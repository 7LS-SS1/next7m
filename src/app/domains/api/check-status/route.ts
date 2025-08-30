// src/app/domains/api/check-status/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ใช้ HEAD ก่อน ถ้าไม่รองรับค่อย fallback เป็น GET
async function probe(url: string, init?: RequestInit): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    return await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      cache: "no-store",
      signal: ctrl.signal,
      ...init,
    });
  } finally {
    clearTimeout(t);
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  if (!url) return NextResponse.json({ ok: false, error: "missing_url" }, { status: 400 });

  const target = url.startsWith("http") ? url : `https://${url}`;

  try {
    let res = await probe(target);
    if (res.status === 405 || res.status === 501) {
      // บางโฮสต์ไม่รับ HEAD → ลอง GET (ไม่ดึง body)
      res = await probe(target, { method: "GET" });
    }
    return NextResponse.json({ ok: true, status: res.status, url: res.url });
  } catch (e: any) {
    // อยากให้ UI เห็นว่าเช็คไม่สำเร็จ แต่ไม่ให้ล่ม → ส่ง 200 พร้อม error message
    return NextResponse.json(
      { ok: false, error: e?.name || "fetch_error", message: e?.message || String(e) },
      { status: 200 }
    );
  }
}