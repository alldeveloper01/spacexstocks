'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const CURRENCIES = ['USDT', 'BTC', 'ETH', 'TRX', 'LTC', 'XRP', 'MATIC', 'BNB']

const PLAN_PERKS = {
  Bronze: [], Starter: [],
  Growth: ['2 years X Premium free', '2 years Grok AI free', 'Private members group', 'SpaceX merch shipped to you'],
  Premium: ['Everything in Growth', '2 years Starlink internet free', '2 years Tesla FSD free', 'X blue tick verification', 'Free Tesla charging — 1 year', '1 Elon event invite'],
  Elite: ['Everything in Premium', 'Starlink & FSD extended to 3 years', 'Early Tesla & SpaceX product access', 'SpaceX launch viewing invite', 'Dedicated account manager', '2 Elon event invites'],
  Platinum: ['Everything in Elite', 'Tesla vehicle discount', '3 Elon event invites', 'Private contact for updates anytime', 'VIP SpaceX launch viewing', 'Lifetime community access'],
}

const PERK_ICONS = {
  Tesla: '🚗', Starlink: '🛰️', 'X Premium': '𝕏', Grok: '𝕏', event: '🎟️', Elon: '🎟️',
  launch: '🚀', merch: '📦', community: '👥', discount: '💰', contact: '📞',
}

function getPerkIcon(perk) {
  for (const [key, icon] of Object.entries(PERK_ICONS)) {
    if (perk.toLowerCase().includes(key.toLowerCase())) return icon
  }
  return '✦'
}

export default function InvestPage() {
  const router = useRouter()
  const [plans, setPlans] = useState([])
  const [user, setUser] = useState(null)
  const [selected, setSelected] = useState(null)
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('USDT')
  const [step, setStep] = useState('plan')
  const [depositData, setDepositData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [pollCount, setPollCount] = useState(0)
  const token = typeof window !== 'undefined' ? localStorage.getItem('sx_token') : null

  useEffect(() => {
    if (!token) { router.push('/login'); return }
    fetch('/api/auth', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(setUser)
    fetch('/api/plans', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => setPlans(d.plans || []))
  }, [])

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
    } catch { setError('Something went wrong') }
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
    } catch { setError('Something went wrong') }
    setLoading(false)
  }

  const perks = selected ? PLAN_PERKS[selected.name] || [] : []

  return (
    <div>
      {step === 'plan' && (
        <>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 'clamp(20px,3vw,28px)', fontWeight: 400, marginBottom: 4 }}>Choose Your Plan</div>
            <div style={{ fontSize: 8, letterSpacing: '0.4em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase' }}>Select a plan · Our team trades · You earn weekly</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 1, background: 'rgba(255,255,255,0.04)', marginBottom: 24 }}>
            {plans.map(p => {
              const isSel = selected?.id === p.id
              const hasPerks = (PLAN_PERKS[p.name] || []).length > 0
              return (
                <div key={p.id} onClick={() => setSelected(p)} style={{
                  background: isSel ? 'rgba(192,192,192,0.05)' : '#000',
                  border: isSel ? '1px solid rgba(192,192,192,0.3)' : '1px solid rgba(255,255,255,0.05)',
                  borderTop: `2px solid ${isSel ? '#C0C0C0' : 'rgba(255,255,255,0.1)'}`,
                  padding: '22px 20px', cursor: 'pointer', transition: 'all 0.2s', position: 'relative',
                }}>
                  {hasPerks && (
                    <div style={{ position: 'absolute', top: 10, right: 12, fontSize: 7, letterSpacing: '0.28em', color: 'rgba(192,192,192,0.6)', textTransform: 'uppercase', background: 'rgba(192,192,192,0.08)', padding: '2px 8px', border: '1px solid rgba(192,192,192,0.15)' }}>Perks</div>
                  )}
                  <div style={{ fontSize: 8, letterSpacing: '0.45em', color: isSel ? 'rgba(192,192,192,0.7)' : 'rgba(255,255,255,0.25)', textTransform: 'uppercase', marginBottom: 12 }}>{p.name}</div>
                  <div style={{ fontSize: 28, letterSpacing: '-0.02em', marginBottom: 6 }}>${p.min_amount.toLocaleString()} <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>min</span></div>
                  <div style={{ fontSize: 11, color: isSel ? 'rgba(192,192,192,0.8)' : 'rgba(255,255,255,0.45)', letterSpacing: '0.06em', marginBottom: 4 }}>${p.weekly_return.toLocaleString()} per week</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', marginBottom: 14 }}>{p.duration_days} days</div>
                  <div style={{ paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
                    Total return: <span style={{ color: isSel ? '#C0C0C0' : 'rgba(255,255,255,0.7)', fontWeight: 600 }}>${p.target_profit.toLocaleString()}</span>
                  </div>
                  {hasPerks && (
                    <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {(PLAN_PERKS[p.name] || []).slice(0, 3).map((perk, i) => (
                        <span key={i} style={{ fontSize: 7, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '2px 7px' }}>{getPerkIcon(perk)} {perk.split(' ').slice(0, 3).join(' ')}</span>
                      ))}
                      {(PLAN_PERKS[p.name] || []).length > 3 && <span style={{ fontSize: 7, color: 'rgba(192,192,192,0.4)', padding: '2px 4px' }}>+{(PLAN_PERKS[p.name] || []).length - 3} more</span>}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {selected && (
            <div style={{ background: 'rgba(192,192,192,0.03)', border: '1px solid rgba(192,192,192,0.12)', padding: '20px 22px', marginBottom: 20 }}>
              <div style={{ fontSize: 8, letterSpacing: '0.38em', color: 'rgba(192,192,192,0.5)', textTransform: 'uppercase', marginBottom: 14 }}>Selected: {selected.name}</div>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: perks.length > 0 ? 16 : 0 }}>
                {[
                  { label: 'Min Deposit', val: `$${selected.min_amount.toLocaleString()}` },
                  { label: 'Weekly Return', val: `$${selected.weekly_return.toLocaleString()}` },
                  { label: 'Duration', val: `${selected.duration_days} days` },
                  { label: 'Total Return', val: `$${selected.target_profit.toLocaleString()}` },
                ].map((s, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 7, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: 16, color: '#C0C0C0' }}>{s.val}</div>
                  </div>
                ))}
              </div>
              {perks.length > 0 && (
                <div>
                  <div style={{ fontSize: 7, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: 10 }}>Included Perks</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {perks.map((p, i) => (
                      <div key={i} style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', padding: '4px 10px', border: '1px solid rgba(192,192,192,0.12)', background: 'rgba(192,192,192,0.03)', letterSpacing: '0.04em' }}>
                        {getPerkIcon(p)} {p}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {selected && (
            <button onClick={() => setStep('amount')} style={{ background: '#fff', color: '#000', border: 'none', padding: '13px 32px', fontFamily: "'Courier New',monospace", fontSize: 10, letterSpacing: '0.35em', cursor: 'pointer', fontWeight: 700, textTransform: 'uppercase' }}>
              Continue with {selected.name} →
            </button>
          )}
        </>
      )}

      {step === 'amount' && selected && (
        <>
          <div style={{ marginBottom: 24 }}>
            <button onClick={() => setStep('plan')} style={{ fontSize: 8, letterSpacing: '0.28em', color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase', marginBottom: 16, fontFamily: 'inherit' }}>← Back to Plans</button>
            <div style={{ fontSize: 'clamp(20px,3vw,28px)', fontWeight: 400, marginBottom: 4 }}>{selected.name} Plan</div>
            <div style={{ fontSize: 8, letterSpacing: '0.4em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase' }}>Enter amount · Deposit crypto · Start earning</div>
          </div>

          <div style={{ maxWidth: 460, background: 'rgba(192,192,192,0.02)', border: '1px solid rgba(192,192,192,0.1)', padding: 28 }}>
            {user && user.balance >= selected.min_amount ? (
              <>
                <div style={{ fontSize: 9, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)', lineHeight: 1.9, marginBottom: 20, padding: '10px 14px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  Your balance: <span style={{ color: '#C0C0C0' }}>${(user.balance || 0).toLocaleString()}</span> — ready to invest
                </div>
                <label style={{ fontSize: 7, letterSpacing: '0.38em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Investment Amount (USD)</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder={`Min $${selected.min_amount.toLocaleString()}`}
                  style={{ width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', padding: '12px 14px', color: '#fff', fontFamily: "'Courier New',monospace", fontSize: 14, outline: 'none', marginBottom: 12, letterSpacing: '0.06em', display: 'block' }} />
                <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                  {[selected.min_amount, selected.min_amount * 1.5, selected.min_amount * 2, selected.min_amount * 3].map(v => (
                    <button key={v} onClick={() => setAmount(v.toString())} style={{ padding: '6px 14px', fontSize: 9, letterSpacing: '0.18em', cursor: 'pointer', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', fontFamily: 'inherit' }}>${v.toLocaleString()}</button>
                  ))}
                </div>
                {error && <div style={{ color: 'rgba(255,80,80,0.7)', fontSize: 9, letterSpacing: '0.15em', marginBottom: 14 }}>{error}</div>}
                <button onClick={handleInvest} disabled={loading} style={{ width: '100%', background: '#fff', color: '#000', border: 'none', padding: 13, fontFamily: "'Courier New',monospace", fontSize: 10, letterSpacing: '0.35em', cursor: 'pointer', fontWeight: 700, textTransform: 'uppercase' }}>
                  {loading ? 'Activating...' : 'Activate Plan →'}
                </button>
              </>
            ) : (
              <>
                <div style={{ fontSize: 9, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)', lineHeight: 1.9, marginBottom: 20, padding: '10px 14px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  Deposit funds first. Min for {selected.name}: <span style={{ color: '#C0C0C0' }}>${selected.min_amount.toLocaleString()}</span>
                </div>
                <label style={{ fontSize: 7, letterSpacing: '0.38em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Deposit Amount (USD)</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder={`Min $${selected.min_amount}`}
                  style={{ width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', padding: '12px 14px', color: '#fff', fontFamily: "'Courier New',monospace", fontSize: 14, outline: 'none', marginBottom: 12, letterSpacing: '0.06em', display: 'block' }} />
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                  {[selected.min_amount, selected.min_amount * 1.5, selected.min_amount * 2].map(v => (
                    <button key={v} onClick={() => setAmount(v.toString())} style={{ padding: '6px 14px', fontSize: 9, letterSpacing: '0.18em', cursor: 'pointer', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', fontFamily: 'inherit' }}>${v.toLocaleString()}</button>
                  ))}
                </div>
                <label style={{ fontSize: 7, letterSpacing: '0.38em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Select Cryptocurrency</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginBottom: 18 }}>
                  {CURRENCIES.map(c => (
                    <button key={c} onClick={() => setCurrency(c)} style={{ padding: '8px 4px', textAlign: 'center', fontSize: 9, letterSpacing: '0.15em', cursor: 'pointer', fontFamily: 'inherit', background: currency === c ? 'rgba(192,192,192,0.1)' : 'transparent', border: currency === c ? '1px solid rgba(192,192,192,0.35)' : '1px solid rgba(255,255,255,0.07)', color: currency === c ? '#C0C0C0' : 'rgba(255,255,255,0.35)' }}>{c}</button>
                  ))}
                </div>
                {(currency === 'ETH' || currency === 'BNB') && (
                  <div style={{ fontSize: 9, color: 'rgba(255,160,0,0.7)', padding: '8px 12px', border: '1px solid rgba(255,160,0,0.15)', marginBottom: 14, letterSpacing: '0.06em', lineHeight: 1.8 }}>Note: {currency} may include gas fees. USDT or TRX recommended.</div>
                )}
                {error && <div style={{ color: 'rgba(255,80,80,0.7)', fontSize: 9, letterSpacing: '0.15em', marginBottom: 14 }}>{error}</div>}
                <button onClick={handleDeposit} disabled={loading} style={{ width: '100%', background: '#fff', color: '#000', border: 'none', padding: 13, fontFamily: "'Courier New',monospace", fontSize: 10, letterSpacing: '0.35em', cursor: 'pointer', fontWeight: 700, textTransform: 'uppercase' }}>
                  {loading ? 'Generating address...' : 'Deposit via Crypto →'}
                </button>
              </>
            )}
          </div>
        </>
      )}

      {step === 'address' && depositData && (
        <div style={{ maxWidth: 460 }}>
          <div style={{ fontSize: 'clamp(20px,3vw,28px)', fontWeight: 400, marginBottom: 4 }}>Send Payment</div>
          <div style={{ fontSize: 8, letterSpacing: '0.4em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', marginBottom: 28 }}>Send exact amount · Do not close this page</div>
          <div style={{ background: 'rgba(192,192,192,0.02)', border: '1px solid rgba(192,192,192,0.1)', padding: 24 }}>
            <div style={{ fontSize: 7, letterSpacing: '0.35em', color: 'rgba(192,192,192,0.5)', textTransform: 'uppercase', marginBottom: 6 }}>Send Exactly</div>
            <div style={{ fontSize: 28, letterSpacing: '-0.02em', marginBottom: 20, color: '#C0C0C0' }}>${depositData.amount} {depositData.currency}</div>
            <div style={{ fontSize: 7, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', marginBottom: 8 }}>To This Address (tap to copy)</div>
            <div onClick={() => { navigator.clipboard.writeText(depositData.address); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 14px', wordBreak: 'break-all', fontSize: 11, letterSpacing: '0.04em', marginBottom: 8, cursor: 'pointer', lineHeight: 1.6 }}>
              {depositData.address}
            </div>
            {copied && <div style={{ fontSize: 8, letterSpacing: '0.25em', color: 'rgba(192,192,192,0.6)', marginBottom: 10 }}>COPIED ✓</div>}
            {depositData.trust_wallet_warning && (
              <div style={{ fontSize: 9, color: 'rgba(255,160,0,0.6)', padding: '10px 12px', border: '1px solid rgba(255,160,0,0.12)', marginBottom: 14, lineHeight: 1.8 }}>
                If Trust Wallet shows a "high risk" warning, this is a false positive from OxaPay. The address is safe.
              </div>
            )}
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em', lineHeight: 1.8 }}>
              Checking for payment... ({pollCount * 5}s). Page will update automatically when confirmed.
            </div>
          </div>
        </div>
      )}

      {step === 'success' && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>🚀</div>
          <div style={{ fontSize: 8, letterSpacing: '0.5em', color: 'rgba(192,192,192,0.5)', textTransform: 'uppercase', marginBottom: 16 }}>Mission Confirmed</div>
          <div style={{ fontSize: 'clamp(24px,4vw,40px)', fontWeight: 400, marginBottom: 12 }}>You're in.</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em', lineHeight: 2, maxWidth: 380, margin: '0 auto 32px' }}>
            {selected ? `Your ${selected.name} plan is now active. Your first weekly return will be paid within 7 days.` : 'Your deposit has been confirmed and credited to your account.'}
          </div>
          <button onClick={() => router.push('/dashboard')} style={{ background: '#fff', color: '#000', border: 'none', padding: '13px 32px', fontFamily: "'Courier New',monospace", fontSize: 10, letterSpacing: '0.35em', cursor: 'pointer', fontWeight: 700, textTransform: 'uppercase' }}>
            Go to Dashboard →
          </button>
        </div>
      )}
    </div>
  )
}
