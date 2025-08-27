"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Props = {
  idOrSlug: string;
  name?: string;
  className?: string;
};

export default function DeleteProgramButton({ idOrSlug, name, className }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const onDelete = () => {
    if (!confirm(`ลบโปรแกรม "${name || idOrSlug}" ?`)) return;
    start(async () => {
      try {
        const res = await fetch("/extensions/programs/api/delete", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ id: idOrSlug }),
        });
        const data = await res.json().catch(() => ({} as any));
        if (!res.ok || !data?.ok) {
          toast.error(data?.message || "ลบไม่สำเร็จ");
          return;
        }
        toast.success("ลบสำเร็จ");
        router.replace(data.redirect || "/extensions/programs?toast=deleted");
      } catch (e: any) {
        toast.error(e?.message || "เกิดข้อผิดพลาด");
      }
    });
  };

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={pending}
      className={
        className ??
        "rounded-lg border border-white/10 p-2 hover:bg-white/10 text-red-300 flex items-center justify-center"
      }
      aria-busy={pending}
      title="ลบโปรแกรม"
      aria-label="ลบโปรแกรม"
    >
      {pending ? (
        <span className="text-sm">…</span>
      ) : (
        // ไอคอนถังขยะแบบ inline SVG (ไม่ต้องใช้แพ็กเกจภายนอก)
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
        </svg>
      )}
    </button>
  );
}