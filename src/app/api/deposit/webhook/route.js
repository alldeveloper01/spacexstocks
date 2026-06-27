export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendEmail } from '@/lib/email'
import { pushover } from '@/lib/pushover'
import crypto from 'crypto'

export async function POST(request) {
  try {
    const body = await request.text()
    const data = JSON.parse(body)

    // Verify HMAC — header is uppercase SHA512 from Meridian fix
    const hmacHeader = request.headers.get('hmac') || request.headers.get('HMAC')
    if (process.env.OXAPAY_API_KEY && hmacHeader) {
      const expected = crypto
        .createHmac('sha512', process.env.OXAPAY_API_KEY)
        .update(body)
        .digest('hex')
      if (expected !== hmacHeader) {
        console.error('HMAC mismatch')
        return new Response('ok', { status: 200 })
      }
    }

    // Critical fix from Meridian: status is "Paid" with capital P
    if (data.status !== 'Paid') {
      return new Response('ok', { status: 200 })
    }

    const order_id = data.order_id
    if (!order_id) return new Response('ok', { status: 200 })

    // Find deposit by order_id
    const { data: deposit } = await supabaseAdmin
      .from('deposits')
      .select('*, users(*)')
      .eq('order_id', order_id)
      .single()

    if (!deposit || deposit.status === 'completed') {
      return new Response('ok', { status: 200 })
    }

    // Use txs[0].value for actual amount received — from Meridian fix
    const paidAmount = data.txs?.[0]?.value
      ? parseFloat(data.txs[0].value)
      : deposit.amount

    // Update deposit
    await supabaseAdmin
      .from('deposits')
      .update({
        status: 'completed',
        oxapay_track_id: data.track_id || deposit.oxapay_track_id,
      })
      .eq('id', deposit.id)

    // Credit user balance
    const user = deposit.users
    await supabaseAdmin
      .from('users')
      .update({ balance: (user.balance || 0) + paidAmount })
      .eq('id', user.id)

    // Email confirmation
    await sendEmail({
      to: user.email,
      subject: 'Deposit Confirmed',
      title: 'Your Deposit Has Been Received.',
      body: `Hello ${user.full_name},<br><br>
Your deposit of <strong>$${paidAmount.toLocaleString()}</strong> has been confirmed and credited to your account.<br><br>
Your balance is now ready. You can invest in a plan from your dashboard.<br><br>
Questions? Contact us at invest@spacestocks.finance`,
      from: 'noreply@spacestocks.finance',
    })

    await pushover('Deposit Confirmed', `${user.full_name} deposited $${paidAmount.toLocaleString()}`)

    // Webhook must return "ok" string — from Meridian fix
    return new Response('ok', { status: 200 })
  } catch (e) {
    console.error('Webhook error:', e)
    return new Response('ok', { status: 200 })
  }
}
