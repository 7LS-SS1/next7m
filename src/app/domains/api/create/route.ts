import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { Prisma, DomainStatus } from "@prisma/client";

const LIST = "/domains";
const trim = (v: unknown) => (v == null ? undefined : v.toString().trim());
const empty = (v: unknown) => {
  const s = v == null ? "" : v.toString().trim();
  return s === "" ? undefined : s;
};

const Schema = z.object({
  name: z.preprocess(trim, z.string().min(2).max(255)),
  note: z.preprocess(empty, z.string().max(500).optional()),
  // รับเฉพาะ ACTIVE/INACTIVE (ถ้าไม่ส่งจะปล่อยให้ใช้ค่าเริ่มต้นที่ DB)
  status: z
    .preprocess(trim, z.enum(["ACTIVE", "INACTIVE"]).optional()),
});

export async function POST(req: Request) {
  try {
    const fd = await req.formData();
    const p = Schema.safeParse({
      name: fd.get("name"),
      note: fd.get("note"),
      status: fd.get("status"),
    });
    if (!p.success) {
      return NextResponse.redirect(new URL(`${LIST}/new?toast=invalid&detail=ข้อมูลไม่ถูกต้อง`, req.url), { status: 303 });
    }

    // สร้าง payload แบบ type-safe ให้ตรงกับ Prisma.DomainCreateInput
    const data: Prisma.DomainCreateInput = {
      name: p.data.name,
      ...(p.data.note ? { note: p.data.note } : {}),
      ...(p.data.status ? { status: p.data.status as DomainStatus } : {}),
    };

    // กันชื่อซ้ำถ้าตั้ง unique ที่ DB
    try {
      await prisma.domain.create({ data });
    } catch (e: any) {
      const msg = e?.code === "P2002" ? "มีโดเมนนี้อยู่แล้ว" : (e?.message || "บันทึกไม่สำเร็จ");
      return NextResponse.redirect(new URL(`${LIST}/new?toast=error&detail=${encodeURIComponent(msg)}`, req.url), { status: 303 });
    }

    revalidatePath(LIST);
    return NextResponse.redirect(new URL(`${LIST}?toast=created&detail=สร้าง Domain สำเร็จ`, req.url), { status: 303 });
  } catch (e: any) {
    const detail = encodeURIComponent(e?.message ?? "เกิดข้อผิดพลาด");
    return NextResponse.redirect(new URL(`${LIST}/new?toast=error&detail=${detail}`, req.url), { status: 303 });
  }
}