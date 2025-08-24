import Link from "next/link";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { createHost, updateHost, deleteHost } from "@/app/host/actions";

export const dynamic = "force-dynamic"; // ให้ list สดเสมอ
export const runtime = "nodejs";

async function getData(q?: string) {
  const where: Prisma.HostWhereInput = q
    ? {
        OR: [
          { name: { contains: q, mode: Prisma.QueryMode.insensitive } },
          { ip: { contains: q, mode: Prisma.QueryMode.insensitive } },
          { note: { contains: q, mode: Prisma.QueryMode.insensitive } },
        ],
      }
    : {};
  const rows = await prisma.host.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, ip: true, status: true, createdAt: true },
  });
  return rows;
}

export default async function HostPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const qRaw = sp?.q;
  const q = Array.isArray(qRaw) ? (qRaw[0] ?? "") : (qRaw ?? "");
  const qTrim = q.toString().trim();
  const hosts = await getData(qTrim || undefined);

  async function deleteAction(fd: FormData) {
    "use server";
    await deleteHost({ ok: false, message: "" }, fd);
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Hosts</h1>
        <Link href="/host/new" className="btn-primary rounded-xl px-4 py-2">
          Add Host
        </Link>
      </div>

      <form className="max-w-xl">
        <input
          name="q"
          defaultValue={qTrim}
          placeholder="ค้นหา host…"
          className="w-full rounded-xl bg-white/5 px-4 py-2 outline-none placeholder:text-white/40 focus:ring-2 focus:ring-white/10"
        />
      </form>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-full text-sm">
          <thead className="bg-white/[0.04] text-white/70">
            <tr>
              <th className="p-3 text-left">ชื่อ</th>
              <th className="p-3 text-left">IP</th>
              <th className="p-3 text-left">สถานะ</th>
              <th className="p-3 text-left">สร้างเมื่อ</th>
              <th className="p-3 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {hosts.map((h) => (
              <tr key={h.id} className="border-t border-white/10">
                <td className="p-3">
                  <Link href={`/host/${h.id}`} className="hover:underline">
                    {h.name}
                  </Link>
                </td>
                <td className="p-3">{h.ip ?? "-"}</td>
                <td className="p-3">
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${h.status === "ACTIVE" ? "bg-green-500/20 text-green-300" : "bg-yellow-500/20 text-yellow-300"}`}
                  >
                    {h.status}
                  </span>
                </td>
                <td className="p-3">
                  {new Intl.DateTimeFormat("th-TH", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC" }).format(new Date(h.createdAt))}
                </td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/host/${h.id}/edit`}
                      className="rounded-lg border border-white/10 px-3 py-1.5 hover:bg-white/10"
                    >
                      แก้ไข
                    </Link>

                    <form
                      method="post"
                      action={deleteAction}
                      onSubmit={(e) => {
                        if (!confirm(`ลบโฮสต์ "${h.name}" ?`)) e.preventDefault();
                      }}
                    >
                      <input type="hidden" name="id" value={h.id} />
                      <button className="rounded-lg border border-white/10 px-3 py-1.5 hover:bg-white/10 text-red-300">
                        ลบ
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {hosts.length === 0 && (
              <tr>
                <td className="p-6 text-center text-white/60" colSpan={5}>
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
