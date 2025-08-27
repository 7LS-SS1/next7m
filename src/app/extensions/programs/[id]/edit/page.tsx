// src/app/extensions/programs/[id]/edit/page.tsx
import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProgramForm from "../../_components/ProgramForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = { params: Promise<{ id: string }> };

const baseSelect = {
  id: true,
  slug: true,
  name: true,
  version: true,
  vendor: true,
  category: true,
  content: true,
  iconUrl: true,
  fileUrl: true,
  recommended: true,
  isRecommended: true,
  featured: true,
  updatedAt: true,
} as const;

export default async function ProgramEditPage({ params }: PageProps) {
  const { id } = await params;
  const idOrSlugInput = decodeURIComponent(id ?? "");

  const program = await prisma.program.findFirst({
    where: { OR: [{ id: idOrSlugInput }, { slug: idOrSlugInput }] },
    select: baseSelect,
  });
  if (!program) return notFound();

  const idOrSlug = program.slug || program.id;

  return (
    <div className="grid gap-4">
      <nav className="text-sm text-white/60">
        <Link href="/extensions" className="hover:underline">
          Extensions
        </Link>
        {" / "}
        <Link href="/extensions/programs" className="hover:underline">
          Programs
        </Link>
        {" / "}
        <Link
          href={`/extensions/programs/${encodeURIComponent(idOrSlug)}/view`}
          className="hover:underline"
        >
          {program.name}
        </Link>
        {" / "}
        <span className="text-white">แก้ไข</span>
      </nav>

      <h1 className="text-xl font-bold">แก้ไขโปรแกรม</h1>

      <ProgramForm
        mode="edit"
        idOrSlug={program.slug || program.id}
        actionHref="/extensions/programs/api/update" // ✅ ฟิกซ์ URL ไม่ให้เป็น undefined
        defaults={{
          id: program.id,
          slug: program.slug ?? undefined,
          name: program.name,
          version: program.version ?? "",
          vendor: program.vendor ?? "",
          category: program.category ?? "",
          iconUrl: program.iconUrl ?? "",
          fileUrl: program.fileUrl ?? "",
          content: program.content ?? "",
          recommended: program.recommended,
          isRecommended: program.isRecommended,
          featured: program.featured,
        }}
      />
    </div>
  );
}
