// src/app/extensions/plugins/api/create/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import slugify from "@/lib/slugify";
import { z } from "zod";
import { RelOrAbsUrl } from "@/lib/zod-helpers";
import { toBool, toStr } from "@/lib/form";

// ✅ รับเฉพาะ URL ที่ได้จากการอัปโหลดไป Blob แล้วเท่านั้น
const BodySchema = z.object({
  name: z.string().min(1, "ต้องใส่ชื่อ").transform((v) => v.trim()),
  version: z.string().optional(),
  vendor: z.string().optional(),
  category: z
    .string()
    .trim()
    .transform((v) => (v && v.length > 0 ? v : "Etc."))
    .default("Etc."),
  content: z.string().optional(),
  iconUrl: RelOrAbsUrl.optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
  fileUrl: RelOrAbsUrl.optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
  // รองรับทั้ง recommended และ isRecommended จากฟอร์มเดิม
  recommended: z.boolean().optional().default(false),
  isRecommended: z.boolean().optional().default(false),
  featured: z.boolean().optional().default(false),
});

export async function POST(req: Request) {
  try {
    const fd = await req.formData();

    // ❌ ไม่รองรับไฟล์ดิบอีกต่อไป (อัปโหลดที่ client → ได้ URL → ส่งมาเท่านั้น)
    // const iconFile = fd.get("icon") as File | null;
    // const mainFile = fd.get("file") as File | null;

    const raw = {
      name: toStr(fd.get("name")),
      version: toStr(fd.get("version")),
      vendor: toStr(fd.get("vendor")),
      category: toStr(fd.get("category")) ?? "Etc.",
      content: toStr(fd.get("content")),
      iconUrl: toStr(fd.get("iconUrl")) ?? undefined,
      fileUrl: toStr(fd.get("fileUrl")) ?? undefined,
      recommended: toBool(fd.get("recommended")),
      isRecommended:
        toBool(fd.get("isRecommended")) || toBool(fd.get("recommended")),
      featured: toBool(fd.get("featured")),
    };

    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid input", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const slug = slugify(data.name);

    const created = await prisma.plugin.create({
      data: {
        name: data.name,
        version: data.version ?? null,
        vendor: data.vendor ?? null,
        category: data.category || "Etc.",
        content: data.content ?? null,
        iconUrl: data.iconUrl ?? null,
        fileUrl: data.fileUrl ?? null,
        recommended: data.recommended || data.isRecommended || false,
        featured: data.featured || false,
        slug,
      },
      select: { id: true, slug: true, name: true },
    });

    return NextResponse.json({
      ok: true,
      status: "created",
      message: "บันทึกปลั๊กอินสำเร็จ",
      plugin: created,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}