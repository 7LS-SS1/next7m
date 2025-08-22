// src/lib/crypto.ts
import bcrypt from 'bcrypt'

export async function hashPassword(plain: string) {
  // saltRounds 12: สมดุลความเร็ว/ความปลอดภัย
  return bcrypt.hash(plain, 12)
}