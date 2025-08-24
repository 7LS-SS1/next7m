// src/app/domain/page.tsx
import { prisma } from "@/lib/db";
import DomainForm from "./DomainForm";
import DomainRow from "./DomainRow";
import { Prisma } from "@prisma/client";

export const metadata = { title: "จัดการโดเมน | Next7M" };
export const runtime = "nodejs"; // ให้ Prisma Node client ใช้งานแน่ใจ

export default async function DomainPage({
  searchParams,
}: {
  // บางเวอร์ชันของ Next.js ส่งเป็น Promise
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const qRaw = sp?.q;
  const q = Array.isArray(qRaw) ? (qRaw[0] ?? "") : (qRaw ?? "");
  const qTrim = q.toString().trim();

  const where: Prisma.DomainWhereInput = qTrim
    ? {
        OR: [
          { name: { contains: qTrim, mode: Prisma.QueryMode.insensitive } },
          { note: { contains: qTrim, mode: Prisma.QueryMode.insensitive } },
        ],
      }
    : {};

  const domains = await prisma.domain.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container-page py-6">
      <h1 className="text-2xl font-bold">จัดการโดเมน</h1>

      {/* ค้นหา */}
      <form className="mt-4">
        <input
          name="q"
          defaultValue={qTrim}
          placeholder="ค้นหาโดเมน / โน้ต…"
          className="w-full rounded-xl bg-white/5 px-4 py-2 outline-none placeholder:text-white/40 focus:ring-2 focus:ring-white/10"
        />
      </form>

      {/* ฟอร์มเพิ่มโดเมน */}
      <div className="mt-4">
        <DomainForm />
      </div>

      {/* ตาราง */}
      <div className="mt-4 card overflow-hidden">
        <div className="border-b border-white/5 px-4 py-3 text-sm text-white/70">
          พบ {domains.length} รายการ{qTrim ? ` (ค้นหา: "${qTrim}")` : ""}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-white/70">
              <tr className="border-b border-white/5">
                <th className="px-3 py-3 text-left">โดเมน</th>
                <th className="px-3 py-3 text-left">บันทึก</th>
                <th className="px-3 py-3 text-left">สถานะ</th>
                <th className="px-3 py-3 text-left">เพิ่มเมื่อ</th>
                <th className="px-3 py-3 text-left">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {domains.map((d) => (
                <DomainRow
                  key={d.id}
                  id={d.id}
                  name={d.name}
                  note={d.note}
                  status={d.status}
                  createdAt={d.createdAt.toLocaleString("th-TH")}
                />
              ))}
              {domains.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-white/60">
                    ไม่พบข้อมูล
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}