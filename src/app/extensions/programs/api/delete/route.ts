// src/app/extensions/programs/api/delete/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    // รองรับทั้ง JSON และ FormData
    let idOrSlug = "";
    const ctype = req.headers.get("content-type") || "";
    if (ctype.includes("application/json")) {
      const body = await req.json();
      idOrSlug = String(body.id || body.slug || body.key || "").trim();
    } else {
      const fd = await req.formData();
      idOrSlug = String(fd.get("id") || fd.get("slug") || fd.get("key") || "").trim();
    }
    if (!idOrSlug) {
      return NextResponse.json({ ok: false, message: "missing id/slug" }, { status: 400 });
    }

    const key = decodeURIComponent(idOrSlug);
    const target = await prisma.program.findFirst({
      where: {
        OR: [
          { id: key },
          { slug: { equals: key, mode: "insensitive" } },
          { name: { equals: key, mode: "insensitive" } },
        ],
      },
      select: { id: true, slug: true },
    });
    if (!target) {
      return NextResponse.json({ ok: false, message: "not found" }, { status: 404 });
    }

    await prisma.program.delete({ where: { id: target.id } });

    // refresh list + (หน้า view เดิมถ้ายังเปิด)
    revalidatePath("/extensions/programs");
    if (target.slug) revalidatePath(`/extensions/programs/${encodeURIComponent(target.slug)}/view`);

    return NextResponse.json({
      ok: true,
      redirect: "/extensions/programs?toast=deleted",
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || "error" }, { status: 500 });
  }
}