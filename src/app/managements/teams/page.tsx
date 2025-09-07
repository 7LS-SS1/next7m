// src/app/managements/teams/page.tsx
import Link from "next/link";
import { prisma } from "@lib/db";
import ConfirmSubmit from "@/components/ConfirmSubmit";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TeamsPage() {
  const rows = await prisma.team.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, note: true, createdAt: true },
  });

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Teams</h1>
        <Link href="/managements/teams/new" className="btn-primary px-4 py-2 rounded-xl">
          เพิ่ม Team
        </Link>
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
            {rows.map((t) => (
              <tr key={t.id} className="border-t border-white/10">
                <td className="p-3">{t.name}</td>
                <td className="p-3">{t.note ?? "-"}</td>
                <td className="p-3">
                  <div className="flex gap-2 justify-end">
                    <Link
                      href={`/managements/teams/${t.id}/edit`}
                      className="rounded-lg border border-white/10 px-3 py-1.5 hover:bg-white/10"
                    >
                      แก้ไข
                    </Link>
                    <form method="post" action="/managements/teams/api/delete">
                      <input type="hidden" name="id" value={t.id} />
                      <ConfirmSubmit confirmText={`ลบทีม "${t.name}" ?`}>
                        ลบ
                      </ConfirmSubmit>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={3} className="p-6 text-center text-white/60">
                  ยังไม่มีข้อมูล
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}