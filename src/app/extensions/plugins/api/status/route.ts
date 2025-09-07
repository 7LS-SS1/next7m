// src/app/extensions/plugins/api/status/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, error: "missing id" }, { status: 400 });

    const p = await prisma.plugin.findUnique({
      where: { id },
      select: { id: true, status: true, error: true, processedAt: true },
    });
    if (!p) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });

    return NextResponse.json({ ok: true, data: p });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "status failed" }, { status: 500 });
  }
}