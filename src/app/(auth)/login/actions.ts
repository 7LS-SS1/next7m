"use server";

import { prisma } from "@lib/db"; // ✅ Node client
import { verifyPassword, hashPassword } from "@lib/crypto";
import { redirect } from "next/navigation";
import { createSession } from "@lib/auth-server";

export type LoginState = { ok: boolean; message: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const FAIL = (code: string, msg?: string): LoginState => ({
    ok: false,
    message: `[${code}]${msg ? " " + msg : ""}`,
  });

  // 1) รับค่า
  const identifier = (formData.get("identifier") || "").toString().trim();
  const password = (formData.get("password") || "").toString();
  if (!identifier || !password) return FAIL("E_INPUT", "กรุณากรอกข้อมูลให้ครบถ้วน");

  const looksLikeEmail = identifier.includes("@");
  const normalizedEmail = identifier.toLowerCase();

  // 2) ดึงผู้ใช้ด้วย field ที่ถูกต้อง
  let user:
    | { id: string; email: string; role: string; passwordHash: string }
    | null = null;

  try {
    user = await prisma.user.findUnique({
      where: looksLikeEmail ? { email: normalizedEmail } : { id: identifier },
      select: { id: true, email: true, role: true, passwordHash: true },
    });
  } catch {
    return FAIL("E_DB_FIND");
  }
  if (!user) return FAIL("E_NOT_FOUND", "ไม่พบบัญชีผู้ใช้ตามข้อมูลที่ระบุ");

  // 3) ตรวจรหัสผ่าน
  try {
    const match = await verifyPassword(password, user.passwordHash);
    if (!match) return FAIL("E_BAD_CREDENTIALS", "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
  } catch {
    return FAIL("E_VERIFY");
  }

  // 4) อัปเกรด hash (ถ้าจำเป็น)
  try {
    if (!user.passwordHash.startsWith("$2") && !user.passwordHash.startsWith("$argon2")) {
      const newHash = await hashPassword(password);
      await prisma.user.update({ where: { id: user.id }, data: { passwordHash: newHash } });
    }
  } catch {
    // เงียบไว้ไม่ขัด flow
  }

  // 5) ออก session แบบ JWT (HttpOnly)
  await createSession({ sub: user.id, email: user.email, role: user.role });

  // 6) ไปหน้าแดชบอร์ด
  redirect("/dashboard");
}