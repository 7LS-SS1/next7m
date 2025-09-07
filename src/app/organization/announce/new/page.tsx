// src/app/organization/announce/new/page.tsx
import { prisma } from '@lib/db'
import AnnounceForm from '../_components/AnnounceForm'
import Link from 'next/link'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const orgId = typeof sp.org === 'string' ? sp.org : ''

  // ถ้าไม่มี org ใน query ให้ผู้ใช้เลือกองค์กรก่อน
  if (!orgId) {
    const orgs = await prisma.organization.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }).catch(() => [])

    return (
      <main className="w-[90%] mx-auto p-6 space-y-4">
        <h1 className="text-xl font-semibold">สร้างประกาศ</h1>
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-100">
          กรุณาเลือกองค์กรก่อนสร้างประกาศ
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
          {orgs.map((o) => (
            <Link
              key={o.id}
              href={`/organization/announce/new?org=${o.id}`}
              className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 hover:bg-white/10"
            >
              {o.name}
            </Link>
          ))}
        </div>
        <Link
          href="/organization/announce"
          className="inline-block rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1 text-sm text-white/80 hover:bg-white/10"
        >
          ← ย้อนกลับ
        </Link>
      </main>
    )
  }

  const teams = await prisma.team
    .findMany({
      where: { organizationId: orgId },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    })
    .catch(() => [])

  return (
    <main className="w-[90%] mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">สร้างประกาศ</h1>
      <Link
        href="/organization/announce"
        className="inline-block rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1 text-sm text-white/80 hover:bg-white/10"
      >
        ← ย้อนกลับ
      </Link>
      <AnnounceForm
        action="/organization/api/announce"
        defaults={{}}
        redirectTo="/organization/announce"
        submitLabel="บันทึก"
      />
    </main>
  )
}
