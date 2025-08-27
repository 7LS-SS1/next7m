// src/app/managements/projects/[id]/edit/page.tsx
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EditProjectPage({ params }: { params: { id: string } }) {
  const row = await prisma.project.findUnique({ where: { id: params.id } });
  if (!row) notFound();

  return (
    <div className="grid gap-4 max-w-xl">
      <h1 className="text-xl font-bold">แก้ไข Project</h1>

      <form method="post" action="/managements/projects/api/update" className="card p-4 grid gap-3">
        <input type="hidden" name="id" value={row.id} />
        <input
          name="name"
          defaultValue={row.name}
          placeholder="ชื่อโปรเจค"
          className="rounded-xl bg-white/5 px-4 py-2 outline-none"
          required
        />
        <textarea
          name="note"
          rows={3}
          defaultValue={row.note || ""}
          placeholder="หมายเหตุ"
          className="rounded-xl bg-white/5 px-4 py-2 outline-none"
        />
        <div className="flex gap-2">
          <button type="submit" className="btn-primary px-5 py-2">อัปเดต</button>
          <a href="/managements/projects" className="rounded-xl border border-white/10 px-5 py-2 hover:bg-white/10">
            ยกเลิก
          </a>
        </div>
      </form>
    </div>
  );
}