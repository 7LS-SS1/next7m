// src/app/domains/page.tsx
import Link from "next/link";
import { prisma } from "@lib/db";
import ConfirmSubmit from "@/components/ConfirmSubmit";
import { getSession } from "@lib/auth-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = { searchParams: Promise<{ q?: string }> };

type Where =
  | {}
  | {
      OR: (
        | { name: { contains: string; mode: "insensitive" } }
        | { note: { contains: string; mode: "insensitive" } }
      )[];
    };

async function checkIsAdmin() {
  const session = await getSession().catch(() => null);
  const role = session?.role ?? null;
  return role === "ADMIN" || role === "SYSTEM";
}

async function fetchDomains(where: Where) {
  // รีทรายกันเคส connection drop / transient errors
  const maxAttempts = 3;
  let lastErr: unknown = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await prisma.domain.findMany({
        where,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          note: true,
          status: true,
          createdAt: true,
          team: { select: { name: true } },
          host: { select: { name: true } },
          hostType: { select: { name: true } },
        },
      });
    } catch (e: any) {
      lastErr = e;
      const msg = e?.message || "";
      const code = e?.code || "";
      const transient =
        msg.includes("Server has closed the connection") ||
        code === "P1001" || // cannot reach database server
        code === "P1008" || // timed out
        code === "P2024";   // timeout waiting for a connection

      if (!transient || attempt === maxAttempts) {
        // ล้มถาวร หรือครบจำนวนครั้ง → โยนให้ error boundary ของหน้า
        throw e;
      }
      // backoff เล็กน้อยแล้วลองใหม่
      await new Promise((r) => setTimeout(r, 200 * attempt));
    }
  }
  // ปกติจะไม่ถึงบรรทัดนี้
  throw lastErr ?? new Error("Unknown error");
}

export default async function DomainsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const isAdmin = await checkIsAdmin();
  const q = (sp?.q ?? "").trim();

  // สร้าง where แบบยืดหยุ่น (มี/ไม่มี q)
  const where: Where =
    q !== ""
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { note: { contains: q, mode: "insensitive" } },
          ],
        }
      : {};

  const rows = await fetchDomains(where);

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
            <button type="submit" className="rounded-xl border border-white/10 px-4 py-2 hover:bg-white/10">
              ค้นหา
            </button>
          </form>
          {isAdmin && (
            <Link href="/domains/new" className="btn-primary rounded-xl px-4 py-2">
              เพิ่ม Domain
            </Link>
          )}
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
                <td className="p-3">
                  <Link
                    href={`/domains/${r.id}/view`}
                    className="underline decoration-dotted underline-offset-2 hover:opacity-90"
                  >
                    {r.name}
                  </Link>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <label className="font-medium">สถานะ :</label>
                    <span className="inline-block rounded-full bg-green-600/20 px-2 py-0.5 text-xs font-medium text-green-400">
                      {r.status}
                    </span>
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <label className="font-medium">ทีมรับผิดชอบ :</label>
                    <span className="inline-block rounded-full bg-cyan-600/20 px-2 py-0.5 text-xs font-medium text-cyan-400">
                      {r.team?.name ?? "-"}
                    </span>
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex gap-2">
                      <label className="font-medium">Host :</label>
                      <span className="inline-block rounded-full bg-gray-600/20 px-2 py-0.5 text-xs font-medium text-gray-200">
                        {r.host?.name ?? "-"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <label className="font-medium">Type :</label>
                      <span className="inline-block rounded-full bg-gray-600/20 px-2 py-0.5 text-xs font-medium text-gray-200">
                        {r.hostType?.name ?? "-"}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="p-3">{r.note ?? "-"}</td>
                <td className="p-3">
                  <div className="flex gap-2 justify-end">
                    <Link
                      href={`/domains/${r.id}/view`}
                      className="flex items-center justify-center rounded-lg border border-white/10 w-20 h-9 hover:bg-white/10"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    </Link>
                    <Link
                      href={`/domains/${r.id}/edit`}
                      className="flex items-center justify-center rounded-lg border border-white/10 w-20 h-9 hover:bg-white/10"
                    >
                      แก้ไข
                    </Link>
                    <form method="post" action="/domains/api/delete">
                      <input type="hidden" name="id" value={r.id} />
                      <ConfirmSubmit
                        confirmText={`ลบโดเมน \"${r.name}\" ?`}
                        className="flex items-center justify-center rounded-lg border border-white/10 w-20 h-9 hover:bg-white/10 text-rose-300"
                      >
                        ลบ
                      </ConfirmSubmit>
                    </form>
                  </div>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-white/60">
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