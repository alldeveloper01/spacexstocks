export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getAdminFromRequest } from '@/lib/auth'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const TIER_ORDER = ['Bronze', 'Starter', 'Growth', 'Premium', 'Elite', 'Platinum']

export async function POST(request) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { subject, message, target_tier } = await request.json()

  const { data: allUsers } = await supabaseAdmin
    .from('users')
    .select('id, email, full_name')
    .eq('role', 'user')

  if (!allUsers) return NextResponse.json({ error: 'No users found' }, { status: 500 })

  let targets = allUsers

  if (target_tier !== 'all') {
    const requiredLevel = TIER_ORDER.indexOf(target_tier)
    const { data: investments } = await supabaseAdmin
      .from('user_investments')
      .select('user_id, investment_plans(name)')
      .eq('status', 'active')

    const qualifiedIds = new Set(
      (investments || [])
        .filter(inv => TIER_ORDER.indexOf(inv.investment_plans?.name) >= requiredLevel)
        .map(inv => inv.user_id)
    )
    targets = allUsers.filter(u => qualifiedIds.has(u.id))
  }

  await supabaseAdmin.from('broadcasts').insert({
    subject, message, target_tier, sent_by: admin.id
  })

  let sent = 0
  for (const u of targets) {
    try {
      await resend.emails.send({
        from: 'SpaceX Stocks <noreply@spacexstocks.finance>',
        to: u.email,
        subject,
        html: `
          <div style="background:#000;color:#fff;font-family:sans-serif;padding:40px;max-width:560px;margin:auto;border:1px solid #222;border-radius:12px">
            <h2 style="color:#C0C0C0;margin-bottom:16px">${subject}</h2>
            <p style="color:#ccc;line-height:1.7;white-space:pre-line">${message}</p>
            <hr style="border-color:#222;margin:32px 0"/>
            <p style="color:#555;font-size:12px">SpaceX Stocks · spacexstocks.finance</p>
          </div>
        `
      })
      sent++
    } catch (_) {}
  }

  return NextResponse.json({ success: true, count: sent })
}