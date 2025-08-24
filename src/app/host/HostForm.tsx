"use client";

import React, { useState } from "react";
import { useFormState as useFormState18 } from "react-dom";
import type { ActionState } from "@/app/host/actions";

function useActionStateCompat<S, P>(
  action: (prev: S, payload: P) => Promise<S> | S,
  initial: S
): [S, (payload: P) => void, boolean] {
  const uas = (React as any)?.useActionState as
    | (<S2, P2>(act: any, init: S2) => [S2, (p: P2) => void, boolean])
    | undefined;
  if (uas) return uas<S, P>(action, initial);
  const [state, formAction] = (useFormState18 as any)(action, initial);
  return [state as S, formAction as (p: P) => void, false];
}

type Option = { id: string; name: string };
type Props = {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  defaults?: {
    id?: string; name?: string; ip?: string; note?: string; status?: "ACTIVE" | "INACTIVE";
    providerId?: string | null; groupId?: string | null;
  };
  providers?: Option[];
  groups?: Option[];
  submitText: string;
};

const initial: ActionState = { ok: false, message: "" };

export default function HostForm({ action, defaults, providers = [], groups = [], submitText }: Props) {
  const [state, formAction, pending] = useActionStateCompat<ActionState, FormData>(action, initial);
  const [provModeNew, setProvModeNew] = useState(false);
  const [groupModeNew, setGroupModeNew] = useState(false);

  return (
    <form action={formAction} className="card p-4 grid gap-3">
      {defaults?.id && <input type="hidden" name="id" defaultValue={defaults.id} />}

      <div className="grid gap-2 sm:grid-cols-2">
        <label className="grid gap-1">
          <span className="text-sm text-white/70">ชื่อโฮสต์ *</span>
          <input
            name="name"
            required
            minLength={2}
            defaultValue={defaults?.name}
            placeholder="เช่น app-server-1"
            className="rounded-xl bg-white/5 px-4 py-2 outline-none placeholder:text-white/40 focus:ring-2 focus:ring-white/10"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm text-white/70">IP</span>
          <input
            name="ip"
            defaultValue={defaults?.ip}
            placeholder="เช่น 10.0.1.23"
            className="rounded-xl bg-white/5 px-4 py-2 outline-none placeholder:text-white/40 focus:ring-2 focus:ring-white/10"
          />
        </label>
      </div>

      {/* Provider */}
      <div className="grid gap-1 sm:max-w-md">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/70">Host Provider</span>
          <button type="button" className="text-xs text-yellow-400 hover:underline"
            onClick={() => setProvModeNew(v => !v)}>
            {provModeNew ? "เลือกจากรายการ" : "เพิ่มใหม่"}
          </button>
        </div>

        {!provModeNew ? (
          <select
            name="providerId"
            defaultValue={defaults?.providerId ?? ""}
            className="rounded-xl bg-white/5 px-4 py-2 outline-none focus:ring-2 focus:ring-white/10"
          >
            <option value="">— ไม่ระบุ —</option>
            {providers.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        ) : (
          <input
            name="providerNew"
            placeholder="เช่น AWS, WPX, Plesk, Digital Ocean"
            className="rounded-xl bg-white/5 px-4 py-2 outline-none placeholder:text-white/40 focus:ring-2 focus:ring-white/10"
          />
        )}
      </div>

      {/* Group */}
      <div className="grid gap-1 sm:max-w-md">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/70">Host Group</span>
          <div className="flex items-center gap-3">
            <a href="/host/groups" className="text-xs text-white/60 hover:text-white" title="จัดการกลุ่ม">จัดการกลุ่ม</a>
            <button type="button" className="text-xs text-yellow-400 hover:underline"
              onClick={() => setGroupModeNew(v => !v)}>
              {groupModeNew ? "เลือกจากรายการ" : "เพิ่มใหม่"}
            </button>
          </div>
        </div>

        {!groupModeNew ? (
          <select
            name="groupId"
            defaultValue={defaults?.groupId ?? ""}
            className="rounded-xl bg-white/5 px-4 py-2 outline-none focus:ring-2 focus:ring-white/10"
          >
            <option value="">— ไม่ระบุ —</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        ) : (
          <input
            name="groupNew"
            placeholder="เช่น Center X, 7M, RCA"
            className="rounded-xl bg-white/5 px-4 py-2 outline-none placeholder:text-white/40 focus:ring-2 focus:ring-white/10"
          />
        )}
      </div>

      <label className="grid gap-1 max-w-xs">
        <span className="text-sm text-white/70">สถานะ</span>
        <select
          name="status"
          defaultValue={defaults?.status ?? "ACTIVE"}
          className="rounded-xl bg-white/5 px-4 py-2 outline-none focus:ring-2 focus:ring-white/10"
        >
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
        </select>
      </label>

      <label className="grid gap-1">
        <span className="text-sm text-white/70">บันทึก</span>
        <textarea
          name="note"
          defaultValue={defaults?.note}
          rows={3}
          placeholder="รายละเอียดเพิ่มเติม"
          className="rounded-xl bg-white/5 px-4 py-2 outline-none placeholder:text-white/40 focus:ring-2 focus:ring-white/10"
        />
      </label>

      <div className="flex items-center gap-2">
        <button className="btn-primary px-5 py-2" disabled={pending}>
          {pending ? "กำลังบันทึก..." : submitText}
        </button>
        {state.message && (
          <span className={`text-sm ${state.ok ? "text-green-400" : "text-red-400"}`}>
            {state.message}
          </span>
        )}
      </div>
    </form>
  );
}