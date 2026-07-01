export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req) {
  try {
    const { session_id, is_admin, typing } = await req.json()
    if (!session_id) return Response.json({ error: 'Session ID required' }, { status: 400 })

    const updateField = is_admin
      ? { admin_typing: typing, admin_typing_at: typing ? new Date().toISOString() : null }
      : { user_typing: typing, user_typing_at: typing ? new Date().toISOString() : null }

    await supabaseAdmin
      .from('chat_sessions')
      .update(updateField)
      .eq('session_id', session_id)

    return Response.json({ success: true })
  } catch (error) {
    console.error('Typing error:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}