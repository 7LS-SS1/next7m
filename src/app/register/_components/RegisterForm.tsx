"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";

type FormState = { ok?: boolean; error?: string; message?: string } | null;

type Props = {
  action: (fd: FormData) => Promise<any>;
};

type Step = 1 | 2 | 3;

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl px-4 py-2 font-medium text-black bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:brightness-95 disabled:opacity-60"
    >
      {pending ? "กำลังดำเนินการ..." : label}
    </button>
  );
}

export default function RegisterForm({ action }: Props) {
  const [step, setStep] = React.useState<Step>(1);
  const [showPw, setShowPw] = React.useState(false);
  const [state, formAction] = useFormState<FormState>(action as any, null);

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [accept, setAccept] = React.useState(false);

  function next() {
    setStep((s) => (s < 3 ? ((s + 1) as Step) : s));
  }
  function prev() {
    setStep((s) => (s > 1 ? ((s - 1) as Step) : s));
  }

  const pwScore = React.useMemo(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }, [password]);

  const canNext1 = email.length > 0 && password.length >= 8;
  const canNext2 = name.trim().length > 0;

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-6 grid grid-cols-3 gap-2 text-center text-xs">
        {["บัญชี", "โปรไฟล์", "ยืนยัน"].map((t, i) => {
          const active = step >= (i + 1);
          return (
            <div
              key={t}
              className={`rounded-full px-2 py-1 ${active ? "bg-white/90 text-black" : "bg-white/10 text-white/70"}`}
            >
              {i + 1}. {t}
            </div>
          );
        })}
      </div>

      <form action={formAction} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur">
        {step === 3 && (
          <>
            <input type="hidden" name="email" value={email} />
            <input type="hidden" name="password" value={password} />
            <input type="hidden" name="name" value={name} />
            <input type="hidden" name="accept" value={accept ? "on" : ""} />
          </>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">อีเมล</label>
              <input
                type="email"
                className="w-full rounded-xl border border-white/15 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-white/15"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value.trim())}
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">รหัสผ่าน</label>
              <div className="flex gap-2">
                <input
                  type={showPw ? "text" : "password"}
                  className="w-full rounded-xl border border-white/15 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-white/15"
                  placeholder="อย่างน้อย 8 ตัวอักษร"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="shrink-0 rounded-xl border border-white/15 px-3 py-2 text-sm hover:bg-white/5"
                >
                  {showPw ? "ซ่อน" : "แสดง"}
                </button>
              </div>
              <div className="mt-2 grid grid-cols-5 gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded ${i < pwScore ? "bg-emerald-400" : "bg-white/15"}`}
                  />
                ))}
              </div>
              <p className="mt-1 text-xs text-white/60">
                แนะนำให้มีตัวพิมพ์ใหญ่ ตัวเลข และอักขระพิเศษ
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={next}
                disabled={!canNext1}
                className="w-full rounded-xl border border-white/15 px-4 py-2 hover:bg-white/5 disabled:opacity-50"
              >
                ขั้นถัดไป
              </button>
            </div>

            {(state?.error || state?.message) && (
              <p className="text-sm text-red-400">{state?.error ?? state?.message}</p>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">ชื่อที่แสดง</label>
              <input
                className="w-full rounded-xl border border-white/15 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-white/15"
                placeholder="เช่น วิชญ์ชัย"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>

            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={accept}
                onChange={(e) => setAccept(e.target.checked)}
              />
              <span>ฉันยอมรับเงื่อนไขการใช้งาน</span>
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={prev}
                className="w-1/2 rounded-xl border border-white/15 px-4 py-2 hover:bg-white/5"
              >
                กลับ
              </button>
              <button
                type="button"
                onClick={next}
                disabled={!canNext2}
                className="w-1/2 rounded-xl border border-white/15 px-4 py-2 hover:bg-white/5 disabled:opacity-50"
              >
                ขั้นถัดไป
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div className="rounded-xl border border-white/10 p-4">
              <div className="mb-2 text-sm font-semibold text-white/80">ตรวจสอบข้อมูล</div>
              <ul className="text-sm text-white/80">
                <li><span className="opacity-60">อีเมล:</span> {email}</li>
                <li><span className="opacity-60">ชื่อที่แสดง:</span> {name}</li>
              </ul>
            </div>

            <SubmitButton label="สมัครสมาชิก" />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={prev}
                className="w-full rounded-xl border border-white/15 px-4 py-2 hover:bg-white/5"
              >
                กลับไปแก้ไข
              </button>
            </div>

            {(state?.error || state?.message) && (
              <p className="text-sm text-red-400">{state?.error ?? state?.message}</p>
            )}
          </div>
        )}
      </form>

      <p className="mt-4 text-center text-sm text-white/70">
        มีบัญชีอยู่แล้ว? <a href="/login" className="underline decoration-dotted">เข้าสู่ระบบ</a>
      </p>
    </div>
  );
}
