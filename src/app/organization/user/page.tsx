import Toolbar from './_components/Toolbar'
import UserCard from './_components/UserCard'
import Link from 'next/link'
import { prisma } from '@lib/db'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const orgId = typeof sp.org === 'string' ? sp.org : ''
  const q = typeof sp.q === 'string' ? sp.q.trim().toLowerCase() : ''

  if (!orgId) {
    const orgs = await prisma.organization.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } })
    return (
      <main className="mx-auto w-[92%] max-w-5xl space-y-6 p-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">ผู้ใช้ในองค์กร</h1>
        </header>
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-100">กรุณาเลือกองค์กร</div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
          {orgs.map((o) => (
            <Link key={o.id} href={`/organization/user?org=${o.id}`}
              className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 hover:bg-white/10">
              {o.name}
            </Link>
          ))}
        </div>
      </main>
    )
  }

  const rows = await prisma.membership.findMany({
    where: { organizationId: orgId },
    select: { user: { select: { id: true, name: true, email: true, createdAt: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const users = rows
    .map(r => ({
      id: r.user?.id!, name: r.user?.name ?? 'ผู้ใช้', email: r.user?.email ?? '',
      team: null, since: r.user?.createdAt ? new Date(r.user.createdAt).toLocaleDateString('th-TH') : null, image: null
    }))
    .filter(u => q ? [u.name, u.email].some(x => (x || '').toLowerCase().includes(q)) : true)

  return (
    <main className="mx-auto w-[92%] max-w-5xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">ผู้ใช้ในองค์กร</h1>
        <Link href={`/organization/works?org=${orgId}`} className="text-sm text-white/70 hover:text-white">งานในองค์กร →</Link>
      </div>

      <Toolbar orgId={orgId} q={q} />

      {users.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-white/60">ไม่พบผู้ใช้</div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {users.map(u => <UserCard key={u.id} u={u} />)}
        </div>
      )}
    </main>
  )
}