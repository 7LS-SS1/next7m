"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export type ActionState = { ok: boolean; message: string };

const HostSchema = z.object({
  name: z.string().trim().min(2, "กรุณาระบุชื่อโฮสต์อย่างน้อย 2 ตัวอักษร").max(100),
  ip: z.string().trim().max(100).optional().transform(v => (v === "" ? undefined : v)),
  note: z.string().trim().max(500).optional().transform(v => (v === "" ? undefined : v)),
  status: z.enum(["ACTIVE", "INACTIVE"]) 
           .optional()
           .transform(v => v ?? "ACTIVE"),
  // dropdown เลือกจากรายการ
  providerId: z.string().optional().transform(v => (v === "" ? undefined : v)),
  groupId: z.string().optional().transform(v => (v === "" ? undefined : v)),
  // ช่อง “เพิ่มใหม่”
  providerNew: z.string().trim().optional().transform(v => (v === "" ? undefined : v)),
  groupNew: z.string().trim().optional().transform(v => (v === "" ? undefined : v)),
});

async function ensureProviderId(input: { providerId?: string; providerNew?: string }) {
  if (input.providerId) return input.providerId;
  if (input.providerNew) {
    const exist = await prisma.hostProvider.findUnique({ where: { name: input.providerNew } });
    if (exist) return exist.id;
    const created = await prisma.hostProvider.create({ data: { name: input.providerNew } });
    return created.id;
  }
  return undefined;
}

async function ensureGroupId(input: { groupId?: string; groupNew?: string }) {
  if (input.groupId) return input.groupId;
  if (input.groupNew) {
    const exist = await prisma.hostGroup.findUnique({ where: { name: input.groupNew } });
    if (exist) return exist.id;
    const created = await prisma.hostGroup.create({ data: { name: input.groupNew } });
    return created.id;
  }
  return undefined;
}

export async function createHost(_prev: ActionState, formData: FormData): Promise<ActionState> {
  // debug form (dev เท่านั้น)
  if (process.env.NODE_ENV === "development") {
    console.log("[createHost] entries:", Object.fromEntries(formData.entries()));
  }

  const parsed = HostSchema.safeParse({
    name: formData.get("name"),
    ip: formData.get("ip"),
    note: formData.get("note"),
    status: formData.get("status"),
    providerId: formData.get("providerId"),
    groupId: formData.get("groupId"),
    providerNew: formData.get("providerNew"),
    groupNew: formData.get("groupNew"),
  });
  if (!parsed.success) {
    const first = parsed.error.issues?.[0];
    return { ok: false, message: first?.message || "ข้อมูลไม่ถูกต้อง" };
  }

  try {
    const [providerId, groupId] = await Promise.all([
      ensureProviderId(parsed.data),
      ensureGroupId(parsed.data),
    ]);

    const exist = await prisma.host.findUnique({ where: { name: parsed.data.name } });
    if (exist) return { ok: false, message: "มีชื่อโฮสต์นี้อยู่แล้ว" };

    const h = await prisma.host.create({
      data: {
        name: parsed.data.name,
        ip: parsed.data.ip,
        note: parsed.data.note,
        status: parsed.data.status!,
        providerId,
        groupId,
      },
    });

    revalidatePath("/host");
    redirect(`/host/${h.id}`);
  } catch (e: any) {
    return { ok: false, message: e?.message ?? "ไม่สามารถเพิ่มโฮสต์ได้" };
  }
}

export async function updateHost(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get("id") || "");
  if (!id) return { ok: false, message: "ไม่พบ ID" };

  const parsed = HostSchema.safeParse({
    name: formData.get("name"),
    ip: formData.get("ip"),
    note: formData.get("note"),
    status: formData.get("status"),
    providerId: formData.get("providerId"),
    groupId: formData.get("groupId"),
    providerNew: formData.get("providerNew"),
    groupNew: formData.get("groupNew"),
  });
  if (!parsed.success) {
    const first = parsed.error.issues?.[0];
    return { ok: false, message: first?.message || "ข้อมูลไม่ถูกต้อง" };
  }

  try {
    const [providerId, groupId] = await Promise.all([
      ensureProviderId(parsed.data),
      ensureGroupId(parsed.data),
    ]);

    await prisma.host.update({
      where: { id },
      data: {
        name: parsed.data.name,
        ip: parsed.data.ip,
        note: parsed.data.note,
        status: parsed.data.status!,
        providerId,
        groupId,
      },
    });

    revalidatePath("/host");
    redirect(`/host/${id}`);
  } catch (e: any) {
    return { ok: false, message: e?.message ?? "อัปเดตไม่สำเร็จ" };
  }
}

export async function deleteHost(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const id = String(formData.get("id") || "");
    if (!id) return { ok: false, message: "ไม่พบ ID" };
    await prisma.host.delete({ where: { id } });
    revalidatePath("/host");
    redirect("/host");
  } catch (e: any) {
    return { ok: false, message: e?.message ?? "ลบไม่สำเร็จ" };
  }
}