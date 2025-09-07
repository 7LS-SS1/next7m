import { prisma } from "@lib/db";
import { notFound } from "next/navigation";
import FormNewHost from "../../_components/formNewHost";

type DefaultVals = {
  id: string;
  title: string;
  ip?: string | null;
  note?: string | null;
  hostProviderId?: string | null;
  emailId?: string | null;
  createdAt?: string | null; // ISO yyyy-mm-dd for the date picker
};

async function getDefaults(id: string): Promise<DefaultVals | null> {
  const anyPrisma = prisma as unknown as Record<string, any>;

  // 1) Preferred: AllHost
  if (anyPrisma.allHost?.findUnique) {
    const h = await anyPrisma.allHost.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        ip: true,
        note: true,
        hostProviderId: true,
        emailId: true,
        createdOn: true,
      },
    });
    if (h) {
      return {
        id: h.id,
        title: h.title,
        ip: h.ip ?? null,
        note: h.note ?? null,
        hostProviderId: h.hostProviderId ?? null,
        emailId: h.emailId ?? null,
        createdAt: h.createdOn ? new Date(h.createdOn).toISOString().slice(0, 10) : null,
      };
    }
  }

  // 2) Fallback: HostProvider (map minimal fields)
  const hp = await prisma.hostProvider.findUnique({
    where: { id },
    select: { id: true, name: true, note: true },
  });
  if (hp) {
    return {
      id: hp.id,
      title: hp.name,
      note: hp.note ?? null,
    };
  }

  return null;
}

export default async function EditHostPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const host = await getDefaults(id);
  if (!host) notFound();

  const providers = await prisma.hostProvider.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const emails = await prisma.emailAccount.findMany({
    orderBy: { address: "asc" },
    select: { id: true, address: true },
  });

  const providerOptions = providers.map((p) => ({ id: p.id, label: p.name }));
  const emailOptions = emails.map((e) => ({ id: e.id, label: e.address }));

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">แก้ไข All Host</h1>
      <FormNewHost
        mode="update"
        action="/hosts/all-hosts/api/update"
        defaultValues={host}
        providers={providerOptions}
        emails={emailOptions}
      />
    </div>
  );
}