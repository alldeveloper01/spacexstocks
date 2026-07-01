export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0
import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req) {
  try {
    const admin = await getUserFromRequest(req)
    if (!admin || admin.role !== 'admin') return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { data } = await supabaseAdmin
      .from('site_settings')
      .select('*')

    return Response.json({ settings: data || [] })
  } catch (error) {
    console.error('Settings get error:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function PUT(req) {
  try {
    const admin = await getUserFromRequest(req)
    if (!admin || admin.role !== 'admin') return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { key, value } = await req.json()
    if (!key || value === undefined) return Response.json({ error: 'Missing key or value' }, { status: 400 })

    await supabaseAdmin
      .from('site_settings')
      .upsert({ key, value: String(value) }, { onConflict: 'key' })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Settings put error:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}