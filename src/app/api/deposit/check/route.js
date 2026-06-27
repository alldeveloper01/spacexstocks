export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request) {
  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const deposit_id = searchParams.get('deposit_id')

  if (!deposit_id) return NextResponse.json({ error: 'deposit_id required' }, { status: 400 })

  const { data: deposit } = await supabaseAdmin
    .from('deposits')
    .select('*')
    .eq('id', deposit_id)
    .eq('user_id', user.id)
    .single()

  if (!deposit) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ status: deposit.status, amount: deposit.amount })
}
