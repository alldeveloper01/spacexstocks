export const dynamic = 'force-dynamic'
import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || user.role !== 'admin') return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: kycs } = await supabaseAdmin
      .from('kyc')
      .select('*, users(full_name, email, kyc_charge, kyc_charge_reason)')
      .order('created_at', { ascending: false })

    return Response.json({ kycs: kycs || [] })
  } catch (error) {
    console.error('Admin KYC error:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function PUT(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || user.role !== 'admin') return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { id, action, admin_note } = await req.json()

    const { data: kyc } = await supabaseAdmin
      .from('kyc')
      .select('*, users(*)')
      .eq('id', id)
      .single()

    if (!kyc) return Response.json({ error: 'KYC not found' }, { status: 404 })

    const status = action === 'approve' ? 'verified' : 'rejected'

    await supabaseAdmin.from('kyc').update({ status, admin_note }).eq('id', id)
    await supabaseAdmin.from('users').update({ kyc_status: status }).eq('id', kyc.user_id)

    return Response.json({ success: true })
  } catch (error) {
    console.error('Admin KYC put error:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}