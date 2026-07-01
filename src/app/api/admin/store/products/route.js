export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getAdminFromRequest } from '@/lib/auth'

export async function GET(request) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabaseAdmin
    .from('store_products')
    .select('*')
    .order('created_at', { ascending: false })

  return NextResponse.json({ products: data })
}

export async function POST(request) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  const { error } = await supabaseAdmin.from('store_products').insert({
    title: body.title,
    description: body.description,
    image_url: body.image_url,
    market_price: Number(body.market_price),
    member_price: Number(body.member_price),
    category: body.category,
    tier_required: body.tier_required,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function PATCH(request) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, is_active } = await request.json()
  await supabaseAdmin.from('store_products').update({ is_active }).eq('id', id)
  return NextResponse.json({ success: true })
}