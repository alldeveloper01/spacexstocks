export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request) {
  try {
    const payload = await request.text()
    const body = JSON.parse(payload)

    if (body.type !== 'email.received') {
      return NextResponse.json({ ok: true })
    }

    const { email_id, from, subject, to, attachments: attachmentsMeta } = body.data

    let bodyText = ''
    let bodyHtml = ''
    try {
      const emailRes = await fetch(`https://api.resend.com/inbound/emails/${email_id}`, {
  headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` }
})
const fullEmail = await emailRes.json()
console.log('Full email fetch result:', JSON.stringify(fullEmail))
bodyText = fullEmail?.text || ''
bodyHtml = fullEmail?.html || ''
    } catch (err) {
      console.error('Failed to fetch email body:', err)
    }

    const attachments = (attachmentsMeta || []).map(att => ({
      id: att.id,
      filename: att.filename,
      content_type: att.content_type,
      size: att.size || null
    }))

    await supabaseAdmin.from('emails').insert({
      email_id,
      from_address: from,
      to_address: Array.isArray(to) ? to[0] : to || '',
      subject: subject || '(no subject)',
      body_text: bodyText,
      body_html: bodyHtml,
      attachments: attachments.length > 0 ? attachments : null,
      received_at: body.created_at || new Date().toISOString(),
      read: false
    })

    if (process.env.PUSHOVER_APP_TOKEN && process.env.PUSHOVER_USER_KEY) {
      await fetch('https://api.pushover.net/1/messages.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: process.env.PUSHOVER_APP_TOKEN,
          user: process.env.PUSHOVER_USER_KEY,
          title: `📧 SpaceX Stocks — New Email`,
          message: `From: ${from}\nSubject: ${subject || '(no subject)'}${attachments.length > 0 ? `\n📎 ${attachments.length} attachment(s)` : ''}\n\n${bodyText?.slice(0, 300) || '(no preview)'}`,
          priority: 1,
          sound: 'magic'
        })
      })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Email webhook error:', e)
    return NextResponse.json({ ok: true })
  }
}