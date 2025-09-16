import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { saveBufferToStorage, storageDownloadUrl } from "@lib/storage";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const name = String(form.get("name") || "").trim();
    if (!name) return NextResponse.json({ ok: false, error: "missing name" }, { status: 400 });
    if (!file) return NextResponse.json({ ok: false, error: "missing file" }, { status: 400 });

    const buf = Buffer.from(await file.arrayBuffer());
    const original = (file as any).name || "plugin";
    const ext = original.includes(".") ? original.split(".").pop()! : "zip";

    const saved = await saveBufferToStorage(buf, ext);
    const fileUrl = storageDownloadUrl(saved.key);

    const plugin = await prisma.plugin.create({
      data: {
        name,
        version: (form.get("version") as string) || undefined,
        vendor: (form.get("vendor") as string) || undefined,
        pluginType: (form.get("pluginType") as string) || undefined,
        category: ((form.get("category") as string) || "Misc.") as any,
        content: (form.get("content") as string) || undefined,
        iconUrl: (form.get("iconUrl") as string) || undefined,
        fileUrl,
        recommended: !!form.get("recommended"),
        featured: !!form.get("featured"),
      },
    });

    return NextResponse.json({ ok: true, plugin });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "upload_failed" }, { status: 500 });
  }
}