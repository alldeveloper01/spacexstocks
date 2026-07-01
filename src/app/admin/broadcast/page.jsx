'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const TIERS = ['all', 'Bronze', 'Starter', 'Growth', 'Premium', 'Elite', 'Platinum']

function authHeaders() {
  const token = localStorage.getItem('sx_token')
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
}

const S = {
  wrap: { minHeight: '100vh', background: '#000', color: '#fff', fontFamily: "'Courier New',monospace" },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', gap: 12 },
  logo: { fontSize: 10, letterSpacing: '0.4em', color: '#fff', textTransform: 'uppercase' },
  back: { fontSize: 8, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit' },
  main: { maxWidth: 600, margin: '0 auto', padding: '28px 16px' },
  title: { fontSize: 20, fontWeight: 400, marginBottom: 4, color: '#C0C0C0' },
  sub: { fontSize: 8, letterSpacing: '0.38em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', marginBottom: 24 },
  card: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '24px 22px', borderTop: '2px solid #C0C0C0' },
  label: { fontSize: 7, letterSpacing: '0.32em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: 8, display: 'block' },
  input: { width: '100%', background: '#000', border: '1px solid rgba(255,255,255,0.1)', padding: '11px 14px', fontFamily: "'Courier New',monospace", fontSize: 12, color: '#fff', outline: 'none', boxSizing: 'border-box' },
  field: { marginBottom: 20 },
  btn: { width: '100%', background: '#fff', color: '#000', border: 'none', padding: '13px 0', fontFamily: "'Courier New',monospace", fontSize: 9, letterSpacing: '0.35em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 700 },
  msg: { fontSize: 9, color: '#C0C0C0', letterSpacing: '0.1em', marginBottom: 16, padding: '8px 14px', border: '1px solid rgba(192,192,192,0.15)' },
}

export default function BroadcastPage() {
  const router = useRouter()
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [tier, setTier] = useState('all')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const handleSend = async () => {
    if (!subject || !message) return
    setLoading(true)
    const res = await fetch('/api/admin/broadcast', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ subject, message, target_tier: tier }) })
    const data = await res.json()
    setLoading(false)
    setMsg(data.success ? `Broadcast sent to ${data.count} user(s).` : data.error || 'Failed.')
    if (data.success) { setSubject(''); setMessage('') }
    setTimeout(() => setMsg(''), 5000)
  }

  return (
    <div style={S.wrap}>
      <nav style={S.nav}>
        <div style={S.logo}>SpaceX Stocks · Admin</div>
        <button style={S.back} onClick={() => router.push('/admin')}>← Dashboard</button>
      </nav>

      <main style={S.main}>
        <div style={S.title}>Broadcast Message</div>
        <div style={S.sub}>Send updates to your members</div>

        {msg && <div style={S.msg}>{msg}</div>}

        <div style={S.card}>
          <div style={S.field}>
            <label style={S.label}>Target Audience</label>
            <select style={S.input} value={tier} onChange={e => setTier(e.target.value)}>
              {TIERS.map(t => (
                <option key={t} value={t}>{t === 'all' ? 'All Users' : `${t} tier and above`}</option>
              ))}
            </select>
          </div>

          <div style={S.field}>
            <label style={S.label}>Subject</label>
            <input style={S.input} value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Weekly Return Processed" />
          </div>

          <div style={S.field}>
            <label style={S.label}>Message</label>
            <textarea style={{ ...S.input, height: 160, resize: 'none' }} value={message} onChange={e => setMessage(e.target.value)} placeholder="Write your message here..." />
          </div>

          <button style={{ ...S.btn, opacity: loading || !subject || !message ? 0.5 : 1, cursor: loading || !subject || !message ? 'not-allowed' : 'pointer' }}
            onClick={handleSend} disabled={loading || !subject || !message}>
            {loading ? 'Sending...' : 'Send Broadcast'}
          </button>
        </div>
      </main>
    </div>
  )
}