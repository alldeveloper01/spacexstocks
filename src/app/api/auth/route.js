export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase'
import { signToken, getUserFromRequest } from '@/lib/auth'
import { sendEmail } from '@/lib/email'
import { pushover } from '@/lib/pushover'

export async function POST(request) {
  const { action, email, password, full_name, invite_code } = await request.json()

  // REGISTER
  if (action === 'register') {
    if (!email || !password || !full_name) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 })
    }
    if (!invite_code) {
      return NextResponse.json({ error: 'Invitation code required' }, { status: 400 })
    }

    // Validate invite code
    const { data: code } = await supabaseAdmin
      .from('invite_codes')
      .select('*')
      .eq('code', invite_code.toUpperCase())
      .is('used_by', null)
      .single()

    if (!code) {
      return NextResponse.json({ error: 'Invalid or already used invitation code' }, { status: 400 })
    }

    // Check existing
    const { data: existing } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    const password_hash = await bcrypt.hash(password, 12)
    const userInviteCode = `SX${Math.random().toString(36).substring(2,8).toUpperCase()}`

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert({
        email: email.toLowerCase(),
        password_hash,
        full_name,
        invite_code: userInviteCode,
        referred_by: code.created_by || null,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: 'Registration failed' }, { status: 500 })

    // Mark invite code used
    await supabaseAdmin
      .from('invite_codes')
      .update({ used_by: user.id, used_at: new Date().toISOString() })
      .eq('code', invite_code.toUpperCase())

    // Welcome email
    await sendEmail({
      to: email,
      subject: 'Welcome to SpaceX Stocks',
      title: 'Welcome to the Mission.',
      body: `Hello ${full_name},<br><br>
You've been granted access to SpaceX Stocks — a private managed investment platform built around the most important company on earth.<br><br>
Your account is now active. Browse our investment plans, make your first deposit, and our team will begin trading on your behalf immediately.<br><br>
Your returns are paid out weekly. Your perks activate with your plan.<br><br>
If you have any questions, reply to this email or reach us at invest@spacestocks.finance.<br><br>
Welcome aboard.`,
      from: 'noreply@spacestocks.finance',
    })

    await pushover('New Member', `${full_name} (${email}) just joined SpaceX Stocks`)

    const token = signToken({ id: user.id, email: user.email, role: user.role })
    return NextResponse.json({ token, user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role } })
  }

  // LOGIN
  if (action === 'login') {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    const token = signToken({ id: user.id, email: user.email, role: user.role })
    return NextResponse.json({ token, user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role } })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

// GET /api/auth — return current user
export async function GET(request) {
  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
    balance: user.balance,
    withdrawal_balance: user.withdrawal_balance,
    total_profit: user.total_profit,
    total_deposited: user.total_deposited,
    kyc_verified: user.kyc_verified,
    invite_code: user.invite_code,
  })
}
