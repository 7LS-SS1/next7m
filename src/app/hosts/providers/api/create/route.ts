import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@lib/db";
import { z } from "zod";

const LIST = "/hosts/providers";
const trim = (v: unknown) => (v == null ? undefined : v.toString().trim());
const empty = (v: unknown) => { const s = v == null ? "" : v.toString().trim(); return s === "" ? undefined : s; };

const Schema = z.object({
  name: z.preprocess(trim, z.string().min(2).max(120)),
  note: z.preprocess(empty, z.string().max(500).optional()),
});

export async function POST(req: Request) {
  try {
    const fd = await req.formData();
    const p = Schema.safeParse({ name: fd.get("name"), note: fd.get("note") });
    if (!p.success) return NextResponse.redirect(new URL(`${LIST}/new?toast=invalid&detail=กรอกข้อมูลไม่ถูกต้อง`, req.url), { status: 303 });

    const exists = await prisma.hostProvider.findUnique({ where: { name: p.data.name } });
    if (exists) return NextResponse.redirect(new URL(`${LIST}/new?toast=exists&detail=มีชื่อนี้แล้ว`, req.url), { status: 303 });

    await prisma.hostProvider.create({ data: p.data });
    revalidatePath(LIST);
    return NextResponse.redirect(new URL(`${LIST}?toast=created&detail=สร้างสำเร็จ`, req.url), { status: 303 });
  } catch (e: any) {
    const detail = encodeURIComponent(e?.message || "เกิดข้อผิดพลาด");
    return NextResponse.redirect(new URL(`${LIST}/new?toast=error&detail=${detail}`, req.url), { status: 303 });
  }
}