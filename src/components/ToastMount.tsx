"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";

/**
 * ToastMount
 * - อ่านค่า ?toast= จาก URL (หรือจาก prop `code`)
 * - แสดง toast (success / error / warning / message)
 * - กันยิงซ้ำเมื่อมี re-render / back-forward / mount ซ้อน
 * - เคลียร์ query (?toast, ?detail, ?message, ?error) หลังแสดง
 *
 * หมายเหตุ: ควรถูกครอบด้วย <Suspense fallback={null}> ใน layout.tsx
 * เพื่อหลีกเลี่ยง warning "useSearchParams should be wrapped in a suspense boundary"
 */

const RECENT_MS = 1500;

// เก็บคีย์ที่เพิ่งยิงไปไม่นาน ป้องกันซ้ำ (เช่น mount ซ้อน หรือเปลี่ยน URL ซ้ำซ้อน)
const recently = new Map<string, number>();

function shouldFire(key: string) {
  const now = Date.now();
  const last = recently.get(key) ?? 0;
  if (now - last < RECENT_MS) return false;
  recently.set(key, now);

  // prune map ป้องกันโตเรื่อย ๆ
  if (recently.size > 64) {
    const threshold = now - RECENT_MS * 2;
    for (const [k, t] of recently) {
      if (t < threshold) recently.delete(k);
    }
  }
  return true;
}

export default function ToastMount({ code }: { code?: string }) {
  const pathname = usePathname();
  const sp = useSearchParams();
  // ใช้ string ของ searchParams เป็นสัญญาณให้ effect ทำงานเมื่อ query เปลี่ยน
  const sig = sp?.toString();

  useEffect(() => {
    // ทำงานเฉพาะฝั่ง client เท่านั้น
    if (typeof window === "undefined") return;

    // อ่านค่าจาก useSearchParams เป็นหลัก (เสถียรกว่า parse จาก window.location)
    const rawFromQuery = sp?.get("toast") ?? "";
    const raw = (code ?? rawFromQuery).toLowerCase().trim();

    const detail =
      sp?.get("detail") ||
      sp?.get("message") ||
      sp?.get("error") ||
      undefined;

    if (!raw) return;

    const key = `${pathname}:${raw}:${detail ?? ""}`;
    if (!shouldFire(key)) return;

    const success = new Set(["created", "updated", "deleted", "success", "ok", "done"]);
    const errors = new Set(["error", "fail", "failed"]);
    const warns = new Set(["warning", "invalid", "exists"]);

    if (success.has(raw)) {
      toast.success(detail || "เสร็จสิ้น");
    } else if (errors.has(raw)) {
      toast.error(detail || "ผิดพลาด");
    } else if (warns.has(raw)) {
      toast.warning(detail || "ไม่สำเร็จ", {
        action: detail
          ? {
              label: "คัดลอกข้อผิดพลาด",
              onClick: async () => {
                try {
                  await navigator.clipboard.writeText(detail);
                  toast.success("คัดลอกแล้ว");
                } catch {
                  toast.message(detail);
                }
              },
            }
          : undefined,
      });
    } else {
      toast.message(detail || raw);
    }

    // ลบ query ที่เกี่ยวข้องหลังแสดง ลดโอกาสซ้ำตอน back/re-render
    try {
      const url = new URL(window.location.href);
      const params = new URLSearchParams(url.search);
      params.delete("toast");
      params.delete("detail");
      params.delete("message");
      params.delete("error");

      const next = `${url.pathname}${params.toString() ? `?${params.toString()}` : ""}${url.hash ?? ""}`;
      window.history.replaceState(null, "", next);
    } catch {
      // no-op
    }
  // ใส่ sp เป็น dependency แบบปลอดภัยด้วย sig เพื่อหลีกเลี่ยง object identity ใหม่ทุกครั้ง
  }, [pathname, sig, code]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}