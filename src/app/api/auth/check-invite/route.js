export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request) {
  const { code } = await request.json()

  const { data } = await supabaseAdmin
    .from('invite_codes')
    .select('*')
    .eq('code', code)
    .is('used_by', null)
    .single()

  return NextResponse.json({ valid: !!data })
}