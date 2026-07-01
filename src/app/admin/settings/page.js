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
  section: { fontSize: 8, letterSpacing: '0.4em', color: 'rgba(255,255,255,0.18)', textTransform: 'uppercase', marginBottom: 12, marginTop: 28, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.05)' },
  card: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '24px 22px', borderTop: '2px solid #C0C0C0', marginBottom: 16 },
  label: { fontSize: 7, letterSpacing: '0.32em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: 8, display: 'block' },
  input: { width: '100%', background: '#000', border: '1px solid rgba(255,255,255,0.1)', padding: '11px 14px', fontFamily: "'Courier New',monospace", fontSize: 14, color: '#fff', outline: 'none', boxSizing: 'border-box' },
  hint: { fontSize: 8, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em', marginTop: 6 },
  btn: { background: '#fff', color: '#000', border: 'none', padding: '10px 24px', fontFamily: "'Courier New',monospace", fontSize: 8, letterSpacing: '0.35em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 700, marginTop: 12 },
  msg: { fontSize: 9, color: '#C0C0C0', letterSpacing: '0.1em', marginTop: 10, padding: '8px 12px', border: '1px solid rgba(192,192,192,0.15)' },
  err: { fontSize: 9, color: 'rgba(255,80,80,0.7)', letterSpacing: '0.1em', marginTop: 10, padding: '8px 12px', border: '1px solid rgba(255,80,80,0.2)' },
}

function SettingCard({ label, hint, value, onChange, onSave, loading, msg, err, placeholder, type = 'number' }) {
  return (
    <div style={S.card}>
      <label style={S.label}>{label}</label>
      <input style={S.input} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      {hint && <div style={S.hint}>{hint}</div>}
      {msg && <div style={S.msg}>{msg}</div>}
      {err && <div style={S.err}>{err}</div>}
      <button style={S.btn} disabled={loading} onClick={onSave}>Save</button>
    </div>
  )
}

export default function AdminSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [minDeposit, setMinDeposit] = useState('50')
  const [minWithdrawal, setMinWithdrawal] = useState('50')
  const [feedMin, setFeedMin] = useState('500')
  const [feedMax, setFeedMax] = useState('5000')
  const [poolSize, setPoolSize] = useState('2400000000')

  const [msgs, setMsgs] = useState({})
  const [errs, setErrs] = useState({})

  useEffect(() => {
    fetch('/api/admin/settings', { headers: authHeaders() })
      .then(r => r.json())
      .then(d => {
        const settings = d.settings || []
        const get = key => settings.find(s => s.key === key)?.value
        if (get('min_deposit')) setMinDeposit(get('min_deposit'))
        if (get('min_withdrawal')) setMinWithdrawal(get('min_withdrawal'))
        if (get('feed_min_amount')) setFeedMin(get('feed_min_amount'))
        if (get('feed_max_amount')) setFeedMax(get('feed_max_amount'))
        if (get('pool_size')) setPoolSize(get('pool_size'))
      })
  }, [])

  async function save(key, value) {
    setMsgs(m => ({ ...m, [key]: '' }))
    setErrs(e => ({ ...e, [key]: '' }))
    if (!value || isNaN(Number(value)) || Number(value) < 0) {
      setErrs(e => ({ ...e, [key]: 'Please enter a valid amount' }))
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
      if (data.success) setMsgs(m => ({ ...m, [key]: 'Saved successfully' }))
      else setErrs(e => ({ ...e, [key]: data.error || 'Failed' }))
    } catch { setErrs(e => ({ ...e, [key]: 'Something went wrong' })) }
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
        <div style={S.sub}>Configure platform amounts and display values</div>

        <div style={S.section}>Transaction Limits</div>

        <SettingCard
          label="Minimum Deposit Amount (USD)"
          hint={`Users cannot deposit below this amount. Current: $${minDeposit}`}
          value={minDeposit}
          onChange={setMinDeposit}
          onSave={() => save('min_deposit', minDeposit)}
          loading={loading}
          msg={msgs['min_deposit']}
          err={errs['min_deposit']}
          placeholder="50"
        />

        <SettingCard
          label="Minimum Withdrawal Amount (USD)"
          hint={`Users cannot withdraw below this amount. Current: $${minWithdrawal}`}
          value={minWithdrawal}
          onChange={setMinWithdrawal}
          onSave={() => save('min_withdrawal', minWithdrawal)}
          loading={loading}
          msg={msgs['min_withdrawal']}
          err={errs['min_withdrawal']}
          placeholder="20"
        />

        <div style={S.section}>Activity Feed</div>

        <SettingCard
          label="Feed — Minimum Deposit Amount (USD)"
          hint={`Deposits shown in the live feed will be no lower than this. Current: $${feedMin}`}
          value={feedMin}
          onChange={setFeedMin}
          onSave={() => save('feed_min_amount', feedMin)}
          loading={loading}
          msg={msgs['feed_min_amount']}
          err={errs['feed_min_amount']}
          placeholder="500"
        />

        <SettingCard
          label="Feed — Maximum Deposit Amount (USD)"
          hint={`Deposits shown in the live feed will be no higher than this. Current: $${feedMax}`}
          value={feedMax}
          onChange={setFeedMax}
          onSave={() => save('feed_max_amount', feedMax)}
          loading={loading}
          msg={msgs['feed_max_amount']}
          err={errs['feed_max_amount']}
          placeholder="5000"
        />

        <div style={S.section}>Landing Page</div>

        <SettingCard
          label="Funds Under Management (USD)"
          hint={`Displayed as "$X.XB+ Under Management" on the landing page. Current: $${Number(poolSize).toLocaleString()}`}
          value={poolSize}
          onChange={setPoolSize}
          onSave={() => save('pool_size', poolSize)}
          loading={loading}
          msg={msgs['pool_size']}
          err={errs['pool_size']}
          placeholder="2400000000"
        />
      </main>
    </div>
  )
}