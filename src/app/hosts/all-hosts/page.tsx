import { prisma } from "@lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  title: string;
  ip?: string | null;
  note?: string | null;
  updatedAt: Date;
};

export default async function HostsPage() {
  const anyPrisma = prisma as unknown as Record<string, any>;

  let list: Row[] = [];

  if (anyPrisma.allHost?.findMany) {
    // ✅ ใช้โมเดล AllHost (มี title/ip)
    const rows = await anyPrisma.allHost.findMany({
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, ip: true, note: true, updatedAt: true },
    });
    list = rows;
  } else {
    // 🔁 Fallback: ยังไม่มีโมเดล AllHost → ใช้ hostProvider แล้ว map name -> title (ไม่มี ip)
    const rows = await prisma.hostProvider.findMany({
      orderBy: { updatedAt: "desc" },
      select: { id: true, name: true, note: true, updatedAt: true },
    });
    list = rows.map((h) => ({
      id: h.id,
      title: h.name,
      ip: null,
      note: h.note ?? null,
      updatedAt: h.updatedAt,
    }));
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">All Hosts</h1>
        <Link href="/hosts/all-hosts/new" className="rounded-xl border px-3 py-2 hover:bg-gray-50">
          + เพิ่มใหม่
        </Link>
      </div>

      <div className="grid gap-3">
        {list.length === 0 && <p className="opacity-60">ยังไม่มีรายการ</p>}

        {list.map((h) => (
          <div key={h.id} className="rounded-xl border p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{h.title}</div>
              {h.ip && <div className="text-sm">IP: {h.ip}</div>}
              {h.note && <div className="text-sm opacity-70">{h.note}</div>}
              <div className="text-xs opacity-60 mt-1">
                อัปเดตล่าสุด: {new Date(h.updatedAt).toLocaleString()}
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/hosts/all-hosts/${h.id}/view`} className="rounded-lg border px-3 py-1.5">ดู</Link>
              <Link href={`/hosts/all-hosts/${h.id}/edit`} className="rounded-lg border px-3 py-1.5">แก้ไข</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}