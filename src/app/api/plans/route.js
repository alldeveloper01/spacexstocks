export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'
import { sendEmail } from '@/lib/email'
import { pushover } from '@/lib/pushover'

export async function GET(request) {
  const user = await getUserFromRequest(request)

  const { data: plans } = await supabaseAdmin
    .from('investment_plans')
    .select('*')
    .eq('is_active', true)
    .order('min_amount', { ascending: true })

  let userInvestments = []
  if (user) {
    const { data } = await supabaseAdmin
      .from('user_investments')
      .select('*, investment_plans(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    userInvestments = data || []
  }

  return NextResponse.json({ plans: plans || [], investments: userInvestments })
}

export async function POST(request) {
  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan_id, amount } = await request.json()

  if (!plan_id || !amount) {
    return NextResponse.json({ error: 'Plan and amount required' }, { status: 400 })
  }

  const { data: plan } = await supabaseAdmin
    .from('investment_plans')
    .select('*')
    .eq('id', plan_id)
    .single()

  if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
  if (amount < plan.min_amount) {
    return NextResponse.json({ error: `Minimum deposit is $${plan.min_amount.toLocaleString()}` }, { status: 400 })
  }
  if (user.balance < amount) {
    return NextResponse.json({ error: 'Insufficient balance. Please deposit first.' }, { status: 400 })
  }

  // Calculate proportional weekly return for custom amounts
  const rate = plan.weekly_return / plan.min_amount
  const weeklyReturn = Math.floor(amount * rate)
  const weeksTotal = Math.floor(plan.duration_days / 7)
  const targetProfit = weeklyReturn * weeksTotal

  const endDate = new Date()
  endDate.setDate(endDate.getDate() + plan.duration_days)

  // Deduct from balance
  await supabaseAdmin
    .from('users')
    .update({
      balance: user.balance - amount,
      total_deposited: (user.total_deposited || 0) + amount,
    })
    .eq('id', user.id)

  const { data: investment, error } = await supabaseAdmin
    .from('user_investments')
    .insert({
      user_id: user.id,
      plan_id: plan.id,
      amount,
      weekly_return: weeklyReturn,
      target_profit: targetProfit,
      end_date: endDate.toISOString(),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Investment failed' }, { status: 500 })

  await sendEmail({
    to: user.email,
    subject: `${plan.name} Plan Activated`,
    title: `Your ${plan.name} Plan is Now Active.`,
    body: `Hello ${user.full_name},<br><br>
Your <strong>${plan.name}</strong> investment plan has been activated.<br><br>
<strong>Amount Invested:</strong> $${amount.toLocaleString()}<br>
<strong>Weekly Return:</strong> $${weeklyReturn.toLocaleString()}<br>
<strong>Total Return:</strong> $${targetProfit.toLocaleString()}<br>
<strong>Duration:</strong> ${plan.duration_days} days<br>
<strong>End Date:</strong> ${endDate.toDateString()}<br><br>
Our team is now trading on your behalf. Your first weekly payout will arrive within 7 days.<br><br>
Welcome to the mission.`,
    from: 'invest@spacestocks.finance',
  })

  await pushover('New Investment', `${user.full_name} invested $${amount.toLocaleString()} in ${plan.name}`)

  return NextResponse.json({ investment })
}
