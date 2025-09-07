import { NextResponse } from 'next/server'
import { prisma } from '@lib/db'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const orgId = searchParams.get('org') || ''
  if (!orgId) return NextResponse.json({ ok: false, error: 'organizationId is required' }, { status: 400 })
  const rows = await prisma.work.findMany({
    where: { organizationId: orgId },
    include: { assignedTo: { select: { name: true } } },
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
        title: String(j.title || ''),
        description: j.description ? String(j.description) : undefined,
        status: j.status ? String(j.status) : undefined,
        dueDate: j.dueDate ? new Date(String(j.dueDate)) : undefined,
        teamId: j.teamId ? String(j.teamId) : undefined,
        assignedToId: j.assignedToId ? String(j.assignedToId) : undefined,
      }
    }
    const f = await req.formData()
    return {
      organizationId: String(f.get('organizationId') || ''),
      title: String(f.get('title') || ''),
      description: f.get('description') ? String(f.get('description')) : undefined,
      status: f.get('status') ? String(f.get('status')) : undefined,
      dueDate: f.get('dueDate') ? new Date(String(f.get('dueDate'))) : undefined,
      teamId: f.get('teamId') ? String(f.get('teamId')) : undefined,
      assignedToId: f.get('assignedToId') ? String(f.get('assignedToId')) : undefined,
    }
  }

  const body = await parse()
  if (!body.organizationId || !body.title) {
    return NextResponse.json({ ok: false, error: 'INVALID_INPUT' }, { status: 400 })
  }

  try {
    const w = await prisma.work.create({
      data: {
        organizationId: body.organizationId,
        title: body.title,
        status: body.status as any,
        assignedToId: body.assignedToId,
      },
    })
    return NextResponse.json({ ok: true, data: w })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'FAILED' }, { status: 500 })
  }
}
