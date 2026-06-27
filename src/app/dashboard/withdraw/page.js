'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const S = {
  wrap: { minHeight: '100vh', background: '#000', color: '#fff', fontFamily: "'Courier New',monospace" },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 28px', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  logo: { fontSize: 11, letterSpacing: '0.45em', color: '#fff', textTransform: 'uppercase' },
  back: { fontSize: 9, letterSpacing: '0.28em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit' },
  main: { maxWidth: 520, margin: '0 auto', padding: '40px 20px' },
  title: { fontSize: 'clamp(22px,3vw,32px)', fontWeight: 400, marginBottom: 6, letterSpacing: '-0.01em' },
  sub: { fontSize: 9, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', marginBottom: 36 },
  balBox: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', padding: '18px 20px', marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  balLabel: { fontSize: 8, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', marginBottom: 6 },
  balVal: { fontSize: 24, letterSpacing: '-0.02em' },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  label: { fontSize: 8, letterSpacing: '0.38em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', marginBottom: 6, display: 'block' },
  input: { width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', padding: '13px 16px', color: '#fff', fontFamily: "'Courier New',monospace", fontSize: 13, outline: 'none', letterSpacing: '0.06em' },
  info: { fontSize: 9, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.28)', lineHeight: 1.8, padding: '10px 14px', border: '1px solid rgba(255,255,255,0.06)' },
  btn: { background: '#fff', color: '#000', border: 'none', padding: 14, fontFamily: "'Courier New',monospace", fontSize: 10, letterSpacing: '0.35em', cursor: 'pointer', fontWeight: 700, textTransform: 'uppercase' },
  err: { color: 'rgba(255,80,80,0.7)', fontSize: 9, letterSpacing: '0.15em' },
  histHead: { fontSize: 8, letterSpacing: '0.4em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', margin: '36px 0 14px' },
  histRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  badge: (s) => ({ fontSize: 7, letterSpacing: '0.28em', padding: '3px 10px', textTransform: 'uppercase', background: s === 'approved' ? 'rgba(255,255,255,0.06)' : s === 'rejected' ? 'rgba(255,80,80,0.08)' : 'rgba(255,255,255,0.03)', color: s === 'approved' ? 'rgba(255,255,255,0.6)' : s === 'rejected' ? 'rgba(255,80,80,0.5)' : 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.06)' }),
}

export default function WithdrawPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [amount, setAmount] = useState('')
  const [wallet, setWallet] = useState('')
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const token = typeof window !== 'undefined' ? localStorage.getItem('sx_token') : null

  useEffect(() => {
    if (!token) { router.push('/login'); return }
    fetch('/api/auth', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(setUser)
    fetch('/api/withdraw', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => setHistory(d.withdrawals || []))
  }, [])

  const handleWithdraw = async () => {
    setError('')
    const amt = parseFloat(amount)
    if (!amt || amt < 20) { setError('Minimum withdrawal is $20'); return }
    if (!wallet) { setError('Wallet address required'); return }
    if (user?.withdrawal_balance < amt) { setError('Insufficient withdrawal balance'); return }
    setLoading(true)
    try {
      const r = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: amt, wallet_address: wallet, currency: 'TRX' }),
      })
      const d = await r.json()
      if (d.error) { setError(d.error); setLoading(false); return }
      setSuccess(true)
      setAmount(''); setWallet('')
      setUser(u => ({ ...u, withdrawal_balance: u.withdrawal_balance - amt }))
    } catch { setError('Something went wrong') }
    setLoading(false)
  }

  return (
    <div style={S.wrap}>
      <nav style={S.nav}>
        <div style={S.logo}>SpaceX Stocks</div>
        <button style={S.back} onClick={() => router.push('/dashboard')}>← Dashboard</button>
      </nav>
      <main style={S.main}>
        <div style={S.title}>Withdraw Funds</div>
        <div style={S.sub}>Withdrawals processed within 24 hours</div>

        <div style={S.balBox}>
          <div>
            <div style={S.balLabel}>Withdrawal Balance</div>
            <div style={S.balVal}>${(user?.withdrawal_balance || 0).toLocaleString()}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={S.balLabel}>Total Earned</div>
            <div style={{ fontSize: 16, letterSpacing: '-0.01em' }}>${(user?.total_profit || 0).toLocaleString()}</div>
          </div>
        </div>

        {success && (
          <div style={{ ...S.info, marginBottom: 20, color: 'rgba(255,255,255,0.5)' }}>
            ✓ Withdrawal request submitted. You will receive a confirmation email within 24 hours.
          </div>
        )}

        <div style={S.form}>
          <div>
            <label style={S.label}>Amount (USD)</label>
            <input style={S.input} type="number" placeholder="Min $20" value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
          <div>
            <label style={S.label}>TRX Wallet Address</label>
            <input style={S.input} type="text" placeholder="Your TRX wallet address" value={wallet} onChange={e => setWallet(e.target.value)} />
          </div>
          <div style={S.info}>
            Withdrawals are sent in TRX (TRON network). Processing time: up to 24 hours. Minimum: $20.
          </div>
          {error && <div style={S.err}>{error}</div>}
          <button style={S.btn} onClick={handleWithdraw} disabled={loading || !user?.withdrawal_balance}>
            {loading ? 'Submitting...' : 'Request Withdrawal →'}
          </button>
        </div>

        {history.length > 0 && (
          <>
            <div style={S.histHead}>Withdrawal History</div>
            {history.map(w => (
              <div key={w.id} style={S.histRow}>
                <div>
                  <div style={{ fontSize: 12 }}>${w.amount.toLocaleString()}</div>
                  <div style={{ fontSize: 8, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.2)', marginTop: 3 }}>{new Date(w.created_at).toLocaleDateString()}</div>
                </div>
                <div style={S.badge(w.status)}>{w.status}</div>
              </div>
            ))}
          </>
        )}
      </main>
    </div>
  )
}
