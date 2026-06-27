export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getAdminFromRequest } from '@/lib/auth'
import { sendEmail } from '@/lib/email'

export async function GET(request) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: investments } = await supabaseAdmin
    .from('user_investments')
    .select('*, users(full_name, email), investment_plans(name)')
    .order('created_at', { ascending: false })

  return NextResponse.json({ investments: investments || [] })
}

export async function PUT(request) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { investment_id, action, weekly_return } = await request.json()

  const { data: inv } = await supabaseAdmin
    .from('user_investments')
    .select('*, users(*), investment_plans(*)')
    .eq('id', investment_id)
    .single()

  if (!inv) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (action === 'complete') {
    await supabaseAdmin
      .from('user_investments')
      .update({ status: 'completed' })
      .eq('id', investment_id)

    // Credit target profit to withdrawal balance
    await supabaseAdmin
      .from('users')
      .update({
        withdrawal_balance: (inv.users.withdrawal_balance || 0) + inv.target_profit,
        total_profit: (inv.users.total_profit || 0) + inv.target_profit,
      })
      .eq('id', inv.user_id)

    await sendEmail({
      to: inv.users.email,
      subject: 'Investment Plan Completed',
      title: 'Your Investment Plan Has Completed.',
      body: `Hello ${inv.users.full_name},<br><br>
Your <strong>${inv.investment_plans.name}</strong> investment plan has completed successfully.<br><br>
<strong>Total Return:</strong> $${inv.target_profit.toLocaleString()}<br><br>
Your earnings are now available in your withdrawal balance. You can withdraw at any time from your dashboard, or reinvest in a new plan.<br><br>
Thank you for being part of the mission.`,
      from: 'invest@spacestocks.finance',
    })

    return NextResponse.json({ ok: true, message: 'Investment completed and profit credited' })
  }

  if (action === 'pay_weekly') {
    const amount = weekly_return || inv.weekly_return
    await supabaseAdmin
      .from('users')
      .update({
        withdrawal_balance: (inv.users.withdrawal_balance || 0) + amount,
        total_profit: (inv.users.total_profit || 0) + amount,
      })
      .eq('id', inv.user_id)

    await sendEmail({
      to: inv.users.email,
      subject: 'Weekly Return Credited',
      title: 'Your Weekly Return Has Been Paid.',
      body: `Hello ${inv.users.full_name},<br><br>
Your weekly return of <strong>$${amount.toLocaleString()}</strong> from your ${inv.investment_plans.name} plan has been credited to your account.<br><br>
You can withdraw this amount or let it grow with a new investment.<br><br>
See you next week.`,
      from: 'invest@spacestocks.finance',
    })

    return NextResponse.json({ ok: true, message: `$${amount.toLocaleString()} weekly return paid` })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
