export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch(
      'https://query1.finance.yahoo.com/v8/finance/chart/SPCX?interval=1m&range=1d',
      { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 60 } }
    )
    const data = await res.json()
    const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice
    const prev = data?.chart?.result?.[0]?.meta?.chartPreviousClose
    const ipo = 135

    if (!price) throw new Error('No price')

    return NextResponse.json({
      price: price.toFixed(2),
      prev_close: prev?.toFixed(2),
      ipo_price: ipo,
      change_pct: (((price - prev) / prev) * 100).toFixed(2),
      ipo_change_pct: (((price - ipo) / ipo) * 100).toFixed(2),
      ticker: 'SPCX',
    })
  } catch (e) {
    return NextResponse.json({
      price: '153.23',
      prev_close: '153.00',
      ipo_price: 135,
      change_pct: '0.15',
      ipo_change_pct: '13.50',
      ticker: 'SPCX',
      fallback: true,
    })
  }
}