'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

function authHeaders() {
  const token = localStorage.getItem('sx_token')
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
}

const S = {
  wrap: { minHeight: '100vh', background: '#000', color: '#fff', fontFamily: "'Courier New',monospace" },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  logo: { fontSize: 10, letterSpacing: '0.4em', color: '#fff', textTransform: 'uppercase' },
  back: { fontSize: 8, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit' },
  main: { maxWidth: 600, margin: '0 auto', padding: '28px 16px' },
  title: { fontSize: 20, fontWeight: 400, marginBottom: 4, color: '#C0C0C0' },
  sub: { fontSize: 8, letterSpacing: '0.38em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', marginBottom: 24 },
  card: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '24px 22px', borderTop: '2px solid #C0C0C0', marginBottom: 16 },
  label: { fontSize: 7, letterSpacing: '0.32em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: 8, display: 'block' },
  input: { width: '100%', background: '#000', border: '1px solid rgba(255,255,255,0.1)', padding: '11px 14px', fontFamily: "'Courier New',monospace", fontSize: 14, color: '#fff', outline: 'none', boxSizing: 'border-box' },
  btn: { background: '#fff', color: '#000', border: 'none', padding: '10px 24px', fontFamily: "'Courier New',monospace", fontSize: 8, letterSpacing: '0.35em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 700, marginTop: 12 },
  msg: { fontSize: 9, color: '#C0C0C0', letterSpacing: '0.1em', marginTop: 10, padding: '8px 12px', border: '1px solid rgba(192,192,192,0.15)' },
  err: { fontSize: 9, color: 'rgba(255,80,80,0.7)', letterSpacing: '0.1em', marginTop: 10, padding: '8px 12px', border: '1px solid rgba(255,80,80,0.2)' },
}

export default function AdminSettingsPage() {
  const router = useRouter()
  const [minDeposit, setMinDeposit] = useState('50')
  const [minWithdrawal, setMinWithdrawal] = useState('50')
  const [depositMsg, setDepositMsg] = useState('')
  const [withdrawalMsg, setWithdrawalMsg] = useState('')
  const [depositErr, setDepositErr] = useState('')
  const [withdrawalErr, setWithdrawalErr] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings', { headers: authHeaders() })
      .then(r => r.json())
      .then(d => {
        const settings = d.settings || []
        const dep = settings.find(s => s.key === 'min_deposit')
        const wit = settings.find(s => s.key === 'min_withdrawal')
        if (dep) setMinDeposit(dep.value)
        if (wit) setMinWithdrawal(wit.value)
      })
  }, [])

  async function saveSetting(key, value, setMsg, setErr) {
    setMsg(''); setErr('')
    if (!value || isNaN(Number(value)) || Number(value) < 0) {
      setErr('Please enter a valid amount')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ key, value })
      })
      const data = await res.json()
      if (data.success) setMsg('Saved successfully')
      else setErr(data.error || 'Failed')
    } catch { setErr('Something went wrong') }
    setLoading(false)
  }

  return (
    <div style={S.wrap}>
      <nav style={S.nav}>
        <div style={S.logo}>SpaceX Stocks · Admin</div>
        <button style={S.back} onClick={() => router.push('/admin')}>← Dashboard</button>
      </nav>

      <main style={S.main}>
        <div style={S.title}>Platform Settings</div>
        <div style={S.sub}>Configure minimum amounts</div>

        {/* Min Deposit */}
        <div style={S.card}>
          <label style={S.label}>Minimum Deposit Amount (USD)</label>
          <input
            style={S.input}
            type="number"
            value={minDeposit}
            onChange={e => setMinDeposit(e.target.value)}
            placeholder="50"
          />
          <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em', marginTop: 6 }}>
            Users will not be able to deposit below this amount. Current: ${minDeposit}
          </div>
          {depositMsg && <div style={S.msg}>{depositMsg}</div>}
          {depositErr && <div style={S.err}>{depositErr}</div>}
          <button style={S.btn} disabled={loading} onClick={() => saveSetting('min_deposit', minDeposit, setDepositMsg, setDepositErr)}>
            Save
          </button>
        </div>

        {/* Min Withdrawal */}
        <div style={S.card}>
          <label style={S.label}>Minimum Withdrawal Amount (USD)</label>
          <input
            style={S.input}
            type="number"
            value={minWithdrawal}
            onChange={e => setMinWithdrawal(e.target.value)}
            placeholder="50"
          />
          <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em', marginTop: 6 }}>
            Users will not be able to withdraw below this amount. Current: ${minWithdrawal}
          </div>
          {withdrawalMsg && <div style={S.msg}>{withdrawalMsg}</div>}
          {withdrawalErr && <div style={S.err}>{withdrawalErr}</div>}
          <button style={S.btn} disabled={loading} onClick={() => saveSetting('min_withdrawal', minWithdrawal, setWithdrawalMsg, setWithdrawalErr)}>
            Save
          </button>
        </div>
      </main>
    </div>
  )
}