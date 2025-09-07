import Link from 'next/link'
import { prisma } from '@lib/db'

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams
  const orgId = typeof sp.org === 'string' ? sp.org : ''

  const items = await prisma.announcement
    .findMany({
      where: orgId ? { organizationId: orgId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    .catch(() => [])

  return (
    <main className="w-[90%] mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">ประกาศ</h1>
        <Link
          href={`/organization/announce/new${orgId ? `?org=${orgId}` : ''}`}
          className="px-3 py-2 rounded-xl bg-black text-white"
        >
          + New
        </Link>
      </div>

      <ul className="card p-4 space-y-2">
        {items.map((a) => (
          <li key={a.id} className="p-4 border rounded-xl flex items-center justify-between">
            <div>
              <div className="font-medium">{a.title}</div>
              <div className="text-sm opacity-70 line-clamp-1">{a.content}</div>
            </div>
            <div className="flex gap-3 text-sm">
              <Link href={`/organization/announce/${a.id}/view`} className="underline">
                View
              </Link>
              <Link href={`/organization/announce/${a.id}/edit`} className="underline">
                Edit
              </Link>
            </div>
          </li>
        ))}
        {items.length === 0 && <li className="opacity-70">ไม่มีประกาศ</li>}
      </ul>
    </main>
  )
}