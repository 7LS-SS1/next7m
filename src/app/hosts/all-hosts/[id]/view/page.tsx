import { prisma } from "@lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

type DisplayHost = {
  id: string;
  title: string;           // title or name
  providerName?: string | null;
  ip?: string | null;
  email?: string | null;   // email address
  createdOn?: Date | null; // business created date (if present)
  createdAt: Date;
  updatedAt: Date;
  note?: string | null;
};

async function getDisplayHost(id: string): Promise<DisplayHost | null> {
  const anyPrisma = prisma as unknown as Record<string, any>;

  // 1) Preferred: AllHost model
  if (anyPrisma.allHost?.findUnique) {
    const h = await anyPrisma.allHost.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        ip: true,
        note: true,
        createdAt: true,
        updatedAt: true,
        createdOn: true,
        hostProvider: { select: { name: true } },
        email: { select: { address: true } },
      },
    });
    if (!h) return null;
    return {
      id: h.id,
      title: h.title,
      providerName: h.hostProvider?.name ?? null,
      ip: h.ip ?? null,
      email: h.email?.address ?? null,
      createdOn: h.createdOn ?? null,
      createdAt: h.createdAt,
      updatedAt: h.updatedAt,
      note: h.note ?? null,
    };
  }

  // 2) Fallback: domain model (map fields loosely if available)
  if (anyPrisma.domain?.findUnique) {
    const d = await anyPrisma.domain.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        note: true,
        createdAt: true,
        updatedAt: true,
        host: { select: { name: true } },
        hostMail: { select: { address: true } },
        // อาจไม่มี IP/createdOn ในโดเมนจริง ๆ
      },
    });
    if (d) {
      return {
        id: d.id,
        title: d.name,
        providerName: d.host?.name ?? null,
        email: d.hostMail?.address ?? null,
        ip: null,
        createdOn: null,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
        note: d.note ?? null,
      };
    }
  }

  // 3) Fallback: hostProvider model (minimal view)
  if (anyPrisma.hostProvider?.findUnique) {
    const hp = await anyPrisma.hostProvider.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        note: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (hp) {
      return {
        id: hp.id,
        title: hp.name,
        providerName: hp.name,
        ip: null,
        email: null,
        createdOn: null,
        createdAt: hp.createdAt,
        updatedAt: hp.updatedAt,
        note: hp.note ?? null,
      };
    }
  }

  return null;
}

export default async function ViewAllHostPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const host = await getDisplayHost(id);
  if (!host) notFound();

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{host.title}</h1>
        <div className="flex gap-2">
          <Link
            href={`/hosts/all-hosts/${host.id}/edit`}
            className="rounded-lg border px-3 py-1.5"
          >
            แก้ไข
          </Link>
          <form action="/hosts/all-hosts/api/delete" method="POST">
            <input type="hidden" name="id" value={host.id} />
            <button className="rounded-lg border px-3 py-1.5 text-red-600">
              ลบ
            </button>
          </form>
        </div>
      </div>

      <div className="grid gap-3 rounded-xl border p-4">
        <div className="grid gap-1">
          <span className="text-sm opacity-60">ผู้ให้บริการ</span>
          <span>{host.providerName ?? "-"}</span>
        </div>

        <div className="grid gap-1">
          <span className="text-sm opacity-60">IP</span>
          <span>{host.ip ?? "-"}</span>
        </div>

        <div className="grid gap-1">
          <span className="text-sm opacity-60">อีเมล</span>
          <span>{host.email ?? "-"}</span>
        </div>

        <div className="grid gap-1">
          <span className="text-sm opacity-60">วันที่สร้าง (ธุรกิจ)</span>
          <span>
            {host.createdOn ? new Date(host.createdOn).toLocaleDateString() : "-"}
          </span>
        </div>
      </div>

      {host.note && (
        <div className="rounded-xl border p-4 whitespace-pre-wrap">{host.note}</div>
      )}

      <div className="text-sm opacity-60">
        บันทึกเมื่อ: {new Date(host.createdAt).toLocaleString()}<br />
        อัปเดตล่าสุด: {new Date(host.updatedAt).toLocaleString()}
      </div>

      <div>
        <Link
          href="/hosts/all-hosts"
          className="inline-block mt-4 rounded-lg border px-3 py-1.5"
        >
          ← กลับรายการ All Host
        </Link>
      </div>
    </div>
  );
}