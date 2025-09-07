import Link from 'next/link'
import { prisma } from '@lib/db'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const p = await params
  const a = await prisma.announcement.findUnique({ where: { id: p.id } }).catch(() => null)
  if (!a) return <main className="max-w-2xl mx-auto p-6">ไม่พบประกาศ</main>

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{a.title}</h2>
        <Link href={`/organization/announce/${a.id}/edit`} className="px-3 py-2 rounded-xl bg-black text-white">Edit</Link>
      </div>
      <Link
        href="/organization/announce"
        className="inline-block rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1 text-sm text-white/80 hover:bg-white/10"
      >
        ← ย้อนกลับ
      </Link>
      <article className="whitespace-pre-wrap leading-7 p-4 border rounded-xl">{a.content}</article>
    </main>
  )
}