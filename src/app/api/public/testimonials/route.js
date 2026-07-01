export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const { data } = await supabaseAdmin
    .from('member_wall')
    .select('*')
    .eq('approved', true)
    .order('created_at', { ascending: false })
    .limit(9)

  return NextResponse.json({ testimonials: data || [] })
}