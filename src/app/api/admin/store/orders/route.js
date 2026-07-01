export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getAdminFromRequest } from '@/lib/auth'

export async function GET(request) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabaseAdmin
    .from('store_orders')
    .select('*, store_products(title), users(full_name, email)')
    .order('created_at', { ascending: false })

  return NextResponse.json({ orders: data })
}

export async function PATCH(request) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, status, admin_note } = await request.json()
  await supabaseAdmin.from('store_orders').update({ status, admin_note }).eq('id', id)
  return NextResponse.json({ success: true })
}