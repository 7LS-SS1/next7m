'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

export default function UserForm({ user, orgId }: { user: { id: string; email: string; name: string | null }; orgId: string }) {
  const [name, setName] = useState(user.name ?? '')
  const [password, setPassword] = useState('')
  const [loading, startTransition] = useTransition()
  const router = useRouter()

  const onSave = async () => {
    const res = await fetch(`/organization/api/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: name.trim() || null, password: password || undefined }),
    })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      alert(j.error || 'บันทึกไม่สำเร็จ')
      return
    }
    startTransition(() => router.push(`/organization/user/${user.id}/view?org=${orgId}`))
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
      <div className="grid gap-2">
        <label className="text-sm text-white/70">อีเมล</label>
        <input value={user.email} disabled className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-white/70" />
      </div>
      <div className="grid gap-2">
        <label className="text-sm">ชื่อที่แสดง</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="เช่น สมชาย ใจดี"
               className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 outline-none focus:border-white/20" />
      </div>
      <div className="grid gap-2">
        <label className="text-sm">รหัสผ่านใหม่ (เว้นว่างหากไม่เปลี่ยน)</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password"
               className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 outline-none focus:border-white/20" />
      </div>
      <div className="flex gap-2">
        <button onClick={onSave} disabled={loading}
                className="rounded-xl bg-black px-3 py-2 text-sm hover:opacity-90 disabled:opacity-60">
          {loading ? 'กำลังบันทึก...' : 'บันทึก'}
        </button>
      </div>
    </div>
  )
}