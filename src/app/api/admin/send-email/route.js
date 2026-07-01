export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0
import { getAdminFromRequest } from '@/lib/auth'
import { resend, buildEmailTemplate } from '@/lib/email'

export async function POST(req) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { to, subject, body, from } = await req.json()
    if (!to || !subject || !body) return Response.json({ error: 'Please fill in all fields' }, { status: 400 })

    const fromMap = {
      support: 'SpaceX Stocks Support <support@spacestocks.finance>',
      invest: 'SpaceX Stocks Investments <invest@spacestocks.finance>',
      compliance: 'SpaceX Stocks Compliance <compliance@spacestocks.finance>',
      noreply: 'SpaceX Stocks <noreply@spacestocks.finance>',
    }
    const fromAddress = fromMap[from] || fromMap.support

    const html = buildEmailTemplate({ title: subject, body: body.replace(/\n/g, '<br>') })

    const { error } = await resend.emails.send({ from: fromAddress, to, subject, html })
    if (error) return Response.json({ error: error.message }, { status: 500 })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Send email error:', error)
    return Response.json({ error: 'Failed to send email' }, { status: 500 })
  }
}