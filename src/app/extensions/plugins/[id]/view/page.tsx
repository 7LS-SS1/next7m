// src/app/extensions/plugins/[id]/view/page.tsx
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function PluginViewPage({ params }: { params: { id: string } }) {
  const plugin = await prisma.program.findUnique({
    where: { id: params.id },
  });

  if (!plugin) return notFound();

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{plugin.name}</h1>
        <Link
          href={`/extensions/plugins/${plugin.id}/edit`}
          className="btn-primary px-4 py-2 rounded-xl"
        >
          แก้ไข
        </Link>
      </div>

      <div className="text-sm text-white/70">เวอร์ชัน: {plugin.version ?? "-"}</div>
      <div className="text-sm text-white/70">ผู้พัฒนา: {plugin.vendor ?? "-"}</div>
      <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: plugin.content ?? "" }} />

      {plugin.fileUrl && (
        <a
          href={plugin.fileUrl}
          className="btn-primary px-4 py-2 rounded-xl inline-block"
          download
        >
          ดาวน์โหลด
        </a>
      )}
    </div>
  );
}