import { z } from "zod";

export function parseBoolean(value: FormDataEntryValue | null | undefined): boolean {
if (typeof value === "string") {
  return value === "true" || value === "on" || value === "1";
}
return false;
}

export const LoginSchema = z.object({
  email: z.string().email('อีเมลไม่ถูกต้อง').max(200),
  password: z.string().min(8, 'อย่างน้อย 8 ตัวอักษร').max(200),
});

export const RegisterSchema = LoginSchema.extend({
  name: z.string().min(1, 'กรุณากรอกชื่อ').max(120),
  role: z.enum(['STAFF', 'ASSISTANT_MANAGER', 'MANAGER', 'ADMIN', 'SYSTEM']).default('STAFF'),
});

/**
 * ยอมรับได้ 3 กรณี:
 * - absolute url: http(s)://...
 * - relative path: /something.png
 * - undefined (ไม่ได้ส่งมา)
 */
export const RelOrAbsUrl = z
  .union([z.string().url(), z.string().regex(/^\/[^\s]+$/)])
  .optional();
