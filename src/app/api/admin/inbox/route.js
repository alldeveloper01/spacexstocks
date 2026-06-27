export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getAdminFromRequest } from '@/lib/auth'
import { resend, VALID_FROM, buildEmailTemplate } from '@/lib/email'

export async function GET(request) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: emails } = await supabaseAdmin
    .from('emails')
    .select('*')
    .order('received_at', { ascending: false })
    .limit(100)

  return NextResponse.json({ emails: emails || [] })
}

export async function PUT(request) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email_id, action, body } = await request.json()

  const { data: email } = await supabaseAdmin
    .from('emails')
    .select('*')
    .eq('id', email_id)
    .single()

  if (!email) return NextResponse.json({ error: 'Email not found' }, { status: 404 })

  if (action === 'read') {
    await supabaseAdmin.from('emails').update({ read: true }).eq('id', email_id)
    return NextResponse.json({ ok: true })
  }

  if (action === 'reply') {
    if (!body?.trim()) return NextResponse.json({ error: 'Body required' }, { status: 400 })

    // Reply from the same address it was received on — from Meridian fix
    const toAddress = email.to_address
    const fromAddress = VALID_FROM.includes(toAddress) ? toAddress : 'support@spacestocks.finance'

    const html = buildEmailTemplate({
      title: `Re: ${email.subject}`,
      body: body.replace(/\n/g, '<br>'),
    })

    const { error } = await resend.emails.send({
      from: `SpaceX Stocks <${fromAddress}>`,
      to: email.from_address,
      subject: `Re: ${email.subject}`,
      html,
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await supabaseAdmin.from('email_replies').insert({
      email_id: email.id,
      from_address: fromAddress,
      to_address: email.from_address,
      subject: `Re: ${email.subject}`,
      body,
    })

    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
