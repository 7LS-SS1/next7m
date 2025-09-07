// src/app/managements/projects/api/update/route.ts
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@lib/db";
import { z } from "zod";
import { asTrim, emptyToUndef } from "@lib/form";

const LIST = "/managements/projects";

const UpdateSchema = z.object({
  id: z.preprocess(asTrim, z.string().min(1)),
  name: z.preprocess(asTrim, z.string().min(2).max(120)),
  note: z.preprocess(emptyToUndef, z.string().max(500).optional()),
});

export async function POST(req: Request) {
  try {
    const fd = await req.formData();
    const p = UpdateSchema.safeParse({ id: fd.get("id"), name: fd.get("name"), note: fd.get("note") });
    if (!p.success) {
      return NextResponse.redirect(new URL(`${LIST}?toast=invalid&detail=ข้อมูลไม่ถูกต้อง`, req.url), { status: 303 });
    }

    await prisma.project.update({ where: { id: p.data.id }, data: { name: p.data.name, note: p.data.note } });
    revalidatePath(LIST);
    return NextResponse.redirect(new URL(`${LIST}?toast=updated&detail=อัปเดตสำเร็จ`, req.url), { status: 303 });
  } catch (e: any) {
    const detail = encodeURIComponent(e?.message || "อัปเดตไม่สำเร็จ");
    return NextResponse.redirect(new URL(`${LIST}?toast=error&detail=${detail}`, req.url), { status: 303 });
  }
}