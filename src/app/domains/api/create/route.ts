import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { Prisma, DomainStatus } from "@prisma/client";

const LIST = "/domains";

// helpers
const trim = (v: unknown) => (v == null ? undefined : v.toString().trim());
const empty = (v: unknown) => {
  const s = v == null ? "" : v.toString().trim();
  return s === "" ? undefined : s;
};
// accept ISO date or YYYY-MM-DD; return Date | undefined
const toDate = (v: unknown) => {
  const s = trim(v);
  if (!s) return undefined;
  // normalize YYYY-MM-DD to ISO by appending T00:00:00Z (UTC)
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(s)
    ? `${s}T00:00:00Z`
    : (s as string);
  const d = new Date(iso);
  return isNaN(d.getTime()) ? undefined : d;
};

const Schema = z.object({
  name: z.preprocess(trim, z.string().min(2).max(255)),
  note: z.preprocess(empty, z.string().max(500).optional()),
  // ถ้าไม่ส่ง status มา จะใช้ค่า default ของ DB (เช่น PENDING)
  status: z.preprocess(trim, z.enum(["ACTIVE", "INACTIVE", "PENDING"]).optional()),
  // วันที่จดโดเมน (ไม่ส่งมาก็ใช้ "ตอนนี้")
  registeredAt: z.preprocess(toDate, z.date().optional()),
});

export async function POST(req: Request) {
  try {
    const fd = await req.formData();
    const p = Schema.safeParse({
      name: fd.get("name"),
      note: fd.get("note"),
      status: fd.get("status"),
      registeredAt: fd.get("registeredAt"),
    });

    if (!p.success) {
      return NextResponse.redirect(
        new URL(`${LIST}/new?toast=invalid&amp;detail=ข้อมูลไม่ถูกต้อง`, req.url),
        { status: 303 },
      );
    }

    // คำนวณวันที่จด/หมดอายุ (+1 ปี)
    const registeredAt = p.data.registeredAt ?? new Date();
    const expiresAt = new Date(registeredAt);
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    // payload ที่ตรงกับ Prisma.DomainCreateInput
    const data: Prisma.DomainCreateInput = {
      name: p.data.name,
      registeredAt,
      expiresAt,
      ...(p.data.note ? { note: p.data.note } : {}),
      ...(p.data.status ? { status: p.data.status as DomainStatus } : {}),
    };

    // กันชื่อซ้ำถ้าตั้ง unique ที่ DB
    try {
      await prisma.domain.create({ data });
    } catch (e: any) {
      const msg =
        e?.code === "P2002"
          ? "มีโดเมนนี้อยู่แล้ว"
          : e?.message || "บันทึกไม่สำเร็จ";
      return NextResponse.redirect(
        new URL(
          `${LIST}/new?toast=error&amp;detail=${encodeURIComponent(msg)}`,
          req.url,
        ),
        { status: 303 },
      );
    }

    revalidatePath(LIST);
    return NextResponse.redirect(
      new URL(`${LIST}?toast=created&amp;detail=สร้าง Domain สำเร็จ`, req.url),
      { status: 303 },
    );
  } catch (e: any) {
    const detail = encodeURIComponent(e?.message ?? "เกิดข้อผิดพลาด");
    return NextResponse.redirect(
      new URL(`${LIST}/new?toast=error&amp;detail=${detail}`, req.url),
      { status: 303 },
    );
  }
}