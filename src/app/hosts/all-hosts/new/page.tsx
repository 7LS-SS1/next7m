// /src/app/hosts/all-hosts/new/page.tsx
import FormNewHost from "../_components/formNewHost";
import { prisma } from "@lib/db";

export default async function NewAllHostPage() {
  const providers = await prisma.hostProvider.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  const emails = await prisma.emailAccount.findMany({
    orderBy: { address: "asc" },
    select: { id: true, address: true },
  });

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">เพิ่ม All Host</h1>
      <FormNewHost
        mode="create"
        action="/hosts/all-hosts/api/create"
        providers={providers.map(p => ({ id: p.id, label: p.name }))}
        emails={emails.map(e => ({ id: e.id, label: e.address }))}
      />
    </div>
  );
}