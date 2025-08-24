// src/app/api/debug/login/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("id") || "").toString().trim();
  if (!q) return NextResponse.json({ ok: false, error: "missing id" }, { status: 400 });

  const looksLikeEmail = q.includes("@");
  const normalizedEmail = q.toLowerCase();
  const normalizedPhone = q.replace(/[^\d+]/g, "");

  const user = await prisma.user.findFirst({
    where: looksLikeEmail
      ? { email: normalizedEmail }
      : { OR: [{ phone: normalizedPhone }, { email: normalizedEmail }] },
    select: { id: true, email: true, phone: true, password: true, createdAt: true },
  });

  if (!user) return NextResponse.json({ ok: true, found: false });

  const prefix = user.password.slice(0, 12);
  const algo =
    prefix.startsWith("$2") ? "bcrypt" :
    prefix.startsWith("$argon2") ? "argon2" :
    "plain_or_unknown";

  return NextResponse.json({
    ok: true,
    found: true,
    id: user.id,
    email: user.email,
    phone: user.phone,
    algo,
    hashPrefix: prefix,
    createdAt: user.createdAt,
  });
}