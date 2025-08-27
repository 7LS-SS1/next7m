// src/app/domains/[id]/view/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

// Always fetch latest domain details
export const dynamic = "force-dynamic";

/**
 * In this project, the Next.js type generator sometimes emits `params` as a Promise.
 * To avoid type constraint issues from the generated PageProps, we accept `params: any`
 * and normalize it with `await Promise.resolve(params)`.
 */
export default async function DomainViewPage({ params }: { params: any }) {
  const resolved = await Promise.resolve(params);
  const rawId: string = resolved?.id ?? "";
  const idOrName = decodeURIComponent(rawId);

  // Find by id or unique name
  const domain = await prisma.domain.findFirst({
    where: {
      OR: [{ id: idOrName }, { name: idOrName }],
    },
  });

  if (!domain) return notFound();

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "ชื่อโดเมน", value: domain.name },
    {
      label: "สถานะ",
      value: (
        <span
          className={
            domain.status === "ACTIVE"
              ? "inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-300 text-xs"
              : domain.status === "INACTIVE"
              ? "inline-flex items-center gap-1 rounded-full bg-zinc-500/15 px-2 py-0.5 text-zinc-300 text-xs"
              : "inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-amber-300 text-xs"
          }
        >
          ● {domain.status}
        </span>
      ),
    },
    { label: "หมายเหตุ", value: domain.note ?? "—" },
    {
      label: "สร้างเมื่อ",
      value: new Date(domain.createdAt).toISOString().replace("T", " ").slice(0, 19),
    },
    {
      label: "อัปเดตล่าสุด",
      value: new Date(domain.updatedAt).toISOString().replace("T", " ").slice(0, 19),
    },
  ];

  return (
    <div className="grid gap-4">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <nav className="text-sm text-white/60 mb-1" aria-label="Breadcrumb">
            <ol className="flex items-center gap-1">
              <li>
                <Link href="/domains" className="hover:underline">
                  Domains
                </Link>
              </li>
              <li className="opacity-60">/</li>
              <li className="text-white truncate max-w-[60vw] sm:max-w-[40vw]" title={domain.name}>
                {domain.name}
              </li>
            </ol>
          </nav>
          <h1 className="text-xl sm:text-2xl font-bold">รายละเอียดโดเมน</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/domains/${encodeURIComponent(domain.id)}/edit`}
            className="rounded-lg border border-white/15 px-3 py-1.5 hover:bg-white/10"
          >
            แก้ไข
          </Link>
          <Link
            href="/domains"
            className="rounded-lg border border-white/15 px-3 py-1.5 hover:bg-white/10"
          >
            กลับไปหน้ารายการ
          </Link>
        </div>
      </div>

      {/* Body */}
      <section className="card p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {rows.map((r) => (
            <div key={r.label} className="grid grid-cols-[120px,1fr] gap-3 items-start min-w-0">
              <div className="text-white/60 text-sm pt-1">{r.label}</div>
              <div className="min-w-0 break-words">{r.value}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}