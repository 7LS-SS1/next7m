
import WorkToolbar from './_components/WorkToolbar'
import WorkCard, { type Work } from './_components/WorkCard'
import { prisma } from '@/lib/db'
import Link from 'next/link'

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams
  const orgId = typeof sp.org === 'string' ? sp.org : ''
  const q = typeof sp.q === 'string' ? sp.q.trim() : ''

  if (!orgId) {
    const orgs = await prisma.organization.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } })
    return (
      <main className="w-[90%] mx-auto p-6 space-y-4">
        <h1 className="text-xl font-semibold">งานขององค์กร</h1>
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-100">กรุณาเลือกองค์กร</div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
          {orgs.map((o) => (
            <Link key={o.id} href={`/organization/works?org=${o.id}`} className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 hover:bg-white/10">
              {o.name}
            </Link>
          ))}
        </div>
      </main>
    )
  }

  const rows = await prisma.work
    .findMany({
      where: { organizationId: orgId },
      include: {
        assignedTo: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    .catch(() => [])

  let works: Work[] = rows.map((r: any) => ({
    id: r.id,
    title: r.title || 'Untitled',
    status: r.status ?? null,
    priority: r.priority ?? null,
    dueDate: r.dueDate ? new Date(r.dueDate).toLocaleDateString('th-TH') : null,
    teamName: null,
    assigneeName: r.assignedTo?.name ?? null,
    createdAt: r.createdAt ? new Date(r.createdAt).toLocaleDateString('th-TH') : null,
  }))

  if (q) {
    const qq = q.toLowerCase()
    works = works.filter((w) => [w.title, w.teamName, w.assigneeName].some((x) => (x || '').toLowerCase().includes(qq)))
  }

  return (
    <main className="w-[90%] mx-auto space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">งานขององค์กร</h1>
        <Link href={`/organization/announce?org=${orgId}`} className="text-sm text-white/70 hover:text-white">ประกาศขององค์กร →</Link>
      </div>

      <WorkToolbar />

      {works.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-white/60">ยังไม่มีงาน หรือผลการค้นหาว่างเปล่า</div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {works.map((w) => (
            <WorkCard key={w.id} w={w} />
          ))}
        </div>
      )}
    </main>
  )
}