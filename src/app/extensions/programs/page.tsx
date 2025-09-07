// src/app/extensions/programs/page.tsx
// Server Component – รายการ Programs แบบ Card Layout + Tabs หมวดหมู่
import Link from "next/link";
import { prisma } from "@lib/db";
import ProgramCard from "@/components/programs/ProgramCard";

export const dynamic = "force-dynamic"; // ให้ดึงสดเสมอ
export const revalidate = 0;

// หมวดหมู่หลัก (แก้/เพิ่มได้ตามต้องการ)
const CATEGORIES = ["All", "Adobe", "Office", "Etc."] as const;

type SearchParams = Record<string, string | string[] | undefined>;

async function getPrograms(category?: string, q?: string) {
  // สร้าง where แบบยืดหยุ่น (รองรับ Prisma client ไม่พร้อมด้วย optional chaining)
  const where: any = {};
  if (category && category !== "All") where.category = category;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { vendor: { contains: q, mode: "insensitive" } },
      { category: { contains: q, mode: "insensitive" } },
    ];
  }

  const rows = await (prisma as any)?.program
    ?.findMany?.({
      where,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        slug: true,
        name: true,
        version: true,
        vendor: true,
        category: true,
        updatedAt: true,
        iconUrl: true,
        recommended: true,
        isRecommended: true,
        featured: true,
      },
    })
    .catch(() => [] as any[]);

  return Array.isArray(rows) ? rows : [];
}

export default async function ProgramsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const activeCat = (sp?.category as string) || "All";
  const q = (sp?.q as string) || "";

  const rows = await getPrograms(activeCat, q);

  // แบ่งรายการที่ "แนะนำ"
  const recommendedSet = new Set<string>();
  const recommended = rows.filter((p) => {
    const ok = Boolean(p.recommended || p.isRecommended || p.featured);
    if (ok) recommendedSet.add(p.id);
    return ok;
  });

  return (
    <div className="grid gap-4">
      {/* Header + Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Programs</h1>
          <p className="text-white/60 text-sm">
            จัดการซอฟต์แวร์ทั้งหมดของคุณในที่เดียว
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/extensions/programs/new"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 px-4 py-2 font-semibold text-black hover:brightness-95"
            aria-label="เพิ่ม Program"
          >
            + Program
          </Link>
        </div>
      </div>

      {/* Tabs Category */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-2">
        {CATEGORIES.map((c) => {
          const isActive = c === activeCat;
          const href =
            c === "All"
              ? "/extensions/programs"
              : `/extensions/programs?category=${encodeURIComponent(c)}`;
          return (
            <Link
              key={c}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`rounded-lg px-3 py-1.5 text-sm border transition ${
                isActive
                  ? "border-white/20 bg-white/10"
                  : "border-transparent hover:bg-white/5"
              }`}
            >
              {c}
            </Link>
          );
        })}
      </div>

      {/* Recommended */}
      {recommended.length > 0 && (
        <section className="grid gap-3">
          <h3 className="font-semibold text-white/90">แนะนำ</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {recommended.map((p) => (
              <ProgramCard key={p.id} item={p as any} basePath="/extensions/programs" highlight />
            ))}
          </div>
        </section>
      )}

      {/* All items */}
      <section className="grid gap-3">
        <h3 className="font-semibold text-white/90">
          ทั้งหมด{activeCat !== "All" ? ` · ${activeCat}` : ""}
        </h3>
        {rows.length === 0 ? (
          <div className="card p-6 text-center text-white/70">
            <div>ยังไม่มีข้อมูลในหมวดนี้</div>
            <div className="mt-3">
              <Link
                href="/extensions/programs/new"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 hover:bg-white/10"
              >
                + เพิ่มโปรแกรม
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rows.map((p) => (
              <ProgramCard key={p.id} item={p as any} basePath="/extensions/programs" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
