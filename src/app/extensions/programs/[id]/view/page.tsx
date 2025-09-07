// src/app/extensions/programs/[id]/view/page.tsx
import { prisma } from "@lib/db";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ✅ ใช้ Promise<PageProps> ให้สอดคล้องกับ Next 15 (รองรับทั้งรูปแบบ sync/async)
type PageProps = { params: Promise<{ id: string }> };

export default async function ProgramViewPage({ params }: PageProps) {
  // Next 15: params เป็น Promise ต้อง await ก่อนใช้
  const { id: rawId } = await params;
  const raw = rawId ?? "";
  const id = decodeURIComponent(raw);

  // กลุ่ม candidate slug/name เพื่อให้ค้นหาเจอ แม้พิมพ์มีช่องว่าง/ตัวพิมพ์ต่าง
  const slugCand = uniqueNonEmpty([id, id.toLowerCase(), id.toUpperCase(), slugify(id)]);

  // 1) ตรง id
  const byId = await prisma.program.findUnique({ where: { id }, select: baseSelect });
  // 2) ตรง slug
  const bySlug = !byId
    ? await prisma.program.findFirst({ where: { slug: { in: slugCand } }, select: baseSelect })
    : null;
  // 3) เผื่อกรอกชื่อมาเป็น path
  const byName = !byId && !bySlug
    ? await prisma.program.findFirst({ where: { name: id }, select: baseSelect })
    : null;

  const program = byId ?? bySlug ?? byName;
  if (!program) return notFound();

  const {
    id: programId,
    name,
    version,
    vendor,
    category,
    iconUrl,
    fileUrl,
    content,
    updatedAt,
    recommended,
    isRecommended,
    featured,
    slug,
  } = program;

  // สร้างตัวระบุที่เสถียรเหมือน ProgramCard
  const basePath = "/extensions/programs";
  const idOrSlugRaw = (typeof slug === "string" ? slug.trim() : "") || (typeof programId === "string" ? programId.trim() : "");
  const safeIdOrSlug = idOrSlugRaw || slugify(name || "");

  const prettyFile = fileUrl ? humanizeFilename(fileUrl) : null;

  return (
    <div className="grid gap-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-white/60">
        <Link href="/extensions" className="hover:underline">Extensions</Link> {" / "}
        <Link href="/extensions/programs" className="hover:underline">Programs</Link> {" / "}
        <span className="text-white">{name}</span>
      </nav>

      {/* Header 2 columns */}
      <header className="grid gap-4 lg:grid-cols-[1fr,340px]">
        {/* ซ้าย: ชื่อ + meta */}
        <section className="card p-5">
          <div className="flex items-start gap-4">
            <div className="shrink-0">
              <IconBox iconUrl={iconUrl} name={name} />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold leading-tight">{name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-white/70">
                {version ? <Badge>v{version}</Badge> : null}
                {vendor ? <Badge>{vendor}</Badge> : null}
                {category ? <Badge tone="amber">{category}</Badge> : null}
                {recommended || isRecommended ? (
                  <Badge tone="emerald">Recommended</Badge>
                ) : null}
                {featured ? <Badge tone="purple">Featured</Badge> : null}
                <span className="ml-auto text-xs">อัปเดตล่าสุด: {fmt(updatedAt)}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ขวา: กล่องควบคุม & ดาวน์โหลด */}
        <aside className="card p-5 h-max">
          <div className="grid gap-3">
            {fileUrl ? (
              <a
                href={fileUrl}
                download
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 px-4 py-3 font-semibold text-black hover:brightness-95 active:brightness-90"
              >
                ⬇️ ดาวน์โหลด {prettyFile ? `• ${prettyFile}` : ""}
              </a>
            ) : (
              <div className="rounded-xl border border-white/10 p-3 text-center text-white/70">
                ยังไม่มีไฟล์สำหรับดาวน์โหลด
              </div>
            )}

            <div className="flex gap-2">
              <Link
                href={`${basePath}/${encodeURIComponent(safeIdOrSlug)}/edit`}
                className="flex-1 rounded-xl border border-white/10 px-3 py-2 text-center hover:bg-white/10"
              >
                แก้ไข
              </Link>
              <Link
                href="/extensions/programs"
                className="flex-1 rounded-xl border border-white/10 px-3 py-2 text-center hover:bg-white/10"
              >
                กลับรายการ
              </Link>
            </div>

            {/* ข้อมูลสรุป */}
            <div className="rounded-xl bg-white/[0.06] p-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <Meta label="เวอร์ชัน" value={version || "-"} />
                <Meta label="ผู้พัฒนา" value={vendor || "-"} />
                <Meta label="หมวดหมู่" value={category || "-"} />
                <Meta
                  label="สถานะ"
                  value={[
                    featured ? "Featured" : null,
                    recommended || isRecommended ? "Recommended" : null,
                  ].filter(Boolean).join(" • ") || "-"}
                />
              </div>
            </div>
          </div>
        </aside>
      </header>

      {/* เนื้อหา/รายละเอียด */}
      <section className="card p-5">
        <h2 className="mb-3 text-lg font-semibold">รายละเอียด</h2>
        {content ? (
          <article
            className={[
              "prose prose-invert max-w-none",
              "[&_img]:max-w-full [&_img]:h-auto",
              "[&_video]:max-w-full [&_video]:h-auto",
              "[&_iframe]:w-full [&_iframe]:aspect-video",
              "[&_table]:w-full [&_table]:border-collapse",
              "[&_th]:text-left [&_td]:align-top",
              "[&_pre]:overflow-x-auto [&_code]:break-words",
              "[&_blockquote]:border-l-4 [&_blockquote]:pl-3",
              "[&_ul]:list-disc [&_ol]:list-decimal",
              "[&_ul]:pl-6 [&_ol]:pl-6",
              "[&_li]:my-1",
              "[&_li>p]:m-0",
              "[&_li::marker]:text-white/60",
              "overflow-x-auto",
            ].join(" ")}
            dangerouslySetInnerHTML={{ __html: sanitizeHTML(content) }}
          />
        ) : (
          <p className="text-white/70">ยังไม่มีรายละเอียด</p>
        )}
      </section>

      {/* ไฟล์ที่เกี่ยวข้อง */}
      {fileUrl ? (
        <section className="card p-5">
          <h3 className="mb-3 font-semibold">ไฟล์ที่เกี่ยวข้อง</h3>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <li className="rounded-xl border border-white/10 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate">{name}</div>
                  <div className="text-xs text-white/50 truncate">{fileExt(fileUrl)}</div>
                </div>
                <a href={fileUrl} download className="rounded-lg border border-white/15 px-3 py-1.5 text-sm hover:bg-white/10">
                  ดาวน์โหลด
                </a>
              </div>
            </li>
          </ul>
        </section>
      ) : null}
    </div>
  );
}

/* -------------------- helpers & tiny UI -------------------- */
const baseSelect = {
  id: true,
  slug: true,
  name: true,
  version: true,
  vendor: true,
  category: true,
  iconUrl: true,
  fileUrl: true,
  content: true,
  recommended: true,
  isRecommended: true,
  featured: true,
  updatedAt: true,
} as const;

function fmt(d: Date) {
  try {
    return new Intl.DateTimeFormat("th-TH", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(d));
  } catch {
    return "-";
  }
}

function sanitizeHTML(html: string) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/on[a-z]+\s*=\s*"[^"]*"/gi, "")
    .replace(/on[a-z]+\s*=\s*'[^']*'/gi, "")
    .replace(/on[a-z]+\s*=\s*\{[^}]*\}/gi, "");
}

function humanizeFilename(url: string) {
  try {
    const pathname = new URL(url, "http://local").pathname;
    const base = pathname.split("/").pop() || url;
    return base;
  } catch {
    const base = url.split("/").pop() || url;
    return base;
  }
}

function fileExt(url: string) {
  const base = humanizeFilename(url);
  const dot = base.lastIndexOf(".");
  return dot >= 0 ? base.slice(dot + 1).toUpperCase() : "FILE";
}

function IconBox({ iconUrl, name }: { iconUrl?: string | null; name: string }) {
  if (iconUrl) {
    return (
      <div className="grid size-16 place-items-center overflow-hidden rounded-xl bg-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="icon" src={iconUrl} className="h-12 w-12 object-contain" />
      </div>
    );
  }
  return (
    <div className="grid size-16 place-items-center rounded-xl bg-white/10 text-2xl">
      {getInitial(name)}
    </div>
  );
}

function getInitial(text: string) {
  const t = (text || "").trim();
  if (!t) return "P";
  return t[0]?.toUpperCase() ?? "P";
}

function Badge({ children, tone }: { children: React.ReactNode; tone?: "amber" | "emerald" | "purple"; }) {
  const map: Record<string, string> = {
    amber: "from-yellow-400 to-amber-500 text-black",
    emerald: "from-emerald-300 to-emerald-500 text-black",
    purple: "from-fuchsia-400 to-purple-500 text-black",
  };
  const g = tone && map[tone] ? `bg-gradient-to-r ${map[tone]}` : "bg-white/10 text-white";
  return (
    <span className={`inline-flex items-center rounded-lg px-2 py-1 text-xs ${g}`}>
      {children}
    </span>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-white/10 px-3 py-2">
      <span className="text-white/60">{label}</span>
      <span className="truncate">{value}</span>
    </div>
  );
}

function slugify(input: string) {
  return (input || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

function uniqueNonEmpty(arr: string[]) {
  const s = new Set<string>();
  for (const v of arr) if (v && v.trim()) s.add(v.trim());
  return Array.from(s);
}
