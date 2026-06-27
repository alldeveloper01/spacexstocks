'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const CURRENCIES = ['USDT', 'BTC', 'ETH', 'TRX', 'LTC', 'XRP', 'MATIC', 'BNB']
const PLAN_COLORS = { Bronze: '#CD7F32', Starter: '#C9A84C', Growth: '#2196F3', Premium: '#9C27B0', Elite: '#FF9800', Platinum: '#4CAF50' }

const S = {
  wrap: { minHeight: '100vh', background: '#000', color: '#fff', fontFamily: "'Courier New',monospace" },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 28px', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  logo: { fontSize: 11, letterSpacing: '0.45em', color: '#fff', textTransform: 'uppercase' },
  back: { fontSize: 9, letterSpacing: '0.28em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit' },
  main: { maxWidth: 1100, margin: '0 auto', padding: '32px 20px' },
  title: { fontSize: 'clamp(22px,3vw,32px)', fontWeight: 400, marginBottom: 6, letterSpacing: '-0.01em' },
  sub: { fontSize: 9, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', marginBottom: 36 },
  planGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 1, background: 'rgba(255,255,255,0.04)', marginBottom: 32 },
  planCard: (sel, color) => ({
    background: '#000', padding: '24px 20px', cursor: 'pointer',
    border: sel ? `1px solid ${color}` : '1px solid rgba(255,255,255,0.05)',
    transition: 'border-color 0.2s', position: 'relative',
    borderTop: `2px solid ${color}`,
  }),
  planName: { fontSize: 8, letterSpacing: '0.45em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 10 },
  planMin: { fontSize: 26, letterSpacing: '-0.02em', marginBottom: 4 },
  planRet: { fontSize: 10, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)', marginBottom: 3 },
  planDur: { fontSize: 9, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.2)' },
  planTotal: { marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: 10, color: 'rgba(255,255,255,0.5)' },
  depositBox: { background: '#000', border: '1px solid rgba(255,255,255,0.08)', padding: 28, maxWidth: 480 },
  label: { fontSize: 8, letterSpacing: '0.38em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', marginBottom: 8, display: 'block' },
  input: { width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', padding: '13px 16px', color: '#fff', fontFamily: "'Courier New',monospace", fontSize: 14, outline: 'none', marginBottom: 16, letterSpacing: '0.08em' },
  currGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginBottom: 16 },
  currBtn: (sel) => ({
    padding: '8px 4px', textAlign: 'center', fontSize: 9, letterSpacing: '0.2em', cursor: 'pointer', fontFamily: 'inherit',
    background: sel ? 'rgba(255,255,255,0.1)' : 'transparent',
    border: sel ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.08)',
    color: sel ? '#fff' : 'rgba(255,255,255,0.4)',
  }),
  shortcuts: { display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  shortBtn: { padding: '6px 14px', fontSize: 9, letterSpacing: '0.18em', cursor: 'pointer', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', fontFamily: 'inherit' },
  btn: { width: '100%', background: '#fff', color: '#000', border: 'none', padding: 14, fontFamily: "'Courier New',monospace", fontSize: 10, letterSpacing: '0.35em', cursor: 'pointer', fontWeight: 700, textTransform: 'uppercase' },
  warn: { fontSize: 9, letterSpacing: '0.06em', color: 'rgba(255,120,80,0.7)', lineHeight: 1.8, marginBottom: 14, padding: '10px 14px', border: '1px solid rgba(255,120,80,0.15)' },
  info: { fontSize: 9, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.3)', lineHeight: 1.8, marginBottom: 14 },
  addrBox: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 14px', wordBreak: 'break-all', fontSize: 12, letterSpacing: '0.06em', marginBottom: 14, cursor: 'pointer' },
  err: { color: 'rgba(255,80,80,0.7)', fontSize: 9, letterSpacing: '0.15em', marginTop: 10 },
}

export default function InvestPage() {
  const router = useRouter()
  const [plans, setPlans] = useState([])
  const [user, setUser] = useState(null)
  const [selected, setSelected] = useState(null)
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('USDT')
  const [step, setStep] = useState('plan') // plan | amount | deposit | address | success
  const [depositData, setDepositData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [pollCount, setPollCount] = useState(0)

  const token = typeof window !== 'undefined' ? localStorage.getItem('sx_token') : null

  useEffect(() => {
    if (!token) { router.push('/login'); return }
    fetch('/api/auth', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setUser(d))
    fetch('/api/plans', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setPlans(d.plans || []))
  }, [])

  // Poll deposit status for static address
  useEffect(() => {
    if (step !== 'address' || !depositData?.deposit_id) return
    const iv = setInterval(async () => {
      const r = await fetch(`/api/deposit/check?deposit_id=${depositData.deposit_id}`, { headers: { Authorization: `Bearer ${token}` } })
      const d = await r.json()
      if (d.status === 'completed') { setStep('success'); clearInterval(iv) }
      setPollCount(c => c + 1)
    }, 5000)
    return () => clearInterval(iv)
  }, [step, depositData])

  const handleDeposit = async () => {
    setError('')
    const amt = parseFloat(amount)
    if (!amt || amt < 10) { setError('Minimum deposit is $10'); return }
    setLoading(true)
    try {
      const r = await fetch('/api/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: amt, currency }),
      })
      const d = await r.json()
      if (d.error) { setError(d.error); setLoading(false); return }
      setDepositData(d)
      if (d.method === 'invoice') {
        localStorage.setItem('sx_deposit_id', d.deposit_id)
        window.location.href = d.payment_url
      } else {
        setStep('address')
      }
    } catch (e) { setError('Something went wrong') }
    setLoading(false)
  }

  const handleInvest = async () => {
    if (!selected) return
    setError('')
    const amt = parseFloat(amount)
    if (!amt || amt < selected.min_amount) { setError(`Minimum is $${selected.min_amount.toLocaleString()}`); return }
    setLoading(true)
    try {
      const r = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan_id: selected.id, amount: amt }),
      })
      const d = await r.json()
      if (d.error) { setError(d.error); setLoading(false); return }
      setStep('success')
    } catch (e) { setError('Something went wrong') }
    setLoading(false)
  }

  const copyAddr = () => {
    navigator.clipboard.writeText(depositData.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const color = (p) => PLAN_COLORS[p?.name] || '#fff'

  return (
    <div style={S.wrap}>
      <nav style={S.nav}>
        <div style={S.logo}>SpaceX Stocks</div>
        <button style={S.back} onClick={() => router.push('/dashboard')}>← Back to Dashboard</button>
      </nav>

      <main style={S.main}>
        {step === 'plan' && (
          <>
            <div style={S.title}>Choose Your Plan</div>
            <div style={S.sub}>Select a plan · Our team trades · You earn weekly</div>
            <div style={S.planGrid}>
              {plans.map(p => (
                <div key={p.id} style={S.planCard(selected?.id === p.id, color(p))} onClick={() => setSelected(p)}>
                  <div style={S.planName}>{p.name}</div>
                  <div style={S.planMin}>${p.min_amount.toLocaleString()} <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>min</span></div>
                  <div style={S.planRet}>${p.weekly_return.toLocaleString()} per week</div>
                  <div style={S.planDur}>{p.duration_days} days</div>
                  <div style={S.planTotal}>Total return: <strong>${p.target_profit.toLocaleString()}</strong></div>
                </div>
              ))}
            </div>
            {selected && (
              <div style={{ display: 'flex', gap: 12 }}>
                <button style={S.btn} onClick={() => setStep('amount')}>Invest in {selected.name} →</button>
              </div>
            )}
          </>
        )}

        {step === 'amount' && selected && (
          <>
            <div style={S.title}>{selected.name} Plan</div>
            <div style={S.sub}>Enter amount · Deposit crypto · Start earning</div>

            {/* Balance check */}
            {user && user.balance >= selected.min_amount ? (
              <div style={S.depositBox}>
                <div style={S.info}>Your available balance: <strong>${(user.balance || 0).toLocaleString()}</strong></div>
                <label style={S.label}>Investment Amount (USD)</label>
                <input style={S.input} type="number" placeholder={`Min $${selected.min_amount.toLocaleString()}`} value={amount} onChange={e => setAmount(e.target.value)} />
                <div style={S.shortcuts}>
                  {[selected.min_amount, selected.min_amount * 1.5, selected.min_amount * 2].map(v => (
                    <button key={v} style={S.shortBtn} onClick={() => setAmount(v.toString())}>${v.toLocaleString()}</button>
                  ))}
                </div>
                {error && <div style={S.err}>{error}</div>}
                <button style={S.btn} onClick={handleInvest} disabled={loading}>{loading ? 'Processing...' : 'Activate Plan →'}</button>
              </div>
            ) : (
              <div style={S.depositBox}>
                <div style={S.info}>You need to deposit funds first. Minimum for {selected.name}: <strong>${selected.min_amount.toLocaleString()}</strong></div>
                <label style={S.label}>Deposit Amount (USD)</label>
                <input style={S.input} type="number" placeholder={`Min $${selected.min_amount}`} value={amount} onChange={e => setAmount(e.target.value)} />
                <div style={S.shortcuts}>
                  {[selected.min_amount, selected.min_amount * 1.5, selected.min_amount * 2].map(v => (
                    <button key={v} style={S.shortBtn} onClick={() => setAmount(v.toString())}>${v.toLocaleString()}</button>
                  ))}
                </div>
                <label style={S.label}>Select Cryptocurrency</label>
                <div style={S.currGrid}>
                  {CURRENCIES.map(c => (
                    <button key={c} style={S.currBtn(currency === c)} onClick={() => setCurrency(c)}>{c}</button>
                  ))}
                </div>
                {(currency === 'ETH' || currency === 'BNB') && (
                  <div style={S.warn}>Note: {currency} deposits may include gas fees. USDT or TRX recommended for exact amounts.</div>
                )}
                {error && <div style={S.err}>{error}</div>}
                <button style={S.btn} onClick={handleDeposit} disabled={loading}>{loading ? 'Generating address...' : 'Deposit via Crypto →'}</button>
              </div>
            )}
            <div style={{ marginTop: 16 }}>
              <button style={{ ...S.back, fontSize: 8 }} onClick={() => setStep('plan')}>← Change Plan</button>
            </div>
          </>
        )}

        {step === 'address' && depositData && (
          <div style={S.depositBox}>
            <div style={S.title}>Send Payment</div>
            <div style={{ ...S.sub, marginBottom: 24 }}>Send exact amount to address below</div>
            <label style={S.label}>Send exactly ({depositData.currency})</label>
            <div style={{ fontSize: 22, letterSpacing: '-0.01em', marginBottom: 20 }}>${depositData.amount}</div>
            <label style={S.label}>To this address (click to copy)</label>
            <div style={S.addrBox} onClick={copyAddr}>{depositData.address}</div>
            {copied && <div style={{ fontSize: 9, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>COPIED</div>}
            {depositData.trust_wallet_warning && (
              <div style={S.warn}>If Trust Wallet shows a "high risk" warning, this is a false positive from OxaPay's address system. The address is safe to send to.</div>
            )}
            <div style={S.info}>Checking for payment... ({pollCount * 5}s elapsed). Do not close this page.</div>
          </div>
        )}

        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 11, letterSpacing: '0.45em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 16 }}>Mission Confirmed</div>
            <div style={{ fontSize: 'clamp(28px,5vw,52px)', fontWeight: 400, marginBottom: 16 }}>You're in.</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', lineHeight: 2, maxWidth: 400, margin: '0 auto 32px' }}>
              {selected ? `Your ${selected.name} plan is now active. Your first weekly return will be paid within 7 days.` : 'Your deposit has been confirmed and credited to your account.'}
            </div>
            <button style={S.btn} onClick={() => router.push('/dashboard')}>Go to Dashboard →</button>
          </div>
        )}
      </main>
    </div>
  )
}
