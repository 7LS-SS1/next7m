import HostForm from "../HostForm";
import { createHost } from "@/app/host/actions";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export default async function NewHostPage() {
  const [providers, groups] = await Promise.all([
    (prisma.hostProvider?.findMany?.({ orderBy: { name: "asc" }, select: { id: true, name: true } }) ?? []),
    (prisma.hostGroup?.findMany?.({ orderBy: { name: "asc" }, select: { id: true, name: true } }) ?? []),
  ]);

  return (
    <div className="grid gap-4">
      <h1 className="text-xl font-bold">เพิ่มโฮสต์</h1>
      <HostForm action={createHost} submitText="บันทึก" providers={providers} groups={groups} />
    </div>
  );
}