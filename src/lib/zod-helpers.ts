import { z } from "zod";

/**
 * ยอมรับได้ 3 กรณี:
 * - absolute url: http(s)://...
 * - relative path: /something.png
 * - undefined (ไม่ได้ส่งมา)
 */
export const RelOrAbsUrl = z
  .union([z.string().url(), z.string().regex(/^\/[^\s]+$/)])
  .optional();