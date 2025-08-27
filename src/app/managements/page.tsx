// src/app/managements/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function fmt(dt?: Date | null) {
  if (!dt) return "-";
  const iso = dt.toISOString(); // คงที่ ไม่ทำให้ hydration เพี้ยน
  return `${iso.slice(0, 10)} ${iso.slice(11, 16)}`;
}

export default async function ManagementsDashboard() {
  // ดึงสรุป + รายการล่าสุด (ป้องกันกรณี prisma ไม่พร้อม)
  const [
    projCount,
    teamCount,
    mailCount,
    projects,
    teams,
    emails,
  ] = await Promise.all([
    (prisma as any)?.project?.count?.() ?? 0,
    (prisma as any)?.team?.count?.() ?? 0,
    (prisma as any)?.emailAccount?.count?.() ?? 0,
    (prisma as any)?.project?.findMany?.({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, note: true, createdAt: true },
      take: 5,
    }) ?? [],
    (prisma as any)?.team?.findMany?.({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, createdAt: true },
      take: 5,
    }) ?? [],
    (prisma as any)?.emailAccount?.findMany?.({
      orderBy: { createdAt: "desc" },
      select: { id: true, address: true, createdAt: true },
      take: 5,
    }) ?? [],
  ]);

  return (
    <div className="grid gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Managements Overview</h1>
          <p className="text-white/60 text-sm">ภาพรวมการจัดการ Projects, Teams และ E‑Mail</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/managements/projects/new" className="btn-primary px-4 py-2 rounded-xl">+ Project</Link>
          <Link href="/managements/teams/new" className="btn-primary px-4 py-2 rounded-xl">+ Team</Link>
          <Link href="/managements/emails/new" className="btn-primary px-4 py-2 rounded-xl">+ E‑Mail</Link>
        </div>
      </div>

      {/* Stats */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Projects"
          value={projCount}
          href="/managements/projects"
          hint="ทั้งหมด"
          emoji="📁"
        />
        <StatCard
          title="Teams"
          value={teamCount}
          href="/managements/teams"
          hint="ทั้งหมด"
          emoji="👥"
        />
        <StatCard
          title="E‑Mail"
          value={mailCount}
          href="/managements/emails"
          hint="ทั้งหมด"
          emoji="✉️"
        />
      </section>

      {/* Quick Actions */}
      <section className="card p-4">
        <h3 className="font-semibold mb-3">ปุ่มลัด</h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <QuickAction href="/managements/projects" label="จัดการ Projects" />
          <QuickAction href="/managements/teams" label="จัดการ Teams" />
          <QuickAction href="/managements/emails" label="จัดการ E‑Mails" />
        </div>
      </section>

      {/* Latest */}
      <section className="grid gap-3 lg:grid-cols-3">
        <LatestCard
          title="Projects ล่าสุด"
          moreHref="/managements/projects"
          headers={["ชื่อ", "หมายเหตุ", "เพิ่มเมื่อ"]}
          rows={projects.map((r: any) => [
            <Link key={r.id} href={`/managements/projects/${r.id}/edit`} className="hover:underline">{r.name}</Link>,
            r.note ?? "-",
            fmt(r.createdAt),
          ])}
        />
        <LatestCard
          title="Teams ล่าสุด"
          moreHref="/managements/teams"
          headers={["ชื่อ", "หมายเหตุ", "เพิ่มเมื่อ"]}
          rows={teams.map((r: any) => [
            <Link key={r.id} href={`/managements/teams/${r.id}/edit`} className="hover:underline">{r.name}</Link>,
            r.note ?? "-",
            fmt(r.createdAt),
          ])}
        />
        <LatestCard
          title="E‑Mail ล่าสุด"
          moreHref="/managements/emails"
          headers={["อีเมล", "ผู้ให้บริการ", "เพิ่มเมื่อ"]}
          rows={emails.map((r: any) => [
            <Link key={r.id} href={`/managements/emails/${r.id}/edit`} className="hover:underline">{r.address}</Link>,
            (r as any)?.provider ?? "-",
            fmt(r.createdAt),
          ])}
        />
      </section>
    </div>
  );
}

/* ---------- UI Helpers (Server-safe, ไม่มี client hook) ---------- */

function StatCard({
  title, value, hint, emoji, href,
}: { title: string; value: number; hint?: string; emoji?: string; href: string }) {
  return (
    <Link href={href} className="card group relative overflow-hidden p-5 hover:bg-white/[0.06] transition">
      <div className="absolute -right-8 -top-8 size-24 rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-300/10 blur-2xl" />
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-white/60">{title}</div>
          <div className="mt-1 text-2xl font-bold">{value}</div>
          {hint && <div className="text-xs text-white/50 mt-1">{hint}</div>}
        </div>
        <div className="grid size-10 place-items-center rounded-xl bg-white/5 text-xl">
          {emoji ?? "•"}
        </div>
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