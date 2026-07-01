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

  const { amount, wallet_address, currency } = await request.json()

  if (!amount || !wallet_address) {
    return NextResponse.json({ error: 'Amount and wallet address required' }, { status: 400 })
  }
  const { data: minWithdrawalSetting } = await supabaseAdmin
    .from('site_settings')
    .select('value')
    .eq('key', 'min_withdrawal')
    .single()
  const MIN_WITHDRAWAL = Number(minWithdrawalSetting?.value || 20)

  if (amount < MIN_WITHDRAWAL) {
    return NextResponse.json({ error: `Minimum withdrawal is $${MIN_WITHDRAWAL}` }, { status: 400 })
  }
  if (user.withdrawal_balance < amount) {
    return NextResponse.json({ error: 'Insufficient withdrawal balance' }, { status: 400 })
  }

  // Deduct from withdrawal balance
  await supabaseAdmin
    .from('users')
    .update({ withdrawal_balance: user.withdrawal_balance - amount })
    .eq('id', user.id)

  const { data: withdrawal } = await supabaseAdmin
    .from('withdrawals')
    .insert({
      user_id: user.id,
      amount,
      wallet_address,
      currency: currency || 'TRX',
      status: 'pending',
    })
    .select()
    .single()

  await sendEmail({
    to: user.email,
    subject: 'Withdrawal Request Received',
    title: 'Withdrawal Request Submitted.',
    body: `Hello ${user.full_name},<br><br>
Your withdrawal request has been received and is being processed.<br><br>
<strong>Amount:</strong> $${amount.toLocaleString()}<br>
<strong>Wallet:</strong> ${wallet_address}<br>
<strong>Currency:</strong> ${currency || 'TRX'}<br><br>
Withdrawals are typically processed within 24 hours. You will receive a confirmation email when it's sent.<br><br>
Questions? Contact invest@spacestocks.finance`,
    from: 'noreply@spacestocks.finance',
  })

  await pushover('Withdrawal Request', `${user.full_name} requested $${amount.toLocaleString()} withdrawal`)

  return NextResponse.json({ withdrawal })
}

export async function GET(request) {
  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: withdrawals } = await supabaseAdmin
    .from('withdrawals')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return NextResponse.json({ withdrawals: withdrawals || [] })
}
