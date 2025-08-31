'use client'

import { useState } from 'react'

// Post type options for the select
export type PostType = 'ANNOUNCE' | 'URGENT' | 'GENERAL'

export type AnnounceFormProps = {
  action: string
  defaults?: { title?: string; content?: string; organizationId?: string; type?: PostType; teamId?: string }
  method?: 'POST'
  redirectTo?: string
  submitLabel?: string
  showDelete?: boolean
  deleteAction?: string
  types?: { value: PostType; label: string }[]
  teams?: { id: string; name: string }[]
}

export default function AnnounceForm({
  action,
  defaults,
  method = 'POST',
  redirectTo,
  submitLabel = 'บันทึก',
  showDelete = false,
  deleteAction,
  types,
  teams,
}: AnnounceFormProps) {
  const [confirming, setConfirming] = useState(false)
  const [title, setTitle] = useState(defaults?.title ?? '')
  const [content, setContent] = useState(defaults?.content ?? '')

  const TITLE_MAX = 120
  const CONTENT_MAX = 5000

  const TYPE_OPTIONS: { value: PostType; label: string }[] = types ?? [
    { value: 'ANNOUNCE', label: 'ประกาศ' },
    { value: 'URGENT', label: 'ด่วน!' },
    { value: 'GENERAL', label: 'ทั่วไป' },
  ]

  return (
    <>
      <form method={method} action={action} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur-sm">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">ประกาศใหม่</h2>
            <p className="text-xs text-white/60">สร้าง/แก้ไขประกาศสำหรับองค์กรของคุณ</p>
          </div>
          <div className="hidden gap-2 md:flex">
            <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-wide text-white/70">Draft</span>
          </div>
        </div>

        {/* Meta controls */}
        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-white/90" htmlFor="announce-type">ประเภทโพสต์</label>
            <select
              id="announce-type"
              name="type"
              defaultValue={defaults?.type ?? 'ANNOUNCE'}
              className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 outline-none ring-1 ring-transparent transition focus:border-white/20 focus:ring-white/20"
            >
              {TYPE_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white/90" htmlFor="announce-team">ทีม (ถ้ามี)</label>
            <select
              id="announce-team"
              name="teamId"
              defaultValue={defaults?.teamId ?? ''}
              className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 outline-none ring-1 ring-transparent transition focus:border-white/20 focus:ring-white/20"
            >
              <option value="">— ไม่ระบุทีม —</option>
              {(teams ?? []).map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>

        {defaults?.organizationId && (
          <input type="hidden" name="organizationId" value={defaults.organizationId} />
        )}
        {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}

        {/* Title */}
        <label className="mb-2 block text-sm font-medium text-white/90" htmlFor="announce-title">
          หัวข้อประกาศ
        </label>
        <div className="mb-4">
          <input
            id="announce-title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX))}
            maxLength={TITLE_MAX}
            placeholder="เช่น ปรับปรุงระบบคืนนี้ 22:00–23:00"
            required
            className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 outline-none ring-1 ring-transparent transition focus:border-white/20 focus:ring-white/20"
          />
          <div className="mt-1 flex items-center justify-between text-xs text-white/60">
            <span>หัวข้อควรกระชับ ชัดเจน</span>
            <span>
              {title.length}/{TITLE_MAX}
            </span>
          </div>
        </div>

        {/* Content */}
        <label className="mb-2 block text-sm font-medium text-white/90" htmlFor="announce-content">
          เนื้อหา
        </label>
        <div className="mb-5">
          <textarea
            id="announce-content"
            name="content"
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, CONTENT_MAX))}
            rows={8}
            placeholder="รายละเอียดประกาศ ข้อมูล เวลา ลิงก์อ้างอิง ฯลฯ"
            required
            className="w-full resize-y rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 outline-none ring-1 ring-transparent transition focus:border-white/20 focus:ring-white/20"
          />
          <div className="mt-1 flex items-center justify-between text-xs text-white/60">
            <span>รองรับ Markdown/Plain text (ถ้าต้องการ Rich Text ใช้ตัวแก้ไขขั้นสูง)</span>
            <span>
              {content.length}/{CONTENT_MAX}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <button className="rounded-xl bg-gradient-to-r from-black to-black/80 px-4 py-2 text-white transition hover:opacity-90">
              {submitLabel}
            </button>
            {showDelete && deleteAction && (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-red-300 hover:bg-red-500/15"
              >
                ลบ
              </button>
            )}
          </div>

          <div className="text-xs text-white/50">กด ⌘/Ctrl + Enter เพื่อบันทึกเร็ว (บนเบราว์เซอร์บางรุ่น)</div>
        </div>
      </form>

      {/* Separate Delete Form (ไม่ซ้อนใน form หลัก) */}
      {showDelete && deleteAction && confirming && (
        <form method="POST" action={deleteAction} className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}
          <input type="hidden" name="_method" value="DELETE" />
          <div className="mb-2 text-sm">ต้องการลบประกาศนี้หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้</div>
          <div className="flex gap-2">
            <button className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-red-300 hover:bg-red-500/15">
              ยืนยันลบ
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="rounded-xl border border-white/10 px-4 py-2 hover:bg-white/5"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      )}
    </>
  )
}