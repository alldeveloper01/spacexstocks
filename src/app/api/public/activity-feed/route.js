export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'

const TRON_API_KEY = 'c6bfe543-8567-4cb4-8719-45779c1eb316'
const MIN = 500
const MAX = 5000

function timeAgo(ts) {
  const secs = Math.floor((Date.now() - ts) / 1000)
  if (secs < 60) return `${secs}s ago`
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
  return `${Math.floor(secs / 3600)}h ago`
}

async function fetchUSDT() {
  try {
    const res = await fetch(
      'https://apilist.tronscanapi.com/api/token_trc20/transfers?limit=20&token=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t&start=0',
      { headers: { 'TRON-PRO-API-KEY': TRON_API_KEY } }
    )
    const data = await res.json()
    return (data.token_transfers || [])
      .map(tx => ({
        txid: tx.transaction_id,
        amount: (tx.quant / 1_000_000).toFixed(2),
        currency: 'USDT',
        chain: 'TRC-20',
        explorer: `https://tronscan.org/#/transaction/${tx.transaction_id}`,
        time_ago: timeAgo(tx.block_ts),
        ts: tx.block_ts
      }))
      .filter(e => Number(e.amount) >= MIN && Number(e.amount) <= MAX)
      .slice(0, 5)
  } catch { return [] }
}

async function fetchTRX() {
  try {
    const res = await fetch(
      'https://apilist.tronscanapi.com/api/transfer?limit=20&start=0',
      { headers: { 'TRON-PRO-API-KEY': TRON_API_KEY } }
    )
    const data = await res.json()
    return (data.data || [])
      .map(tx => ({
        txid: tx.transactionHash,
        amount: (tx.amount / 1_000_000).toFixed(2),
        currency: 'TRX',
        chain: 'TRON',
        explorer: `https://tronscan.org/#/transaction/${tx.transactionHash}`,
        time_ago: timeAgo(tx.timestamp),
        ts: tx.timestamp
      }))
      .filter(e => Number(e.amount) >= MIN && Number(e.amount) <= MAX)
      .slice(0, 3)
  } catch { return [] }
}

async function fetchETH() {
  try {
    const res = await fetch('https://eth.llamarpc.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', method: 'eth_getBlockByNumber',
        params: ['latest', true], id: 1
      })
    })
    const data = await res.json()
    const txs = (data.result?.transactions || []).slice(0, 20)
    const ts = parseInt(data.result?.timestamp, 16) * 1000

    const priceRes = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
    )
    const ethPrice = (await priceRes.json())?.ethereum?.usd || 3000

    return txs
      .map(tx => {
        const usd = (parseInt(tx.value, 16) / 1e18) * ethPrice
        return {
          txid: tx.hash,
          amount: usd.toFixed(2),
          currency: 'ETH',
          chain: 'Ethereum',
          explorer: `https://etherscan.io/tx/${tx.hash}`,
          time_ago: timeAgo(ts),
          ts
        }
      })
      .filter(e => Number(e.amount) >= MIN && Number(e.amount) <= MAX)
      .slice(0, 3)
  } catch { return [] }
}

async function fetchBNB() {
  try {
    const res = await fetch('https://bsc-dataseed.binance.org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', method: 'eth_getBlockByNumber',
        params: ['latest', true], id: 1
      })
    })
    const data = await res.json()
    const txs = (data.result?.transactions || []).slice(0, 20)
    const ts = parseInt(data.result?.timestamp, 16) * 1000

    const priceRes = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd'
    )
    const bnbPrice = (await priceRes.json())?.binancecoin?.usd || 400

    return txs
      .map(tx => {
        const usd = (parseInt(tx.value, 16) / 1e18) * bnbPrice
        return {
          txid: tx.hash,
          amount: usd.toFixed(2),
          currency: 'BNB',
          chain: 'BSC',
          explorer: `https://bscscan.com/tx/${tx.hash}`,
          time_ago: timeAgo(ts),
          ts
        }
      })
      .filter(e => Number(e.amount) >= MIN && Number(e.amount) <= MAX)
      .slice(0, 3)
  } catch { return [] }
}

async function fetchBTC() {
  try {
    const res = await fetch(
      'https://api.blockchair.com/bitcoin/transactions?limit=10&s=id(desc)'
    )
    const data = await res.json()

    const priceRes = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
    )
    const btcPrice = (await priceRes.json())?.bitcoin?.usd || 65000

    return (data.data || [])
      .map(tx => {
        const usd = (tx.output_total / 1e8) * btcPrice
        return {
          txid: tx.hash,
          amount: usd.toFixed(2),
          currency: 'BTC',
          chain: 'Bitcoin',
          explorer: `https://blockchair.com/bitcoin/transaction/${tx.hash}`,
          time_ago: timeAgo(new Date(tx.time + 'Z').getTime()),
          ts: new Date(tx.time + 'Z').getTime()
        }
      })
      .filter(e => Number(e.amount) >= MIN && Number(e.amount) <= MAX)
      .slice(0, 3)
  } catch { return [] }
}

export async function GET() {
  try {
    const [usdt, trx, eth, bnb, btc] = await Promise.all([
      fetchUSDT(),
      fetchTRX(),
      fetchETH(),
      fetchBNB(),
      fetchBTC(),
    ])

    const entries = [...usdt, ...trx, ...eth, ...bnb, ...btc]
      .sort((a, b) => b.ts - a.ts)
      .slice(0, 10)

    return NextResponse.json({ entries })
  } catch (err) {
    console.error('Activity feed error:', err.message)
    return NextResponse.json({ entries: [] })
  }
}