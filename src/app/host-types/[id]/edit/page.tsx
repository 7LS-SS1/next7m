import { prisma } from "@/lib/db";
import TypeForm from "../../TypeForm";
import { updateType } from "@/app/host-types/actions";

export const runtime = "nodejs";

export default async function TypeEditPage({ params }: { params: Promise<{ id: string }> }) {
  const p = await params;
  const row = await prisma.hostType.findUnique({ where: { id: p.id } });
  if (!row) return <div className="text-red-400">ไม่พบข้อมูล</div>;
  return (
    <div className="grid gap-4">
      <h1 className="text-xl font-bold">แก้ไข Host Type</h1>
      <TypeForm action={updateType} submitText="อัปเดต" defaults={{ id: row.id, name: row.name, note: row.note ?? "" }} />
    </div>
  );
}