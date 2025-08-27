// src/app/extensions/plugins/[id]/view/page.tsx
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";

// In Next 15, `params` is a Promise. Type it that way and await it.
export default async function PluginViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: raw } = await params;
  const idOrSlug = decodeURIComponent(raw ?? "");

  // Support both id and slug; this queries the correct `Plugin` model (not Program)
  const plugin = await prisma.plugin.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
  });

  if (!plugin) return notFound();

  const idForHref = encodeURIComponent(plugin.slug ?? plugin.id);

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold truncate">{plugin.name}</h1>
        <Link
          href={`/extensions/plugins/${idForHref}/edit`}
          className="rounded-xl px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/15"
        >
          แก้ไข
        </Link>
      </div>

      <div className="text-sm text-white/70">เวอร์ชัน: {plugin.version ?? "-"}</div>
      <div className="text-sm text-white/70">ผู้พัฒนา: {plugin.vendor ?? "-"}</div>

      {plugin.content ? (
        <article
          className="prose prose-invert max-w-none [&_img]:max-w-full [&_img]:h-auto [&_video]:max-w-full [&_video]:h-auto [&_iframe]:w-full [&_iframe]:aspect-video [&_table]:w-full [&_table]:border-collapse [&_th]:text-left [&_td]:align-top [&_pre]:overflow-x-auto [&_code]:break-words [&_blockquote]:border-l-4 [&_blockquote]:pl-3 overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: plugin.content }}
        />
      ) : (
        <p className="text-white/60">ไม่มีรายละเอียด</p>
      )}

      {plugin.fileUrl && (
        <a
          href={plugin.fileUrl}
          className="inline-flex items-center justify-center rounded-xl px-4 py-2 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-black font-medium hover:brightness-95 w-fit"
          download
          rel="noopener"
        >
          ดาวน์โหลดไฟล์
        </a>
      )}
    </div>
  );
}