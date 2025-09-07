import { NextResponse } from "next/server";
import { withAuth } from '@lib/with-auth';

export async function POST(req: Request) {
  withAuth(async (_session) => {
    const fd = await req.formData();
    const file = fd.get("file") as File;
    if (!file)
      return NextResponse.json({ error: "ไม่มีไฟล์" }, { status: 400 });

    // TODO: อัปโหลดจริงไป S3 หรือ Vercel Blob
    // mock url
    const url = `/uploads/${file.name}`;

    return NextResponse.json({ url });
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  });
}
