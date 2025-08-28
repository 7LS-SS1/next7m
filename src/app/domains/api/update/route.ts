import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { z } from "zod";
import type { Prisma, DomainStatus } from "@prisma/client";

const LIST = "/domains";

const trim = (v: unknown) => (v == null ? undefined : v.toString().trim());
const empty = (v: unknown) => {
  const s = v == null ? "" : v.toString().trim();
  return s === "" ? undefined : s;
};

// parse `YYYY-MM-DD` or ISO string to Date (or undefined)
const toDate = (v: unknown) => {
  const s = trim(v);
  if (!s) return undefined;
  // Accept only safe dates
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? undefined : d;
};

const Schema = z.object({
  id: z.preprocess(trim, z.string().min(1)),
  name: z.preprocess(trim, z.string().min(2).max(255)),
  note: z.preprocess(empty, z.string().max(500).optional()),
  status: z.preprocess(trim, z.enum(["ACTIVE", "INACTIVE", "PENDING"]).optional()),
  // optional dates
  registeredAt: z.preprocess(toDate, z.date().optional()),
  expiresAt: z.preprocess(toDate, z.date().optional()),
});

export async function POST(req: Request) {
  try {
    const fd = await req.formData();
    const p = Schema.safeParse({
      id: fd.get("id"),
      name: fd.get("name"),
      note: fd.get("note"),
      status: fd.get("status"),
      registeredAt: fd.get("registeredAt"),
      expiresAt: fd.get("expiresAt"),
    });

    if (!p.success) {
      return NextResponse.redirect(
        new URL(`${LIST}?toast=invalid&detail=ข้อมูลไม่ถูกต้อง`, req.url),
        { status: 303 },
      );
    }

    // calculate expiresAt if not provided but registeredAt is present (+1 year)
    let expiresAt: Date | undefined = p.data.expiresAt;
    if (!expiresAt && p.data.registeredAt) {
      const d = new Date(p.data.registeredAt);
      d.setFullYear(d.getFullYear() + 1);
      expiresAt = d;
    }

    // Build Prisma update payload (type-safe)
    const data: Prisma.DomainUpdateInput = {
      name: p.data.name,
      ...(p.data.note !== undefined ? { note: p.data.note } : {}),
      ...(p.data.status ? { status: p.data.status as DomainStatus } : {}),
      ...(p.data.registeredAt ? { registeredAt: p.data.registeredAt } : {}),
      ...(expiresAt ? { expiresAt } : {}),
    };

    await prisma.domain.update({ where: { id: p.data.id }, data });

    // Revalidate list and view pages
    revalidatePath(LIST);
    revalidatePath(`${LIST}/${p.data.id}/view`);

    return NextResponse.redirect(
      new URL(`${LIST}?toast=updated&detail=อัปเดตสำเร็จ`, req.url),
      { status: 303 },
    );
  } catch (e: any) {
    // Prisma duplicate error
    if (e?.code === "P2002") {
      return NextResponse.redirect(
        new URL(`${LIST}?toast=invalid&detail=มีโดเมนนี้อยู่แล้ว`, req.url),
        { status: 303 },
      );
    }
    const msg = encodeURIComponent(e?.message ?? "อัปเดตไม่สำเร็จ");
    return NextResponse.redirect(new URL(`${LIST}?toast=error&detail=${msg}`, req.url), {
      status: 303,
    });
  }
}