// src/app/managements/emails/new/page.tsx
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function NewEmailPage() {
  return (
    <div className="grid gap-4 max-w-xl">
      <h1 className="text-xl font-bold">เพิ่ม E‑Mail</h1>

      <form
        method="post"
        action="/managements/emails/api/create"
        className="card p-4 grid gap-3"
      >
        <input
          name="address"
          type="email"
          placeholder="อีเมล เช่น admin@example.com"
          className="rounded-xl bg-white/5 px-4 py-2 outline-none"
          required
        />
        <select
          name="provider"
          defaultValue="- เลือกผู้ให้บริการ -"
          className="input"
        >
          <option value="Gmail">Gmail</option>
          <option value="Outlook">Outlook</option>
          <option value="Yahoo">Yahoo</option>
        </select>
        <select name="note" defaultValue="- เลือกทีมดูแล -" className="input">
          <option value="Outlook">Center X</option>
          <option value="Yahoo">7M</option>
          <option value="Gmail">RCA</option>
        </select>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary px-5 py-2">
            บันทึก
          </button>
          <a
            href="/managements/emails"
            className="rounded-xl border border-white/10 px-5 py-2 hover:bg-white/10"
          >
            ยกเลิก
          </a>
        </div>
      </form>
    </div>
  );
}
