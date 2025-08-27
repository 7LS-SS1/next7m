// src/app/extensions/plugins/api/create/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { saveUpload } from "@/lib/upload";
import { parseBoolean } from "@/lib/zod-helpers";
import slugify from "@/lib/slugify";

// Coerce unknown FormData values to trimmed string
function s(v: unknown): string | undefined {
  if (typeof v === "string") return v.trim() || undefined;
  if (v == null) return undefined;
  const t = (v as any)?.toString?.();
  return typeof t === "string" ? (t.trim() || undefined) : undefined;
}

const MAX_ICON_MB = 5;   // กันไฟล์ใหญ่เกิน (อ่านง่าย)
const MAX_FILE_MB = 200; // ปลั๊กอินบางทีใหญ่

function tooBig(file?: File | null, maxMB = 10) {
  if (!file) return false;
  return file.size > maxMB * 1024 * 1024;
}

export async function POST(req: Request) {
  try {
    // 0) เช็ค DB ping สั้นๆ (ช่วยหาสาเหตุ 500)
    try {
      await prisma.$queryRaw`SELECT 1`; // ถ้า .env หรือ DB ล้ม จะ throw ชัดเจน
    } catch (e: any) {
      console.error("[plugin:create] DB error:", e);
      return NextResponse.json(
        { ok: false, error: "เชื่อมต่อฐานข้อมูลไม่สำเร็จ (ตรวจ DATABASE_URL / สิทธิ์ DB)" },
        { status: 500 }
      );
    }

    // 1) รับ form-data (multipart)
    const fd = await req.formData();

    const name = s(fd.get("name"));
    if (!name) {
      return NextResponse.json({ ok: false, error: "กรุณากรอกชื่อปลั๊กอิน" }, { status: 400 });
    }

    const version = s(fd.get("version"));
    const vendor = s(fd.get("vendor"));
    const pluginType = s(fd.get("pluginType")) ?? "Other";
    const category = s(fd.get("category")) ?? "Misc.";
    const content = s(fd.get("content"));

    // 2) ไฟล์ (icon/file) + จำกัดขนาด กัน 500 จากบัฟเฟอร์ใหญ่/แอพโฮสติ้ง
    const iconFile = fd.get("icon");
    const pkgFile = fd.get("file");

    let iconUrl = s(fd.get("iconUrl"));
    let fileUrl = s(fd.get("fileUrl"));

    if (iconFile instanceof File && tooBig(iconFile, MAX_ICON_MB)) {
      return NextResponse.json(
        { ok: false, error: `ไอคอนใหญ่เกิน ${MAX_ICON_MB}MB` },
        { status: 413 }
      );
    }
    if (pkgFile instanceof File && tooBig(pkgFile, MAX_FILE_MB)) {
      return NextResponse.json(
        { ok: false, error: `ไฟล์ปลั๊กอินใหญ่เกิน ${MAX_FILE_MB}MB` },
        { status: 413 }
      );
    }

    // 3) อัปโหลดไฟล์ไปยัง public/uploads (หรือสลับเป็น Blob ได้ภายหลัง)
    try {
      if (iconFile instanceof File && iconFile.size > 0) {
        const uploaded = await saveUpload(iconFile, "icons");
        if (uploaded) iconUrl = uploaded; // e.g. /uploads/icons/xxxx.png
      }
      if (pkgFile instanceof File && pkgFile.size > 0) {
        const uploaded = await saveUpload(pkgFile, "files");
        if (uploaded) fileUrl = uploaded; // e.g. /uploads/files/xxxx.zip
      }
    } catch (e: any) {
      console.error("[plugin:create] upload error:", e);
      return NextResponse.json(
        { ok: false, error: "อัปโหลดไฟล์ไม่สำเร็จ (ตรวจ BLOB_READ_WRITE_TOKEN)" },
        { status: 500 }
      );
    }

    const recommended = parseBoolean(fd.get("recommended"));
    const featured = parseBoolean(fd.get("featured"));

    // 4) สร้าง slug ป้องกันซ้ำ
    let slug = slugify(name);
    if (slug) {
      const dup = await prisma.plugin.findUnique({ where: { slug } }).catch(() => null);
      if (dup) slug = `${slug}-${Date.now().toString(36)}`;
    }

    // 5) เขียน DB
    const row = await prisma.plugin.create({
      data: {
        name,
        version,
        vendor,
        pluginType,
        category,
        content,
        iconUrl,
        fileUrl,
        recommended,
        featured,
        slug,
      },
      select: { id: true, slug: true },
    });

    // 6) Revalidate list + view
    revalidatePath("/extensions/plugins");
    if (row.slug) revalidatePath(`/extensions/plugins/${row.slug}/view`);

    return NextResponse.json({ ok: true, id: row.id, slug: row.slug }, { status: 200 });
  } catch (e: any) {
    console.error("[plugin:create] unexpected:", e);
    return NextResponse.json(
      { ok: false, error: e?.message || "เกิดข้อผิดพลาดภายในระบบ" },
      { status: 500 }
    );
  }
}