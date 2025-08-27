// src/lib/slugify.ts
/**
 * สร้าง slug จากข้อความ
 * - แปลงเป็น lowercase
 * - ตัดวรรณยุกต์
 * - แทนที่อักขระที่ไม่ใช่ a-z, 0-9 ด้วย -
 * - ตัด - ที่ขึ้นต้นและลงท้าย
 * - จำกัดความยาวไม่เกิน 100 ตัวอักษร
 */
export default function slugify(input: string) {
  return (input || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 100);
}