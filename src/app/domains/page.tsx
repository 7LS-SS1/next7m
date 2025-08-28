// src/app/domains/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/db";
import ConfirmSubmit from "@/components/ConfirmSubmit";
import { Avatar, Chip } from "@nextui-org/react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = { searchParams: Promise<{ q?: string }> };

export default async function DomainsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const q = (sp?.q ?? "").trim();

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
  select: {
    id: true,
    name: true,
    note: true,
    status: true,
    // statusCode: true, // << เพิ่มบรรทัดนี้
    createdAt: true,
    // TODO: team/host ถ้าจะโชว์ชื่อให้ select relation มาเลย
    // team: { select: { name: true } },
    // host: { select: { name: true } },
  },
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
              <th className="p-3">ทีม</th>
              <th className="p-3">Host</th>
              <th className="p-3">หมายเหตุ</th>
              <th className="p-3 w-40">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-white/10">
                {/* โดเมน */}
                <td className="p-3">{r.name}</td>

                {/* สถานะ + Status code (ตามตัวอย่าง) */}
                <td className="p-3">
                  <div className="flex gap-2 flex-col">
                    <div className="flex gap-2 items-center">
                      <label className="font-medium">สถานะ :</label>
                      <Chip
                        size="sm"
                        variant="flat"
                        color={
                          r.status === "ACTIVE"
                            ? "success"
                            : r.status === "PENDING"
                            ? "warning"
                            : r.status === "INACTIVE"
                            ? "default"
                            : "default"
                        }
                      >
                        {r.status ?? "-"}
                      </Chip>
                    </div>
                    <div className="flex gap-2 items-center">
                      <label className="font-medium">Status :</label>
                      <Chip size="sm" variant="flat">
                        {(r as any)?.statusCode ?? "-"}
                      </Chip>
                    </div>
                  </div>
                </td>

                {/* ทีม (ยังไม่มีข้อมูลใน select) */}
                <td className="p-3">-</td>

                {/* Host (ยังไม่มีข้อมูลใน select) */}
                <td className="p-3">-</td>

                {/* หมายเหตุ */}
                <td className="p-3">{r.note ?? "-"}</td>

                {/* จัดการ */}
                <td className="p-3 w-40">
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

              <tr key="{r.id}" className="border-t border-white/10">
                <td className="p-3">domain-test.com</td>
                <td className="p-3">
                  <div className="flex gap-2 flex-col">
                    <div className="flex gap-2">
                      <label className="font-medium">
                        สถานะ :
                      </label>
                      <span className="inline-block rounded-full bg-green-600/20 px-2 py-0.5 text-xs font-medium text-green-400">
                        ACTIVE
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <label className="font-medium">
                        Status :
                      </label>
                      <span className="inline-block rounded-full bg-green-600/20 px-2 py-0.5 text-xs font-medium text-green-400">
                        200
                      </span>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex gap-2 flex-col">
                    <div className="flex gap-2">
                      <label className="font-medium">
                        ทีมรับผิดชอบ :
                      </label>
                      <span className="inline-block rounded-full bg-cyan-600/20 px-2 py-0.5 text-xs font-medium text-cyan-400">
                        Center X
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <label className="font-medium">
                        Type :
                      </label>
                      <span className="inline-block rounded-full bg-gray-600/20 px-2 py-0.5 text-xs font-medium text-gray-200">
                        PBN
                      </span>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex gap-2 flex-col">
                    <div className="flex gap-2">
                      <label className="font-medium">
                        Host :
                      </label>
                      <span className="inline-block rounded-full bg-gray-600/20 px-2 py-0.5 text-xs font-medium text-gray-200">
                        AWS
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <label className="font-medium">
                        Type :
                      </label>
                      <span className="inline-block rounded-full bg-gray-600/20 px-2 py-0.5 text-xs font-medium text-gray-200">
                        7M PBN 2
                      </span>
                    </div>
                  </div>
                  </td>
                <td className="p-3">โน๊ต</td>
                <td className="p-3">
                  <div className="flex gap-2 justify-end">
                    <Link
                      href={`/domains/#/edit`}
                      className="rounded-lg border border-white/10 px-3 py-1.5 hover:bg-white/10"
                    >
                      แก้ไข
                    </Link>
                    <form method="post" action="/domains/api/delete">
                      <input type="hidden" name="id" value="1" />
                    <ConfirmSubmit confirmText={`ลบโดเมน "domain-test.com" ?`}>
                        ลบ
                      </ConfirmSubmit>
                    </form>
                  </div>
                </td>
              </tr>
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