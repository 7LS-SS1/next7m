// src/app/extensions/programs/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// format เวลาแบบคงที่ ป้องกัน hydration mismatch
function fmt(dt?: Date | null) {
  if (!dt) return "-";
  const iso = dt.toISOString();
  return `${iso.slice(0, 10)} ${iso.slice(11, 16)}`;
}

export default async function ProgramsPage() {
  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const [programCount, newPrograms, latestPrograms] = await Promise.all([
    (prisma as any)?.program?.count?.() ?? 0,
    (prisma as any)?.program?.findMany?.({
      where: { updatedAt: { gte: since } },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        version: true,
        vendor: true,
        category: true,
        updatedAt: true,
      },
      take: 12,
    }) ?? [],
    (prisma as any)?.program?.findMany?.({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        version: true,
        vendor: true,
        category: true,
        updatedAt: true,
      },
      take: 24,
    }) ?? [],
  ]);

  return (
    <div className="grid gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Programs</h1>
          <p className="text-white/60 text-sm">รายการโปรแกรมทั้งหมด พร้อมอัปเดตล่าสุด</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/extensions/programs/new" className="btn-primary px-4 py-2 rounded-xl">+ Program</Link>
          <Link href="/extensions" className="rounded-xl border border-white/10 px-3 py-2 hover:bg-white/10">ภาพรวม</Link>
        </div>
      </div>

      {/* Stats */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="ทั้งหมด" value={programCount} hint="จำนวนโปรแกรม" emoji="🖥️" />
        <StatCard title="อัปเดต 14 วันล่าสุด" value={newPrograms.length} hint="New updates" emoji="✨" />
        <StatCard title="แสดงทั้งหมด" value={latestPrograms.length} hint="ที่โหลดมาในหน้า" emoji="📄" />
      </section>

      {/* Highlights: New Updates */}
      <section className="grid gap-3 lg:grid-cols-2">
        <HighlightCard
          title="New Programs Update"
          moreHref="/extensions/programs"
          items={newPrograms.map((p: any) => ({
            id: p.id,
            title: p.name,
            meta: `${p.vendor ?? "—"} · ${p.category ?? "—"} · v${p.version ?? "-"}`,
            time: fmt(p.updatedAt),
            href: `/extensions/programs/${p.id}/edit`,
          }))}
          emptyText="ยังไม่มีการอัปเดตในช่วง 14 วัน"
        />
        <LatestTable
          title="Programs ล่าสุด"
          moreHref="/extensions/programs"
          headers={["ชื่อ", "รายละเอียด", "อัปเดตเมื่อ"]}
          rows={latestPrograms.map((p: any) => [
            <Link key={p.id} href={`/extensions/programs/${p.id}/edit`} className="hover:underline">{p.name}</Link>,
            `${p.vendor ?? "—"} · ${p.category ?? "—"} · v${p.version ?? "-"}`,
            fmt(p.updatedAt),
          ])}
        />
      </section>
    </div>
  );
}

/* ---------- UI helpers (server-safe) ---------- */

function StatCard({
  title, value, hint, emoji,
}: { title: string; value: number; hint?: string; emoji?: string }) {
  return (
    <div className="card group relative overflow-hidden p-5 rounded-2xl">
      <div className="absolute -right-8 -top-8 size-24 rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-300/10 blur-2xl" />
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-white/60">{title}</div>
          <div className="mt-1 text-2xl font-bold">{value}</div>
          {hint && <div className="text-xs text-white/50 mt-1">{hint}</div>}
        </div>
        <div className="grid size-10 place-items-center rounded-xl bg-white/5 text-xl">{emoji ?? "•"}</div>
      </div>
    </div>
  );
}

function HighlightCard({
  title,
  items,
  moreHref,
  emptyText,
}: {
  title: string;
  items: { id: string; title: string; meta: string; time: string; href: string }[];
  moreHref: string;
  emptyText: string;
}) {
  return (
    <div className="card p-0 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h3 className="font-semibold">{title}</h3>
        <Link href={moreHref} className="text-sm text-white/70 hover:text-white">ดูทั้งหมด</Link>
      </div>
      <ul className="divide-y divide-white/10">
        {items.length > 0 ? (
          items.map((it) => (
            <li key={it.id} className="px-4 py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] px-2 py-0.5">
                    NEW
                  </span>
                  <Link href={it.href} className="hover:underline truncate">{it.title}</Link>
                </div>
                <div className="text-xs text-white/60 truncate">{it.meta}</div>
              </div>
              <div className="text-xs text-white/50 shrink-0">{it.time}</div>
            </li>
          ))
        ) : (
          <li className="px-4 py-6 text-center text-white/60">{emptyText}</li>
        )}
      </ul>
    </div>
  );
}

function LatestTable({
  title,
  headers,
  rows,
  moreHref,
}: {
  title: string;
  headers: string[];
  rows: (string | number | JSX.Element)[][];
  moreHref: string;
}) {
  return (
    <div className="card p-0 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h3 className="font-semibold">{title}</h3>
        <Link href={moreHref} className="text-sm text-white/70 hover:text-white">ดูทั้งหมด</Link>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-white/5 text-left">
          <tr>
            {headers.map((h) => (
              <th key={h} className="p-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map((r, idx) => (
              <tr key={idx} className="border-t border-white/10">
                {r.map((c, i) => (
                  <td key={i} className="p-3">{c as any}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td className="p-6 text-center text-white/60" colSpan={headers.length}>
                ยังไม่มีข้อมูล
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}