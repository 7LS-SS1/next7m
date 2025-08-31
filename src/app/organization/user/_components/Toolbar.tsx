

'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState, useTransition } from 'react'

type Props = {
  orgId: string
  q?: string
  placeholder?: string
}

export default function Toolbar({ orgId, q = '', placeholder = 'ค้นหาชื่อ อีเมล หรือทีม' }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()

  const [value, setValue] = useState(q)
  const [isPending, startTransition] = useTransition()

  // sync when URL changes from outside
  useEffect(() => setValue(q), [q])

  const pushWith = (params: URLSearchParams) => {
    // always pin org
    if (orgId) params.set('org', orgId)
    else params.delete('org')
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  const onSearch = (v: string) => {
    const params = new URLSearchParams(Array.from(sp.entries()))
    const trimmed = v.trim()
    if (trimmed) params.set('q', trimmed)
    else params.delete('q')
    pushWith(params)
  }

  const onClear = () => {
    setValue('')
    const params = new URLSearchParams(Array.from(sp.entries()))
    params.delete('q')
    pushWith(params)
  }

  // debounce typing for better UX (300ms)
  useEffect(() => {
    const h = setTimeout(() => {
      if (value !== q) onSearch(value)
    }, 300)
    return () => clearTimeout(h)
  }, [value])

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-2">
        <div className="relative w-full">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch(value)}
            placeholder={placeholder}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 pr-16 outline-none ring-1 ring-transparent transition focus:border-white/20 focus:ring-white/20"
            aria-label="ค้นหาผู้ใช้ในองค์กร"
          />
          {value ? (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg border border-white/10 bg-white/10 px-2 py-1 text-[11px] text-white/70 hover:bg-white/20"
              aria-label="ล้างคำค้นหา"
            >
              Clear
            </button>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => onSearch(value)}
          className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm hover:bg-white/10"
        >
          ค้นหา
        </button>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href={`/organization/members?org=${orgId}`}
          className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm hover:bg-white/10"
        >
          จัดการสมาชิก
        </Link>
      </div>
    </div>
  )
}