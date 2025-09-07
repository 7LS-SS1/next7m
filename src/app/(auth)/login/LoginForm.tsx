"use client";

import React, { useState } from "react";
import { useFormState as useFormState18 } from "react-dom";
import Link from "next/link";
import { loginAction, type LoginState } from "./actions";

// hook ที่ใช้ได้กับทั้ง React 18/19
function useActionStateCompat<S, P>(
  action: (prevState: S, payload: P) => Promise<S> | S,
  initialState: S
): [S, (payload: P) => void, boolean] {
  const uas = (React as any)?.useActionState as
    | (<S2, P2>(
        act: (prev: S2, payload: P2) => Promise<S2> | S2,
        init: S2
      ) => [S2, (payload: P2) => void, boolean])
    | undefined;

  if (uas) return uas<S, P>(action, initialState);
  const uf = useFormState18 as unknown as (
    act: (prev: any, payload: any) => any | Promise<any>,
    init: any
  ) => [any, (payload: any) => void];

  const [state0, formAction0] = uf(
    action as unknown as (prev: S, payload: P) => S | Promise<S>,
    initialState as unknown as S
  );
  return [state0 as S, formAction0 as (p: P) => void, false];
}

export default function LoginForm() {
  const [showPwd, setShowPwd] = useState(false);
  const initialState: LoginState = { ok: false, message: "" };

  const [state, formAction, isPending] = useActionStateCompat<
    LoginState,
    FormData
  >(
    loginAction as unknown as (
      s: LoginState,
      fd: FormData
    ) => Promise<LoginState>,
    initialState
  );

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div className="space-y-1">
        <label className="text-sm text-white/70">อีเมล / เบอร์โทรศัพท์</label>
        <input
          name="identifier"
          required
          placeholder="you@example.com"
          autoComplete="username"
          className="w-full rounded-xl bg-white/5 px-4 py-3 outline-none placeholder:text-white/40 focus:ring-2 focus:ring-white/10"
        />
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-sm text-white/70">รหัสผ่าน</label>
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            className="text-xs text-white/60 hover:text-white"
          >
            {showPwd ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
          </button>
        </div>
        <input
          name="password"
          type={showPwd ? "text" : "password"}
          required
          minLength={8}
          placeholder="อย่างน้อย 8 ตัวอักษร"
          autoComplete="current-password"
          className="w-full rounded-xl bg-white/5 px-4 py-3 outline-none placeholder:text-white/40 focus:ring-2 focus:ring-white/10"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-white/70">
        <input
          type="checkbox"
          name="remember"
          className="size-4 rounded border-white/20 bg-white/5"
        />
        จดจำการเข้าสู่ระบบ
      </label>

      <button type="submit" className="btn-primary w-full" disabled={isPending}>
        {isPending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
      </button>

      {!state.ok && state.message && (
        <p className="text-red-400 text-sm">{state.message}</p>
      )}

      <div className="flex items-center justify-between text-sm pt-2">
        <Link href="/register" className="text-yellow-500 hover:underline">
          สร้างบัญชี
        </Link>
        <Link href="#" className="text-white/60 hover:text-white">
          ลืมรหัสผ่าน?
        </Link>
      </div>
    </form>
  );
}
