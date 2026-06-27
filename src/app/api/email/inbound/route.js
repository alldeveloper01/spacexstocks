export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { resend } from '@/lib/email'
import { pushover } from '@/lib/pushover'

export async function POST(request) {
  try {
    const payload = await request.json()
    const email_id = payload.email_id || payload.id

    if (!email_id) return NextResponse.json({ ok: true })

    // Critical fix from Meridian: body not in webhook, must fetch separately
    const emailData = await resend.emails.receiving.get(email_id)

    const from_address = emailData?.from || payload.from || ''
    const to_address = emailData?.to?.[0] || payload.to?.[0] || ''
    const subject = emailData?.subject || payload.subject || '(no subject)'
    const body_html = emailData?.html || ''
    const body_text = emailData?.text || ''

    // Store attachment metadata only — not content
    const attachments = (emailData?.attachments || []).map(a => ({
      id: a.id,
      filename: a.filename,
      content_type: a.content_type,
      size: a.size,
    }))

    await supabaseAdmin.from('emails').insert({
      email_id,
      from_address,
      to_address,
      subject,
      body_html,
      body_text,
      attachments,
    })

    await pushover('New Email', `From: ${from_address} — ${subject}`)

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Email webhook error:', e)
    return NextResponse.json({ ok: true })
  }
}
