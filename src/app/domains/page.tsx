// src/app/domains/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/db";
import ConfirmSubmit from "@/components/ConfirmSubmit";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = { searchParams?: { q?: string } };

export default async function DomainsPage({ searchParams }: Props) {
  const q = (searchParams?.q ?? "").trim();

  // สร้าง where แบบยืดหยุ่น (มี/ไม่มี q)
  const where =
    q !== ""
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { note: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {};

  const rows = await prisma.domain.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, note: true, status: true, createdAt: true },
  });

  return (
    <div className="grid gap-4">
      {/* Header + Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold">Domains</h1>
        <div className="flex gap-2">
          <form method="get" action="/domains" className="flex gap-2">
            <input
              name="q"
              defaultValue={q}
              placeholder="ค้นหาโดเมน/หมายเหตุ..."
              className="rounded-xl bg-white/5 px-4 py-2 outline-none"
            />
            <button className="rounded-xl border border-white/10 px-4 py-2 hover:bg-white/10">
              ค้นหา
            </button>
          </form>
          <Link href="/domains/new" className="btn-primary rounded-xl px-4 py-2">
            เพิ่ม Domain
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-left bg-white/5">
            <tr>
              <th className="p-3">โดเมน</th>
              <th className="p-3">สถานะ</th>
              <th className="p-3">หมายเหตุ</th>
              <th className="p-3 w-40">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-white/10">
                <td className="p-3">{r.name}</td>
                <td className="p-3">{r.status ?? "-"}</td>
                <td className="p-3">{r.note ?? "-"}</td>
                <td className="p-3">
                  <div className="flex gap-2 justify-end">
                    <Link
                      href={`/domains/${r.id}/edit`}
                      className="rounded-lg border border-white/10 px-3 py-1.5 hover:bg-white/10"
                    >
                      แก้ไข
                    </Link>
                    <form method="post" action="/domains/api/delete">
                      <input type="hidden" name="id" value={r.id} />
                      <ConfirmSubmit confirmText={`ลบโดเมน "${r.name}" ?`}>
                        ลบ
                      </ConfirmSubmit>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-white/60">
                  ไม่พบข้อมูล
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}