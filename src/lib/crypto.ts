// src/lib/crypto.ts
import bcrypt from "bcryptjs";

export async function hashPassword(plain: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

export async function verifyPassword(plain: string, hashed: string) {
  // bcrypt
  if (hashed.startsWith("$2a$") || hashed.startsWith("$2b$") || hashed.startsWith("$2y$")) {
    return bcrypt.compare(plain, hashed);
  }
  // argon2 (optional): ถ้าจำเป็นค่อยติดตั้ง pnpm add argon2 แล้วเปิดใช้
  if (hashed.startsWith("$argon2")) {
    try {
      const argon2 = require("argon2") as typeof import("argon2");
      return argon2.verify(hashed, plain);
    } catch {
      return false;
    }
  }
  // plain text (seed เก่า)
  return plain === hashed;
}