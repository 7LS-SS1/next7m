"use server";

import { prisma } from "@/lib/db"; // ✅ ใช้ Node client เท่านั้น
import { verifyPassword, hashPassword } from "@/lib/crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type LoginState = { ok: boolean; message: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  // Helper สำหรับส่ง error code ชัดเจน
  const FAIL = (code: string, extra?: string): LoginState => {
    // แสดงรหัส error กลับไปที่ UI โดยตรงเพื่อดีบัก
    return { ok: false, message: `[${code}]${extra ? " " + extra : ""}` };
  };

  // 1) รับค่า
  const identifier = (formData.get("identifier") || "").toString().trim();
  const password = (formData.get("password") || "").toString();
  if (!identifier || !password)
    return FAIL("E_INPUT", "กรุณากรอกข้อมูลให้ครบถ้วน");

  const looksLikeEmail = identifier.includes("@");
  const normalizedEmail = identifier.toLowerCase();

  let user: { id: string; email: string; password: string } | null = null;

  try {
    user = await prisma.user.findFirst({
      where: looksLikeEmail
        ? { email: normalizedEmail }
        : { OR: [{ id: identifier }, { email: normalizedEmail }] },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });
  } catch (e: any) {
    return FAIL("E_DB_FIND", e?.message || String(e));
  }
  if (!user) return FAIL("E_NOT_FOUND", "ไม่พบบัญชีผู้ใช้ตามข้อมูลที่ระบุ");

  let match = false;
  try {
    match = await verifyPassword(password, user.password);
  } catch (e: any) {
    return FAIL("E_VERIFY", e?.message || String(e));
  }
  if (!match) return FAIL("E_BAD_CREDENTIALS", "อีเมลหรือรหัสผ่านไม่ถูกต้อง");

  try {
    if (
      !user.password.startsWith("$2") &&
      !user.password.startsWith("$argon2")
    ) {
      const newHash = await hashPassword(password);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: newHash },
      });
    }
  } catch (e: any) {
    // return FAIL("E_UPGRADE", e?.message || String(e));
  }

  const jar = await cookies();
  const sid =
    globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);

  jar.set("sid", sid, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect("/dashboard");
}
