// src/app/extensions/plugins/[id]/edit/page.tsx
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import PluginForm from "../../_components/PluginForm";

export default async function EditPluginPage({ params }: { params: { id: string } }) {
  const plugin = await prisma.program.findUnique({
    where: { id: params.id },
  });

  if (!plugin) return notFound();

  return (
    <div className="grid gap-6 max-w-2xl">
      <h1 className="text-2xl font-bold">แก้ไข Plugin</h1>
      <PluginForm plugin={plugin} />
    </div>
  );
}