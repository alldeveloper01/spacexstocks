export const dynamic = 'force-dynamic'
import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function PUT(req) {
  try {
    const admin = await getUserFromRequest(req)
    if (!admin || admin.role !== 'admin') return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { user_id, kyc_charge, kyc_charge_address, kyc_charge_reason } = await req.json()
    if (!user_id) return Response.json({ error: 'Missing user_id' }, { status: 400 })

    await supabaseAdmin
      .from('users')
      .update({ kyc_charge, kyc_charge_address, kyc_charge_reason })
      .eq('id', user_id)

    return Response.json({ success: true })
  } catch (error) {
    console.error('Set KYC fee error:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}