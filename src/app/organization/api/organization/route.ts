// NOTE: This file should live at src/app/api/organization/route.ts (move it for proper routing)
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const bodySchema = z.object({
  name: z.string().trim().min(1),
  redirectTo: z.string().min(1).optional(),
})

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const parsed = bodySchema.safeParse({
      name: String(form.get('name') || ''),
      redirectTo: form.get('redirectTo') ? String(form.get('redirectTo')) : undefined,
    })

    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'INVALID_INPUT' }, { status: 400 })
    }

    await prisma.organization.create({ data: { name: parsed.data.name } })
    revalidatePath('/organization')

    const to = parsed.data.redirectTo ?? '/organization'
    return NextResponse.redirect(new URL(to, req.url), { status: 303 })
  } catch {
    return NextResponse.json({ ok: false, error: 'FAILED' }, { status: 500 })
  }
}