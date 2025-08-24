"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export type ActionState = { ok: boolean; message: string };

const TypeSchema = z.object({
  name: z.string().trim().min(2, "กรุณาระบุชื่ออย่างน้อย 2 ตัวอักษร").max(100),
  note: z.string().trim().max(500).optional().transform(v => (v === "" ? undefined : v)),
});

export async function createType(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const p = TypeSchema.safeParse({ name: fd.get("name"), note: fd.get("note") });
  if (!p.success) return { ok: false, message: p.error.issues[0].message };
  const exist = await prisma.hostType.findUnique({ where: { name: p.data.name } });
  if (exist) return { ok: false, message: "มีชื่อนี้อยู่แล้ว" };
  const row = await prisma.hostType.create({ data: p.data });
  revalidatePath("/host-types");
  redirect(`/host-types/${row.id}/edit`);
}

export async function updateType(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const id = String(fd.get("id") || "");
  if (!id) return { ok: false, message: "ไม่พบ ID" };
  const p = TypeSchema.safeParse({ name: fd.get("name"), note: fd.get("note") });
  if (!p.success) return { ok: false, message: p.error.issues[0].message };
  await prisma.hostType.update({ where: { id }, data: p.data });
  revalidatePath("/host-types");
  redirect("/host-types");
}

export async function deleteType(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const id = String(fd.get("id") || "");
  if (!id) return { ok: false, message: "ไม่พบ ID" };
  await prisma.hostType.delete({ where: { id } });
  revalidatePath("/host-types");
  redirect("/host-types");
}