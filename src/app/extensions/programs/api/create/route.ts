// src/app/extensions/programs/api/create/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { saveUpload } from "@/lib/upload";
import slugify from "@/lib/slugify";
import { z } from "zod";
import { RelOrAbsUrl } from "@/lib/zod-helpers";
import { toBool, toStr } from "@/lib/form";

const BodySchema = z.object({
  name: z.string().min(1, "ต้องใส่ชื่อ"),
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
  recommended: z.boolean().optional().default(false),
  isRecommended: z.boolean().optional().default(false),
  featured: z.boolean().optional().default(false),
});

export async function POST(req: Request) {
  try {
    const fd = await req.formData();

    // ไฟล์อัปโหลด (ถ้ามี)
    const iconFile = fd.get("icon") as File | null;
    const mainFile = fd.get("file") as File | null;

    const iconUploaded = await saveUpload(iconFile, "icons").catch(() => null);
    const fileUploaded = await saveUpload(mainFile, "files").catch(() => null);

    // เตรียมข้อมูล พร้อม coercion checkbox → boolean
    const raw = {
      name: toStr(fd.get("name")),
      version: toStr(fd.get("version")),
      vendor: toStr(fd.get("vendor")),
      category: toStr(fd.get("category")) ?? "Etc.",
      content: toStr(fd.get("content")),
      iconUrl: toStr(fd.get("iconUrl")) ?? iconUploaded ?? undefined,
      fileUrl: toStr(fd.get("fileUrl")) ?? fileUploaded ?? undefined,
      recommended: toBool(fd.get("recommended")),
      // รองรับทั้ง recommended / isRecommended
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

    const dataOut = {
      ...data,
      category: data.category || "Etc.",
    };

    const created = await prisma.program.create({
      data: {
        ...dataOut,
        slug,
      },
      select: { id: true, slug: true, name: true },
    });

    return NextResponse.json({
      ok: true,
      status: "created",
      message: "บันทึกโปรแกรมสำเร็จ",
      program: created,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
