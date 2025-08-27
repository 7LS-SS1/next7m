import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { z } from "zod";

const LIST = "/managements/emails";
const trim = (v: unknown) => (v == null ? undefined : v.toString().trim());

const Schema = z.object({
  id: z.preprocess(trim, z.string().min(1)),
  address: z.preprocess(trim, z.string().email().max(254)),
  provider: z.preprocess(trim, z.string().min(2).max(100)),
  note: z.preprocess(trim, z.string().min(2).max(16)).optional(),
});

export async function POST(req: Request) {
  try {
    const fd = await req.formData();
    const p = Schema.safeParse({ id: fd.get("id"), address: fd.get("address"), provider: fd.get("provider"), team: fd.get("note") });
    if (!p.success) {
      return NextResponse.redirect(new URL(`${LIST}?toast=invalid&detail=ข้อมูลไม่ถูกต้อง`, req.url), { status: 303 });
    }

    await prisma.emailAccount.update({
      where: { id: p.data.id },
      data: { address: p.data.address, provider: p.data.provider },
    });
    revalidatePath(LIST);
    return NextResponse.redirect(new URL(`${LIST}?toast=updated&detail=อัปเดตสำเร็จ`, req.url), { status: 303 });
  } catch (e: any) {
    const detail = encodeURIComponent(e?.message || "อัปเดตไม่สำเร็จ");
    return NextResponse.redirect(new URL(`${LIST}?toast=error&detail=${detail}`, req.url), { status: 303 });
  }
}