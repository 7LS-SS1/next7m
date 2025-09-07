"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import RichTextAnnounce from "../_components/RichTextAnnounce";

export type AnnounceDefaults = {
  title?: string | null;
  content?: string | null;
  type?: string | null;
  teamId?: string | null;
};

export default function AnnounceForm({
  action,
  method = "POST",
  submitLabel = "บันทึก",
  defaults,
  deleteAction,
  redirectTo,
}: {
  action: string;
  method?: "POST" | "PUT" | "PATCH";
  submitLabel?: string;
  defaults?: AnnounceDefaults;
  deleteAction?: string; // ถ้าส่งมาจะมีปุ่มลบ
  redirectTo?: string; // ให้ API ใช้ redirect ปลายทาง (optional)
}) {
  const router = useRouter();
  const [title, setTitle] = React.useState<string>(defaults?.title ?? "");
  const [content, setContent] = React.useState<string>(defaults?.content ?? "");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const fd = new FormData(e.currentTarget);
      // sync state เผื่อบาง browser ยังไม่อัปเดต hidden
      fd.set("title", title.trim());
      fd.set("content", content ?? "");
      if (redirectTo) fd.set("redirectTo", redirectTo);

      const res = await fetch(action, { method, body: fd, headers: { "x-requested-with": "fetch", Accept: "application/json" } });
      if (!res.ok) {
        const j = await safeJson(res);
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data?.redirect) {
        router.push(data.redirect);
      } else {
        // fallback: กลับไปหน้า list
        router.push("/organization/announce");
      }
    } catch (err: any) {
      setError(err?.message || "บันทึกไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete() {
    if (!deleteAction) return;
    const ok = confirm("ต้องการลบประกาศนี้หรือไม่?");
    if (!ok) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(deleteAction, { method: "DELETE", headers: { "x-requested-with": "fetch", Accept: "application/json" } });
      const j = await safeJson(res);
      if (!res.ok || j?.ok === false) throw new Error(j?.error || `HTTP ${res.status}`);
      router.push("/organization/announce");
    } catch (err: any) {
      setError(err?.message || "ลบไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="grid gap-4">
          {/* ชื่อประกาศ */}
          <label className="grid gap-1.5">
            <span className="text-sm font-medium">หัวข้อประกาศ</span>
            <input
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="เช่น: ปิดปรับปรุงระบบคืนนี้ 23:00-01:00"
              className="rounded-xl border border-white/15 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-white/15"
            />
          </label>

          {/* เนื้อหา RichText */}
          <div>
            <label className="mb-2 block text-sm font-medium">เนื้อหา</label>
            <RichTextAnnounce
              id="announce-content"
              defaultHTML={defaults?.content ?? ""}
              onChangeHTML={(html) => setContent(html)}
              className="rounded-xl border border-white/10 bg-white/[0.02]"
              minHeight={280}
            />
            <input type="hidden" name="content" value={content} />
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        {deleteAction ? (
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-sm hover:bg-white/[0.08]"
            disabled={submitting}
          >
            ลบประกาศ
          </button>
        ) : <span />}

        <div className="flex items-center gap-2">
          <input type="hidden" name="redirectTo" value={redirectTo ?? ""} />
          <button
            type="submit"
            disabled={submitting || title.trim().length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "กำลังบันทึก..." : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}

async function safeJson(res: Response) {
  try { return await res.json(); } catch { return null; }
}