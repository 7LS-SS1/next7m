import Link from "next/link";
import { prisma } from "@/lib/db";
import { deleteType } from "@/app/host-types/actions";
import ConfirmSubmit from "@/components/ConfirmSubmit";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export default async function TypesPage() {
  let rows: { id: string; name: string; updatedAt: Date }[] = [];
  try {
    rows = await prisma.hostType.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, updatedAt: true },
    });
  } catch (e) {
    rows = [];
  }

  async function del(fd: FormData) {
    "use server";
    await deleteType({ ok: false, message: "" }, fd);
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Host Types</h1>
        <Link href="/host-types/new" className="btn-primary rounded-xl px-4 py-2">เพิ่ม Type</Link>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-white/[0.04] text-white/70">
            <tr>
              <th className="p-3 text-left">ชื่อ</th>
              <th className="p-3 text-left">อัปเดตล่าสุด</th>
              <th className="p-3 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-t border-white/10">
                <td className="p-3">{r.name}</td>
                <td className="p-3">{new Intl.DateTimeFormat("th-TH", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC" }).format(new Date(r.updatedAt))}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <Link href={`/host-types/${r.id}/edit`} className="rounded-lg border border-white/10 px-3 py-1.5 hover:bg-white/10">แก้ไข</Link>
                    <<form method="post" action={del}>
                      <input type="hidden" name="id" value={r.id}/>
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
                </td>
              </tr>
            ))}
            {rows.length===0 && <tr><td className="p-6 text-center text-white/60" colSpan={3}>ยังไม่มีข้อมูล</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}