// src/app/domains/_components/WordpressQuickAdd.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

/**
 * UX: เริ่มจากปุ่ม "+ เพิ่ม WordPress" เมื่อกดจึงแสดงฟอร์ม User/Password
 * บันทึกแล้วจะพยายาม update ก่อน ไม่พบจึง create (idempotent-ish)
 */
export default function WordpressQuickAdd({
  domainId,
  defaultUser = "",
}: {
  domainId: string;
  defaultUser?: string;
}) {
  const r = useRouter();

  const [open, setOpen] = React.useState(false);
  const [user, setUser] = React.useState(defaultUser);
  const [password, setPassword] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [okMsg, setOkMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setOkMsg(null);
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.set("domainId", domainId);
      if (user.trim()) fd.set("user", user.trim());
      if (password.trim()) fd.set("password", password);

      // 1) พยายาม update ก่อน
      let res = await fetch("/domains/api/wordpress/update", { method: "POST", body: fd });
      if (res.status === 404) {
        // 2) ถ้าไม่พบให้สร้างใหม่
        res = await fetch("/domains/api/wordpress/create", { method: "POST", body: fd });
      }
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) throw new Error(json?.error || "บันทึกไม่สำเร็จ");

      setOkMsg("บันทึก WordPress สำเร็จ");
      setPassword(""); // อย่าเก็บรหัสผ่านใน state
      r.refresh();
      // ปิดฟอร์มหลังสำเร็จเล็กน้อย
      setTimeout(() => setOpen(false), 600);
    } catch (err: any) {
      setError(err?.message || "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 px-3 py-2 text-sm font-semibold text-black hover:brightness-95"
      >
        + เพิ่ม WordPress
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-xl border border-white/10 p-3 bg-white/[0.03]">
      <input type="hidden" name="domainId" value={domainId} />

      <div className="grid gap-1.5 md:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="text-sm font-medium">User</span>
          <input
            name="wpUser"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            placeholder="admin"
            autoComplete="username"
            className="rounded-xl border border-white/15 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-white/15"
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm font-medium">Password</span>
          <div className="relative">
            <input
              name="wpPassword"
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full rounded-xl border border-white/15 bg-transparent px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-white/15"
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs border border-white/10 hover:bg-white/10"
              aria-label={showPw ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
            >
              {showPw ? "ซ่อน" : "แสดง"}
            </button>
          </div>
        </label>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {okMsg && <p className="text-sm text-emerald-400">{okMsg}</p>}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 px-3 py-2 text-sm font-semibold text-black disabled:opacity-60"
        >
          {submitting ? "กำลังบันทึก..." : "บันทึก WordPress"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-xl border border-white/15 px-3 py-2 text-sm hover:bg-white/5"
        >
          ยกเลิก
        </button>
      </div>
    </form>
  );
}
