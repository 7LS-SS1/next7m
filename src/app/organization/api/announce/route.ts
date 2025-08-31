import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const schema = z.object({
  organizationId: z.string().min(1, 'organizationId is required'),
  title: z.string().trim().min(1, 'title is required'),
  content: z.string().trim().min(1, 'content is required'),
  type: z.enum(['ANNOUNCE', 'URGENT', 'GENERAL']).default('ANNOUNCE'),
  teamId: z.string().optional().transform((v) => (v && v.trim().length > 0 ? v : undefined)),
  redirectTo: z.string().optional().transform((v) => (v && v.trim().length > 0 ? v : undefined)),
})

async function parseBody(req: Request) {
  const ct = req.headers.get('content-type') || ''
  if (ct.includes('application/json')) {
    const j = await req.json().catch(() => ({}))
    return {
      organizationId: String(j.organizationId ?? ''),
      title: String(j.title ?? ''),
      content: String(j.content ?? ''),
      type: (j.type ?? 'ANNOUNCE') as 'ANNOUNCE' | 'URGENT' | 'GENERAL',
      teamId: j.teamId ? String(j.teamId) : undefined,
      redirectTo: j.redirectTo ? String(j.redirectTo) : undefined,
    }
  }
  const f = await req.formData()
  return {
    organizationId: String(f.get('organizationId') ?? ''),
    title: String(f.get('title') ?? ''),
    content: String(f.get('content') ?? ''),
    type: (f.get('type') ? String(f.get('type')) : 'ANNOUNCE') as 'ANNOUNCE' | 'URGENT' | 'GENERAL',
    teamId: f.get('teamId') ? String(f.get('teamId')) : undefined,
    redirectTo: f.get('redirectTo') ? String(f.get('redirectTo')) : undefined,
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    usage: 'POST /organization/api/announce via form-data or JSON',
    required: ['organizationId', 'title', 'content'],
    optional: {
      type: 'ANNOUNCE | URGENT | GENERAL (default: ANNOUNCE)',
      teamId: 'string (Team.id) | omitted',
      redirectTo: 'path to redirect after created',
    },
  })
}

export async function POST(req: Request) {
  try {
    const raw = await parseBody(req)
    const parsed = schema.safeParse(raw)
    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }))
      return NextResponse.json({ ok: false, error: 'INVALID_INPUT', issues }, { status: 400 })
    }

    const a = await prisma.announcement.create({
      data: {
        organizationId: parsed.data.organizationId,
        title: parsed.data.title,
        content: parsed.data.content,
        type: parsed.data.type,
        teamId: parsed.data.teamId,
      },
    })

    revalidatePath('/organization/announce')
    const to = parsed.data.redirectTo ?? `/organization/announce/${a.id}/view`
    return NextResponse.redirect(new URL(to, req.url), { status: 303 })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'FAILED' }, { status: 500 })
  }
}