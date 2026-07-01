export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const { data } = await supabaseAdmin
      .from('site_settings')
      .select('key, value')
      .in('key', ['min_deposit', 'min_withdrawal'])

    const settings = {}
    ;(data || []).forEach(s => { settings[s.key] = Number(s.value) })

    return Response.json({ 
      min_deposit: settings.min_deposit || 50,
      min_withdrawal: settings.min_withdrawal || 20
    })
  } catch {
    return Response.json({ min_deposit: 50, min_withdrawal: 20 })
  }
}