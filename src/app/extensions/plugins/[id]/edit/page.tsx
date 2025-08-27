// src/app/extensions/plugins/[id]/edit/page.tsx
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import PluginForm from "../../_components/PluginForm";

// Next.js App Router (v15+) provides params/searchParams as Promise types in PageProps
// so we type it accordingly to avoid build-time type errors.

type PageProps = {
  params: Promise<{ id: string }>; // dynamic segment [id] may be an id or a slug
};

export default async function EditPluginPage({ params }: PageProps) {
  const resolved = await params;
  const raw = resolved?.id ?? "";
  const idOrSlug = decodeURIComponent(raw);

  // Support both ID or slug
  const plugin = await prisma.plugin.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
  });

  if (!plugin) return notFound();

  return (
    <div className="grid gap-6 max-w-2xl">
      <h1 className="text-2xl font-bold">แก้ไข Plugin</h1>
      <PluginForm
        key={plugin.id}
        actionUrl="/extensions/plugins/api/update"
        defaults={{
          id: plugin.id,
          name: plugin.name,
          version: plugin.version ?? "",
          vendor: plugin.vendor ?? "",
          category: plugin.category ?? "",
          pluginType: plugin.pluginType ?? "",
          content: plugin.content ?? "",
          iconUrl: plugin.iconUrl ?? "",
          fileUrl: plugin.fileUrl ?? "",
          recommended: plugin.recommended,
          featured: plugin.featured,
        }}
      />
    </div>
  );
}