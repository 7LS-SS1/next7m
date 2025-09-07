import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@lib/db";

const IPV4 = /^((25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(25[0-5]|2[0-4]\d|1?\d?\d)$/;

export async function POST(req: NextRequest) {
  const form = await req.formData();

  const id = String(form.get("id") || "").trim();
  const title = String(form.get("title") || "").trim();
  const hostProviderId = String(form.get("hostProviderId") || "").trim();
  const ip = String(form.get("ip") || "").trim();
  const emailId = String(form.get("emailId") || "").trim();
  const createdAtStr = String(form.get("createdAt") || "").trim();
  const note = String(form.get("note") || "").trim();

  if (!id) return NextResponse.json({ ok: false, error: "ไม่พบ ID" }, { status: 400 });
  if (!title) return NextResponse.json({ ok: false, error: "กรอกชื่อ (Title)" }, { status: 400 });
  if (!hostProviderId) return NextResponse.json({ ok: false, error: "กรุณาเลือก Host Provider" }, { status: 400 });
  if (!IPV4.test(ip)) return NextResponse.json({ ok: false, error: "IP ไม่ถูกต้อง (IPv4)" }, { status: 400 });
  if (!emailId) return NextResponse.json({ ok: false, error: "กรุณาเลือกอีเมล" }, { status: 400 });
  if (!createdAtStr) return NextResponse.json({ ok: false, error: "กรุณาเลือกวันที่สร้าง" }, { status: 400 });

  const createdOn = new Date(createdAtStr);
  if (Number.isNaN(createdOn.getTime())) {
    return NextResponse.json({ ok: false, error: "วันที่สร้างไม่ถูกต้อง" }, { status: 400 });
  }

  try {
    await prisma.allHost.update({
      where: { id },
      data: {
        title,
        ip,
        note: note || null,
        hostProviderId,
        emailId,
        createdOn, // หรือ createdAt
      },
    });

    return NextResponse.redirect(new URL(`/hosts/${id}/view`, req.url), 303);
  } catch (e) {
    console.error("Update All Host error:", e);
    return NextResponse.json({ ok: false, error: "อัปเดตไม่สำเร็จ" }, { status: 500 });
  }
}