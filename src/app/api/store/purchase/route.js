export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'

const TIER_ORDER = ['Bronze', 'Starter', 'Growth', 'Premium', 'Elite', 'Platinum']

export async function POST(request) {
  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { product_id } = await request.json()
  if (!product_id) return NextResponse.json({ error: 'Missing product_id' }, { status: 400 })

  const { data: product } = await supabaseAdmin
    .from('store_products')
    .select('*')
    .eq('id', product_id)
    .eq('is_active', true)
    .single()

  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

  const { data: investment } = await supabaseAdmin
    .from('user_investments')
    .select('plan_id, investment_plans(name)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const userTier = investment?.investment_plans?.name || 'Bronze'
  const userTierLevel = TIER_ORDER.indexOf(userTier)
  const requiredTierLevel = TIER_ORDER.indexOf(product.tier_required)

  if (userTierLevel < requiredTierLevel) {
    return NextResponse.json({ error: `Requires ${product.tier_required} tier or above` }, { status: 403 })
  }

  if (Number(user.balance) < Number(product.member_price)) {
    return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
  }

  await supabaseAdmin
    .from('users')
    .update({ balance: Number(user.balance) - Number(product.member_price) })
    .eq('id', user.id)

  await supabaseAdmin.from('store_orders').insert({
    user_id: user.id,
    product_id: product.id,
    amount_deducted: product.member_price,
    status: 'pending'
  })

  return NextResponse.json({ success: true })
}