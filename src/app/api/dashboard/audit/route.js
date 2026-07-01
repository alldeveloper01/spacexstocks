export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request) {
  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [deposits, withdrawals, returns, storeOrders] = await Promise.all([
    supabaseAdmin.from('deposits').select('amount, status, created_at').eq('user_id', user.id),
    supabaseAdmin.from('withdrawals').select('amount, status, created_at').eq('user_id', user.id),
    supabaseAdmin.from('user_investments').select('weekly_return, status, created_at').eq('user_id', user.id),
    supabaseAdmin.from('store_orders').select('amount_deducted, status, created_at, store_products(title)').eq('user_id', user.id)
  ])

  const entries = [
    ...(deposits.data || []).map(d => ({ ...d, type: 'deposit' })),
    ...(withdrawals.data || []).map(d => ({ ...d, type: 'withdrawal' })),
    ...(returns.data || []).map(d => ({
      amount: d.weekly_return,
      status: d.status,
      created_at: d.created_at,
      type: 'return'
    })),
    ...(storeOrders.data || []).map(d => ({
      amount: d.amount_deducted,
      status: d.status,
      created_at: d.created_at,
      type: 'store',
      note: d.store_products?.title
    }))
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  return NextResponse.json({ entries })
}