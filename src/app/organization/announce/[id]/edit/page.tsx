import { prisma } from "@lib/db";
import AnnounceForm from "@/app/organization/announce/_components/AnnounceForm";
import Link from "next/link";

export default async function EditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const p = await params;

  const a = await prisma.announcement
    .findUnique({ where: { id: p.id } })
    .catch(() => null);

  if (!a) {
    return (
      <main className="w-[90%] mx-auto p-6 space-y-4">
        <h1 className="text-xl font-semibold">ไม่พบประกาศ</h1>
        <Link
          href="/organization/announce"
          className="inline-block rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1 text-sm text-white/80 hover:bg-white/10"
        >
          ← ย้อนกลับ
        </Link>
      </main>
    );
  }

  const teams = await prisma.team
    .findMany({
      where: { organizationId: a.organizationId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    })
    .catch(() => []);

  return (
    <main className="w-[90%] mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">แก้ไขประกาศ</h1>
        <Link
          href="/organization/announce"
          className="inline-block rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1 text-sm text-white/80 hover:bg-white/10"
        >
          ← ย้อนกลับ
        </Link>
      </div>

      <AnnounceForm
        action={`/organization/api/announce/${p.id}`}
        method="POST"
        submitLabel="อัปเดต"
        showDelete={true}
        deleteAction={`/organization/api/announce/${p.id}`}
        redirectTo={`/organization/announce/${p.id}/view`}
        defaults={{
          title: a.title,
          content: a.content,
          organizationId: a.organizationId,
          ...((a as any).type ? { type: (a as any).type } : {}),
          ...((a as any).teamId ? { teamId: (a as any).teamId } : {}),
        }}
        teams={teams}
      />
    </main>
  );
}
