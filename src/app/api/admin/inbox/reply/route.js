export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0
import { getAdminFromRequest } from '@/lib/auth'
import { resend, buildEmailTemplate } from '@/lib/email'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { to, subject, body, email_id } = await req.json()
    if (!to || !subject || !body) return Response.json({ error: 'Missing fields' }, { status: 400 })

    const html = buildEmailTemplate({ title: subject, body: body.replace(/\n/g, '<br>') })

    const { error } = await resend.emails.send({
      from: 'SpaceX Stocks Support <support@spacestocks.finance>',
      to,
      subject,
      html
    })

    if (error) return Response.json({ error: error.message }, { status: 500 })

    await supabaseAdmin.from('email_replies').insert({
      email_id,
      from_address: 'support@spacestocks.finance',
      to_address: to,
      subject,
      body
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Reply error:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}