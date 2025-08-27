import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const fd = await req.formData();
  const file = fd.get("file") as File;
  if (!file) return NextResponse.json({ error: "ไม่มีไฟล์" }, { status: 400 });

  // TODO: อัปโหลดจริงไป S3 หรือ Vercel Blob
  // mock url
  const url = `/uploads/${file.name}`;

  return NextResponse.json({ url });
}