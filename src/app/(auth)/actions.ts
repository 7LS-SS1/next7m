"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@lib/db";
import { createSession, destroySession } from "@lib/auth-server";
import { redirect } from "next/navigation";
import { LoginSchema, RegisterSchema } from "@lib/zod-helpers";


import { headers } from "next/headers";
import { hit } from "@lib/limit";

export async function registerAction(_: any, fd: FormData) {
  const ip = (await headers()).get("x-forwarded-for") || "local";
  const rl = hit(ip);
  if (!rl.allowed) return { ok: false, message: "ลองใหม่ภายหลัง (rate limit)" };
  const data = {
    email: String(fd.get("email") || "")
      .trim()
      .toLowerCase(),
    password: String(fd.get("password") || ""),
    name: String(fd.get("name") || ""),
    role: String(fd.get("role") || "STAFF"),
  };
  const parsed = RegisterSchema.safeParse(data);
  if (!parsed.success)
    return {
      ok: false,
      message: parsed.error.issues?.[0]?.message || "อินพุตไม่ถูกต้อง",
    };

  try {
    const hash = await bcrypt.hash(parsed.data.password, 12);
    const user = await prisma.user.create({
      data: {
        email: parsed.data.email,
        name: parsed.data.name,
        passwordHash: hash,
        role: parsed.data.role as any,
      },
    });
    await createSession({ sub: user.id, email: user.email, role: user.role });
    redirect("/dashboard");
  } catch (e: any) {
    if (e?.code === "P2002") return { ok: false, message: "อีเมลถูกใช้แล้ว" };
    return { ok: false, message: "เกิดข้อผิดพลาด" };
  }
}

export async function loginAction(_: any, fd: FormData) {
  const data = {
    email: String(fd.get("email") || "")
      .trim()
      .toLowerCase(),
    password: String(fd.get("password") || ""),
  };
  const parsed = LoginSchema.safeParse(data);
  if (!parsed.success)
    return {
      ok: false,
      message: parsed.error.issues?.[0]?.message || "อินพุตไม่ถูกต้อง",
    };

  try {
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true, email: true, passwordHash: true, role: true },
    });
    if (!user) return { ok: false, message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };

    const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!ok) return { ok: false, message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
    await createSession({ sub: user.id, email: user.email, role: user.role });
    redirect("/dashboard");
  } catch {
    return { ok: false, message: "เกิดข้อผิดพลาด" };
  }
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
