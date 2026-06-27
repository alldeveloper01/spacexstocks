export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { resend, VALID_FROM, buildEmailTemplate } from '@/lib/email'

export async function POST(request) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { to, subject, title, body, from } = await request.json()

  if (!to || !subject || !body) {
    return NextResponse.json({ error: 'to, subject and body required' }, { status: 400 })
  }

  const fromAddress = VALID_FROM.includes(from) ? from : 'noreply@spacestocks.finance'

  const html = buildEmailTemplate({ title: title || subject, body })

  const { data, error } = await resend.emails.send({
    from: `SpaceX Stocks <${fromAddress}>`,
    to,
    subject,
    html,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, id: data?.id })
}
