import { prisma } from "@/lib/db";
import HostForm from "../../HostForm";
import { updateHost } from "@/app/host/actions";

export const runtime = "nodejs";

async function getData(id: string) {
  const [host, providers, groups] = await Promise.all([
    prisma.host.findUnique({ where: { id } }),
    prisma.hostProvider.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.hostGroup.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  return { host, providers, groups };
}

export default async function EditHostPage({ params }: { params: Promise<{ id: string }> }) {
  const p = await params;
  const { host, providers, groups } = await getData(p.id);
  if (!host) return <div className="text-red-400">ไม่พบโฮสต์</div>;

  return (
    <div className="grid gap-4">
      <h1 className="text-xl font-bold">แก้ไขโฮสต์</h1>
      <HostForm
        action={updateHost}
        submitText="อัปเดต"
        providers={providers}
        groups={groups}
        defaults={{
          id: host.id,
          name: host.name,
          ip: host.ip ?? "",
          note: host.note ?? "",
          status: host.status as any,
          providerId: host.providerId ?? undefined,
          groupId: host.groupId ?? undefined,
        }}
      />
    </div>
  );
}