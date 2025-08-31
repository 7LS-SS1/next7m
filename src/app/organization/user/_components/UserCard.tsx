

'use client'

import Link from 'next/link'

export type UserCardData = {
  id: string
  name: string
  email: string
  image?: string | null
  role?: string | null
  team?: string | null
  since?: string | null // ISO string or localized
}

export default function UserCard({ u }: { u: UserCardData }) {
  const initial = (u.name?.trim()[0] || '?').toUpperCase()

  return (
    <article
      className="group relative rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur-sm transition hover:bg-white/[0.06] focus-within:ring-1 focus-within:ring-white/20"
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-white/10 bg-white/5">
          {u.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={u.image} alt={u.name} className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center text-lg font-semibold text-white/70">
              {initial}
            </div>
          )}
        </div>

        {/* Main info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-medium" title={u.name}>
              {u.name}
            </h3>
            {u.role && (
              <span className="rounded-md border border-white/10 bg-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-white/70">
                {u.role}
              </span>
            )}
          </div>
          <p className="truncate text-xs text-white/60" title={u.email}>
            {u.email}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-white/60">
            {u.team && (
              <span className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5">ทีม: {u.team}</span>
            )}
            {u.since && <span>เข้าร่วม: {u.since}</span>}
          </div>
        </div>

        {/* Actions on hover */}
        <div className="flex items-center gap-2 opacity-0 transition group-hover:opacity-100">
          <Link
            href={`/user/${u.id}`}
            aria-label={`ดูโปรไฟล์ของ ${u.name}`}
            className="rounded-lg border border-white/10 bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
          >
            View
          </Link>
          <a
            href={`mailto:${u.email}`}
            aria-label={`ส่งอีเมลหา ${u.name}`}
            className="rounded-lg border border-white/10 bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
          >
            Email
          </a>
        </div>
      </div>
    </article>
  )
}