

// Path: src/app/profile/page.tsx
import { cookies } from 'next/headers'
import Link from 'next/link'
import { prisma } from '@lib/db'

export const dynamic = 'force-dynamic'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  // วิธีระบุผู้ใช้: ใช้ ?id= สำหรับแอดมิน/ทดสอบ, ถ้าไม่มีให้ลองอ่านจาก cookie "uid"
  const paramId = typeof sp.id === 'string' ? sp.id : ''
  const cookieStore = await cookies()
  const cookieId = cookieStore.get('uid')?.value || ''
  const userId = paramId || cookieId

  if (!userId) {
    return (
      <main className="mx-auto w-[92%] max-w-5xl space-y-6 p-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">โปรไฟล์</h1>
          <Link href="/login" className="rounded-xl bg-black px-3 py-2 text-sm text-white hover:opacity-90">เข้าสู่ระบบ</Link>
        </header>
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-amber-100">
          ไม่พบผู้ใช้ โปรดเข้าสู่ระบบก่อน — หรือลองเปิดด้วยพารามิเตอร์ <code className="mx-1 rounded bg-black/40 px-1 py-0.5">?id=USER_ID</code>
        </div>
      </main>
    )
  }

  const user = await prisma.user
    .findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, createdAt: true, updatedAt: true },
    })
    .catch(() => null)

  if (!user) {
    return (
      <main className="mx-auto w-[92%] max-w-5xl space-y-6 p-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">โปรไฟล์</h1>
          <div />
        </header>
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-200">ไม่พบข้อมูลผู้ใช้ที่ระบุ</div>
      </main>
    )
  }

  const memberships = await prisma.membership
    .findMany({
      where: { userId: user.id },
      select: {
        id: true,
        organizationId: true,
        createdAt: true,
        organization: { select: { id: true, name: true } }, // เผื่อมีความสัมพันธ์นี้ในสคีมา
      },
      orderBy: { createdAt: 'desc' },
    })
    .catch(() => []) as Array<{
      id: string
      organizationId: string
      createdAt: Date | null
      organization?: { id: string; name: string } | null
    }>

  const safeDate = (d?: Date | null) => (d ? new Date(d).toLocaleString('th-TH') : '-')

  return (
    <main className="mx-auto w-[92%] max-w-5xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">โปรไฟล์</h1>
        <div className="flex items-center gap-2">
          <Link
            href={`/organization/user?org=${memberships[0]?.organizationId || ''}`}
            className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm hover:bg-white/10"
          >
            รายชื่อผู้ใช้ในองค์กร
          </Link>
        </div>
      </div>

      {/* Profile summary */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-start gap-4">
            <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-lg font-semibold text-white/70">
              {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-medium">{user.name || 'ผู้ใช้งาน'}</h2>
              <p className="truncate text-sm text-white/70">{user.email}</p>
              <div className="mt-2 grid grid-cols-1 gap-2 text-[12px] text-white/60 sm:grid-cols-2">
                <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">สร้างเมื่อ: {safeDate(user.createdAt)}</div>
                <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">อัปเดตล่าสุด: {safeDate(user.updatedAt)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h3 className="mb-2 text-sm font-medium">การตั้งค่าอย่างรวดเร็ว</h3>
          <div className="flex flex-col gap-2">
            <Link href="/settings/profile" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10">แก้ไขโปรไฟล์</Link>
            <Link href="/settings/security" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10">ความปลอดภัย</Link>
            <Link href="/logout" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10">ออกจากระบบ</Link>
          </div>
        </div>
      </section>

      {/* Organizations */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">องค์กรที่เข้าร่วม</h3>
          <Link href="/organization" className="text-xs text-white/70 hover:text-white">ดูทั้งหมด →</Link>
        </div>
        {memberships.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-white/60">ยังไม่ได้เข้าร่วมองค์กรใด</div>
        ) : (
          <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {memberships.map((m) => (
              <li key={m.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{m.organization?.name || m.organizationId}</p>
                    <p className="text-[12px] text-white/60">เข้าร่วมเมื่อ: {safeDate(m.createdAt)}</p>
                  </div>
                  <Link
                    href={`/organization/announce?org=${m.organizationId}`}
                    className="rounded-lg border border-white/10 bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
                  >
                    เปิดดู
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Activity placeholder (สามารถต่อยอดภายหลัง) */}
      <section className="space-y-3">
        <h3 className="text-sm font-medium">กิจกรรมล่าสุด</h3>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-white/60">
          ยังไม่มีข้อมูลกิจกรรม แสดงตัวอย่างเช่น สร้าง/แก้ไขประกาศ งานที่รับผิดชอบ ฯลฯ
        </div>
      </section>
    </main>
  )
}