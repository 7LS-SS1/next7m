// src/app/domains/api/wordpress/create/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const BodySchema = z.object({
  domainId: z.string().min(1, "missing domainId"),
  url: z.string().url().optional().or(z.literal("")).transform((v) => v || undefined),
  user: z.string().optional().or(z.literal("")).transform((v) => v || undefined),
  password: z.string().optional().or(z.literal("")),
});

export async function POST(req: Request) {
  try {
    const isForm = (req.headers.get("content-type") || "").includes("form");
    const raw = isForm ? Object.fromEntries((await req.formData()).entries()) : await req.json();
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
    }

    const { domainId, url, user, password } = parsed.data;

    const anyPrisma = prisma as any;
    const WP = anyPrisma.wordpress;
    if (!WP?.findUnique || !WP?.create) {
      // fallback: set flag ที่ Domain ให้ระบบเดินต่อได้ชั่วคราว
      await prisma.domain.update({ where: { id: domainId }, data: { wordpressInstall: true } });
      return NextResponse.json({ ok: false, error: "Wordpress model not available in Prisma Client", hint: "รัน migration/add model แล้ว prisma generate" }, { status: 501 });
    }

    const exists = await WP.findUnique({ where: { domainId } });
    if (exists) {
      return NextResponse.json({ ok: false, error: "Wordpress already exists for this domain", id: exists.id }, { status: 409 });
    }

    const created = await WP.create({
      data: { domainId, url, user, password },
      select: { id: true, domainId: true, url: true, user: true, password: true, createdAt: true, updatedAt: true },
    });

    await prisma.domain.update({ where: { id: domainId }, data: { wordpressInstall: true } });

    return NextResponse.json({ ok: true, data: created });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Unexpected error" }, { status: 500 });
  }
}