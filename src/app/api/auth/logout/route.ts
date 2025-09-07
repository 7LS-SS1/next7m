export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { destroySession } from "@lib/auth-server";

export async function POST(req: Request) {
  await destroySession();
  // ✅ ยึด origin ของ req เสมอ
  return NextResponse.redirect(new URL("/login", req.url), { status: 302 });
}

export async function GET(req: Request) {
  await destroySession();
  return NextResponse.redirect(new URL("/login", req.url), { status: 302 });
}