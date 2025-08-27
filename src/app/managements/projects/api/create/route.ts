// src/app/managements/projects/api/create/route.ts
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { asTrim, emptyToUndef } from "@/lib/form";

const LIST = "/managements/projects";

const ProjectSchema = z.object({
  name: z.preprocess(asTrim, z.string().min(2).max(120)),
  note: z.preprocess(emptyToUndef, z.string().max(500).optional()),
});

export async function POST(req: Request) {
  try {
    const fd = await req.formData();
    const p = ProjectSchema.safeParse({ name: fd.get("name"), note: fd.get("note") });
    if (!p.success) {
      return NextResponse.redirect(new URL(`${LIST}/new?toast=invalid&detail=กรอกข้อมูลไม่ถูกต้อง`, req.url), { status: 303 });
    }

    const exists = await prisma.project.findUnique({ where: { name: p.data.name } });
    if (exists) {
      return NextResponse.redirect(new URL(`${LIST}/new?toast=exists&detail=มีโปรเจคชื่อนี้แล้ว`, req.url), { status: 303 });
    }

    await prisma.project.create({ data: p.data });
    revalidatePath(LIST);
    return NextResponse.redirect(new URL(`${LIST}?toast=created&detail=สร้างโปรเจคสำเร็จ`, req.url), { status: 303 });
  } catch (e: any) {
    const detail = encodeURIComponent(e?.message || "เกิดข้อผิดพลาด");
    return NextResponse.redirect(new URL(`${LIST}/new?toast=error&detail=${detail}`, req.url), { status: 303 });
  }
}