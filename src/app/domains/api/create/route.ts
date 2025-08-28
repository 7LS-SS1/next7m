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

const Schema = z.object({
  name: z.string().min(2).max(255),

  // dates
  registeredAt: z.preprocess(toDate, z.date().optional()), // ถ้าไม่ส่งมา จะใส่ new Date() ให้เอง

  // relations (string id หรือ ว่าง)
  hostId: z.preprocess(emptyToUndef, z.string().optional()),
  hostTypeId: z.preprocess(emptyToUndef, z.string().optional()),
  teamId: z.preprocess(emptyToUndef, z.string().optional()),

  domainMail: z.preprocess(emptyToUndef, z.string().optional()),
  hostMail: z.preprocess(emptyToUndef, z.string().optional()),
  cloudflareMail: z.preprocess(emptyToUndef, z.string().optional()),

  // flags
  wordpress: z.preprocess(toBool, z.boolean().optional()),
  active: z.preprocess(toBool, z.boolean().optional()),
  redirect: z.preprocess(toBool, z.boolean().optional()),

  // HTTP status code (ยอมรับทั้ง statusCode และ status เดิม)
  statusCode: z.preprocess(toInt, z.number().int().optional()),
  status: z.preprocess(toInt, z.number().int().optional()).optional(), // backup field

  // Domain.status (ACTIVE/INACTIVE/PENDING) — ไม่ได้อยู่ในฟอร์มนี้ ให้ default = PENDING
  domainStatus: z
    .preprocess((v) => {
      const s = trim(v);
      return s ? s : undefined;
    }, z.enum(["ACTIVE", "INACTIVE", "PENDING"]).optional())
    .transform((v) => (v ?? "PENDING") as DomainStatus)
    .optional(),
});

export async function POST(req: Request) {
  const accept = req.headers.get("accept") || "";
  try {
    const fd = await req.formData();

    // map ชื่อฟิลด์จากฟอร์ม -> schema
    const parsed = Schema.safeParse({
      name: fd.get("name"),

      registeredAt: fd.get("registeredAt"),

      hostId: fd.get("hostId"),
      hostTypeId: fd.get("hostTypeId"),
      teamId: fd.get("teamId"),

      domainMail: fd.get("domainMail"),
      hostMail: fd.get("hostMail"),
      cloudflareMail: fd.get("cloudflareMail"),

      wordpress: fd.get("wordpress"),
      active: fd.get("active"),
      redirect: fd.get("redirect"),

      statusCode: fd.get("statusCode") ?? fd.get("status"), // รองรับชื่อเก่า
      // domainStatus: ไม่มีจากฟอร์มนี้ ปล่อยว่าง -> default PENDING
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
        new URL(`${LIST}/new?toast=invalid&detail=${encodeURIComponent(`${field}: ${msg}`)}`, req.url),
        { status: 303 }
      );
    }

    // ค่าที่ผ่านการแปลงแล้ว
    const d = parsed.data;

    // ลงทะเบียนวันจด & วันหมดอายุ (+1 ปี) — ถ้าไม่ส่ง registeredAt มา ใช้วันนี้
    const registeredAt = d.registeredAt ?? new Date();
    const expiresAt = new Date(registeredAt);
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    // สร้าง payload ให้ตรง Prisma.DomainCreateInput
    const data: Prisma.DomainCreateInput = {
      name: d.name,
      // Domain.status (enum) — default PENDING
      status: (d.domainStatus ?? "PENDING") as DomainStatus,

      // บังคับใน schema
      registeredAt,
      expiresAt,

      // flags
      ...(d.wordpress !== undefined ? { wordpressInstall: d.wordpress } : {}),
      ...(d.active !== undefined ? { activeStatus: d.active } : {}),
      ...(d.redirect !== undefined ? { redirect: d.redirect } : {}),

      // http status code
      ...(d.statusCode !== undefined ? { statusCode: d.statusCode } : {}),

      // relations (connect เฉพาะที่ส่งมา)
      ...(d.hostId ? { host: { connect: { id: d.hostId } } } : {}),
      ...(d.hostTypeId ? { hostType: { connect: { id: d.hostTypeId } } } : {}),
      ...(d.teamId ? { team: { connect: { id: d.teamId } } } : {}),

      ...(d.domainMail ? { domainMail: { connect: { id: d.domainMail } } } : {}),
      ...(d.hostMail ? { hostMail: { connect: { id: d.hostMail } } } : {}),
      ...(d.cloudflareMail ? { cloudflareMail: { connect: { id: d.cloudflareMail } } } : {}),
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