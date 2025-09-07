import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@lib/db";
import { z } from "zod";

const LIST = "/managements/emails";
const trim = (v: unknown) => (v == null ? undefined : v.toString().trim());
const Schema = z.object({ id: z.preprocess(trim, z.string().min(1)) });

export async function POST(req: Request) {
  try {
    const fd = await req.formData();
    const p = Schema.safeParse({ id: fd.get("id") });
    if (!p.success) {
      return NextResponse.redirect(new URL(`${LIST}?toast=invalid&detail=ไม่พบรหัส`, req.url), { status: 303 });
    }

    await prisma.emailAccount.delete({ where: { id: p.data.id } });
    revalidatePath(LIST);
    return NextResponse.redirect(new URL(`${LIST}?toast=deleted&detail=ลบสำเร็จ`, req.url), { status: 303 });
  } catch (e: any) {
    const detail = encodeURIComponent(e?.message || "ลบไม่สำเร็จ");
    return NextResponse.redirect(new URL(`${LIST}?toast=error&detail=${detail}`, req.url), { status: 303 });
  }
}