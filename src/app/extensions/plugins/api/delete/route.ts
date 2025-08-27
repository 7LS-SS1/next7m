// src/app/extensions/plugins/api/delete/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { s } from "@/lib/upload";

export async function POST(req: Request) {
  try {
    const fd = await req.formData();
    const id = s(fd.get("id"));
    const slug = s(fd.get("slug"));
    if (!id && !slug) return NextResponse.json({ ok: false, error: "ไม่พบ id หรือ slug" }, { status: 400 });

    const where = id ? { id } : { slug: slug! };
    const row = await prisma.plugin.delete({ where }).catch(() => null);
    if (!row) return NextResponse.json({ ok: false, error: "ไม่พบข้อมูลที่จะลบ" }, { status: 404 });

    revalidatePath("/extensions/plugins");
    if (row.slug) revalidatePath(`/extensions/plugins/${row.slug}/view`);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("plugin:delete", e);
    return NextResponse.json({ ok: false, error: e?.message || "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}