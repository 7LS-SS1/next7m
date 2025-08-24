"use client";

import { useFormState } from "react-dom";
import { deleteDomain, setStatus, updateDomain, type ActionState } from "./actions";

const init: ActionState = { ok: false, message: "" };

type Props = {
  id: string;
  name: string;
  note?: string | null;
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  createdAt: string; // toLocaleString server -> pass string
};

export default function DomainRow({ id, name, note, status, createdAt }: Props) {
  const [uState, updateAction] = useFormState(updateDomain, init);
  const [sState, statusAction] = useFormState(setStatus, init);
  const [dState, deleteAction] = useFormState(deleteDomain, init);

  return (
    <tr className="border-b border-white/5">
      <td className="px-3 py-3 font-medium">{name}</td>
      <td className="px-3 py-3 text-white/70">{note || "-"}</td>
      <td className="px-3 py-3">
        <form action={statusAction} className="inline-flex items-center gap-2">
          <input type="hidden" name="id" value={id} />
          <select
            name="status"
            defaultValue={status}
            className="rounded-lg bg-white/5 px-2 py-1 text-sm outline-none"
            onChange={(e) => e.currentTarget.form?.requestSubmit()}
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="PENDING">PENDING</option>
          </select>
        </form>
      </td>
      <td className="px-3 py-3 text-white/60">{createdAt}</td>
      <td className="px-3 py-3">
        <div className="flex gap-2">
          {/* แก้ชื่อ/โน้ตอย่างรวดเร็ว */}
          <form action={updateAction} className="hidden md:flex items-center gap-2">
            <input type="hidden" name="id" value={id} />
            <input
              name="name"
              placeholder="แก้ชื่อ"
              className="w-36 rounded-lg bg-white/5 px-2 py-1 text-sm outline-none"
            />
            <input
              name="note"
              placeholder="แก้โน้ต"
              className="w-44 rounded-lg bg-white/5 px-2 py-1 text-sm outline-none"
            />
            <button className="rounded-lg bg-white/10 px-3 py-1 text-sm hover:bg-white/15">อัปเดต</button>
          </form>

          {/* ลบ */}
          <form
            action={deleteAction}
            onSubmit={(e) => {
              if (!confirm(`ลบโดเมน ${name}?`)) e.preventDefault();
            }}
          >
            <input type="hidden" name="id" value={id} />
            <button className="rounded-lg bg-red-600/80 px-3 py-1 text-sm hover:bg-red-600">ลบ</button>
          </form>
        </div>

        {/* แสดงสถานะ action ล่าสุด (แถวนี้) */}
        {[uState, sState, dState].map((st, i) =>
          st.message ? (
            <div key={i} className={`text-[11px] mt-1 ${st.ok ? "text-green-400" : "text-red-400"}`}>
              {st.message}
            </div>
          ) : null
        )}
      </td>
    </tr>
  );
}