export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { pushover } from '@/lib/pushover'

export async function POST(request) {
  const { session_id, message, sender, is_admin, user_name, user_email } = await request.json()

  if (!session_id || !message) {
    return NextResponse.json({ error: 'session_id and message required' }, { status: 400 })
  }

  // Critical fix from Meridian: always upsert session on first message
  await supabaseAdmin
    .from('chat_sessions')
    .upsert({
      session_id,
      status: 'open',
      user_name: user_name || sender || 'Visitor',
      user_email: user_email || null,
      last_message: message.substring(0, 100),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'session_id' })

  const { data, error } = await supabaseAdmin
    .from('chat_messages')
    .insert({
      session_id,
      sender: sender || 'Visitor',
      message,
      is_admin: is_admin || false,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to send' }, { status: 500 })

  if (!is_admin) {
    await pushover('New Chat Message', `${sender || 'Visitor'}: ${message.substring(0, 80)}`)
  }

  return NextResponse.json({ message: data })
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const session_id = searchParams.get('session_id')

  if (!session_id) return NextResponse.json({ error: 'session_id required' }, { status: 400 })

  const { data: messages } = await supabaseAdmin
    .from('chat_messages')
    .select('*')
    .eq('session_id', session_id)
    .order('created_at', { ascending: true })

  // Critical fix from Meridian: select all typing columns not just status
  const { data: session } = await supabaseAdmin
    .from('chat_sessions')
    .select('status, user_typing, admin_typing, user_typing_at, admin_typing_at')
    .eq('session_id', session_id)
    .single()

  const now = Date.now()
  const adminTyping = session?.admin_typing &&
    session?.admin_typing_at &&
    (now - new Date(session.admin_typing_at).getTime()) < 5000

  const userTyping = session?.user_typing &&
    session?.user_typing_at &&
    (now - new Date(session.user_typing_at).getTime()) < 5000

  return NextResponse.json({
    messages: messages || [],
    session_status: session?.status || 'open',
    admin_typing: adminTyping,
    user_typing: userTyping,
  })
}
