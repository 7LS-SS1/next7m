// src/app/page.tsx
import Link from 'next/link'

export default function Page() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Next7M Starter</h1>
      <p className="mt-2">Next.js 14 + Prisma + Vercel พร้อมใช้งาน</p>
      <ul className="list-disc pl-6 mt-4 space-y-2">
        <li>
          <a className="underline" href="/api/health">/api/health</a>
        </li>
        <li>
          <Link className="underline" href="/seed">Seed (ตัวอย่างเร็วๆ นี้)</Link>
        </li>
      </ul>
    </main>
  )
}