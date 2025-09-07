import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@lib/db";

const IPV4 = /^((25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(25[0-5]|2[0-4]\d|1?\d?\d)$/;

export async function POST(req: NextRequest) {
  const form = await req.formData();

  const title = String(form.get("title") || "").trim();
  const hostProviderId = String(form.get("hostProviderId") || "").trim();
  const ip = String(form.get("ip") || "").trim();
  const emailId = String(form.get("emailId") || "").trim();
  const createdAtStr = String(form.get("createdAt") || "").trim(); // yyyy-MM-dd
  const note = String(form.get("note") || "").trim();

  if (!title) return NextResponse.json({ ok: false, error: "กรอกชื่อ (Title)" }, { status: 400 });
  if (!hostProviderId) return NextResponse.json({ ok: false, error: "กรุณาเลือก Host Provider" }, { status: 400 });
  if (!IPV4.test(ip)) return NextResponse.json({ ok: false, error: "รูปแบบ IP ไม่ถูกต้อง (IPv4)" }, { status: 400 });
  if (!emailId) return NextResponse.json({ ok: false, error: "กรุณาเลือกอีเมล" }, { status: 400 });
  if (!createdAtStr) return NextResponse.json({ ok: false, error: "กรุณาเลือกวันที่สร้าง" }, { status: 400 });

  const createdOn = new Date(createdAtStr);
  if (Number.isNaN(createdOn.getTime())) {
    return NextResponse.json({ ok: false, error: "วันที่สร้างไม่ถูกต้อง" }, { status: 400 });
  }

  // --- DEV guard: ตรวจว่ามีโมเดล allHost ใน Prisma Client จริงหรือไม่ ---
  const anyPrisma = prisma as unknown as Record<string, any>;
  if (!anyPrisma.allHost?.create) {
    const available = Object.keys(anyPrisma).filter((k) => {
      try {
        return typeof anyPrisma[k]?.create === "function";
      } catch {
        return false;
      }
    });
    console.error("[AllHost] Prisma model not found. Available models:", available);
    return NextResponse.json(
      {
        ok: false,
        error:
          'Prisma Client ไม่มีโมเดล "allHost". กรุณาตรวจชื่อโมเดลใน prisma/schema.prisma (เช่น model AllHost { ... }) แล้วรัน "npx prisma generate". ดู server logs เพื่อดูรายชื่อโมเดลทั้งหมด.',
        models: available,
      },
      { status: 500 }
    );
  }

  try {
    await anyPrisma.allHost.create({
      data: {
        title,
        ip,
        note: note || null,
        hostProviderId,
        emailId,
        createdOn, // หรือใช้ createdAt ถ้าคุณเลือกแบบนั้นใน schema
      },
      select: { id: true },
    });

    return NextResponse.redirect(new URL("/hosts/all-hosts", req.url), 303);
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ ok: false, error: "ข้อมูลซ้ำ ไม่สามารถบันทึกได้" }, { status: 409 });
    }
    console.error("Create All Host error:", e);
    return NextResponse.json({ ok: false, error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}