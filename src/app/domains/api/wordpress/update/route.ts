// src/app/domains/api/wordpress/update/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const BodySchema = z
  .object({
    id: z.string().optional(),
    domainId: z.string().optional(),
    url: z
      .string()
      .url()
      .optional()
      .or(z.literal(""))
      .transform((v) => v || undefined),
    user: z.string().optional().or(z.literal("")).transform((v) => v || undefined),
    password: z.string().optional().or(z.literal("")),
  })
  .refine((v) => v.id || v.domainId, { message: "Require id or domainId" });

export async function POST(req: Request) {
  try {
    const isForm = (req.headers.get("content-type") || "").includes("form");
    const raw = isForm ? Object.fromEntries((await req.formData()).entries()) : await req.json();
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
    }

    const { id, domainId, url, user, password } = parsed.data;

    // ถ้าไม่มีโมเดล Wordpress ใน Prisma Client ให้ตอบ 501 พร้อม fallback ตั้ง wordpressInstall
    const anyPrisma = prisma as any;
    const WP = anyPrisma.wordpress;
    if (!WP?.findFirst || !WP?.update) {
      if (domainId) {
        await prisma.domain.update({ where: { id: domainId }, data: { wordpressInstall: true } });
      }
      return NextResponse.json({ ok: false, error: "Wordpress model not available in Prisma Client", hint: "รัน migration/add model แล้ว prisma generate" }, { status: 501 });
    }

    // หาเรคอร์ดจาก id หรือ domainId
    const where = id ? { id } : { domainId };
    const row = await WP.findFirst({ where });
    if (!row) {
      return NextResponse.json({ ok: false, error: "Wordpress not found" }, { status: 404 });
    }

    const data: any = {};
    if (typeof url !== "undefined") data.url = url || null;
    if (typeof user !== "undefined") data.user = user || null;
    if (typeof password !== "undefined" && password) {
      data.password = password;
    }

    const updated = await WP.update({
      where: { id: row.id },
      data,
      select: { id: true, domainId: true, url: true, user: true, password: true, createdAt: true, updatedAt: true },
    });

    await prisma.domain.update({ where: { id: updated.domainId }, data: { wordpressInstall: true } });

    return NextResponse.json({ ok: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Unexpected error" }, { status: 500 });
  }
}