// src/app/managements/projects/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/db";
import ConfirmSubmit from "@/components/ConfirmSubmit";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProjectsPage() {
  const rows = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, note: true, createdAt: true },
  });

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Projects</h1>
        <Link
          href="/managements/projects/new"
          className="btn-primary px-4 py-2 rounded-xl"
        >
          เพิ่ม Project
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
            {rows.map((p) => (
              <tr key={p.id} className="border-t border-white/10">
                <td className="p-3">{p.name}</td>
                <td className="p-3">{p.note}</td>
                <td className="p-3">
                  <div className="flex gap-2 justify-end">
                    <Link
                      href={`/managements/projects/${p.id}/edit`}
                      className="rounded-lg border border-white/10 px-3 py-1.5 hover:bg-white/10"
                    >
                      แก้ไข
                    </Link>

                    {/* ลบ: ใช้ POST ไปที่ Route Handler */}
                    <form
                      method="post"
                      action="/managements/projects/api/delete"
                    >
                      <input type="hidden" name="id" value={p.id} />
                      <ConfirmSubmit confirmText={`ลบทีม "${p.name}" ?`}>
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
