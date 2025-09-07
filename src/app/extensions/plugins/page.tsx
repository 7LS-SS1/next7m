// src/app/extensions/plugins/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/db";
import ProgramCard from "@/components/programs/ProgramCard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type Row = {
  id: string;
  slug: string | null;
  name: string;
  version: string | null;
  vendor: string | null;
  category: string | null;
  updatedAt: Date;
  recommended: boolean | null;
  featured: boolean | null;
  iconUrl: string | null;
  fileUrl: string | null;
};

async function fetchPlugins(q?: string): Promise<Row[]> {
  try {
    return await prisma.plugin.findMany({
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
  } catch {
    return [];
  }
}

async function fetchProgramsAsPlugins(q?: string): Promise<Row[]> {
  try {
    return (await prisma.program.findMany({
      where: {
        AND: [
          { category: { equals: "Plugin", mode: "insensitive" } },
          q
            ? {
                OR: [
                  { name: { contains: q, mode: "insensitive" } },
                  { vendor: { contains: q, mode: "insensitive" } },
                ],
              }
            : {},
        ],
      },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        slug: true,
        name: true,
        version: true,
        vendor: true,
        category: true,
        updatedAt: true,
        // map fields ให้เข้ากับการ์ด (null-safe)
        recommended: true as any,
        featured: true as any,
        iconUrl: true as any,
        fileUrl: true as any,
      },
    })) as unknown as Row[];
  } catch {
    return [];
  }
}

export default async function PluginsIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp?.q || "").trim();

  // ดึงแยก 2 แหล่ง
  const [pluginsRaw, programsRaw] = await Promise.all([
    fetchPlugins(q),
    fetchProgramsAsPlugins(q),
  ]);

  // ปรับ slug ไม่ให้ว่าง
  const plugins = pluginsRaw.map((r) => ({ ...r, slug: r.slug ?? r.id }));
  const programs = programsRaw.map((r) => ({ ...r, slug: r.slug ?? r.id }));

  const featuredPlugins = plugins.filter((r) => (r.featured || r.recommended) === true);
  const normalPlugins = plugins.filter((r) => !(r.featured || r.recommended));

  const featuredPrograms = programs.filter((r) => (r.featured || r.recommended) === true);
  const normalPrograms = programs.filter((r) => !(r.featured || r.recommended));

  return (
    <div className="grid gap-6">
      {/* Header */}
      <header className="rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.04] to-white/[0.02] p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">Plugins</h1>
            <p className="text-xs md:text-sm text-white/60 mt-0.5">
              แยกการแสดงผลจาก 2 แหล่งข้อมูล: <code>plugin</code> และ <code>program(category="Plugin")</code>
            </p>
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
              <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-white/60">
                🔎
              </span>
            </form>
            <Link
              href="/extensions/plugins/new"
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-black bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:brightness-95"
            >
              + เพิ่มปลั๊กอิน
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
          <Stat label="Plugins (ตาราง plugin)" value={plugins.length} />
          <Stat label="Programs→Plugin (ตาราง program)" value={programs.length} />
          <Stat label="แนะนำ (plugin)" value={featuredPlugins.length} />
          <Stat label="แนะนำ (program)" value={featuredPrograms.length} />
        </div>
      </header>

      {/* SECTION: Plugins (ตาราง plugin) */}
      <section className="grid gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Plugins — จากตาราง plugin</h2>
          <span className="text-xs text-white/60">{plugins.length} รายการ</span>
        </div>

        {plugins.length === 0 ? (
          <EmptyState q={q} />
        ) : (
          <>
            {featuredPlugins.length > 0 && (
              <>
                <div className="text-xs text-white/60">แนะนำ</div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {featuredPlugins.map((p) => (
                    <ProgramCard key={p.id} item={p as any} basePath="/extensions/plugins" />
                  ))}
                </div>
              </>
            )}

            <div className="text-xs text-white/60">ทั้งหมด</div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {(normalPlugins.length ? normalPlugins : plugins).map((p) => (
                <ProgramCard key={p.id} item={p as any} basePath="/extensions/plugins" />
              ))}
            </div>
          </>
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
      <h3 className="font-semibold">{q ? "ไม่พบผลลัพธ์ที่ค้นหา" : "ยังไม่มีข้อมูล"}</h3>
      <p className="text-sm text-white/60 mt-1">
        {q ? "ลองปรับคำค้น หรือเพิ่มข้อมูลใหม่" : "เริ่มเพิ่มรายการแรกของคุณได้เลย"}
      </p>
      <div className="mt-4 flex gap-2">
        <Link
          href="/extensions/plugins/new"
          className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-black bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:brightness-95"
        >
          + เพิ่มปลั๊กอิน
        </Link>
        <Link
          href="/extensions"
          className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm border border-white/10 hover:bg-white/10"
        >
          ดู Overview
        </Link>
      </div>
    </div>
  );
}