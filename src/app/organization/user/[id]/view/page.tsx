import Link from 'next/link'
import { prisma } from '@lib/db'

export default async function Page({
  params, searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { id } = await params
  const sp = await searchParams
  const orgId = typeof sp.org === 'string' ? sp.org : ''

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, createdAt: true, updatedAt: true },
  })

  if (!user) {
    return (
      <main className="mx-auto w-[92%] max-w-3xl space-y-6 p-6">
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-200">ไม่พบผู้ใช้</div>
      </main>
    )
  }

  const d = (dt?: Date | null) => (dt ? new Date(dt).toLocaleString('th-TH') : '-')

  return (
    <main className="mx-auto w-[92%] max-w-3xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">โปรไฟล์ผู้ใช้</h1>
        <div className="flex gap-2">
          <Link href={`/organization/user?org=${orgId}`} className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm hover:bg-white/20">← กลับสู่รายชื่อ</Link>
          <Link href={`/organization/user/${user.id}/edit?org=${orgId}`} className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm hover:bg-white/20">แก้ไข</Link>
        </div>
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-start gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-white/5 text-lg font-semibold text-white/70">
            {user.name?.[0]?.toUpperCase() || user.email[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-medium">{user.name ?? 'ผู้ใช้'}</h2>
            <p className="truncate text-sm text-white/70">{user.email}</p>
            <div className="mt-3 grid grid-cols-1 gap-2 text-[12px] text-white/60 sm:grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">สร้างเมื่อ: {d(user.createdAt)}</div>
              <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">อัปเดตล่าสุด: {d(user.updatedAt)}</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}