// src/lib/uploads.ts
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

/**
 * เซฟไฟล์ลงที่เก็บแบบ Local (public/uploads/*) และคืนค่า URL ที่เสิร์ฟได้
 * @param file Web File จาก FormData (Route Handler)
 * @param subdir "files" | "icons"
 * @returns public url เริ่มต้นด้วย /uploads/...
 */
export async function saveUpload(
  file: File | null | undefined,
  subdir: "files" | "icons"
): Promise<string | null> {
  if (!file || file.size === 0) return null;

  // ถ้าอยู่บน Vercel filesystem เป็น read-only -> แนะนำให้ใช้ Vercel Blob
  // คุณสามารถสลับมาใช้โค้ด Vercel Blob ด้านล่างได้เมื่อพร้อม
  const isVercel = !!process.env.VERCEL;
  if (isVercel) {
    // ===== ถ้าคุณพร้อมใช้ Vercel Blob ให้ปลดคอมเมนต์ส่วนนี้และติดตั้งแพ็กเกจ =====
    // 1) npm i @vercel/blob
    // 2) ตั้งค่า token ตามเอกสาร จากนั้นใช้แบบนี้:
    // const { put } = await import("@vercel/blob");
    // const ext = guessExt(file.type, file.name);
    // const key = `${subdir}/${genName(ext)}`;
    // const arrayBuf = await file.arrayBuffer();
    // const { url } = await put(key, Buffer.from(arrayBuf), {
    //   access: "public",
    //   contentType: file.type || "application/octet-stream",
    // });
    // return url;

    // ชั่วคราว: โยน Error ชัดเจน เพื่อให้รู้ว่าควรเปิดใช้ Blob แทน
    throw new Error(
      "Running on Vercel read-only FS. โปรดเปิดใช้ Vercel Blob (ติดตั้ง @vercel/blob และปลดคอมเมนต์ใน src/lib/uploads.ts)"
    );
  }

  // โหมด Local: public/uploads/{subdir}/{filename}
  const uploadsDir = path.join(process.cwd(), "public", "uploads", subdir);
  await fs.mkdir(uploadsDir, { recursive: true });

  const ext = guessExt(file.type, file.name);
  const filename = genName(ext);
  const filepath = path.join(uploadsDir, filename);

  const arrayBuf = await file.arrayBuffer();
  await fs.writeFile(filepath, Buffer.from(arrayBuf));

  // public URL
  return `/uploads/${subdir}/${filename}`;
}

/** สุ่มชื่อไฟล์ปลอดภัย */
function genName(ext?: string | null) {
  const id = crypto.randomBytes(10).toString("hex");
  return ext ? `${Date.now()}-${id}${ext}` : `${Date.now()}-${id}`;
}

/** เดา extension จาก content-type หรือชื่อไฟล์เดิม */
function guessExt(mime?: string, originalName?: string | null) {
  const lower = (originalName || "").toLowerCase();
  const map: Record<string, string> = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
    "application/zip": ".zip",
    "application/x-msdownload": ".exe",
    "application/x-msi": ".msi",
    "application/x-apple-diskimage": ".dmg",
    "application/x-7z-compressed": ".7z",
    "application/x-rar-compressed": ".rar",
    "application/gzip": ".gz",
    "application/x-tar": ".tar",
  };

  if (mime && map[mime]) return map[mime];

  // เดาจากชื่อไฟล์
  const known = [
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".svg",
    ".zip",
    ".exe",
    ".msi",
    ".dmg",
    ".7z",
    ".rar",
    ".gz",
    ".tar",
    ".tgz",
  ];
  const hit = known.find((k) => lower.endsWith(k));
  return hit || "";
}