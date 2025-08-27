// src/app/extensions/plugins/api/update/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { saveUpload } from "@/lib/upload";
import { parseBoolean } from "@/lib/zod-helpers";
import slugify from "@/lib/slugify";

// Coerce FormDataEntryValue (or unknown) to a trimmed string or undefined
function s(input: unknown): string | undefined {
  if (typeof input === "string") {
    const t = input.trim();
    return t.length ? t : undefined;
  }
  if (input == null) return undefined;
  if (input instanceof File) return undefined; // files handled separately
  try {
    const t = String(input).trim();
    return t.length ? t : undefined;
  } catch {
    return undefined;
  }
}

export async function POST(req: Request) {
  try {
    const fd = await req.formData();

    const id = s(fd.get("id"));
    const slugParam = s(fd.get("slug"));
    if (!id && !slugParam) {
      return NextResponse.json({ ok: false, error: "ไม่พบ id หรือ slug" }, { status: 400 });
    }

    const name = s(fd.get("name"));
    const version = s(fd.get("version"));
    const vendor = s(fd.get("vendor"));
    const pluginType = s(fd.get("pluginType"));
    const category = s(fd.get("category"));
    const content = s(fd.get("content"));

    const iconFile = fd.get("icon");
    const pkgFile = fd.get("file");
    let iconUrl = s(fd.get("iconUrl"));
    let fileUrl = s(fd.get("fileUrl"));

    if (iconFile instanceof File && iconFile.size > 0) {
      const uploaded = await saveUpload(iconFile, "icons");
      if (uploaded) iconUrl = uploaded;
    }
    if (pkgFile instanceof File && pkgFile.size > 0) {
      const uploaded = await saveUpload(pkgFile, "files");
      if (uploaded) fileUrl = uploaded;
    }

    const recommended = fd.has("recommended") ? parseBoolean(fd.get("recommended")) : undefined;
    const featured = fd.has("featured") ? parseBoolean(fd.get("featured")) : undefined;

    const where = id ? { id } : { slug: slugParam! };

    // ถ้าชื่อเปลี่ยน อาจปรับ slug ใหม่ (ถ้าต้องการ)
    let nextSlug: string | undefined;
    if (name) {
      let candidate = slugify(name);
      if (candidate) {
        const exists = await prisma.plugin.findUnique({ where: { slug: candidate } }).catch(() => null);
        if (exists && (id ? exists.id !== id : exists.slug !== slugParam)) {
          candidate = `${candidate}-${Date.now().toString(36)}`;
        }
        nextSlug = candidate;
      }
    }

    const row = await prisma.plugin.update({
      where,
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(version !== undefined ? { version } : {}),
        ...(vendor !== undefined ? { vendor } : {}),
        ...(pluginType !== undefined ? { pluginType } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(content !== undefined ? { content } : {}),
        ...(iconUrl !== undefined ? { iconUrl } : {}),
        ...(fileUrl !== undefined ? { fileUrl } : {}),
        ...(recommended !== undefined ? { recommended } : {}),
        ...(featured !== undefined ? { featured } : {}),
        ...(nextSlug ? { slug: nextSlug } : {}),
      },
      select: { id: true, slug: true },
    });

    revalidatePath("/extensions/plugins");
    revalidatePath(`/extensions/programs`); // เผื่อหน้ารวมอื่นใช้ร่วมกัน
    if (row.slug) {
      revalidatePath(`/extensions/plugins/${row.slug}/view`);
    }
    if (slugParam) {
      revalidatePath(`/extensions/plugins/${slugParam}/view`);
    }

    return NextResponse.json({ ok: true, id: row.id, slug: row.slug ?? nextSlug });
  } catch (e: any) {
    console.error("plugin:update", e);
    return NextResponse.json({ ok: false, error: e?.message || "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}