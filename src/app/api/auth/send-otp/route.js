export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  const { email } = await request.json()

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id, full_name')
    .eq('email', email)
    .single()

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

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
    html: `
      <div style="background:#000;color:#fff;font-family:sans-serif;padding:40px;max-width:480px;margin:auto;border:1px solid #222;border-radius:12px">
        <h2 style="color:#C0C0C0;margin-bottom:8px">Verification Code</h2>
        <p style="color:#aaa;margin-bottom:24px">Hi ${user.full_name}, enter this code to complete your login.</p>
        <div style="font-size:42px;font-weight:bold;letter-spacing:12px;color:#fff;margin:24px 0">${otp}</div>
        <p style="color:#555;font-size:12px">This code expires in 10 minutes. Do not share it.</p>
      </div>
    `
  })

  return NextResponse.json({ success: true })
}