// src/app/managements/teams/new/page.tsx
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function NewTeamPage() {
  return (
    <div className="grid gap-4 max-w-xl">
      <h1 className="text-xl font-bold">เพิ่ม Team</h1>

      <form method="post" action="/managements/teams/api/create" className="card p-4 grid gap-3">
        <input
          name="name"
          placeholder="ชื่อทีม"
          className="rounded-xl bg-white/5 px-4 py-2 outline-none"
          required
        />
        <textarea
          name="note"
          rows={3}
          placeholder="หมายเหตุ"
          className="rounded-xl bg-white/5 px-4 py-2 outline-none"
        />
        <div className="flex gap-2">
          <button type="submit" className="btn-primary px-5 py-2">บันทึก</button>
          <a href="/managements/teams" className="rounded-xl border border-white/10 px-5 py-2 hover:bg-white/10">
            ยกเลิก
          </a>
        </div>
      </form>
    </div>
  );
}