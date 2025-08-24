import { prisma } from "@/lib/db";
import Link from "next/link";

export const runtime = "nodejs";

async function getHost(id: string) {
  return prisma.host.findUnique({ where: { id } });
}

export default async function HostDetail({ params }: { params: Promise<{ id: string }> }) {
  const p = await params;
  const host = await getHost(p.id);
  if (!host) return <div className="text-red-400">ไม่พบโฮสต์</div>;

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{host.name}</h1>
        <Link href={`/host/${host.id}/edit`} className="rounded-lg border border-white/10 px-3 py-1.5 hover:bg-white/10">
          แก้ไข
        </Link>
      </div>

      <div className="grid gap-2">
        <div className="card p-4 grid gap-2">
          <div><span className="text-white/60">IP:</span> {host.ip ?? "-"}</div>
          <div><span className="text-white/60">สถานะ:</span> {host.status}</div>
          <div><span className="text-white/60">บันทึก:</span> {host.note ?? "-"}</div>
          <div><span className="text-white/60">สร้างเมื่อ:</span> {new Date(host.createdAt).toLocaleString()}</div>
          <div><span className="text-white/60">แก้ไขล่าสุด:</span> {new Date(host.updatedAt).toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}