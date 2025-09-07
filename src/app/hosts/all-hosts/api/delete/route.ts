import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@lib/db";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const id = String(form.get("id") || "");
  if (!id) {
    return NextResponse.json({ ok: false, error: "ไม่พบ ID" }, { status: 400 });
  }
  try {
    await prisma.hostProvider.delete({ where: { id } });
    return NextResponse.redirect(new URL("/hosts", req.url), 303);
  } catch {
    return NextResponse.json({ ok: false, error: "ลบไม่สำเร็จ" }, { status: 500 });
  }
}