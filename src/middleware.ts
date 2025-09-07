// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "@lib/auth-server"; // ฟังก์ชันดึง session user

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  // เช็คเฉพาะ API ที่ไม่ให้ STAFF แก้ไข
  if (url.pathname.startsWith("/extensions") || url.pathname.startsWith("/domains")) {
    const session = await getSession().catch(() => null);
    if (session?.role === "STAFF") {
      // ถ้าเป็น method POST/PUT/PATCH/DELETE → บล็อก
      if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
        return NextResponse.json(
          { ok: false, error: "คุณไม่มีสิทธิ์แก้ไข (STAFF ดูได้เท่านั้น)" },
          { status: 403 }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/extensions/:path*", "/domains/:path*"], // เลือก path ที่จะป้องกัน
};