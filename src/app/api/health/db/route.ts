// src/app/api/health/db/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const rows = await prisma.$queryRawUnsafe<{ now: Date }[]>("SELECT NOW() as now");
    const nowIso = rows?.[0]?.now?.toISOString?.() ?? String(rows?.[0]?.now ?? "");
    return NextResponse.json({ ok: true, now: nowIso });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}