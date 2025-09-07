import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@lib/db";
import { z } from "zod";

const LIST = "/managements/emails";
const trim = (v: unknown) => (v == null ? undefined : v.toString().trim());

const Schema = z.object({
  address: z.preprocess(trim, z.string().email().max(254)),
  provider: z.preprocess(trim, z.string().min(2).max(100)),
  note: z.preprocess(trim, z.string().min(2).max(16)),
});

export async function POST(req: Request) {
  try {
    const fd = await req.formData();
    const p = Schema.safeParse({ address: fd.get("address"), provider: fd.get("provider"), note: fd.get("note") });
    if (!p.success) {
      return NextResponse.redirect(new URL(`${LIST}/new?toast=invalid&detail=ข้อมูลไม่ถูกต้อง`, req.url), { status: 303 });
    }

    const exists = await prisma.emailAccount.findUnique({ where: { address: p.data.address } });
    if (exists) {
      return NextResponse.redirect(new URL(`${LIST}/new?toast=exists&detail=มีอีเมลนี้แล้ว`, req.url), { status: 303 });
    }

    await prisma.emailAccount.create({
      data: {
        address: p.data.address,
        provider: p.data.provider,
        note: p.data.note,
      },
    });
    revalidatePath(LIST);
    return NextResponse.redirect(new URL(`${LIST}?toast=created&detail=สร้าง E‑Mail สำเร็จ`, req.url), { status: 303 });
  } catch (e: any) {
    const detail = encodeURIComponent(e?.message || "เกิดข้อผิดพลาด");
    return NextResponse.redirect(new URL(`${LIST}/new?toast=error&detail=${detail}`, req.url), { status: 303 });
  }
}