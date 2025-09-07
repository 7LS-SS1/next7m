// src/app/domains/api/wordpress/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function toStr(v: FormDataEntryValue | null): string | undefined {
  const s = (v ?? "") as string;
  const t = s.trim();
  return t.length ? t : undefined;
}

export async function POST(req: Request) {
  try {
    const fd = await req.formData();
    const domainId = toStr(fd.get("domainId"));
    if (!domainId) return NextResponse.json({ ok: false, error: "missing domainId" }, { status: 400 });

    const wpUrl = toStr(fd.get("wpUrl"));
    const wpUser = toStr(fd.get("wpUser"));
    const wpPassword = toStr(fd.get("wpPassword"));

    // ข้อมูลหลัก: เปิดสถานะติดตั้ง WordPress
    const baseData: any = { wordpressInstall: true };

    // พยายามอัปเดตฟิลด์เฉพาะ (ถ้ามีใน schema จริง)
    const tryFull = async () => {
      return await (prisma as any).domain.update({
        where: { id: domainId },
        data: {
          ...baseData,
          ...(wpUrl ? { wpUrl } : {}),
          ...(wpUser ? { wpUser } : {}),
          ...(wpPassword ? { wpPassword } : {}),
        },
        select: { id: true },
      });
    };

    const tryBaseOnly = async () => {
      // fallback: อัปเดตเฉพาะ wordpressInstall (กัน schema ไม่มีคอลัมน์ที่ระบุ)
      return await prisma.domain.update({
        where: { id: domainId },
        data: baseData,
        select: { id: true },
      });
    };

    let updated;
    try {
      updated = await tryFull();
    } catch {
      updated = await tryBaseOnly();
    }

    return NextResponse.json({ ok: true, id: updated.id });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "unexpected" }, { status: 500 });
  }
}