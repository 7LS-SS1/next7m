// ใช้ COMPLETED แทน SUCCEEDED
import { PluginProcessStatus } from "@prisma/client";

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const BodySchema = z.object({ id: z.string().min(1) });

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => ({}));
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid input", issues: parsed.error.issues },
      { status: 400 }
      );
    }

    const pluginId = parsed.data.id;

    // ระบุสถานะกำลังประมวลผล
    await prisma.plugin.update({
      where: { id: pluginId },
      data: { status: PluginProcessStatus.PROCESSING, error: null },
      select: { id: true },
    });

    // TODO: ใส่ลอจิกประมวลผลจริง (scan/verify/etc.)

    // ✅ เสร็จสมบูรณ์
    await prisma.plugin.update({
      where: { id: pluginId },
      data: {
        status: PluginProcessStatus.COMPLETED, // <-- แทน SUCCEEDED
        processedAt: new Date(),
        error: null,
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, status: "COMPLETED" });
  } catch (err: any) {
    // พัง → FAILED
    try {
      const body = await req.json().catch(() => ({}));
      const id = body?.id as string | undefined;
      if (id) {
        await prisma.plugin.update({
          where: { id },
          data: {
            status: PluginProcessStatus.FAILED,
            error: String(err?.message || err),
          },
        });
      }
    } catch {}

    return NextResponse.json(
      { ok: false, error: err?.message || "Process failed" },
      { status: 500 }
    );
  }
}