import Link from 'next/link'
import { prisma } from '@lib/db'
import UserForm from '../../_components/UserForm'

export default async function Page({
  params, searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { id } = await params
  const sp = await searchParams
  const orgId = typeof sp.org === 'string' ? sp.org : ''

  const u = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true },
  })
  if (!u) {
    return (
      <main className="mx-auto w-[92%] max-w-2xl space-y-6 p-6">
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-200">ไม่พบผู้ใช้</div>
      </main>
    )
  }

  return (
    <main className="mx-auto w-[92%] max-w-2xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">แก้ไขผู้ใช้</h1>
        <Link href={`/organization/user/${u.id}/view?org=${orgId}`} className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm hover:bg-white/20">← กลับไปดู</Link>
      </div>
      <UserForm user={u} orgId={orgId} />
    </main>
  )
}