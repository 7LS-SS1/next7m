import { NextResponse, NextRequest } from "next/server";
import { destroySession } from "@lib/auth-server";

export async function POST(req: NextRequest) {
  await destroySession();
  return NextResponse.redirect(new URL("/login", req.url));
}

export async function GET() {
  return NextResponse.json({ ok: false, error: "Method Not Allowed" }, { status: 405 });
}