import { prisma } from "@/lib/db";
import Link from "next/link";
import ConfirmSubmit from "@/components/ConfirmSubmit";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export default async function GroupsPage() {
  let groups: { id: string; name: string; note: string | null }[] = [];
  try {
    groups = await prisma.hostGroup.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, note: true },
    });
  } catch (e) {
    groups = [];
  }

  async function del(fd: FormData) {
    "use server";
    const id = fd.get("id")?.toString();
    if (!id) return;
    await prisma.hostGroup.delete({ where: { id } });
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Host Groups</h1>
        <Link
          href="/host/groups/new"
          className="btn-primary rounded-xl px-4 py-2"
        >
          เพิ่มกลุ่ม
        </Link>
      </div>

      <div className="card p-3 grid gap-2">
        {groups.map((g) => (
          <div
            key={g.id}
            className="flex items-center justify-between border-b border-white/10 py-2 last:border-0"
          >
            <div>
              <div className="font-medium">{g.name}</div>
              {g.note && <div className="text-white/60 text-sm">{g.note}</div>}
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/host/groups/${g.id}/edit`}
                className="rounded-lg border border-white/10 px-3 py-1.5 hover:bg-white/10"
              >
                แก้ไข
              </Link>
              <form method="post" action={del}>
                <input type="hidden" name="id" value={g.id} />
                <form method="post" action={del}>
                  <input type="hidden" name="id" value={r.id} />
                  <ConfirmSubmit
                    confirmText={`ลบ "${r.name}" ?`}
                    className="rounded-lg border border-white/10 px-3 py-1.5 hover:bg-white/10 text-red-300"
                  >
                    ลบ
                  </ConfirmSubmit>
                </form>
              </form>
            </div>
          </div>
        ))}
        {groups.length === 0 && (
          <div className="text-white/60">ยังไม่มีกลุ่ม</div>
        )}
      </div>
    </div>
  );
}
