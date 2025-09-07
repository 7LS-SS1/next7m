import { NextResponse } from 'next/server'
import { prisma } from '@lib/db'
import { z } from 'zod'
import { hashPassword } from '@lib/crypto'
export const runtime = 'nodejs'

const UpdateUser = z.object({
  name: z.string().trim().nullable().optional(),
  password: z.string().min(8, 'รหัสผ่านต้องอย่างน้อย 8 ตัวอักษร').optional(),
})

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const u = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, createdAt: true, updatedAt: true },
  })
  if (!u) return NextResponse.json({ ok: false, error: 'NOT_FOUND' }, { status: 404 })
  return NextResponse.json({ ok: true, data: u })
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params

  const body = await req.json().catch(() => null)
  const parsed = UpdateUser.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'INVALID_INPUT', issues: parsed.error.issues.map(i => ({ path: i.path.join('.'), message: i.message })) },
      { status: 400 }
    )
  }

  const data: { name?: string | null; passwordHash?: string } = {}
  if (typeof parsed.data.name !== 'undefined') data.name = parsed.data.name ?? null

  if (parsed.data.password) {
    data.passwordHash = await hashPassword(parsed.data.password)
  }

  const u = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, email: true, name: true },
  })
  return NextResponse.json({ ok: true, data: u })
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}