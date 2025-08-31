

'use client'

import Link from 'next/link'
import { useMemo } from 'react'

export type Work = {
  id: string
  title: string
  description?: string | null
  status?: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'BLOCKED' | null
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | null
  dueDate?: string | null // ISO string
  teamName?: string | null
  assigneeName?: string | null
  createdAt?: string | null // ISO string
}

// --- Theming helpers to match the app's glass/dim theme ---
const tone = {
  base: 'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] uppercase tracking-wide',
  gray: 'border-white/10 bg-white/10 text-white/70',
  blue: 'border-blue-500/30 bg-blue-500/10 text-blue-200',
  amber: 'border-amber-500/30 bg-amber-500/10 text-amber-100',
  red: 'border-red-500/30 bg-red-500/10 text-red-200',
  green: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
} as const

function StatusBadge({ status }: { status?: Work['status'] }) {
  if (!status) return null
  const cls =
    status === 'DONE' ? tone.green :
    status === 'BLOCKED' ? tone.red :
    status === 'IN_PROGRESS' || status === 'REVIEW' ? tone.blue : tone.gray
  return <span className={`${tone.base} ${cls}`}>{status.replace('_', ' ')}</span>
}

function PriorityBadge({ priority }: { priority?: Work['priority'] }) {
  if (!priority) return null
  const cls = priority === 'URGENT' ? tone.red : priority === 'HIGH' ? tone.amber : tone.gray
  return <span className={`${tone.base} ${cls}`}>{priority}</span>
}

function MetaPill({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <span className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[11px] text-white/70">
      {label}: {value}
    </span>
  )
}

function fmtDate(d?: string | null) {
  if (!d) return null
  try {
    return new Date(d).toLocaleDateString('th-TH')
  } catch {
    return d
  }
}

export default function WorkCard({ w }: { w: Work }) {
  const created = fmtDate(w.createdAt)
  const due = fmtDate(w.dueDate)

  const isOverdue = useMemo(() => {
    if (!w.dueDate) return false
    const now = new Date()
    const dueAt = new Date(w.dueDate)
    return now > dueAt && w.status !== 'DONE'
  }, [w.dueDate, w.status])

  return (
    <article
      className="group relative rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur-sm transition hover:bg-white/[0.06] focus-within:ring-1 focus-within:ring-white/20"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-medium" title={w.title}>
            {w.title || 'Untitled'}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-white/60">
            <StatusBadge status={w.status} />
            <PriorityBadge priority={w.priority} />
            <MetaPill label="ทีม" value={w.teamName ?? undefined} />
            <MetaPill label="ผู้รับผิดชอบ" value={w.assigneeName ?? undefined} />
            {due && (
              <span
                className={
                  'rounded-md border px-1.5 py-0.5 text-[11px] ' +
                  (isOverdue
                    ? 'border-red-500/30 bg-red-500/10 text-red-200'
                    : 'border-white/10 bg-white/5 text-white/70')
                }
              >
                กำหนดส่ง: {due}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 opacity-0 transition group-hover:opacity-100">
          <Link
            href={`/organization/works/${w.id}/view`}
            aria-label={`ดูงาน ${w.title}`}
            className="rounded-lg border border-white/10 bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
          >
            View
          </Link>
          <Link
            href={`/organization/works/${w.id}/edit`}
            aria-label={`แก้ไขงาน ${w.title}`}
            className="rounded-lg border border-white/10 bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
          >
            Edit
          </Link>
        </div>
      </div>

      {/* Description */}
      {w.description && (
        <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-xs text-white/70">
          {w.description}
        </p>
      )}

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-white/40">
        {created && <span>สร้างเมื่อ: {created}</span>}
        {/* Reserved for future actions */}
      </div>
    </article>
  )
}