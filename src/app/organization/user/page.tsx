import Link from 'next/link'
import { prisma } from '@/lib/db'
import Toolbar from './_components/Toolbar'
import UserCard from './_components/UserCard'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const orgId = typeof sp.org === 'string' ? sp.org : ''
  const q = typeof sp.q === 'string' ? sp.q.trim() : ''

  // ถ้าไม่มี org → ให้เลือกองค์กรก่อน
  if (!orgId) {
    const orgs = await prisma.organization
      .findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } })
      .catch(() => [])

    return (
      <main className="w-[90%] mx-auto space-y-4 p-6">
        <h1 className="text-xl font-semibold">ผู้ใช้งานในองค์กร</h1>
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-100">
          กรุณาเลือกองค์กรก่อนดูรายชื่อผู้ใช้
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
          {orgs.map((o) => (
            <Link
              key={o.id}
              href={`/organization/user?org=${o.id}`}
              className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 hover:bg-white/10"
            >
              {o.name}
            </Link>
          ))}
        </div>
      </main>
    )
  }

  // ดึง Users ผ่านตาราง Membership (ผูกกับ organizationId)
  const rows = await prisma.membership
    .findMany({
      where: { organizationId: orgId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    .catch(() => [])

  // map → unique by user.id
  const seen = new Set<string>()
  let users = rows
    .map((r) => ({
      id: r.user?.id || r.id,
      name: r.user?.name || 'Unknown',
      email: r.user?.email || '-',
      image: null,
      team: null,
      since: r.createdAt ? new Date(r.createdAt).toLocaleDateString('th-TH') : null,
    }))
    .filter((u) => {
      if (!u.id) return false
      if (seen.has(u.id)) return false
      seen.add(u.id)
      return true
    })

  // client-like filter ฝั่งเซิร์ฟเวอร์ตาม q
  if (q) {
    const qq = q.toLowerCase()
    users = users.filter((u) => [u.name, u.email, u.team].some((x) => (x || '').toLowerCase().includes(qq)))
  }

  return (
    <main className="w-[90%] mx-auto space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">ผู้ใช้งานในองค์กร</h1>
        <Link href={`/organization/announce?org=${orgId}`} className="text-sm text-white/70 hover:text-white">
          ประกาศขององค์กร →
        </Link>
      </div>

      {/* Toolbar: ค้นหา + ลิงก์สร้างสมาชิกใหม่ (ถ้ามี flow เพิ่ม) */}
      <Toolbar orgId={orgId} q={q} />

      {users.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-white/60">
          ไม่พบผู้ใช้ตามเงื่อนไขที่ค้นหา
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {users.map((u) => (
            <UserCard key={u.id} u={u} />
          ))}
        </div>
      )}
    </main>
  )
}
