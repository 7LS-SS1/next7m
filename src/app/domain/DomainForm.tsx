"use client";

import { useActionState } from "react";
import { createDomain, type ActionState } from "./actions";

const initial: ActionState = { ok: false, message: "" };

export default function DomainForm() {
  const [state, formAction] = useActionState(createDomain, initial);

  return (
    <form action={formAction} className="card p-4 grid gap-3">
      <div className="text-lg font-semibold">เพิ่มโดเมน</div>
      <div className="grid gap-2 sm:grid-cols-3">
        <input
          name="name"
          placeholder="เช่น example.com"
          required
          className="sm:col-span-1 rounded-xl bg-white/5 px-4 py-2 outline-none placeholder:text-white/40 focus:ring-2 focus:ring-white/10"
        />
        <input
          name="note"
          placeholder="บันทึก (ไม่บังคับ)"
          className="sm:col-span-2 rounded-xl bg-white/5 px-4 py-2 outline-none placeholder:text-white/40 focus:ring-2 focus:ring-white/10"
        />
      </div>
      <div className="flex gap-2">
        <button className="btn-primary px-5 py-2">บันทึก</button>
        {state.message && (
          <span className={`text-sm ${state.ok ? "text-green-400" : "text-red-400"}`}>{state.message}</span>
        )}
      </div>
    </form>
  );
}