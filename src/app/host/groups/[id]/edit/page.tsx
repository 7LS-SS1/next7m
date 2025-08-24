import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export const runtime = "nodejs";

export default async function EditGroupPage({ params }: { params: Promise<{ id: string }> }) {
  const p = await params;
  const group = await prisma.hostGroup.findUnique({ where: { id: p.id } });
  if (!group) return <div className="text-red-400">ไม่พบกลุ่ม</div>;

  const gid = group.id;

  async function update(fd: FormData) {
    "use server";
    const name = fd.get("name")?.toString().trim();
    const note = fd.get("note")?.toString().trim() || undefined;
    if (!name) return;
    await prisma.hostGroup.update({ where: { id: gid }, data: { name, note } });
    redirect("/host/groups");
  }

  return (
    <div className="grid gap-4">
      <h1 className="text-xl font-bold">แก้ไข Host Group</h1>
      <form method="post" action={update} className="card p-4 grid gap-3 max-w-lg">
        <input name="name" defaultValue={group.name} className="rounded-xl bg-white/5 px-4 py-2 outline-none" required />
        <textarea name="note" rows={3} defaultValue={group.note ?? ""} className="rounded-xl bg-white/5 px-4 py-2 outline-none" />
        <button type="submit" className="btn-primary px-5 py-2">อัปเดต</button>
      </form>
    </div>
  );
}