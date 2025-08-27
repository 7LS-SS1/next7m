// src/app/managements/emails/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/db";
import ConfirmSubmit from "@/components/ConfirmSubmit";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EmailsPage() {
  const rows = await prisma.emailAccount.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, address: true, provider: true,note: true, createdAt: true },
  });

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">E‑Mail</h1>
        <Link
          href="/managements/emails/new"
          className="btn-primary px-4 py-2 rounded-xl"
        >
          เพิ่ม E‑Mail
        </Link>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-left bg-white/5">
            <tr>
              <th className="p-3">อีเมล</th>
              <th className="p-3">ผู้ให้บริการ</th>
              <th className="p-3">ทีม</th>
              <th className="p-3 w-40">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id} className="border-t border-white/10">
                <td className="p-3">{m.address}</td>
                <td className="p-3">{m.provider}</td>
                <td className="p-3">{m.note}</td>
                <td className="p-3">
                  <div className="flex gap-2 justify-end">
                    <Link
                      href={`/managements/emails/${m.id}/edit`}
                      className="rounded-lg border border-white/10 px-3 py-1.5 hover:bg-white/10"
                    >
                      แก้ไข
                    </Link>
                    <form method="post" action="/managements/emails/api/delete">
                      <input type="hidden" name="id" value={m.id} />
                      <ConfirmSubmit confirmText={`ลบทีม "${m.name}" ?`}>
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
