'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition, useEffect } from 'react'

export default function WorkToolbar() {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()

  const [q, setQ] = useState(sp.get('q') ?? '')
  const [status, setStatus] = useState(sp.get('status') ?? '')
  const [, startTransition] = useTransition()

  // sync from URL
  useEffect(() => {
    setQ(sp.get('q') ?? '')
    setStatus(sp.get('status') ?? '')
  }, [sp])

  const pushWith = (params: URLSearchParams) => {
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  const applySearch = () => {
    const params = new URLSearchParams(Array.from(sp.entries()))
    const qq = q.trim()
    if (qq) params.set('q', qq)
    else params.delete('q')
    if (status) params.set('status', status)
    else params.delete('status')
    pushWith(params)
  }

  const clearQ = () => {
    setQ('')
    const params = new URLSearchParams(Array.from(sp.entries()))
    params.delete('q')
    pushWith(params)
  }

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') applySearch()
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-2">
        <div className="relative w-full">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKey}
            placeholder="ค้นหางานตามชื่อ/คำอธิบาย ผู้รับผิดชอบ หรือคำสำคัญ"
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 pr-16 outline-none ring-1 ring-transparent transition focus:border-white/20 focus:ring-white/20"
            aria-label="ค้นหางาน"
          />
          {q ? (
            <button
              type="button"
              onClick={clearQ}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg border border-white/10 bg-white/10 px-2 py-1 text-[11px] text-white/70 hover:bg-white/20"
              aria-label="ล้างคำค้นหา"
            >
              Clear
            </button>
          ) : null}
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/80 outline-none ring-1 ring-transparent transition focus:border-white/20 focus:ring-white/20"
          aria-label="ตัวกรองสถานะงาน"
        >
          <option value="">ทุกสถานะ</option>
          <option value="TODO">TODO</option>
          <option value="IN_PROGRESS">IN PROGRESS</option>
          <option value="REVIEW">REVIEW</option>
          <option value="DONE">DONE</option>
          <option value="BLOCKED">BLOCKED</option>
        </select>
        <button
          type="button"
          onClick={applySearch}
          className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm hover:bg-white/10"
        >
          ค้นหา
        </button>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/organization/works/new"
          className="rounded-xl bg-black px-3 py-2 text-sm text-white hover:opacity-90"
        >
          + สร้างงาน
        </Link>
      </div>
    </div>
  )
}
