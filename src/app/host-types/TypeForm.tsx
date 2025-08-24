"use client";

import React from "react";
import { useFormState as useFormState18 } from "react-dom";
import type { ActionState } from "./actions";

function useActionStateCompat<S, P>(
  action: (prev: S, payload: P) => Promise<S> | S,
  initial: S
): [S, (payload: P) => void, boolean] {
  const uas = (React as any)?.useActionState as (<S2,P2>(a:any,i:S2)=>[S2,(p:P2)=>void,boolean])|undefined;
  if (uas) return uas<S,P>(action, initial);
  const [state, formAction] = (useFormState18 as any)(action, initial);
  return [state as S, formAction as (p: P)=>void, false];
}

export default function TypeForm({
  action, defaults, submitText,
}: {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  defaults?: { id?: string; name?: string; note?: string };
  submitText: string;
}) {
  const [state, formAction, pending] = useActionStateCompat<ActionState, FormData>(action, { ok:false, message:"" });

  return (
    <form action={formAction} className="card p-4 grid gap-3 max-w-xl">
      {defaults?.id && <input type="hidden" name="id" defaultValue={defaults.id} />}
      <label className="grid gap-1">
        <span className="text-sm text-white/70">ชื่อ *</span>
        <input name="name" required minLength={2} defaultValue={defaults?.name}
          className="rounded-xl bg-white/5 px-4 py-2 outline-none focus:ring-2 focus:ring-white/10" />
      </label>
      <label className="grid gap-1">
        <span className="text-sm text-white/70">บันทึก</span>
        <textarea name="note" rows={3} defaultValue={defaults?.note}
          className="rounded-xl bg-white/5 px-4 py-2 outline-none focus:ring-2 focus:ring-white/10" />
      </label>
      <div className="flex items-center gap-2">
        <button type="submit" disabled={pending} className="btn-primary px-5 py-2">
          {pending ? "กำลังบันทึก..." : submitText}
        </button>
        {state.message && <span className={`text-sm ${state.ok?"text-green-400":"text-red-400"}`}>{state.message}</span>}
      </div>
    </form>
  );
}