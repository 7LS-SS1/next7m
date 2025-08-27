"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";

const RECENT_MS = 1500;
// เก็บคีย์ที่เพิ่งยิงไปไม่นาน ป้องกันซ้ำ (เช่น mount ซ้อน หรือเปลี่ยน URL ซ้ำซ้อน)
const recently = new Map<string, number>();
function shouldFire(key: string) {
  const now = Date.now();
  const last = recently.get(key) ?? 0;
  if (now - last < RECENT_MS) return false;
  recently.set(key, now);
  return true;
}

export default function ToastMount({ code }: { code?: string }) {
  const pathname = usePathname();
  const sp = useSearchParams();
  const sig = sp?.toString(); // ใช้เป็นสัญญาณให้ useEffect รันเมื่อ searchParams เปลี่ยน

  useEffect(() => {
    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);
    const raw = (code ?? url.searchParams.get("toast") ?? "").toLowerCase().trim();
    const detail =
      url.searchParams.get("detail") ||
      url.searchParams.get("message") ||
      url.searchParams.get("error") ||
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
      url.searchParams.delete("toast");
      url.searchParams.delete("detail");
      url.searchParams.delete("message");
      url.searchParams.delete("error");
      window.history.replaceState(null, "", url.toString());
    } catch {
      // no-op
    }
  }, [pathname, sig, code]);

  return null;
}