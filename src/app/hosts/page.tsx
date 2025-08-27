// src/app/hosts/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function fmt(dt?: Date | null) {
  if (!dt) return "-";
  const iso = dt.toISOString();
  return `${iso.slice(0, 10)} ${iso.slice(11, 16)}`;
}

export default async function HostsDashboard() {
  const [providerCount, typeCount, latestProviders, latestTypes] = await Promise.all([
    prisma.hostProvider.count(),
    prisma.hostType.count(),
    prisma.hostProvider.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, note: true, createdAt: true },
      take: 5,
    }),
    prisma.hostType.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, note: true, createdAt: true },
      take: 5,
    }),
  ]);

  return (
    <div className="grid gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Hosts Overview</h1>
          <p className="text-white/60 text-sm">ภาพรวม Host Providers และ Host Types</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/hosts/providers/new" className="btn-primary px-4 py-2 rounded-xl">+ Provider</Link>
          <Link href="/hosts/types/new" className="btn-primary px-4 py-2 rounded-xl">+ Type</Link>
        </div>
      </div>

      {/* Stats */}
      <section className="grid gap-3 sm:grid-cols-2">
        <StatCard title="Host Providers" value={providerCount} href="/hosts/providers" hint="ทั้งหมด" emoji="🛠️" />
        <StatCard title="Host Types" value={typeCount} href="/hosts/types" hint="ทั้งหมด" emoji="📦" />
      </section>

      {/* Quick Actions */}
      <section className="card p-4">
        <h3 className="font-semibold mb-3">ปุ่มลัด</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          <QuickAction href="/hosts/providers" label="จัดการ Providers" />
          <QuickAction href="/hosts/types" label="จัดการ Types" />
        </div>
      </section>

      {/* Latest */}
      <section className="grid gap-3 lg:grid-cols-2">
        <LatestCard
          title="Providers ล่าสุด"
          moreHref="/hosts/providers"
          headers={["ชื่อ", "หมายเหตุ", "เพิ่มเมื่อ"]}
          rows={latestProviders.map((r) => [
            <Link key={r.id} href={`/hosts/providers/${r.id}/edit`} className="hover:underline">
              {r.name}
            </Link>,
            r.note ?? "-",
            fmt(r.createdAt),
          ])}
        />
        <LatestCard
          title="Types ล่าสุด"
          moreHref="/hosts/types"
          headers={["ชื่อ", "หมายเหตุ", "เพิ่มเมื่อ"]}
          rows={latestTypes.map((r) => [
            <Link key={r.id} href={`/hosts/types/${r.id}/edit`} className="hover:underline">
              {r.name}
            </Link>,
            r.note ?? "-",
            fmt(r.createdAt),
          ])}
        />
      </section>
    </div>
  );
}

/* ---------- UI Helpers (Server-safe) ---------- */
function StatCard({
  title,
  value,
  hint,
  emoji,
  href,
}: {
  title: string;
  value: number;
  hint?: string;
  emoji?: string;
  href: string;
}) {
  return (
    <Link href={href} className="card group relative overflow-hidden p-5 hover:bg-white/[0.06] transition rounded-2xl">
      <div className="absolute -right-8 -top-8 size-24 rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-300/10 blur-2xl" />
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-white/60">{title}</div>
          <div className="mt-1 text-2xl font-bold">{value}</div>
          {hint && <div className="text-xs text-white/50 mt-1">{hint}</div>}
        </div>
        <div className="grid size-10 place-items-center rounded-xl bg-white/5 text-xl">{emoji ?? "•"}</div>
      </div>
    </Link>
  );
}

function QuickAction({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-white/10 px-4 py-3 hover:bg-white/10 transition flex items-center justify-between"
    >
      <span>{label}</span>
      <span className="text-white/60">→</span>
    </Link>
  );
}

function LatestCard({
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
        <Link href={moreHref} className="text-sm text-white/70 hover:text-white">
          ดูทั้งหมด
        </Link>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-white/5 text-left">
          <tr>
            {headers.map((h) => (
              <th key={h} className="p-3">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map((r, idx) => (
              <tr key={idx} className="border-t border-white/10">
                {r.map((c, i) => (
                  <td key={i} className="p-3">
                    {c as any}
                  </td>
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