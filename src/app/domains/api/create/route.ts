import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { DomainStatus } from "@prisma/client";

const LIST = "/domains";

/* ---------------------------- small helpers ---------------------------- */
const trim = (v: unknown) => (v == null ? "" : String(v).trim());
const emptyToUndef = (v: unknown) => {
  const s = trim(v);
  return s ? s : undefined;
};
const toDate = (v: unknown) => {
  const s = trim(v);
  if (!s) return undefined;
  // รองรับ YYYY-MM-DD และ ISO
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(s) ? `${s}T00:00:00.000Z` : s;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? undefined : d;
};
const toBool = (v: unknown) => {
  const s = trim(v).toLowerCase();
  if (["true", "1", "on", "yes"].includes(s)) return true;
  if (["false", "0", "off", "no", ""].includes(s)) return false;
  return undefined;
};
const toInt = (v: unknown) => {
  const s = trim(v);
  if (!s) return undefined;
  const n = Number(s);
  return Number.isInteger(n) ? (n as number) : undefined;
};
const toFloat = (v: unknown) => {
  const s = trim(v);
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? (n as number) : undefined;
};

// ตรงกับ Model Domain ปัจจุบัน
const Schema = z.object({
  name: z.string().min(2).max(255),
  note: z.preprocess((v) => trim(v), z.string().optional()).transform((v) => (v === "" ? undefined : v)).optional(),

  // Domain.status (enum)
  status: z
    .preprocess((v) => (trim(v) || undefined), z.enum(["ACTIVE", "INACTIVE", "PENDING"]).optional())
    .transform((v) => (v ?? "PENDING") as DomainStatus)
    .optional(),

  // dates
  registeredAt: z.preprocess(toDate, z.date().optional()),
  expiresAt: z.preprocess(toDate, z.date().optional()),

  // relations (string id หรือ ว่าง)
  hostId: z.preprocess(emptyToUndef, z.string().optional()),
  hostTypeId: z.preprocess(emptyToUndef, z.string().optional()),
  teamId: z.preprocess(emptyToUndef, z.string().optional()),

  domainMailId: z.preprocess(emptyToUndef, z.string().optional()),
  hostMailId: z.preprocess(emptyToUndef, z.string().optional()),
  cloudflareMailId: z.preprocess(emptyToUndef, z.string().optional()),

  // flags (ชื่อใหม่ตาม Model)
  wordpressInstall: z.preprocess(toBool, z.boolean().optional()),
  activeStatus: z.preprocess(toBool, z.boolean().optional()),
  redirect: z.preprocess(toBool, z.boolean().optional()),

  // price (Float?)
  price: z.preprocess(toFloat, z.number().optional()),
});

export async function POST(req: Request) {
  const accept = req.headers.get("accept") || "";
  try {
    const fd = await req.formData();

    // map ชื่อฟิลด์จากฟอร์ม -> schema (สอดคล้องกับ DomainForm ใหม่)
    const parsed = Schema.safeParse({
      name: fd.get("name"),
      note: fd.get("note"),
      status: fd.get("status"), // ACTIVE/INACTIVE/PENDING

      registeredAt: fd.get("registeredAt"),
      expiresAt: fd.get("expiresAt"),

      hostId: fd.get("hostId"),
      hostTypeId: fd.get("hostTypeId"),
      teamId: fd.get("teamId"),

      domainMailId: fd.get("domainMailId"),
      hostMailId: fd.get("hostMailId"),
      cloudflareMailId: fd.get("cloudflareMailId"),

      wordpressInstall: fd.get("wordpressInstall"),
      activeStatus: fd.get("activeStatus"),
      redirect: fd.get("redirect"),

      price: fd.get("price"),
    });

    if (!parsed.success) {
      const first = parsed.error.issues?.[0];
      const field = first?.path?.[0] ?? "input";
      const msg = first?.message ?? "ข้อมูลไม่ถูกต้อง";

      if (accept.includes("application/json")) {
        return NextResponse.json(
          { ok: false, error: "invalid_input", field, message: msg, issues: parsed.error.issues },
          { status: 400 }
        );
      }
      return NextResponse.redirect(
        new URL(
          `${LIST}/new?toast=invalid&detail=${encodeURIComponent(`${String(field)}: ${String(msg)}`)}`,
          req.url
        ),
        { status: 303 }
      );
    }

    const d = parsed.data;

    // registeredAt: ถ้าไม่ส่งมา → วันนี้
    const registeredAt = d.registeredAt ?? new Date();
    // expiresAt: ถ้าส่งมาใช้ตามนั้น, ถ้าไม่ส่งมา +1 ปี ตามนโยบายฟอร์ม
    const expiresAt = d.expiresAt ?? new Date(new Date(registeredAt).setFullYear(registeredAt.getFullYear() + 1));

    // Prisma payload ให้ตรงกับ DomainCreateInput
    const data: Prisma.DomainCreateInput = {
      name: d.name,
      status: (d.status ?? "PENDING") as DomainStatus,
      registeredAt,
      expiresAt,
      ...(d.note !== undefined ? { note: d.note } : {}),

      // flags
      ...(d.wordpressInstall !== undefined ? { wordpressInstall: d.wordpressInstall } : {}),
      ...(d.activeStatus !== undefined ? { activeStatus: d.activeStatus } : {}),
      ...(d.redirect !== undefined ? { redirect: d.redirect } : {}),

      ...(d.price !== undefined ? { price: d.price } : {}),

      // relations (connect เฉพาะที่ส่งมา)
      ...(d.hostId ? { host: { connect: { id: d.hostId } } } : {}),
      ...(d.hostTypeId ? { hostType: { connect: { id: d.hostTypeId } } } : {}),
      ...(d.teamId ? { team: { connect: { id: d.teamId } } } : {}),

      ...(d.domainMailId ? { domainMail: { connect: { id: d.domainMailId } } } : {}),
      ...(d.hostMailId ? { hostMail: { connect: { id: d.hostMailId } } } : {}),
      ...(d.cloudflareMailId ? { cloudflareMail: { connect: { id: d.cloudflareMailId } } } : {}),
    };

    // สร้าง record
    try {
      await prisma.domain.create({ data });
    } catch (e: any) {
      const msg =
        e?.code === "P2002"
          ? "มีโดเมนนี้อยู่แล้ว"
          : e?.code === "P2003"
          ? "ID ความสัมพันธ์ไม่ถูกต้อง (Host/Type/Team/Email)"
          : e?.message || "บันทึกไม่สำเร็จ";

      if (accept.includes("application/json")) {
        return NextResponse.json({ ok: false, error: msg }, { status: 400 });
      }
      return NextResponse.redirect(
        new URL(`${LIST}/new?toast=error&detail=${encodeURIComponent(msg)}`, req.url),
        { status: 303 }
      );
    }

    // revalidate + redirect
    try {
      revalidatePath(LIST);
    } catch {}
    if (accept.includes("application/json")) {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.redirect(
      new URL(`${LIST}?toast=created&detail=${encodeURIComponent("สร้าง Domain สำเร็จ")}`, req.url),
      { status: 303 }
    );
  } catch (e: any) {
    const msg = e?.message || "เกิดข้อผิดพลาด";
    if (accept.includes("application/json")) {
      return NextResponse.json({ ok: false, error: msg }, { status: 500 });
    }
    return NextResponse.redirect(
      new URL(`${LIST}/new?toast=error&detail=${encodeURIComponent(msg)}`, req.url),
      { status: 303 }
    );
  }
}