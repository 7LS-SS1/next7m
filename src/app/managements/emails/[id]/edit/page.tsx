// src/app/managements/emails/[id]/edit/page.tsx
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EditEmailPage({ params }: { params: { id: string } }) {
  const row = await prisma.emailAccount.findUnique({ where: { id: params.id } });
  if (!row) notFound();

  return (
    <div className="grid gap-4 max-w-xl">
      <h1 className="text-xl font-bold">แก้ไข E‑Mail</h1>

      <form method="post" action="/managements/emails/api/update" className="card p-4 grid gap-3">
        <input type="hidden" name="id" value={row.id} />
        <input
          name="address"
          type="email"
          defaultValue={row.address}
          className="rounded-xl bg-white/5 px-4 py-2 outline-none"
          required
        />
        <select
          name="provider"
          defaultValue={row.provider}
          className="input"
        >
          <option value="Outlook">Center X</option>
          <option value="Yahoo">7M</option>
          <option value="Gmail">RCA</option>
        </select>
        <select
          name="team"
          defaultValue={row.team}
          className="input"
        >
          <option value="Outlook">Outlook</option>
          <option value="Yahoo">Yahoo</option>
          <option value="Gmail">Gmail</option>
        </select>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary px-5 py-2">อัปเดต</button>
          <a href="/managements/emails" className="rounded-xl border border-white/10 px-5 py-2 hover:bg-white/10">
            ยกเลิก
          </a>
        </div>
      </form>
    </div>
  );
}