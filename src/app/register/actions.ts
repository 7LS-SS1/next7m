"use server";

import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";

const RegisterSchema = z.object({
  email: z.string().email(),
  phone: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v || undefined)),
  password: z.string().min(6),
});

// ✅ Server Action signature for <form action={...}> — only (formData)
export async function registerAction(formData: FormData): Promise<void> {
  const input = {
    email: String(formData.get("email") || ""),
    phone: String(formData.get("phone") || ""),
    password: String(formData.get("password") || ""),
  };

  const parsed = RegisterSchema.safeParse(input);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message || "Invalid input";
    redirect(`/register?toast=error&detail=${encodeURIComponent(msg)}`);
  }

  const { email, phone, password } = parsed.data;

  const exist = await prisma.user.findFirst({
    where: { email },
  });

  if (exist) {
    redirect(`/register?toast=error&detail=${encodeURIComponent("อีเมลนี้ถูกใช้แล้ว")}`);
  }

  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      password: hashed,
    },
  });

  // สำเร็จ -> ไปหน้าเข้าสู่ระบบ พร้อม toast
  redirect("/login?toast=created&detail=%E0%B8%AA%E0%B8%A1%E0%B8%B1%E0%B8%84%E0%B8%A3%E0%B8%AA%E0%B8%A1%E0%B8%B2%E0%B8%8A%E0%B8%B4%E0%B8%81%E0%B8%AA%E0%B8%B3%E0%B9%80%E0%B8%A3%E0%B9%87%E0%B8%88");
}

// (ออปชัน) เผื่อที่อื่นต้องการรูปแบบ useActionState(prev, formData)
export async function registerActionState(_prev: unknown, formData: FormData) {
  await registerAction(formData);
}