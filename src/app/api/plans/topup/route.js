export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'
import { sendEmail } from '@/lib/email'
import { pushover } from '@/lib/pushover'

export async function POST(request) {
  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { investment_id, action, amount } = await request.json()
  // action: 'topup' | 'upgrade'

  if (!investment_id || !action) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Get current investment
  const { data: inv } = await supabaseAdmin
    .from('user_investments')
    .select('*, investment_plans(*)')
    .eq('id', investment_id)
    .eq('user_id', user.id)
    .single()

  if (!inv) return NextResponse.json({ error: 'Investment not found' }, { status: 404 })
  if (inv.status !== 'active') return NextResponse.json({ error: 'Investment is not active' }, { status: 400 })

  // Refresh user balance
  const { data: freshUser } = await supabaseAdmin
    .from('users')
    .select('balance, total_deposited, full_name, email')
    .eq('id', user.id)
    .single()

  if (action === 'topup') {
    // Add extra funds to existing investment — increase weekly return proportionally
    const topupAmount = parseFloat(amount)
    if (!topupAmount || topupAmount < 100) {
      return NextResponse.json({ error: 'Minimum top-up is $100' }, { status: 400 })
    }
    if (freshUser.balance < topupAmount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    const plan = inv.investment_plans
    const rate = plan.weekly_return / plan.min_amount
    const extraWeekly = Math.floor(topupAmount * rate)
    const newAmount = inv.amount + topupAmount
    const newWeekly = inv.weekly_return + extraWeekly

    // Recalculate target profit based on remaining days
    const daysLeft = Math.max(0, Math.ceil((new Date(inv.end_date) - new Date()) / 86400000))
    const weeksLeft = Math.floor(daysLeft / 7)
    const extraProfit = extraWeekly * weeksLeft
    const newTarget = inv.target_profit + extraProfit

    await supabaseAdmin
      .from('user_investments')
      .update({ amount: newAmount, weekly_return: newWeekly, target_profit: newTarget })
      .eq('id', investment_id)

    await supabaseAdmin
      .from('users')
      .update({ balance: freshUser.balance - topupAmount })
      .eq('id', user.id)

    await sendEmail({
      to: freshUser.email,
      subject: `${plan.name} Plan Topped Up`,
      title: 'Your Plan Has Been Topped Up.',
      body: `Hello ${freshUser.full_name},<br><br>
Your <strong>${plan.name}</strong> plan has been topped up successfully.<br><br>
<strong>Top-up Amount:</strong> $${topupAmount.toLocaleString()}<br>
<strong>New Total Invested:</strong> $${newAmount.toLocaleString()}<br>
<strong>New Weekly Return:</strong> $${newWeekly.toLocaleString()}<br>
<strong>Additional Weekly:</strong> +$${extraWeekly.toLocaleString()}<br><br>
Your increased returns will apply from your next weekly payout.`,
      from: 'invest@spacestocks.finance',
    })

    await pushover('Plan Top-Up', `${freshUser.full_name} topped up $${topupAmount.toLocaleString()} on ${plan.name}`)

    return NextResponse.json({
      success: true,
      new_weekly: newWeekly,
      new_amount: newAmount,
      extra_weekly: extraWeekly,
    })
  }

  if (action === 'upgrade') {
    // Migrate to next plan tier
    const { data: allPlans } = await supabaseAdmin
      .from('investment_plans')
      .select('*')
      .eq('is_active', true)
      .order('min_amount', { ascending: true })

    const currentPlanIndex = allPlans.findIndex(p => p.id === inv.plan_id)
    if (currentPlanIndex === -1 || currentPlanIndex === allPlans.length - 1) {
      return NextResponse.json({ error: 'Already on the highest plan' }, { status: 400 })
    }

    const nextPlan = allPlans[currentPlanIndex + 1]
    const upgradeCost = Math.max(0, nextPlan.min_amount - inv.amount)

    if (freshUser.balance < upgradeCost) {
      return NextResponse.json({
        error: `Insufficient balance. You need $${upgradeCost.toLocaleString()} more to upgrade.`
      }, { status: 400 })
    }

    // New investment amount is max of next plan min or current amount
    const newAmount = Math.max(nextPlan.min_amount, inv.amount + upgradeCost)
    const rate = nextPlan.weekly_return / nextPlan.min_amount
    const newWeekly = Math.floor(newAmount * rate)
    const weeksTotal = Math.floor(nextPlan.duration_days / 7)
    const newTarget = newWeekly * weeksTotal

    const endDate = new Date()
    endDate.setDate(endDate.getDate() + nextPlan.duration_days)

    // Cancel current investment
    await supabaseAdmin
      .from('user_investments')
      .update({ status: 'upgraded' })
      .eq('id', investment_id)

    // Create new investment on next plan
    const { data: newInv } = await supabaseAdmin
      .from('user_investments')
      .insert({
        user_id: user.id,
        plan_id: nextPlan.id,
        amount: newAmount,
        weekly_return: newWeekly,
        target_profit: newTarget,
        end_date: endDate.toISOString(),
      })
      .select()
      .single()

    // Deduct upgrade cost from balance
    await supabaseAdmin
      .from('users')
      .update({ balance: freshUser.balance - upgradeCost })
      .eq('id', user.id)

    await sendEmail({
      to: freshUser.email,
      subject: `Upgraded to ${nextPlan.name} Plan`,
      title: `You've Been Upgraded to ${nextPlan.name}.`,
      body: `Hello ${freshUser.full_name},<br><br>
Your plan has been upgraded from <strong>${inv.investment_plans.name}</strong> to <strong>${nextPlan.name}</strong>.<br><br>
<strong>Upgrade Cost:</strong> $${upgradeCost.toLocaleString()}<br>
<strong>New Amount Invested:</strong> $${newAmount.toLocaleString()}<br>
<strong>New Weekly Return:</strong> $${newWeekly.toLocaleString()}<br>
<strong>New Duration:</strong> ${nextPlan.duration_days} days<br>
<strong>New End Date:</strong> ${endDate.toDateString()}<br><br>
Welcome to ${nextPlan.name}. Your upgraded returns start from your next weekly payout.`,
      from: 'invest@spacestocks.finance',
    })

    await pushover('Plan Upgrade', `${freshUser.full_name} upgraded from ${inv.investment_plans.name} to ${nextPlan.name}`)

    return NextResponse.json({
      success: true,
      new_plan: nextPlan.name,
      new_weekly: newWeekly,
      upgrade_cost: upgradeCost,
    })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}