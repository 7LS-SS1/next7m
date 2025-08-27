// src/app/hosts/types/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/db";
import ConfirmSubmit from "@/components/ConfirmSubmit";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TypesPage() {
  const rows = await prisma.hostType.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, note: true, createdAt: true },
  });

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Host Types</h1>
        <Link href="/hosts/types/new" className="btn-primary px-4 py-2 rounded-xl">เพิ่ม Type</Link>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-left bg-white/5">
            <tr>
              <th className="p-3">ชื่อ</th>
              <th className="p-3">หมายเหตุ</th>
              <th className="p-3 w-40">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-white/10">
                <td className="p-3">{r.name}</td>
                <td className="p-3">{r.note ?? "-"}</td>
                <td className="p-3">
                  <div className="flex gap-2 justify-end">
                    <Link href={`/hosts/types/${r.id}/edit`} className="rounded-lg border border-white/10 px-3 py-1.5 hover:bg-white/10">แก้ไข</Link>
                    <form method="post" action="/hosts/types/api/delete">
                      <input type="hidden" name="id" value={r.id} />
                      <ConfirmSubmit confirmText={`ลบ "${r.name}" ?`}>
                        ลบ
                      </ConfirmSubmit>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={3} className="p-6 text-center text-white/60">ยังไม่มีข้อมูล</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}