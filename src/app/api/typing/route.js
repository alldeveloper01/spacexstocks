export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request) {
  const { session_id, is_admin, typing } = await request.json()

  if (!session_id) return NextResponse.json({ error: 'session_id required' }, { status: 400 })

  const updateData = is_admin
    ? { admin_typing: typing, admin_typing_at: new Date().toISOString() }
    : { user_typing: typing, user_typing_at: new Date().toISOString() }

  await supabaseAdmin
    .from('chat_sessions')
    .update(updateData)
    .eq('session_id', session_id)

  return NextResponse.json({ ok: true })
}
