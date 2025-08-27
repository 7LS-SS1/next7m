import { z } from "zod";

export function parseBoolean(value: FormDataEntryValue | null | undefined): boolean {
if (typeof value === "string") {
  return value === "true" || value === "on" || value === "1";
}
return false;
}

/**
 * ยอมรับได้ 3 กรณี:
 * - absolute url: http(s)://...
 * - relative path: /something.png
 * - undefined (ไม่ได้ส่งมา)
 */
export const RelOrAbsUrl = z
  .union([z.string().url(), z.string().regex(/^\/[^\s]+$/)])
  .optional();
