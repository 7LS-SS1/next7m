import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@lib/db'
import { z } from 'zod'

const upSchema = z.object({
  title: z.string().trim().min(1),
  content: z.string().trim().min(1),
  type: z.enum(['ANNOUNCE', 'URGENT', 'GENERAL']).default('ANNOUNCE'),
  teamId: z.string().optional(),
  redirectTo: z.string().min(1).optional(),
})

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const a = await prisma.announcement.findUnique({ where: { id } })
  if (!a) return NextResponse.json({ ok: false, error: 'NOT_FOUND' }, { status: 404 })
  return NextResponse.json(a)
}

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const f = await req.formData()
  const method = String(f.get('_method') || 'PATCH').toUpperCase()

  if (method === 'DELETE') {
    try {
      await prisma.announcement.delete({ where: { id } })
      revalidatePath('/organization/announce')
      const to = String(f.get('redirectTo') || '/organization/announce')
      return NextResponse.redirect(new URL(to, req.url), { status: 303 })
    } catch {
      return NextResponse.json({ ok: false, error: 'FAILED' }, { status: 500 })
    }
  }

  const parsed = upSchema.safeParse({
    title: String(f.get('title') || ''),
    content: String(f.get('content') || ''),
    type: (f.get('type') ? String(f.get('type')) : 'ANNOUNCE') as 'ANNOUNCE' | 'URGENT' | 'GENERAL',
    teamId: f.get('teamId') ? String(f.get('teamId')) : undefined,
    redirectTo: f.get('redirectTo') ? String(f.get('redirectTo')) : undefined,
  })
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'INVALID_INPUT' }, { status: 400 })

  try {
    await prisma.announcement.update({
      where: { id },
      data: {
        title: parsed.data.title,
        content: parsed.data.content,
        type: parsed.data.type,
        teamId: parsed.data.teamId || undefined,
      },
    })
    revalidatePath(`/organization/announce/${id}/view`)
    revalidatePath('/organization/announce')
    const to = parsed.data.redirectTo ?? `/organization/announce/${id}/view`
    return NextResponse.redirect(new URL(to, req.url), { status: 303 })
  } catch {
    return NextResponse.json({ ok: false, error: 'FAILED' }, { status: 500 })
  }
}