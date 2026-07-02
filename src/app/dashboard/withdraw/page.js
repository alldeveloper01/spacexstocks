'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const WITHDRAW_CURRENCIES = [
  { id: 'TRX', name: 'Tron', network: 'TRON', placeholder: 'T... (TRC20 address)', color: '#FF0013' },
  { id: 'USDT', name: 'USDT TRC20', network: 'TRC20', placeholder: 'T... (TRC20 address)', color: '#26A17B' },
  { id: 'BTC', name: 'Bitcoin', network: 'Bitcoin', placeholder: 'bc1... or 1... or 3...', color: '#F7931A' },
  { id: 'ETH', name: 'Ethereum', network: 'ERC20', placeholder: '0x... (ERC20 address)', color: '#627EEA' },
  { id: 'BNB', name: 'BNB Chain', network: 'BEP20', placeholder: '0x... (BEP20 address)', color: '#F3BA2F' },
  { id: 'SOL', name: 'Solana', network: 'Solana', placeholder: 'Sol... address', color: '#9945FF' },
  { id: 'XRP', name: 'XRP', network: 'Ripple', placeholder: 'r... (XRP address)', color: '#00AAE4' },
  { id: 'LTC', name: 'Litecoin', network: 'Litecoin', placeholder: 'L... or M... address', color: '#BFBBBB' },
]

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
  input: { width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', padding: '13px 16px', color: '#fff', fontFamily: "'Courier New',monospace", fontSize: 13, outline: 'none', letterSpacing: '0.06em', boxSizing: 'border-box' },
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
  const [currency, setCurrency] = useState('TRX')
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [minWithdraw, setMinWithdraw] = useState(20)

  const token = typeof window !== 'undefined' ? localStorage.getItem('sx_token') : null
  const selectedCurrency = WITHDRAW_CURRENCIES.find(c => c.id === currency)

  useEffect(() => {
    if (!token) { router.push('/login'); return }
    fetch('/api/auth', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(setUser)
    fetch('/api/withdraw', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => setHistory(d.withdrawals || []))
    fetch('/api/public/settings')
      .then(r => r.json())
      .then(d => { if (d.min_withdrawal) setMinWithdraw(d.min_withdrawal) })
      .catch(() => {})
  }, [])

  const handleWithdraw = async () => {
    setError('')
    const amt = parseFloat(amount)
    if (!amt || amt < minWithdraw) { setError(`Minimum withdrawal is $${minWithdraw}`); return }
    if (!wallet) { setError('Wallet address required'); return }
    if (user?.withdrawal_balance < amt) { setError('Insufficient withdrawal balance'); return }
    setLoading(true)
    try {
      const r = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: amt, wallet_address: wallet, currency }),
      })
      const d = await r.json()
      if (d.error) { setError(d.error); setLoading(false); return }
      setSuccess(true)
      setAmount(''); setWallet('')
      setUser(u => ({ ...u, withdrawal_balance: u.withdrawal_balance - amt }))
      fetch('/api/withdraw', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => setHistory(d.withdrawals || []))
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
            <input style={S.input} type="number" placeholder={`Min $${minWithdraw}`} value={amount} onChange={e => setAmount(e.target.value)} />
          </div>

          <div>
            <label style={S.label}>Select Currency</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
              {WITHDRAW_CURRENCIES.map(c => (
                <button key={c.id} onClick={() => { setCurrency(c.id); setWallet(''); setError('') }} style={{
                  padding: '10px 6px', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 5, cursor: 'pointer', transition: 'all 0.15s',
                  background: currency === c.id ? `${c.color}12` : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${currency === c.id ? c.color + '44' : 'rgba(255,255,255,0.07)'}`,
                }}>
                  <span style={{ fontSize: 7, letterSpacing: '0.15em', color: currency === c.id ? c.color : 'rgba(255,255,255,0.3)', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.5, fontFamily: "'Courier New',monospace" }}>
                    {c.id}
                  </span>
                  <span style={{ fontSize: 6, letterSpacing: '0.08em', color: currency === c.id ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.18)', textTransform: 'uppercase', textAlign: 'center', fontFamily: "'Courier New',monospace" }}>
                    {c.network}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={S.label}>{selectedCurrency?.name} Wallet Address</label>
            <input
              style={S.input}
              type="text"
              placeholder={selectedCurrency?.placeholder || 'Your wallet address'}
              value={wallet}
              onChange={e => setWallet(e.target.value)}
            />
          </div>

          <div style={S.info}>
            Withdrawal will be sent in <strong style={{ color: 'rgba(255,255,255,0.5)' }}>{selectedCurrency?.name}</strong> on the <strong style={{ color: 'rgba(255,255,255,0.5)' }}>{selectedCurrency?.network}</strong> network.
            Processing time: up to 24 hours. Minimum: ${minWithdraw}.
          </div>

          {(currency === 'ETH' || currency === 'BNB') && (
            <div style={{ background: 'rgba(255,160,0,0.04)', border: '1px solid rgba(255,160,0,0.15)', padding: '10px 14px', fontSize: 8, color: 'rgba(255,160,0,0.6)', letterSpacing: '0.08em', lineHeight: 1.9 }}>
              Note: {currency} withdrawals may take slightly longer due to network gas fees.
            </div>
          )}

          {error && <div style={S.err}>{error}</div>}

          <button style={{ ...S.btn, opacity: loading || !user?.withdrawal_balance ? 0.6 : 1 }} onClick={handleWithdraw} disabled={loading || !user?.withdrawal_balance}>
            {loading ? 'Submitting...' : `Withdraw via ${selectedCurrency?.name} →`}
          </button>
        </div>

        {history.length > 0 && (
          <>
            <div style={S.histHead}>Withdrawal History</div>
            {history.map(w => (
              <div key={w.id} style={S.histRow}>
                <div>
                  <div style={{ fontSize: 12 }}>${w.amount.toLocaleString()}</div>
                  <div style={{ fontSize: 8, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.2)', marginTop: 3 }}>
                    {w.currency || 'TRX'} · {new Date(w.created_at).toLocaleDateString()}
                  </div>
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