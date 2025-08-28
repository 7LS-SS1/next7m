// src/app/domains/api/update/route.ts
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { Prisma, DomainStatus } from "@prisma/client";
import { z } from "zod";

const LIST = "/domains";

/* ---------------- helpers ---------------- */
const trim = (v: unknown) => (v == null ? undefined : v.toString().trim());

/** formData:
 * - ถ้า key ไม่ถูกส่งมา -> fd.get(...) = null  => ไม่อัปเดตฟิลด์นั้น
 * - ถ้าส่งค่าว่าง ""    -> ต้องการ “ล้างค่า”   => จะ map เป็น null
 */
const toNullOrString = (v: unknown) => {
  if (v == null) return undefined; // null หรือ undefined -> ไม่อัปเดต
  const s = v.toString().trim();
  return s === "" ? null : s; // "" => null (ล้างค่า)
};

const toDate = (v: unknown) => {
  if (v === null || v === undefined) return undefined; // ไม่อัปเดต
  const s = v.toString().trim();
  if (!s) return null; // ล้างค่า (กรณีต้องการให้เป็น null) — แต่ฟิลด์เราบังคับ Date, ปกติไม่เปิดล้าง
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(s) ? `${s}T00:00:00Z` : s;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? undefined : d;
};

const toBool = (v: unknown) => {
  if (v == null) return undefined; // ไม่อัปเดต (null/undefined)
  const s = v.toString().trim().toLowerCase();
  if (["true", "1", "on", "yes"].includes(s)) return true;
  if (["false", "0", "off", "no", ""].includes(s)) return false;
  return undefined;
};

const toInt = (v: unknown) => {
  if (v == null) return undefined; // null/undefined -> ไม่อัปเดต
  const s = v.toString().trim();
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? Math.trunc(n) : undefined;
};

const AllowedStatusCodes = new Set([200, 301, 302, 307, 308, 400, 404, 500]);

/* ---------------- input schema ---------------- */
const Schema = z.object({
  id: z.preprocess(trim, z.string().min(8)), // ต้องมี id เสมอ

  name: z.preprocess(trim, z.string().min(2).max(255)).optional(),
  note: z.preprocess(
    (v) => (v === null ? undefined : v?.toString() ?? undefined),
    z.string().max(500).nullable().optional()
  ),
  status: z
    .preprocess(trim, z.enum(["ACTIVE", "INACTIVE", "PENDING"]).optional())
    .optional(),

  // dates
  registeredAt: z.preprocess(toDate, z.date().optional()),

  // FKs: undefined = ไม่แตะ, string = เซ็ตเป็นค่านั้น, null = ล้างค่า
  hostId: z.preprocess(toNullOrString, z.union([z.string(), z.null()]).optional()),
  hostTypeId: z.preprocess(toNullOrString, z.union([z.string(), z.null()]).optional()),
  domainMailId: z.preprocess(toNullOrString, z.union([z.string(), z.null()]).optional()),
  hostMailId: z.preprocess(toNullOrString, z.union([z.string(), z.null()]).optional()),
  cloudflareMailId: z.preprocess(toNullOrString, z.union([z.string(), z.null()]).optional()),
  teamId: z.preprocess(toNullOrString, z.union([z.string(), z.null()]).optional()),

  // flags
  wordpressInstall: z.preprocess(toBool, z.boolean().optional()),
  activeStatus: z.preprocess(toBool, z.boolean().optional()),
  redirect: z.preprocess(toBool, z.boolean().optional()),

  // statusCode
  statusCode: z
    .preprocess(toInt, z.number().int().refine((v) => AllowedStatusCodes.has(v), "invalid statusCode"))
    .optional(),
});

export async function POST(req: Request) {
  try {
    const fd = await req.formData();

    const parsed = Schema.safeParse({
      id: fd.get("id"),

      name: fd.get("name"),
      note: fd.get("note"),
      status: fd.get("status"),

      registeredAt: fd.get("registeredAt"),

      hostId: fd.get("hostId"),
      hostTypeId: fd.get("hostTypeId"),
      domainMailId: fd.get("domainMailId"),
      hostMailId: fd.get("hostMailId"),
      cloudflareMailId: fd.get("cloudflareMailId"),
      teamId: fd.get("teamId"),

      wordpressInstall: fd.get("wordpressInstall"),
      activeStatus: fd.get("activeStatus"),
      redirect: fd.get("redirect"),

      statusCode: fd.get("statusCode"),
    });

    if (!parsed.success) {
      console.error("[domains/update] invalid input", {
        issues: parsed.error.issues,
      });
      const detail = encodeURIComponent("ข้อมูลไม่ถูกต้อง");
      return NextResponse.redirect(
        new URL(`${LIST}/${encodeURIComponent(fd.get("id")?.toString() ?? "")}/edit?toast=invalid&detail=${detail}`, req.url),
        { status: 303 }
      );
    }

    const id = parsed.data.id;

    // สร้าง payload แบบ update เฉพาะฟิลด์ที่ถูกส่งมา
    const data: Prisma.DomainUncheckedUpdateInput = {};

    if (parsed.data.name !== undefined) data.name = parsed.data.name;
    if (parsed.data.note !== undefined) data.note = parsed.data.note; // string | null
    if (parsed.data.status !== undefined)
      data.status = parsed.data.status as DomainStatus;

    // ถ้าเปลี่ยน registeredAt -> คำนวณ expiresAt ใหม่
    if (parsed.data.registeredAt !== undefined) {
      const registeredAt = parsed.data.registeredAt;
      if (registeredAt instanceof Date && !isNaN(registeredAt.getTime())) {
        const expiresAt = new Date(registeredAt);
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        data.registeredAt = registeredAt;
        data.expiresAt = expiresAt;
      }
    }

    // FKs (string | null | undefined)
    if (parsed.data.hostId !== undefined) data.hostId = parsed.data.hostId;
    if (parsed.data.hostTypeId !== undefined) data.hostTypeId = parsed.data.hostTypeId;
    if (parsed.data.domainMailId !== undefined) data.domainMailId = parsed.data.domainMailId;
    if (parsed.data.hostMailId !== undefined) data.hostMailId = parsed.data.hostMailId;
    if (parsed.data.cloudflareMailId !== undefined) data.cloudflareMailId = parsed.data.cloudflareMailId;
    if (parsed.data.teamId !== undefined) data.teamId = parsed.data.teamId;

    // flags
    if (parsed.data.wordpressInstall !== undefined) data.wordpressInstall = parsed.data.wordpressInstall;
    if (parsed.data.activeStatus !== undefined) data.activeStatus = parsed.data.activeStatus;
    if (parsed.data.redirect !== undefined) data.redirect = parsed.data.redirect;

    // statusCode
    if (parsed.data.statusCode !== undefined) data.statusCode = parsed.data.statusCode;

    try {
      await prisma.domain.update({ where: { id }, data });
    } catch (e: any) {
      console.error("[domains/update] prisma error", {
        code: e?.code,
        message: e?.message,
        meta: e?.meta,
      });
      const msg =
        e?.code === "P2002"
          ? "มีโดเมนนี้อยู่แล้ว"
          : e?.code === "P2025"
          ? "ไม่พบโดเมนนี้"
          : e?.message || "อัปเดตไม่สำเร็จ";
      return NextResponse.redirect(
        new URL(
          `${LIST}/${encodeURIComponent(id)}/edit?toast=error&detail=${encodeURIComponent(msg)}`,
          req.url
        ),
        { status: 303 }
      );
    }

    // revalidate list + view
    try {
      revalidatePath(LIST);
      revalidatePath(`${LIST}/${id}/view`);
    } catch (e) {
      console.warn("[domains/update] revalidatePath warn", e);
    }

    return NextResponse.redirect(
      new URL(
        `${LIST}/${encodeURIComponent(id)}/view?toast=updated&detail=${encodeURIComponent(
          "อัปเดต Domain สำเร็จ"
        )}`,
        req.url
      ),
      { status: 303 }
    );
  } catch (e: any) {
    console.error("[domains/update] fatal error", e);
    const detail = encodeURIComponent(e?.message ?? "เกิดข้อผิดพลาด");
    return NextResponse.redirect(
      new URL(`${LIST}?toast=error&detail=${detail}`, req.url),
      { status: 303 }
    );
  }
}