'use client'

import { useEffect, useState } from 'react'

const CURRENCY_COLORS = {
  USDT: '#26A17B',
  TRX: '#FF0013',
  BTC: '#F7931A',
  ETH: '#627EEA',
  BNB: '#F3BA2F',
  SOL: '#9945FF',
}

const CHAIN_LABELS = {
  'TRC-20': 'Tron Network',
  'TRON': 'Tron Network',
  'Ethereum': 'Ethereum',
  'BSC': 'BNB Chain',
  'Bitcoin': 'Bitcoin',
  'Solana': 'Solana',
}

function randomInterval() {
  // Random between 3-8 minutes in ms
  return (3 + Math.random() * 5) * 60 * 1000
}

export default function ActivityFeedPage() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [lastUpdated, setLastUpdated] = useState(null)
  const [pulse, setPulse] = useState(false)

  const fetchFeed = async () => {
    try {
      const res = await fetch('/api/public/activity-feed')
      const data = await res.json()
      setEntries(data.entries || [])
      setLastUpdated(new Date())
      setPulse(true)
      setTimeout(() => setPulse(false), 1000)
    } catch (_) {}
    setLoading(false)
  }

  useEffect(() => {
    fetchFeed()

    // Randomized polling interval
    let timeout
    const schedule = () => {
      timeout = setTimeout(() => {
        fetchFeed()
        schedule()
      }, randomInterval())
    }
    schedule()

    return () => clearTimeout(timeout)
  }, [])

  const deposits = entries.filter(e => e.type === 'deposit')
  const withdrawals = entries.filter(e => e.type === 'withdrawal')
  const displayed = filter === 'all' ? entries : filter === 'deposits' ? deposits : withdrawals

  const FILTERS = [
    { key: 'all', label: 'All', count: entries.length },
    { key: 'deposits', label: 'Deposits', count: deposits.length },
    { key: 'withdrawals', label: 'Withdrawals', count: withdrawals.length },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontFamily: "'Courier New',monospace", fontSize: 'clamp(18px,3vw,28px)', fontWeight: 400, color: '#fff', letterSpacing: '0.06em', marginBottom: 6 }}>
            Live Platform Activity
          </div>
          <div style={{ fontFamily: "'Courier New',monospace", fontSize: 8, letterSpacing: '0.38em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase' }}>
            Real blockchain transactions · Verified on-chain
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(192,192,192,0.04)', border: '1px solid rgba(192,192,192,0.1)', padding: '8px 14px' }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%', background: '#C0C0C0',
            boxShadow: pulse ? '0 0 8px #C0C0C0' : 'none',
            transition: 'box-shadow 0.3s',
          }} />
          <div style={{ fontFamily: "'Courier New',monospace", fontSize: 8, letterSpacing: '0.2em', color: 'rgba(192,192,192,0.6)', textTransform: 'uppercase' }}>
            {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Connecting...'}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: 'rgba(255,255,255,0.04)', marginBottom: 24 }}>
        {[
          { label: 'Total Transactions', value: entries.length },
          { label: 'Deposit Volume', value: deposits.length },
          { label: 'Withdrawal Volume', value: withdrawals.length },
        ].map((stat, i) => (
          <div key={i} style={{ background: '#000', padding: '16px 18px', borderTop: `2px solid ${i === 0 ? '#C0C0C0' : i === 1 ? 'rgba(192,192,192,0.5)' : 'rgba(255,255,255,0.15)'}` }}>
            <div style={{ fontFamily: "'Courier New',monospace", fontSize: 7, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: 8 }}>
              {stat.label}
            </div>
            <div style={{ fontFamily: "'Courier New',monospace", fontSize: 24, letterSpacing: '-0.02em', color: '#fff' }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 20, background: 'rgba(255,255,255,0.02)', padding: 4, border: '1px solid rgba(255,255,255,0.04)' }}>
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8,
            background: filter === f.key ? 'rgba(192,192,192,0.1)' : 'transparent',
            border: 'none',
            borderBottom: filter === f.key ? '1px solid #C0C0C0' : '1px solid transparent',
            color: filter === f.key ? '#C0C0C0' : 'rgba(255,255,255,0.3)',
            fontFamily: "'Courier New',monospace",
            fontSize: 8, letterSpacing: '0.28em', textTransform: 'uppercase',
            cursor: 'pointer', transition: 'all 0.15s',
          }}>
            {f.label}
            <span style={{
              fontSize: 7, padding: '1px 6px',
              background: filter === f.key ? 'rgba(192,192,192,0.15)' : 'rgba(255,255,255,0.06)',
              color: filter === f.key ? '#C0C0C0' : 'rgba(255,255,255,0.2)',
            }}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Transaction list */}
      {loading ? (
        <div style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          {Array(5).fill(0).map((_, i) => (
            <div key={i} style={{ height: 72, borderBottom: '1px solid rgba(255,255,255,0.03)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }} />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontFamily: "'Courier New',monospace", fontSize: 9, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.15)', textTransform: 'uppercase' }}>
            No transactions yet
          </div>
        </div>
      ) : (
        <div style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Header row */}
          <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr 1fr 120px', gap: 0, padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
            {['', 'Transaction', 'Network · Time', 'Amount'].map((h, i) => (
              <div key={i} style={{ fontFamily: "'Courier New',monospace", fontSize: 7, letterSpacing: '0.38em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>
                {h}
              </div>
            ))}
          </div>

          {displayed.map((entry, i) => (
            <div key={entry.id || i} style={{
              display: 'grid', gridTemplateColumns: '48px 1fr 1fr 120px',
              gap: 0, padding: '16px 20px',
              borderBottom: i < displayed.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
              background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
            }}>
              {/* Currency circle */}
              <div style={{
                width: 32, height: 32,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${CURRENCY_COLORS[entry.currency] || '#C0C0C0'}15`,
                border: `1px solid ${CURRENCY_COLORS[entry.currency] || '#C0C0C0'}30`,
                fontFamily: "'Courier New',monospace", fontSize: 7,
                letterSpacing: '0.1em', color: CURRENCY_COLORS[entry.currency] || '#C0C0C0',
                flexShrink: 0,
              }}>
                {entry.currency}
              </div>

              {/* Transaction info */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <div style={{ fontFamily: "'Courier New',monospace", fontSize: 10, color: '#fff', letterSpacing: '0.06em' }}>
                    Anonymous User
                  </div>
                  <span style={{
                    fontFamily: "'Courier New',monospace",
                    fontSize: 7, letterSpacing: '0.2em', textTransform: 'uppercase',
                    padding: '2px 6px',
                    background: entry.type === 'deposit' ? 'rgba(192,192,192,0.08)' : 'rgba(100,160,255,0.08)',
                    color: entry.type === 'deposit' ? 'rgba(192,192,192,0.7)' : 'rgba(100,160,255,0.7)',
                    border: `1px solid ${entry.type === 'deposit' ? 'rgba(192,192,192,0.15)' : 'rgba(100,160,255,0.15)'}`,
                  }}>
                    {entry.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                  </span>
                </div>
                <a href={entry.explorer} target="_blank" rel="noopener noreferrer" style={{
                  fontFamily: "'Courier New',monospace", fontSize: 8,
                  color: 'rgba(192,192,192,0.4)', letterSpacing: '0.06em',
                  textDecoration: 'none',
                }}>
                  Verify on-chain ↗
                </a>
              </div>

              {/* Network + time */}
              <div>
                <div style={{ fontFamily: "'Courier New',monospace", fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', marginBottom: 3 }}>
                  {CHAIN_LABELS[entry.chain] || entry.chain}
                </div>
                <div style={{ fontFamily: "'Courier New',monospace", fontSize: 8, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.06em' }}>
                  {entry.time_ago}
                </div>
              </div>

              {/* Amount */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: "'Courier New',monospace", fontSize: 14, letterSpacing: '-0.02em', color: '#fff' }}>
                  ${Number(entry.amount).toLocaleString()}
                </div>
                <div style={{ fontFamily: "'Courier New',monospace", fontSize: 8, color: 'rgba(255,255,255,0.2)', marginTop: 2 }}>
                  {entry.currency}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 16, fontFamily: "'Courier New',monospace", fontSize: 8, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.1)', textTransform: 'uppercase', textAlign: 'center' }}>
        All transactions pulled directly from blockchain networks · Anonymous display only
      </div>
    </div>
  )
}