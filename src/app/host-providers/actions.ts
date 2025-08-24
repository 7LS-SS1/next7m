"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export type ActionState = { ok: boolean; message: string };

const ProviderSchema = z.object({
  name: z.string().trim().min(2, "กรุณาระบุชื่ออย่างน้อย 2 ตัวอักษร").max(100),
  note: z.string().trim().max(500).optional().transform(v => (v === "" ? undefined : v)),
});

export async function createProvider(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const p = ProviderSchema.safeParse({ name: fd.get("name"), note: fd.get("note") });
  if (!p.success) return { ok: false, message: p.error.issues[0].message };
  const exist = await prisma.hostProvider.findUnique({ where: { name: p.data.name } });
  if (exist) return { ok: false, message: "มีชื่อนี้อยู่แล้ว" };
  const row = await prisma.hostProvider.create({ data: p.data });
  revalidatePath("/host-providers");
  redirect(`/host-providers/${row.id}/edit`);
}

export async function updateProvider(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const id = String(fd.get("id") || "");
  if (!id) return { ok: false, message: "ไม่พบ ID" };
  const p = ProviderSchema.safeParse({ name: fd.get("name"), note: fd.get("note") });
  if (!p.success) return { ok: false, message: p.error.issues[0].message };
  await prisma.hostProvider.update({ where: { id }, data: p.data });
  revalidatePath("/host-providers");
  redirect("/host-providers");
}

export async function deleteProvider(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const id = String(fd.get("id") || "");
  if (!id) return { ok: false, message: "ไม่พบ ID" };
  await prisma.hostProvider.delete({ where: { id } });
  revalidatePath("/host-providers");
  redirect("/host-providers");
}