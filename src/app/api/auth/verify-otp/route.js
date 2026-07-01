export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { signToken } from '@/lib/auth'

export async function POST(request) {
  const { email, otp } = await request.json()

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .single()

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  if (user.otp_code !== otp) return NextResponse.json({ error: 'Invalid code' }, { status: 400 })
  if (new Date(user.otp_expires_at) < new Date()) return NextResponse.json({ error: 'Code expired' }, { status: 400 })

  await supabaseAdmin
    .from('users')
    .update({ otp_code: null, otp_expires_at: null })
    .eq('id', user.id)

  const token = signToken({ id: user.id, email: user.email, role: user.role })

  return NextResponse.json({ success: true, token, role: user.role })
}