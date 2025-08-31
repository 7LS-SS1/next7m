import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const orgId = searchParams.get('org') || ''
  if (!orgId) return NextResponse.json({ ok: false, error: 'organizationId is required' }, { status: 400 })
  const rows = await prisma.membership.findMany({
    where: { organizationId: orgId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ ok: true, data: rows })
}

export async function POST(req: Request) {
  const ct = req.headers.get('content-type') || ''
  const parse = async () => {
    if (ct.includes('application/json')) {
      const j = await req.json().catch(() => ({}))
      return {
        organizationId: String(j.organizationId || ''),
        userId: String(j.userId || ''),
        role: j.role ? String(j.role) : undefined,
      }
    }
    const f = await req.formData()
    return {
      organizationId: String(f.get('organizationId') || ''),
      userId: String(f.get('userId') || ''),
      role: f.get('role') ? String(f.get('role')) : undefined,
    }
  }

  const body = await parse()
  if (!body.organizationId || !body.userId) {
    return NextResponse.json({ ok: false, error: 'INVALID_INPUT' }, { status: 400 })
  }

  try {
    const m = await prisma.membership.create({
      data: {
        organizationId: body.organizationId,
        userId: body.userId,
        role: (body.role as any) || undefined,
      },
    })
    return NextResponse.json({ ok: true, data: m })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'FAILED' }, { status: 500 })
  }
}
