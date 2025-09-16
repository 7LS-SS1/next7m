import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { savePluginFileFromRequest, localDownloadUrl } from "@/lib/storage";

export const runtime = "nodejs"; // เพื่อใช้ fs ได้
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const name = String(form.get("name") || "");
    const version = String(form.get("version") || "");
    const pluginId = String(form.get("pluginId") || ""); // ถ้ามี

    // บันทึกไฟล์
    const saved = await savePluginFileFromRequest(req);

    // อัปเดต/สร้าง Plugin
    const plugin = pluginId
      ? await prisma.plugin.update({
          where: { id: pluginId },
          data: {
            fileKey: saved.key,
            fileUrl: localDownloadUrl(saved.key),
            fileSize: saved.size,
            fileMime: saved.mime,
            fileHash: saved.sha256,
            status: "COMPLETED",
          },
        })
      : await prisma.plugin.create({
          data: {
            name,
            version,
            fileKey: saved.key,
            fileUrl: localDownloadUrl(saved.key),
            fileSize: saved.size,
            fileMime: saved.mime,
            fileHash: saved.sha256,
            status: "COMPLETED",
          },
        });

    return NextResponse.json({ ok: true, plugin });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "upload_failed" }, { status: 400 });
  }
}