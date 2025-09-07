// src/app/dashboard/page.tsx
import Link from "next/link";
import AnnouncementsCard from "@/components/cards/AnnouncementsCard";
import CategoryGrid, { CategoryItem } from "@/components/CategoryGrid";
import ProgramCard from "@/components/programs/ProgramCard";
import { prisma } from "@/lib/db";

export const metadata = { title: "Dashboard | Next7M" };
export const dynamic = "force-dynamic"; // แสดงข้อมูลล่าสุดเสมอ
export const revalidate = 0;

// หมวดหมู่หลัก
const categories: CategoryItem[] = [
  { title: "คาสิโน", desc: "สล๊อต ไลฟ์ ดีลเลอร์", emoji: "🎰", href: "/extensions/programs" },
  { title: "กีฬา", desc: "ฟุตบอล, NFL, eSports", emoji: "🏆", href: "/extensions/plugins" },
  { title: "ล็อตเตอรี่", desc: "หวยไทย ตัวจัดการ API", emoji: "🎟️", href: "https://thai-lotto-checker.vercel.app/latest" },
  { title: "โปรโมชั่น", desc: "โบนัส & กิจกรรม", emoji: "🎁", href: "/extensions" },
];

// ดึงประกาศล่าสุดจากตาราง announcement
async function fetchAnnouncements() {
  const rows = await prisma.announcement
    .findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, createdAt: true },
    })
    .catch(() => [] as { id: string; title: string | null; createdAt: Date }[]);

  // map ให้เข้ารูปแบบ AnnouncementsCard: { id, text, time, href }
  return rows.map((r) => ({
    id: r.id,
    text: r.title ?? "ประกาศ",
    // ใช้วันที่แบบ ISO ย่อเพื่อกัน hydration mismatch
    time: r.createdAt ? r.createdAt.toISOString().slice(0, 10) : "",
    href: `/organization/announce/${r.id}/view`,
  }));
}

// ดึง Program/Plugin ล่าสุด (order by updatedAt desc)
async function fetchLatest() {
  const [plugins, programs] = await Promise.all([
    prisma.plugin
      .findMany({
        orderBy: { updatedAt: "desc" },
        take: 6,
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
      })
      .catch(() => [] as any[]),
    prisma.program
      .findMany({
        orderBy: { updatedAt: "desc" },
        take: 6,
        select: {
          id: true,
          slug: true,
          name: true,
          version: true,
          vendor: true,
          category: true,
          updatedAt: true,
          recommended: true as any,
          featured: true as any,
          iconUrl: true as any,
          fileUrl: true as any,
        },
      })
      .catch(() => [] as any[]),
  ]);

  // slug fallback เป็น id เพื่อให้ ProgramCard ทำงานแน่นอน
  const normPlugins = plugins.map((p: any) => ({ ...p, slug: p.slug ?? p.id }));
  const normPrograms = programs.map((p: any) => ({ ...p, slug: p.slug ?? p.id }));

  return { plugins: normPlugins, programs: normPrograms };
}

export default async function DashboardPage() {
  const [{ plugins, programs }, announceItems] = await Promise.all([
    fetchLatest(),
    fetchAnnouncements(),
  ]);

  return (
    <div className="min-h-dvh">
      <div className="container-page flex gap-4 pt-4">
        {/* MAIN */}
        <main className="flex-1 pb-10">
          {/* ประกาศ/ข่าวสาร */}
          <AnnouncementsCard items={announceItems} className="mt-6" />

          {/* หมวดหมู่หลัก */}
          <CategoryGrid items={categories} />

          {/* ล่าสุด: Plugins */}
          <section className="mt-6 grid gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Plugins ล่าสุด</h2>
              <Link
                href="/extensions/plugins"
                className="text-xs text-white/70 underline hover:text-white"
              >
                ดูทั้งหมด
              </Link>
            </div>
            {plugins.length === 0 ? (
              <EmptyState label="ยังไม่มี Plugins" href="/extensions/plugins/new" />)
              : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {plugins.map((p: any) => (
                  <ProgramCard key={p.id} item={p} basePath="/extensions/plugins" />
                ))}
              </div>
            )}
          </section>

          {/* ล่าสุด: Programs (ทั้งหมด / รวมที่ไม่ใช่ plugin ด้วย) */}
          <section className="mt-8 grid gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Programs ล่าสุด</h2>
              <Link
                href="/extensions/programs"
                className="text-xs text-white/70 underline hover:text-white"
              >
                ดูทั้งหมด
              </Link>
            </div>
            {programs.length === 0 ? (
              <EmptyState label="ยังไม่มี Programs" href="/extensions/programs/new" />)
              : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {programs.map((p: any) => (
                  <ProgramCard key={p.id} item={p} basePath="/extensions/programs" />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

function EmptyState({ label, href }: { label: string; href: string }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-white/10 p-10 text-center">
      <div className="text-4xl mb-2">✨</div>
      <div className="font-semibold">{label}</div>
      <p className="text-sm text-white/60 mt-1">เพิ่มรายการแรกของคุณได้เลย</p>
      <Link
        href={href}
        className="mt-3 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-black bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:brightness-95"
      >
        + เพิ่มรายการ
      </Link>
    </div>
  );
}
