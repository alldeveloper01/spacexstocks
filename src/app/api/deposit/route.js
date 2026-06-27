export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'
import { pushover } from '@/lib/pushover'

const OXAPAY_MERCHANT = process.env.OXAPAY_MERCHANT_KEY
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL

export async function POST(request) {
  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { amount, currency } = await request.json()

  if (!amount || amount < 10) {
    return NextResponse.json({ error: 'Minimum deposit is $10' }, { status: 400 })
  }

  // order_id max 50 chars — critical from Meridian fix
  const order_id = `SX${user.id.split('-')[0]}${Date.now()}`.substring(0, 50)

  // Create deposit record
  const { data: deposit } = await supabaseAdmin
    .from('deposits')
    .insert({
      user_id: user.id,
      amount,
      currency: currency || 'USDT',
      status: 'pending',
      order_id,
    })
    .select()
    .single()

  // Try invoice first (1.5% fee)
  try {
    const invoiceRes = await fetch('https://api.oxapay.com/v1/payment/invoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'merchant_api_key': OXAPAY_MERCHANT,
      },
      body: JSON.stringify({
        amount,
        currency: 'USD',
        fee_paid_by_payer: 1,
        callback_url: `${SITE_URL}/api/deposit/webhook`,
        return_url: `${SITE_URL}/dashboard?deposit=success&deposit_id=${deposit.id}`,
        order_id,
        lifetime: 60,
      }),
    })

    const invoiceData = await invoiceRes.json()

    // Critical fix from Meridian: use payment_url not pay_link
    if (invoiceData.data?.payment_url) {
      await supabaseAdmin
        .from('deposits')
        .update({ oxapay_track_id: invoiceData.data.track_id })
        .eq('id', deposit.id)

      await pushover('Deposit Started', `${user.full_name} initiated $${amount} deposit`)

      return NextResponse.json({
        method: 'invoice',
        payment_url: invoiceData.data.payment_url,
        deposit_id: deposit.id,
        track_id: invoiceData.data.track_id,
      })
    }
  } catch (e) {
    console.error('Invoice error:', e)
  }

  // Fallback: static address (2% fee shown to user)
  try {
    const staticRes = await fetch('https://api.oxapay.com/v1/payment/static-address', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'merchant_api_key': OXAPAY_MERCHANT,
      },
      body: JSON.stringify({
        currency: currency || 'USDT',
        callback_url: `${SITE_URL}/api/deposit/webhook`,
        order_id,
      }),
    })

    const staticData = await staticRes.json()

    if (staticData.data?.address) {
      await supabaseAdmin
        .from('deposits')
        .update({ oxapay_address: staticData.data.address })
        .eq('id', deposit.id)

      // Show 2% fee adjusted amount to user
      const displayAmount = (amount * 1.02).toFixed(2)

      return NextResponse.json({
        method: 'static',
        address: staticData.data.address,
        currency: currency || 'USDT',
        amount: displayAmount,
        original_amount: amount,
        deposit_id: deposit.id,
        trust_wallet_warning: true,
      })
    }
  } catch (e) {
    console.error('Static address error:', e)
  }

  return NextResponse.json({ error: 'Payment gateway unavailable. Contact support.' }, { status: 500 })
}
