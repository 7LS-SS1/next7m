import { NextResponse } from "next/server";
import { getSession } from "@lib/auth-server";
import { prisma } from "@lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: true, user: null });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { id: true, email: true, name: true, role: true },
  });

  return NextResponse.json({ ok: true, user });
}