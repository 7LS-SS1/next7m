import { NextResponse } from 'next/server'
import { prisma } from '@lib/db'
import { z } from 'zod'
import { hashPassword } from '@lib/crypto'
export const runtime = 'nodejs'

const CreateUser = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'รหัสผ่านต้องอย่างน้อย 8 ตัวอักษร'),
  name: z.string().trim().nullable().optional(),
})

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const orgId = searchParams.get('org') || ''
  if (!orgId) return NextResponse.json({ ok: false, error: 'organizationId is required' }, { status: 400 })

  const rows = await prisma.membership.findMany({
    where: { organizationId: orgId },
    include: { user: { select: { id: true, name: true, email: true, createdAt: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ ok: true, data: rows })
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = CreateUser.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'INVALID_INPUT', issues: parsed.error.issues.map(i => ({ path: i.path.join('.'), message: i.message })) }, { status: 400 })
  }
  const { email, password, name } = parsed.data

  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) return NextResponse.json({ ok: false, error: 'EMAIL_TAKEN' }, { status: 409 })

  const hashed = await hashPassword(password)

  const user = await prisma.user.create({
    data: { email, passwordHash: hashed, name: name ?? null },
    select: { id: true, email: true, name: true },
  })
  return NextResponse.json({ ok: true, data: user })
}