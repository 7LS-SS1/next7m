import { prisma } from "@/lib/db";
import ProviderForm from "../../ProviderForm";
import { updateProvider } from "@/app/host-providers/actions";

export const runtime = "nodejs";

export default async function ProviderEditPage({ params }: { params: Promise<{ id: string }> }) {
  const p = await params;
  const row = await prisma.hostProvider.findUnique({ where: { id: p.id } });
  if (!row) return <div className="text-red-400">ไม่พบข้อมูล</div>;
  return (
    <div className="grid gap-4">
      <h1 className="text-xl font-bold">แก้ไข Provider</h1>
      <ProviderForm action={updateProvider} submitText="อัปเดต" defaults={{ id: row.id, name: row.name, note: row.note ?? "" }} />
    </div>
  );
}