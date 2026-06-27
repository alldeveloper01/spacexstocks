export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getAdminFromRequest } from '@/lib/auth'

export async function GET(request) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: users } = await supabaseAdmin
    .from('users')
    .select('id, email, full_name, role, balance, withdrawal_balance, total_profit, total_deposited, kyc_verified, invite_code, created_at')
    .order('created_at', { ascending: false })

  return NextResponse.json({ users: users || [] })
}

export async function PUT(request) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { user_id, action, amount, note } = await request.json()

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', user_id)
    .single()

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  if (action === 'credit_balance') {
    await supabaseAdmin
      .from('users')
      .update({ balance: (user.balance || 0) + amount })
      .eq('id', user_id)
    return NextResponse.json({ ok: true })
  }

  if (action === 'credit_withdrawal') {
    await supabaseAdmin
      .from('users')
      .update({ withdrawal_balance: (user.withdrawal_balance || 0) + amount })
      .eq('id', user_id)
    return NextResponse.json({ ok: true })
  }

  if (action === 'verify_kyc') {
    await supabaseAdmin
      .from('users')
      .update({ kyc_verified: true })
      .eq('id', user_id)
    return NextResponse.json({ ok: true })
  }

  if (action === 'generate_invite') {
    const code = `SX${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    await supabaseAdmin
      .from('invite_codes')
      .insert({ code, created_by: admin.id })
    return NextResponse.json({ ok: true, code })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
