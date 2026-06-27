export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getAdminFromRequest } from '@/lib/auth'

export async function GET(request) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: sessions } = await supabaseAdmin
    .from('chat_sessions')
    .select('*')
    .order('updated_at', { ascending: false })

  return NextResponse.json({ sessions: sessions || [] })
}

export async function PUT(request) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { session_id, action } = await request.json()

  const status = action === 'close' ? 'closed' : 'open'
  await supabaseAdmin
    .from('chat_sessions')
    .update({ status })
    .eq('session_id', session_id)

  return NextResponse.json({ ok: true })
}
