export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0
import { getAdminFromRequest } from '@/lib/auth'
import { resend } from '@/lib/email'

export async function GET(req) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const email_id = searchParams.get('email_id')
    const attachment_id = searchParams.get('attachment_id')

    if (!email_id || !attachment_id) {
      return Response.json({ error: 'Missing params' }, { status: 400 })
    }

    const { data, error } = await resend.emails.receiving.attachments.get({
      id: attachment_id,
      emailId: email_id
    })

    if (error || !data?.download_url) {
      return Response.json({ error: 'Failed to get attachment' }, { status: 500 })
    }

    return Response.json({ download_url: data.download_url })
  } catch (error) {
    console.error('Attachment error:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}