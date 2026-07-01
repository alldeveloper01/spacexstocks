export const dynamic = 'force-dynamic'
import { supabaseAdmin } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: chatSessions } = await supabaseAdmin
      .from('chat_sessions')
      .select('*')
      .order('updated_at', { ascending: false })

    if (!chatSessions || chatSessions.length === 0) {
      return Response.json({ sessions: [] })
    }

    const sessions = await Promise.all(chatSessions.map(async (s) => {
      const { data: lastMsg } = await supabaseAdmin
        .from('chat_messages')
        .select('message, created_at')
        .eq('session_id', s.session_id)
        .eq('is_admin', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      const { count: unread } = await supabaseAdmin
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', s.session_id)
        .eq('is_admin', false)
        .eq('read', false)

      return {
        session_id: s.session_id,
        user_name: s.user_name,
        user_email: s.user_email,
        last_message: lastMsg?.message || '',
        last_message_time: lastMsg?.created_at || s.updated_at,
        unread: unread || 0,
        status: s.status || 'open',
      }
    }))

    return Response.json({ sessions })
  } catch (error) {
    console.error('Chat sessions error:', error)
    return Response.json({ sessions: [] })
  }
}

export async function PUT(req) {
  try {
    const { session_id, status } = await req.json()

    await supabaseAdmin
      .from('chat_sessions')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('session_id', session_id)

    return Response.json({ success: true })
  } catch (error) {
    console.error('Chat session update error:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}