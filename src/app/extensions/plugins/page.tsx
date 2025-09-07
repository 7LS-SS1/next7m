// src/app/plugins/page.tsx
import Link from "next/link";
import { prisma } from "@lib/db";
import ProgramCard from "@/components/programs/ProgramCard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PluginsIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp?.q || "").trim();

  // ถ้ามี model Plugin ให้ใช้ plugin; ถ้าโปรเจคคุณยังใช้ Program+category:"Plugin" อยู่ ให้สลับคอมเมนต์สองบรรทัดด้านล่าง
  // const rows = await prisma.program.findMany({ where: { category: { equals: "Plugin", mode: "insensitive" } }, orderBy: { updatedAt: "desc" } });
  const rows = await prisma.plugin.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { vendor: { contains: q, mode: "insensitive" } },
            { category: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      slug: true,
      name: true,
      version: true,
      vendor: true,
      category: true,
      updatedAt: true,
      recommended: true,
      featured: true,
      iconUrl: true,
      fileUrl: true,
    },
  });

  // ป้องกัน error slug undefined สำหรับการ์ด/ลิงก์: ถ้าไม่มี slug ให้ fallback เป็น id
  const normalized = rows.map((r) => ({ ...r, slug: r.slug ?? r.id }));

  const featured = normalized.filter((r) => r.featured || r.recommended);
  const normals = normalized.filter((r) => !(r.featured || r.recommended));

  return (
    <div className="grid gap-5">
      {/* Hero / Header */}
      <header className="rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.04] to-white/[0.02] p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">Plugins</h1>
            <p className="text-xs md:text-sm text-white/60 mt-0.5">จัดการปลั๊กอินทั้งหมด ค้นหา อัปเดต และดาวน์โหลดได้จากที่เดียว</p>
          </div>
          <div className="flex items-center gap-2">
            <form action="/extensions/plugins" className="relative hidden sm:block">
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="ค้นหา… (ชื่อ/ผู้พัฒนา/หมวดหมู่)"
                className="w-72 rounded-xl bg-white/5 pl-9 pr-3 py-2 outline-none placeholder:text-white/40 focus:ring-2 focus:ring-white/10"
              />
              <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-white/60">🔎</span>
            </form>
            <Link
              href="/extensions/plugins/new"
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-black bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:brightness-95"
            >
              + เพิ่มปลั๊กอิน
            </Link>
          </div>
        </div>

        {/* Quick stats */}
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
          <Stat label="ทั้งหมด" value={rows.length} />
          <Stat label="แนะนำ" value={featured.length} />
          <Stat label="อัปเดตล่าสุด" value={new Set(rows.map((r) => r.vendor || "-")).size} hint="จำนวนผู้พัฒนา" />
        </div>
      </header>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="grid gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">แนะนำ</h2>
            <span className="text-xs text-white/60">{featured.length} รายการ</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featured.map((p) => (
              <ProgramCard key={p.id} item={p as any} basePath="/extensions/plugins" />
            ))}
          </div>
        </section>
      )}

      {/* All */}
      <section className="grid gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">ทั้งหมด</h2>
          <span className="text-xs text-white/60">{rows.length} รายการ</span>
        </div>
        {rows.length === 0 ? (
          <EmptyState q={q} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {normals.map((p) => (
              <ProgramCard key={p.id} item={p as any} basePath="/extensions/plugins" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
      <div className="text-[11px] text-white/50">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
      {hint ? <div className="text-[10px] text-white/45">{hint}</div> : null}
    </div>
  );
}

function EmptyState({ q }: { q?: string }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-white/10 p-10 text-center">
      <div className="text-5xl mb-3">🔌</div>
      <h3 className="font-semibold">{q ? "ไม่พบผลลัพธ์ที่ค้นหา" : "ยังไม่มีปลั๊กอิน"}</h3>
      <p className="text-sm text-white/60 mt-1">
        {q ? "ลองปรับคำค้น หรือเพิ่มปลั๊กอินใหม่" : "เริ่มเพิ่มปลั๊กอินตัวแรกของคุณได้เลย"}
      </p>
      <div className="mt-4 flex gap-2">
        <Link
          href="/extensions/plugins/new"
          className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-black bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:brightness-95"
        >
          + เพิ่มปลั๊กอิน
        </Link>
        <Link href="/extensions" className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm border border-white/10 hover:bg-white/10">
          ดู Overview
        </Link>
      </div>
    </div>
  );
}
