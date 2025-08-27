// src/app/domains/new/page.tsx
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { prisma } from "@/lib/db";
import DomainForm from "../_components/DomainForm";

export default async function NewDomainPage() {
  // ดึง options จาก DB (ถ้า error ให้ fallback เป็น [])
  const [hosts, emails, teams] = await Promise.all([
    prisma.hostProvider
      .findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } })
      .catch(() => []),
    prisma.emailAccount
      .findMany({ select: { id: true, address: true }, orderBy: { address: "asc" } })
      .catch(() => []),
    prisma.team
      .findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } })
      .catch(() => []),
  ]);

  return (
    <div className="grid gap-4 max-w-3xl">
      <h1 className="text-xl font-bold">เพิ่ม Domain</h1>
      <DomainForm hosts={hosts} emails={emails} teams={teams} />
    </div>
  );
}
