

"use server";

import { prisma } from "@lib/db";
import { hashPassword } from "@lib/crypto";
import { z } from "zod";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

const RegisterSchema = z.object({
  email: z.string().email("อีเมลไม่ถูกต้อง"),
  password: z.string().min(8, "รหัสผ่านต้องอย่างน้อย 8 ตัวอักษร").max(72, "รหัสผ่านยาวเกินไป"),
  name: z.string().min(1, "กรอกชื่อแสดงผล"),
  accept: z.literal("on").optional(),
});

export async function registerAction(formData: FormData) {
  const raw = {
    email: String(formData.get("email") || "").trim().toLowerCase(),
    password: String(formData.get("password") || ""),
    name: String(formData.get("name") || "").trim(),
    accept: formData.get("accept") ? "on" : undefined,
  };

  const parsed = RegisterSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = Object.values(parsed.error.format())[0] as any;
    return { ok: false, error: firstError?._errors?.[0] ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const { email, password, name } = parsed.data;

  // ตรวจสอบว่าอีเมลซ้ำหรือไม่
  const exists = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (exists) {
    return { ok: false, error: "อีเมลนี้ถูกใช้งานแล้ว" };
  }

  // บันทึกผู้ใช้ใหม่
  const passwordHash = await hashPassword(password);
  await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      role: Role.STAFF,
    },
    select: { id: true },
  });

  // สมัครสำเร็จ → ไปหน้า Login
  redirect("/login");
}