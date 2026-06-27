export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getAdminFromRequest } from '@/lib/auth'
import { sendEmail } from '@/lib/email'

export async function GET(request) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: withdrawals } = await supabaseAdmin
    .from('withdrawals')
    .select('*, users(full_name, email)')
    .order('created_at', { ascending: false })

  return NextResponse.json({ withdrawals: withdrawals || [] })
}

export async function PUT(request) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { withdrawal_id, action, admin_note } = await request.json()

  const { data: w } = await supabaseAdmin
    .from('withdrawals')
    .select('*, users(*)')
    .eq('id', withdrawal_id)
    .single()

  if (!w) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (action === 'approve') {
    await supabaseAdmin
      .from('withdrawals')
      .update({ status: 'approved', admin_note: admin_note || null })
      .eq('id', withdrawal_id)

    await sendEmail({
      to: w.users.email,
      subject: 'Withdrawal Approved',
      title: 'Your Withdrawal Has Been Sent.',
      body: `Hello ${w.users.full_name},<br><br>
Your withdrawal of <strong>$${w.amount.toLocaleString()}</strong> has been approved and sent to your wallet.<br><br>
<strong>Wallet:</strong> ${w.wallet_address}<br>
<strong>Currency:</strong> ${w.currency}<br><br>
Please allow up to 24 hours for the transaction to appear in your wallet.`,
      from: 'noreply@spacestocks.finance',
    })
  }

  if (action === 'reject') {
    // Refund to withdrawal balance
    await supabaseAdmin
      .from('users')
      .update({ withdrawal_balance: (w.users.withdrawal_balance || 0) + w.amount })
      .eq('id', w.user_id)

    await supabaseAdmin
      .from('withdrawals')
      .update({ status: 'rejected', admin_note: admin_note || null })
      .eq('id', withdrawal_id)

    await sendEmail({
      to: w.users.email,
      subject: 'Withdrawal Update',
      title: 'Withdrawal Could Not Be Processed.',
      body: `Hello ${w.users.full_name},<br><br>
We were unable to process your withdrawal of $${w.amount.toLocaleString()} at this time.<br><br>
${admin_note ? `<strong>Reason:</strong> ${admin_note}<br><br>` : ''}
The amount has been returned to your withdrawal balance. Please contact us at invest@spacestocks.finance if you need assistance.`,
      from: 'support@spacestocks.finance',
    })
  }

  return NextResponse.json({ ok: true })
}
