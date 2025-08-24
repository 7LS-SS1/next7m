// src/app/page.tsx
import Link from 'next/link'

export default function Page() {
  return (
    <main className="container-page py-10">
      <h1 className="text-2xl font-bold">Next7M Starter</h1>
      <ul className="list-disc pl-6 mt-4 space-y-2">
        <li><a className="underline" href="/api/health">/api/health</a></li>
        <li><a className="underline" href="/register">/register</a></li>
        <li><a className="underline" href="/dashboard">/dashboard</a></li>
      </ul>
    </main>
  );
}