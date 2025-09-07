import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const p = await params;

  const a = await prisma.announcement
    .findUnique({
      where: { id: p.id },
      select: { id: true, title: true, content: true, createdAt: true, updatedAt: true },
    })
    .catch(() => null);

  if (!a) return notFound();

  // วันที่แบบคงที่ (เลี่ยง hydration mismatch)
  const created = a.createdAt ? a.createdAt.toISOString().slice(0, 10) : "";
  const updated = a.updatedAt ? a.updatedAt.toISOString().slice(0, 10) : "";

  return (
    <main className="mx-auto max-w-3xl p-6">
      {/* Header / Breadcrumb */}
      <div className="mb-4 flex items-center gap-2 text-sm text-white/70">
        <Link href="/organization" className="hover:underline">Organization</Link>
        <span>/</span>
        <Link href="/organization/announce" className="hover:underline">ประกาศ</Link>
        <span>/</span>
        <span className="truncate text-white/90">{a.title || "ประกาศ"}</span>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
        {/* Title & Actions */}
        <div className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
          <h1 className="text-xl font-semibold leading-7">{a.title}</h1>
          <div className="shrink-0">
            <Link
              href={`/organization/announce/${a.id}/edit`}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-3 py-1.5 text-sm hover:bg-white/[0.08]"
            >
              ✏️ แก้ไข
            </Link>
          </div>
        </div>

        {/* Meta */}
        <div className="grid gap-2 px-5 py-3 text-xs text-white/60 sm:flex sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5">เผยแพร่: <strong className="ml-1 font-medium text-white/80">{created}</strong></span>
            {updated && updated !== created && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5">อัปเดต: <strong className="ml-1 font-medium text-white/80">{updated}</strong></span>
            )}
          </div>
          <Link href="/organization/announce" className="text-white/70 hover:text-white hover:underline">← ย้อนกลับ</Link>
        </div>

        {/* Content */}
        <div className="px-5 pb-6 pt-2">
          <article
            className="prose prose-invert max-w-none prose-headings:mt-6 prose-p:leading-7 prose-a:text-sky-300 prose-a:underline hover:prose-a:brightness-110 prose-li:my-1 prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-white/5 prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: a.content ?? "" }}
          />
        </div>
      </div>
    </main>
  );
}