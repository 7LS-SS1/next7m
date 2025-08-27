// src/components/programs/ProgramCard.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export type ProgramLike = {
  id: string;
  slug?: string | null;
  name: string;
  version?: string | null;
  vendor?: string | null;
  category?: string | null;
  updatedAt?: Date | string | null;
  iconUrl?: string | null;
  recommended?: boolean | null;
  isRecommended?: boolean | null;
  featured?: boolean | null;
};

export type ProgramCardProps = {
  /** ใช้หนึ่งในสองตัวนี้ก็พอ: p หรือ item (รองรับทั้งสองชื่อเพื่อความเข้ากันได้) */
  p?: ProgramLike;
  item?: ProgramLike;
  /** เส้นทางฐานสำหรับลิงก์ view/edit เช่น 
   *  - "/extensions/programs" (default)
   *  - "/extensions/plugins"
   */
  basePath?: string;
  /** ไฮไลต์เป็นรายการแนะนำ */
  highlight?: boolean;
};

export default function ProgramCard({ p, item, basePath = "/extensions/programs", highlight }: ProgramCardProps) {
  // รองรับทั้ง prop p และ item (เผื่อหน้าเดิมส่งมาเป็น item)
  const data = p ?? item;

  // ถ้าไม่ได้ส่งข้อมูลมาเลย ให้กันล้มด้วยการไม่เรนเดอร์อะไร (และเตือนใน dev console)
  if (!data) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("ProgramCard: missing data prop (neither `p` nor `item` was provided)`");
    }
    return null;
  }

  const idOrSlugRaw = (typeof data.slug === "string" ? data.slug.trim() : "") || (typeof data.id === "string" ? data.id.trim() : "");
  const safeIdOrSlug = idOrSlugRaw || slugifyLocal(data.name || "");

  const hrefView = safeIdOrSlug
    ? `${basePath}/${encodeURIComponent(safeIdOrSlug)}/view`
    : `${basePath}`;

  const hrefEdit = safeIdOrSlug
    ? `${basePath}/${encodeURIComponent(safeIdOrSlug)}/edit`
    : `${basePath}`;

  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function doDelete() {
    try {
      const delApiBase = basePath.replace(/\/$/, ""); // normalize trailing slash
      const res = await fetch(`${delApiBase}/api/delete`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: safeIdOrSlug }),
      });
      const dataRes = await res.json().catch(() => ({} as any));
      if (!res.ok || !dataRes?.ok) throw new Error(dataRes?.message || "ลบไม่สำเร็จ");
      toast.success("ลบสำเร็จ");
      setOpen(false);
      // กลับไปหน้ารายการและรีเฟรช พร้อมพก toast
      router.replace(`${delApiBase}?toast=deleted`);
    } catch (e: any) {
      toast.error(e?.message || "ลบไม่สำเร็จ");
    }
  }

  // ป้องกัน invalid date + รูปแบบที่อ่านง่าย (ฝั่ง client ปลอดภัยเรื่อง hydration)
  const d = data.updatedAt ? new Date(data.updatedAt) : null;
  const updatedISO = d && !isNaN(d.getTime()) ? d.toISOString() : null;
  const updatedLabel =
    d && !isNaN(d.getTime())
      ? new Intl.DateTimeFormat("th-TH", {
          dateStyle: "medium",
          timeStyle: "short",
          hour12: false,
        }).format(d)
      : "-";

  const showRecommended = Boolean(
    data.recommended || data.isRecommended || data.featured || highlight
  );

  const canRoute = Boolean(safeIdOrSlug);

  return (
    <div className="relative card p-4 flex gap-3 hover:bg-white/[0.04] transition rounded-2xl overflow-hidden">
      {showRecommended && (
        <>
          <div className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-gradient-to-br from-yellow-500/25 to-yellow-300/20 blur-2xl" />
          <span className="absolute left-4 top-4 text-[11px] rounded-full bg-amber-500/20 text-amber-200 px-2 py-0.5">
            แนะนำ
          </span>
        </>
      )}

      <div className="grid size-14 place-items-center rounded-xl bg-white/5 overflow-hidden shrink-0">
        {data.iconUrl ? (
          <Image
            src={data.iconUrl}
            alt={data.name}
            width={56}
            height={56}
            className="object-contain"
            unoptimized
          />
        ) : (
          <span className="text-xl" aria-hidden>
            {getInitials(data.name)}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          {canRoute ? (
            <Link
              href={hrefView}
              className="font-semibold hover:underline truncate"
              aria-label={`ดูรายละเอียด ${data.name}`}
            >
              {data.name}
            </Link>
          ) : (
            <span className="font-semibold truncate opacity-50 cursor-not-allowed">{data.name}</span>
          )}

          {/* แสดง badge รายละเอียดเสริมแบบกระชับ */}
          <div className="flex gap-1 shrink-0">
            {data.version && <span className="badge-soft">v{data.version}</span>}
            {data.category && <span className="badge-soft">{data.category}</span>}
          </div>
        </div>

        <div className="mt-1 text-sm text-white/70 flex flex-wrap gap-x-2 gap-y-1">
          {data.vendor && <span>{data.vendor}</span>}
          <span className="opacity-50">•</span>
          <time dateTime={updatedISO ?? undefined}>
            อัปเดตล่าสุด: {updatedLabel}
          </time>
        </div>

        <div className="mt-3 flex gap-2 justify-end">
          {canRoute ? (
            <Link
              href={hrefView}
              className="rounded-lg border border-white/10 px-3 py-1.5 hover:bg-white/10 text-sm"
            >
              รายละเอียด
            </Link>
          ) : (
            <span className="rounded-lg border border-white/10 px-3 py-1.5 text-sm opacity-50 cursor-not-allowed">
              รายละเอียด
            </span>
          )}
          {canRoute ? (
            <Link
              href={hrefEdit}
              className="rounded-lg border border-white/10 px-3 py-1.5 hover:bg-white/10 text-sm"
            >
              แก้ไข
            </Link>
          ) : (
            <span className="rounded-lg border border-white/10 px-3 py-1.5 text-sm opacity-50 cursor-not-allowed">
              แก้ไข
            </span>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-lg border border-white/10 px-3 py-1.5 hover:bg-white/10 text-sm text-red-300"
              title="Delete"
              aria-label={`Delete ${data.name}`}
            >
              ลบ
            </button>
            <ConfirmDeleteModal
              open={open}
              onOpenChange={setOpen}
              title="Delete Program"
              warning="การกระทํานี้ไม่สามารถย้อนกลับได้ โปรดยืนยันการดำเนินการ."
              resourceName={data.name}
              resourceLabel={`กรอกชื่อโปรแกรม ' ${data.name} ' เพื่อดำเนินการต่อ :`}
              requirePhrase
              phraseText="Delete"
              phraseLabel="หากต้องการยืนยัน ให้พิมพ์ ' Delete ' ด้านล่าง :"
              confirmText="Delete"
              cancelText="Cancel"
              onConfirm={doDelete}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function slugifyLocal(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function getInitials(name: string) {
  const initials = name
    ?.split(/\s+/)
    .filter(Boolean)
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return initials || "PG";
}
