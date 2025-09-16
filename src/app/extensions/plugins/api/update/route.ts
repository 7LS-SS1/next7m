import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { saveBufferToStorage, storageDownloadUrl } from "@lib/storage";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const id = String(form.get("id") || "").trim();
    if (!id) return NextResponse.json({ ok: false, error: "missing id" }, { status: 400 });

    const file = form.get("file") as File | null;
    let fileUrl: string | undefined;
    if (file) {
      const buf = Buffer.from(await file.arrayBuffer());
      const original = (file as any).name || "plugin";
      const ext = original.includes(".") ? original.split(".").pop()! : "zip";
      const saved = await saveBufferToStorage(buf, ext);
      fileUrl = storageDownloadUrl(saved.key);
    }

    const data: any = {
      name: (form.get("name") as string) || undefined,
      version: (form.get("version") as string) || undefined,
      vendor: (form.get("vendor") as string) || undefined,
      pluginType: (form.get("pluginType") as string) || undefined,
      category: (form.get("category") as string) || undefined,
      content: (form.get("content") as string) || undefined,
      iconUrl: (form.get("iconUrl") as string) || undefined,
      recommended: !!form.get("recommended"),
      featured: !!form.get("featured"),
      status: "COMPLETED",
    };
    if (fileUrl) data.fileUrl = fileUrl;

    const plugin = await prisma.plugin.update({ where: { id }, data });
    return NextResponse.json({ ok: true, plugin });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "update_failed" }, { status: 500 });
  }
}