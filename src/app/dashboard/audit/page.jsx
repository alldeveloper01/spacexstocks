'use client'

import { useEffect, useState } from 'react'

const TYPE_LABELS = {
  deposit: 'Deposit',
  withdrawal: 'Withdrawal',
  return: 'Weekly Return',
  store: 'Store Purchase'
}

const TYPE_COLORS = {
  deposit: '#C0C0C0',
  withdrawal: 'rgba(255,80,80,0.8)',
  return: 'rgba(192,192,192,0.6)',
  store: 'rgba(255,200,0,0.7)'
}

const TYPE_ICONS = {
  deposit: '↑',
  withdrawal: '↓',
  return: '◈',
  store: '◇'
}

function authHeaders() {
  const token = localStorage.getItem('sx_token')
  return { 'Authorization': `Bearer ${token}` }
}

export default function AuditLogPage() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetch('/api/dashboard/audit', { headers: authHeaders() })
      .then(r => r.json())
      .then(d => { setEntries(d.entries || []); setLoading(false) })
  }, [])

  const filtered = filter === 'all' ? entries : entries.filter(e => e.type === filter)

  const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'deposit', label: 'Deposits' },
    { key: 'withdrawal', label: 'Withdrawals' },
    { key: 'return', label: 'Returns' },
    { key: 'store', label: 'Store' },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: "'Courier New',monospace", fontSize: 'clamp(18px,3vw,28px)', fontWeight: 400, color: '#fff', letterSpacing: '0.06em', marginBottom: 6 }}>
          Audit Log
        </div>
        <div style={{ fontFamily: "'Courier New',monospace", fontSize: 8, letterSpacing: '0.38em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase' }}>
          Your complete transaction history
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 24, background: 'rgba(255,255,255,0.02)', padding: 4, border: '1px solid rgba(255,255,255,0.04)', flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            padding: '8px 16px',
            background: filter === f.key ? 'rgba(192,192,192,0.1)' : 'transparent',
            border: 'none',
            borderBottom: filter === f.key ? '1px solid #C0C0C0' : '1px solid transparent',
            color: filter === f.key ? '#C0C0C0' : 'rgba(255,255,255,0.3)',
            fontFamily: "'Courier New',monospace",
            fontSize: 8, letterSpacing: '0.28em', textTransform: 'uppercase',
            cursor: 'pointer', transition: 'all 0.15s',
          }}>
            {f.label}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', fontFamily: "'Courier New',monospace", fontSize: 8, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.15)', textTransform: 'uppercase', padding: '8px 12px', display: 'flex', alignItems: 'center' }}>
          {filtered.length} Record{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {Array(5).fill(0).map((_, i) => (
            <div key={i} style={{ height: 64, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontFamily: "'Courier New',monospace", fontSize: 9, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.15)', textTransform: 'uppercase' }}>
            No transactions found
          </div>
        </div>
      ) : (
        <div style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr', gap: 0, padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
            {['Type', 'Details', 'Amount', 'Status'].map(h => (
              <div key={h} style={{ fontFamily: "'Courier New',monospace", fontSize: 7, letterSpacing: '0.38em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>
                {h}
              </div>
            ))}
          </div>

          {/* Rows */}
          {filtered.map((entry, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr',
              gap: 0, padding: '16px 20px',
              borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
              background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
              transition: 'background 0.15s',
            }}>
              {/* Type */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `${TYPE_COLORS[entry.type]}12`,
                  border: `1px solid ${TYPE_COLORS[entry.type]}22`,
                  fontFamily: "'Courier New',monospace", fontSize: 14,
                  color: TYPE_COLORS[entry.type], flexShrink: 0,
                }}>
                  {TYPE_ICONS[entry.type] || '·'}
                </div>
                <div style={{ fontFamily: "'Courier New',monospace", fontSize: 10, letterSpacing: '0.15em', color: TYPE_COLORS[entry.type] || '#fff', textTransform: 'uppercase' }}>
                  {TYPE_LABELS[entry.type] || entry.type}
                </div>
              </div>

              {/* Details */}
              <div>
                <div style={{ fontFamily: "'Courier New',monospace", fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em' }}>
                  {new Date(entry.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
                <div style={{ fontFamily: "'Courier New',monospace", fontSize: 8, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.06em', marginTop: 3 }}>
                  {new Date(entry.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  {entry.note && ` · ${entry.note}`}
                </div>
              </div>

              {/* Amount */}
              <div style={{ fontFamily: "'Courier New',monospace", fontSize: 14, letterSpacing: '-0.02em', color: '#fff' }}>
                ${Number(entry.amount).toLocaleString()}
              </div>

              {/* Status */}
              <div>
                <span style={{
                  fontFamily: "'Courier New',monospace",
                  fontSize: 7, letterSpacing: '0.28em', textTransform: 'uppercase',
                  padding: '3px 8px',
                  background: ['completed', 'paid', 'fulfilled', 'active'].includes(entry.status)
                    ? 'rgba(192,192,192,0.08)'
                    : entry.status === 'pending'
                    ? 'rgba(255,200,0,0.08)'
                    : 'rgba(255,80,80,0.08)',
                  color: ['completed', 'paid', 'fulfilled', 'active'].includes(entry.status)
                    ? 'rgba(192,192,192,0.7)'
                    : entry.status === 'pending'
                    ? 'rgba(255,200,0,0.7)'
                    : 'rgba(255,80,80,0.7)',
                  border: `1px solid ${['completed', 'paid', 'fulfilled', 'active'].includes(entry.status)
                    ? 'rgba(192,192,192,0.15)'
                    : entry.status === 'pending'
                    ? 'rgba(255,200,0,0.15)'
                    : 'rgba(255,80,80,0.15)'}`,
                }}>
                  {entry.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}