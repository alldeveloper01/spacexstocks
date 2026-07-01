export const dynamic = 'force-dynamic'
import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { deposit_id } = await req.json()

    const { data: deposit } = await supabaseAdmin
      .from('deposits')
      .select('*')
      .eq('id', deposit_id)
      .eq('user_id', user.id)
      .single()

    if (!deposit) return Response.json({ status: 'unknown' })

    if (deposit.status === 'completed') {
      const { data: updatedUser } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      return Response.json({ status: 'completed', user: updatedUser })
    }

    return Response.json({ status: deposit.status })
  } catch (error) {
    console.error('Check deposit error:', error)
    return Response.json({ status: 'unknown' })
  }
}