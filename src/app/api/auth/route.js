export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase'
import { signToken, getUserFromRequest } from '@/lib/auth'
import { sendEmail, buildEmailTemplate } from '@/lib/email'
import { pushover } from '@/lib/pushover'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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

    const { data: code } = await supabaseAdmin
      .from('invite_codes')
      .select('*')
      .eq('code', invite_code.toUpperCase())
      .is('used_by', null)
      .single()

    if (!code) {
      return NextResponse.json({ error: 'Invalid or already used invitation code' }, { status: 400 })
    }

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

    const { count } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })

    const memberNumber = String(Math.floor(Math.random() * 900000) + 100000)

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert({
        email: email.toLowerCase(),
        password_hash,
        full_name,
        invite_code: userInviteCode,
        referred_by: code.created_by || null,
        member_number: memberNumber,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: 'Registration failed' }, { status: 500 })

    await supabaseAdmin
      .from('invite_codes')
      .update({ used_by: user.id, used_at: new Date().toISOString() })
      .eq('code', invite_code.toUpperCase())

    await sendEmail({
      to: email,
      subject: 'Welcome to SpaceX Stocks',
      title: 'Welcome to the Mission.',
      body: `Hello ${full_name},<br><br>
You've been granted access to SpaceX Stocks — a private managed investment platform built around the most important company on earth.<br><br>
Your account is now active. Browse our investment plans, make your first deposit, and our team will begin trading on your behalf immediately.<br><br>
Your returns are paid out weekly. Your perks activate with your plan.<br><br>
If you have any questions, reply to this email or reach us at <a href="mailto:invest@spacestocks.finance" style="color:#ffffff;text-decoration:none;">invest@spacestocks.finance</a>.<br><br>
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

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    await supabaseAdmin
      .from('users')
      .update({ otp_code: otp, otp_expires_at: expires })
      .eq('id', user.id)

    await resend.emails.send({
      from: 'SpaceX Stocks <noreply@spacestocks.finance>',
      to: email,
      subject: 'Your login verification code',
      html: buildEmailTemplate({
        title: 'Verification Code',
        body: `Hi ${user.full_name},<br><br>
Enter the code below to complete your login to SpaceX Stocks.<br><br>
<div style="font-size:48px;font-weight:700;letter-spacing:16px;color:#ffffff;margin:32px 0;font-family:'Courier New',monospace;text-align:center;background-color:#0a0a0a;padding:24px;border:1px solid #1a1a1a;">${otp}</div>
This code expires in <span style="color:#ffffff;font-weight:700;">10 minutes</span>. Do not share it with anyone.<br><br>
If you did not request this code, please ignore this email.`
      })
    })

    return NextResponse.json({ success: true, requires_otp: true })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

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
    member_number: user.member_number,
    member_since: user.created_at,
    active_tier: user.active_tier,
  })
}