import Link from 'next/link'
import { prisma } from '@/lib/db'

export default async function OrganizationPage() {
  const organizations = await prisma.organization.findMany({
    select: {
      id: true,
      name: true,
      _count: {
        select: { announcements: true, works: true, members: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  }).catch(() => [])

  return (
    <main className="mx-auto max-w-6xl p-6">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Organizations</h1>
          <p className="mt-1 text-sm text-white/70">ภาพรวมขององค์กรทั้งหมด จัดการประกาศ งาน และสมาชิกได้จากที่นี่</p>
        </div>
        <form method="POST" action="/organization/api/" className="flex w-full max-w-md items-center gap-2 md:w-auto">
          <input
            name="name"
            placeholder="เพิ่มชื่อองค์กรใหม่..."
            className="w-full rounded-xl border bg-transparent/20 px-3 py-2 outline-none ring-1 ring-white/10 placeholder:text-white/50 focus:ring-2"
          />
          <input type="hidden" name="redirectTo" value="/organization" />
          <button className="rounded-xl bg-gradient-to-r from-black to-black/80 px-4 py-2 text-white hover:opacity-90">เพิ่ม</button>
        </form>
      </div>

      {/* Empty State */}
      {organizations.length === 0 && (
        <div className="rounded-2xl border border-white/10 p-10 text-center">
          <div className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl bg-white/5 text-2xl">🏢</div>
          <h2 className="text-lg font-medium">ยังไม่มีองค์กร</h2>
          <p className="mt-1 text-sm text-white/70">เริ่มต้นโดยเพิ่มองค์กรแรกของคุณจากด้านบน</p>
        </div>
      )}

      {/* Grid List */}
      {organizations.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org) => (
            <div
              key={org.id}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/20 hover:bg-white/[0.05]"
            >
              <div className="mb-4 flex items-start justify-between">
                <h3 className="text-base font-semibold leading-tight line-clamp-2">{org.name}</h3>
                <span className="ml-3 rounded-lg bg-white/10 px-2 py-1 text-[10px] uppercase tracking-wide text-white/80">ID</span>
              </div>

              <div className="mb-4 grid grid-cols-3 gap-2 text-center text-sm">
                <div className="rounded-xl border border-white/10 p-2">
                  <div className="text-xs opacity-70">Announcements</div>
                  <div className="mt-1 text-base font-semibold">{org._count.announcements}</div>
                </div>
                <div className="rounded-xl border border-white/10 p-2">
                  <div className="text-xs opacity-70">Works</div>
                  <div className="mt-1 text-base font-semibold">{org._count.works}</div>
                </div>
                <div className="rounded-xl border border-white/10 p-2">
                  <div className="text-xs opacity-70">Members</div>
                  <div className="mt-1 text-base font-semibold">{org._count.members}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/announce?org=${org.id}`}
                  className="flex-1 rounded-xl border border-white/10 px-3 py-2 text-center text-sm hover:bg-white/10"
                >
                  Announce
                </Link>
                <Link
                  href={`/works?org=${org.id}`}
                  className="flex-1 rounded-xl border border-white/10 px-3 py-2 text-center text-sm hover:bg-white/10"
                >
                  Works
                </Link>
                <Link
                  href={`/user?org=${org.id}`}
                  className="flex-1 rounded-xl border border-white/10 px-3 py-2 text-center text-sm hover:bg-white/10"
                >
                  Members
                </Link>
              </div>

              {/* Decorative gradient */}
              <div className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-gradient-to-br from-white/10 to-transparent blur-2xl transition-opacity group-hover:opacity-100" />
            </div>
          ))}
        </div>
      )}
    </main>
  )
}