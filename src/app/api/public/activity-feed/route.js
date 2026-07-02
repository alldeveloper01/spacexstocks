export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const TRON_API_KEY = 'c6bfe543-8567-4cb4-8719-45779c1eb316'

function timeAgo(ts) {
  const secs = Math.floor((Date.now() - ts) / 1000)
  if (secs < 60) return `${secs}s ago`
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`
  return `${Math.floor(secs / 86400)}d ago`
}

async function getSettings() {
  try {
    const { data } = await supabaseAdmin
      .from('site_settings')
      .select('key, value')
      .in('key', ['feed_min_amount', 'feed_max_amount'])
    const min = Number(data?.find(s => s.key === 'feed_min_amount')?.value || 500)
    const max = Number(data?.find(s => s.key === 'feed_max_amount')?.value || 5000)
    return { min, max }
  } catch {
    return { min: 500, max: 5000 }
  }
}

async function getTodayCount() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const { count } = await supabaseAdmin
    .from('blockchain_activity')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString())
  return count || 0
}

function getDailyLimit() {
  // Randomize daily limit between 10-30 but keep it consistent for the day
  const seed = new Date().toDateString()
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = ((hash << 5) - hash) + seed.charCodeAt(i)
  return 10 + Math.abs(hash % 21) // 10-30
}

async function saveNew(entries) {
  if (!entries.length) return
  await supabaseAdmin
    .from('blockchain_activity')
    .upsert(
      entries.map(e => ({
        txid: e.txid,
        currency: e.currency,
        chain: e.chain,
        amount: e.amount,
        type: e.type,
        explorer: e.explorer,
        ts: e.ts,
      })),
      { onConflict: 'txid', ignoreDuplicates: true }
    )
}

// DEPOSIT sources: USDT TRC20, TRX, BTC
async function fetchUSDT(min, max) {
  try {
    const res = await fetch(
      'https://apilist.tronscanapi.com/api/token_trc20/transfers?limit=50&token=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t&start=0',
      { headers: { 'TRON-PRO-API-KEY': TRON_API_KEY } }
    )
    const data = await res.json()
    return (data.token_transfers || [])
      .map(tx => ({
        txid: tx.transaction_id,
        amount: (tx.quant / 1_000_000).toFixed(2),
        currency: 'USDT',
        chain: 'TRC-20',
        type: 'deposit',
        explorer: `https://tronscan.org/#/transaction/${tx.transaction_id}`,
        time_ago: timeAgo(tx.block_ts),
        ts: tx.block_ts
      }))
      .filter(e => Number(e.amount) >= min && Number(e.amount) <= max)
      .slice(0, 4)
  } catch { return [] }
}

async function fetchTRX(min, max) {
  try {
    const res = await fetch(
      'https://apilist.tronscanapi.com/api/transfer?limit=50&start=0',
      { headers: { 'TRON-PRO-API-KEY': TRON_API_KEY } }
    )
    const data = await res.json()
    return (data.data || [])
      .map(tx => ({
        txid: tx.transactionHash,
        amount: (tx.amount / 1_000_000).toFixed(2),
        currency: 'TRX',
        chain: 'TRON',
        type: 'deposit',
        explorer: `https://tronscan.org/#/transaction/${tx.transactionHash}`,
        time_ago: timeAgo(tx.timestamp),
        ts: tx.timestamp
      }))
      .filter(e => Number(e.amount) >= min && Number(e.amount) <= max)
      .slice(0, 3)
  } catch { return [] }
}

async function fetchBTC(min, max) {
  try {
    const res = await fetch('https://api.blockchair.com/bitcoin/transactions?limit=20&s=id(desc)')
    const data = await res.json()
    const priceRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
    const btcPrice = (await priceRes.json())?.bitcoin?.usd || 65000
    return (data.data || [])
      .map(tx => {
        const usd = (tx.output_total / 1e8) * btcPrice
        return {
          txid: tx.hash,
          amount: usd.toFixed(2),
          currency: 'BTC',
          chain: 'Bitcoin',
          type: 'deposit',
          explorer: `https://blockchair.com/bitcoin/transaction/${tx.hash}`,
          time_ago: timeAgo(new Date(tx.time + 'Z').getTime()),
          ts: new Date(tx.time + 'Z').getTime()
        }
      })
      .filter(e => Number(e.amount) >= min && Number(e.amount) <= max)
      .slice(0, 3)
  } catch { return [] }
}

// WITHDRAWAL sources: ETH, BNB, SOL — completely different chains
async function fetchETH(min, max) {
  try {
    const blockRes = await fetch('https://eth.llamarpc.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_getBlockByNumber', params: ['latest', true], id: 1 })
    })
    const blockData = await blockRes.json()
    const txs = (blockData.result?.transactions || []).slice(0, 50)
    const ts = parseInt(blockData.result?.timestamp, 16) * 1000
    const priceRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
    const ethPrice = (await priceRes.json())?.ethereum?.usd || 3000
    return txs
      .map(tx => {
        const usd = (parseInt(tx.value, 16) / 1e18) * ethPrice
        return {
          txid: tx.hash,
          amount: usd.toFixed(2),
          currency: 'ETH',
          chain: 'Ethereum',
          type: 'withdrawal',
          explorer: `https://etherscan.io/tx/${tx.hash}`,
          time_ago: timeAgo(ts),
          ts
        }
      })
      .filter(e => Number(e.amount) >= min && Number(e.amount) <= max)
      .slice(0, 3)
  } catch { return [] }
}

async function fetchBNB(min, max) {
  try {
    const blockRes = await fetch('https://bsc-dataseed.binance.org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_getBlockByNumber', params: ['latest', true], id: 1 })
    })
    const blockData = await blockRes.json()
    const txs = (blockData.result?.transactions || []).slice(0, 50)
    const ts = parseInt(blockData.result?.timestamp, 16) * 1000
    const priceRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd')
    const bnbPrice = (await priceRes.json())?.binancecoin?.usd || 400
    return txs
      .map(tx => {
        const usd = (parseInt(tx.value, 16) / 1e18) * bnbPrice
        return {
          txid: tx.hash,
          amount: usd.toFixed(2),
          currency: 'BNB',
          chain: 'BSC',
          type: 'withdrawal',
          explorer: `https://bscscan.com/tx/${tx.hash}`,
          time_ago: timeAgo(ts),
          ts
        }
      })
      .filter(e => Number(e.amount) >= min && Number(e.amount) <= max)
      .slice(0, 3)
  } catch { return [] }
}

async function fetchSOL(min, max) {
  try {
    const priceRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd')
    const solPrice = (await priceRes.json())?.solana?.usd || 150
    const sigRes = await fetch('https://api.mainnet-beta.solana.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', id: 1, method: 'getSignaturesForAddress',
        params: ['So11111111111111111111111111111111111111112', { limit: 20 }]
      })
    })
    const sigData = await sigRes.json()
    const sigs = (sigData.result || []).slice(0, 10)
    return sigs
      .map((s, i) => {
        const seed = s.signature.slice(-8)
        let hash = 0
        for (let j = 0; j < seed.length; j++) hash = ((hash << 5) - hash) + seed.charCodeAt(j)
        const usd = min + Math.abs(hash % (max - min))
        return {
          txid: s.signature,
          amount: usd.toFixed(2),
          currency: 'SOL',
          chain: 'Solana',
          type: 'withdrawal',
          explorer: `https://solscan.io/tx/${s.signature}`,
          time_ago: timeAgo(Date.now() - i * 180000),
          ts: Date.now() - i * 180000
        }
      })
      .filter(e => Number(e.amount) >= min && Number(e.amount) <= max)
      .slice(0, 2)
  } catch { return [] }
}

async function shouldFetchNew() {
  const todayCount = await getTodayCount()
  const dailyLimit = getDailyLimit()
  if (todayCount >= dailyLimit) return false

  try {
    const { data } = await supabaseAdmin
      .from('site_settings')
      .select('value')
      .eq('key', 'activity_last_fetched')
      .maybeSingle()

    if (data?.value) {
      const lastFetch = new Date(data.value).getTime()
      const minGap = (30 + Math.random() * 60) * 60 * 1000
      if (Date.now() - lastFetch < minGap) return false
    }
  } catch {}

  return true
}

async function updateLastFetched() {
  await supabaseAdmin
    .from('site_settings')
    .upsert({ key: 'activity_last_fetched', value: new Date().toISOString() }, { onConflict: 'key' })
}

export async function GET() {
  try {
    const { min, max } = await getSettings()

    if (await shouldFetchNew()) {
      const dailyLimit = getDailyLimit()
      const todayCount = await getTodayCount()
      const remaining = dailyLimit - todayCount
      const batchSize = Math.min(remaining, Math.floor(Math.random() * 3) + 1)

      const [usdt, trx, btc, eth, bnb, sol] = await Promise.all([
        fetchUSDT(min, max),
        fetchTRX(min, max),
        fetchBTC(min, max),
        fetchETH(min, max),
        fetchBNB(min, max),
        fetchSOL(min, max),
      ])

      const fresh = [...usdt, ...trx, ...btc, ...eth, ...bnb, ...sol]
        .sort((a, b) => b.ts - a.ts)
        .slice(0, batchSize)

      if (fresh.length) {
        await saveNew(fresh)
        await updateLastFetched()
      }
    }

    // Pull platform deposits and save as activity
    try {
      const CHAIN_MAP = {
        usdttrc20: { currency: 'USDT', chain: 'TRC-20' },
        usdterc20: { currency: 'USDT', chain: 'Ethereum' },
        trx: { currency: 'TRX', chain: 'TRON' },
        btc: { currency: 'BTC', chain: 'Bitcoin' },
        eth: { currency: 'ETH', chain: 'Ethereum' },
        bnbbsc: { currency: 'BNB', chain: 'BSC' },
        sol: { currency: 'SOL', chain: 'Solana' },
        xrp: { currency: 'XRP', chain: 'Ripple' },
        ltc: { currency: 'LTC', chain: 'Litecoin' },
        usdcbsc: { currency: 'USDC', chain: 'BSC' },
        doge: { currency: 'DOGE', chain: 'Dogecoin' },
        maticpolygon: { currency: 'MATIC', chain: 'Polygon' },
      }
      const { data: recentDeposits } = await supabaseAdmin
        .from('deposits')
        .select('id, amount, currency, created_at, oxapay_track_id')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(20)
      if (recentDeposits?.length) {
        const depositEntries = recentDeposits.map(d => {
          const mapped = CHAIN_MAP[d.currency] || { currency: d.currency?.toUpperCase() || 'USDT', chain: 'TRC-20' }
          return {
            txid: d.oxapay_track_id || `dep_${d.id}`,
            currency: mapped.currency,
            chain: mapped.chain,
            amount: d.amount,
            type: 'deposit',
            explorer: d.oxapay_track_id ? `https://oxapay.com/transaction/${d.oxapay_track_id}` : null,
            ts: new Date(d.created_at).getTime(),
          }
        })
        await saveNew(depositEntries)
      }
    } catch {}

    // Always return from database
    const { data: entries } = await supabaseAdmin
      .from('blockchain_activity')
      .select('*')
      .order('ts', { ascending: false })
      .limit(50)

    const result = (entries || []).map(e => ({
      ...e,
      time_ago: timeAgo(e.ts)
    }))

    return NextResponse.json({ entries: result })
  } catch (err) {
    console.error('Activity feed error:', err.message)
    return NextResponse.json({ entries: [] })
  }
}