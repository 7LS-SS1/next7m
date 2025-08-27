// src/app/managements/emails/[id]/edit/page.tsx
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Next 15 typegen can make `params` a Promise in server components
// so we declare PageProps accordingly and await it before use.
export type PageProps = { params: Promise<{ id: string }> };

export default async function EditEmailPage({ params }: PageProps) {
  const { id } = await params;

  const row = await prisma.emailAccount.findUnique({ where: { id } });
  if (!row) notFound();

  return (
    <div className="grid gap-4 max-w-xl">
      <h1 className="text-xl font-bold">แก้ไข E‑Mail</h1>

      <form method="post" action="/managements/emails/api/update" className="card p-4 grid gap-3">
        <input type="hidden" name="id" value={row.id} />

        <label className="grid gap-1">
          <span className="text-sm text-white/70">ที่อยู่อีเมล</span>
          <input
            name="address"
            type="email"
            defaultValue={row.address}
            className="rounded-xl bg-white/5 px-4 py-2 outline-none"
            required
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm text-white/70">ผู้ให้บริการ</span>
          <select
            name="provider"
            defaultValue={row.provider}
            className="rounded-xl bg-white/5 px-4 py-2 outline-none"
          >
            <option value="Gmail">Gmail</option>
            <option value="Outlook">Outlook</option>
            <option value="Yahoo">Yahoo</option>
            <option value="Other">Other</option>
          </select>
        </label>

        <label className="grid gap-1">
          <span className="text-sm text-white/70">บันทึกเพิ่มเติม (ถ้ามี)</span>
          <textarea
            name="note"
            defaultValue={row.note ?? ""}
            className="rounded-xl bg-white/5 px-4 py-2 outline-none min-h-24"
            placeholder="รายละเอียด หรือข้อมูลสำหรับทีมงาน"
          />
        </label>

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