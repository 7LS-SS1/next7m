"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const DomainSchema = z.object({
  name: z.string().trim().min(3).max(253), // ชื่อโดเมน
  note: z.string().trim().max(500).optional().or(z.literal("")),
});

export type ActionState = { ok: boolean; message: string };

export async function createDomain(_prev: ActionState, form: FormData): Promise<ActionState> {
  const parsed = DomainSchema.safeParse({
    name: String(form.get("name") || ""),
    note: String(form.get("note") || ""),
  });
  if (!parsed.success) return { ok: false, message: "รูปแบบไม่ถูกต้อง" };

  const { name, note } = parsed.data;

  try {
    await prisma.domain.create({
      data: { name: name.toLowerCase(), note: note || undefined, status: "PENDING" },
    });
    revalidatePath("/domain");
    return { ok: true, message: "เพิ่มโดเมนสำเร็จ" };
  } catch (e: any) {
    if (e?.code === "P2002") return { ok: false, message: "โดเมนนี้ถูกเพิ่มไว้แล้ว" };
    return { ok: false, message: "เพิ่มไม่สำเร็จ" };
  }
}

export async function updateDomain(_prev: ActionState, form: FormData): Promise<ActionState> {
  const id = String(form.get("id") || "");
  const parsed = DomainSchema.partial().required({}).safeParse({
    name: form.get("name") ? String(form.get("name")) : undefined,
    note: form.get("note") ? String(form.get("note")) : undefined,
  });
  if (!id) return { ok: false, message: "ไม่พบไอดี" };
  if (!parsed.success) return { ok: false, message: "รูปแบบไม่ถูกต้อง" };

  try {
    await prisma.domain.update({
      where: { id },
      data: {
        ...(parsed.data.name ? { name: parsed.data.name.toLowerCase() } : {}),
        ...(parsed.data.note !== undefined ? { note: parsed.data.note || null } : {}),
      },
    });
    revalidatePath("/domain");
    return { ok: true, message: "อัปเดตสำเร็จ" };
  } catch {
    return { ok: false, message: "อัปเดตไม่สำเร็จ" };
  }
}

export async function setStatus(_prev: ActionState, form: FormData): Promise<ActionState> {
  const id = String(form.get("id") || "");
  const status = String(form.get("status") || "");
  if (!id) return { ok: false, message: "ไม่พบไอดี" };
  if (!["ACTIVE", "INACTIVE", "PENDING"].includes(status)) {
    return { ok: false, message: "สถานะไม่ถูกต้อง" };
  }
  try {
    await prisma.domain.update({ where: { id }, data: { status: status as any } });
    revalidatePath("/domain");
    return { ok: true, message: "เปลี่ยนสถานะแล้ว" };
  } catch {
    return { ok: false, message: "เปลี่ยนสถานะไม่สำเร็จ" };
  }
}

export async function deleteDomain(_prev: ActionState, form: FormData): Promise<ActionState> {
  const id = String(form.get("id") || "");
  if (!id) return { ok: false, message: "ไม่พบไอดี" };
  try {
    await prisma.domain.delete({ where: { id } });
    revalidatePath("/domain");
    return { ok: true, message: "ลบแล้ว" };
  } catch {
    return { ok: false, message: "ลบไม่สำเร็จ" };
  }
}