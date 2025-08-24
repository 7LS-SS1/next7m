import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export const runtime = "nodejs";

async function create(fd: FormData) {
  "use server";
  if (!fd || typeof (fd as any).get !== "function") {
    return;
  }
  const rawName = fd.get("name");
  const rawNote = fd.get("note");
  const name = rawName ? rawName.toString().trim() : "";
  const note = rawNote ? rawNote.toString().trim() || undefined : undefined;
  if (!name) return;
  await prisma.hostGroup.create({ data: { name, note } });
  redirect("/host/groups");
}

export default function NewGroupPage() {
  return (
    <div className="grid gap-4">
      <h1 className="text-xl font-bold">เพิ่ม Host Group</h1>
      <form
        method="post"
        action={create}
        className="card p-4 grid gap-3 max-w-lg"
      >
        <input
          name="name"
          placeholder="ชื่อกลุ่ม (เช่น Center X)"
          className="rounded-xl bg-white/5 px-4 py-2 outline-none"
          required
        />
        <textarea
          name="note"
          rows={3}
          placeholder="หมายเหตุ"
          className="rounded-xl bg-white/5 px-4 py-2 outline-none"
        />
        <button type="submit" className="btn-primary px-5 py-2">
          บันทึก
        </button>
      </form>
    </div>
  );
}
