export const dynamic = 'force-dynamic'
import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: kyc } = await supabaseAdmin
      .from('kyc')
      .select('*')
      .eq('user_id', user.id)
      .single()

    return Response.json({
      kyc_status: user.kyc_status || 'unverified',
      kyc_charge: user.kyc_charge || 0,
      kyc_charge_reason: user.kyc_charge_reason || null,
      kyc_charge_address: user.kyc_charge_address || null,
      kyc: kyc || null
    })
  } catch (error) {
    console.error('KYC get error:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { id_image_url, selfie_url, charge_receipt_url } = await req.json()

    if (!id_image_url || !selfie_url) {
      return Response.json({ error: 'Please upload both ID and selfie' }, { status: 400 })
    }

    if (user.kyc_charge > 0 && !charge_receipt_url) {
      return Response.json({ error: 'Please upload payment receipt' }, { status: 400 })
    }

    const { data: existingKyc } = await supabaseAdmin
      .from('kyc')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (existingKyc) {
      await supabaseAdmin
        .from('kyc')
        .update({ id_image_url, selfie_url, charge_receipt_url: charge_receipt_url || null, status: 'pending' })
        .eq('user_id', user.id)
    } else {
      await supabaseAdmin
        .from('kyc')
        .insert({ user_id: user.id, id_image_url, selfie_url, charge_receipt_url: charge_receipt_url || null, status: 'pending' })
    }

    await supabaseAdmin
      .from('users')
      .update({ kyc_status: 'pending' })
      .eq('id', user.id)

    if (process.env.PUSHOVER_APP_TOKEN && process.env.PUSHOVER_USER_KEY) {
      await fetch('https://api.pushover.net/1/messages.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: process.env.PUSHOVER_APP_TOKEN,
          user: process.env.PUSHOVER_USER_KEY,
          title: '🪪 New KYC Submission',
          message: `${user.full_name} (${user.email}) submitted KYC documents for review.`,
          priority: 0,
        })
      }).catch(() => {})
    }

    return Response.json({ success: true, message: 'KYC submitted successfully. Under review.' })
  } catch (error) {
    console.error('KYC post error:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}