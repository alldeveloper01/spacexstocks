'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const CURRENCIES = [
  { id: 'btc',          symbol: 'BTC',        name: 'Bitcoin',      icon: '₿', color: '#F7931A' },
  { id: 'eth',          symbol: 'ETH',        name: 'Ethereum',     icon: 'Ξ', color: '#627EEA' },
  { id: 'usdttrc20',    symbol: 'USDT TRC20', name: 'Tether TRC20', icon: '₮', color: '#26A17B' },
  { id: 'usdterc20',    symbol: 'USDT ERC20', name: 'Tether ERC20', icon: '₮', color: '#26A17B' },
  { id: 'trx',          symbol: 'TRX',        name: 'Tron',         icon: '◈', color: '#FF0013' },
  { id: 'bnbbsc',       symbol: 'BNB',        name: 'BNB Chain',    icon: 'B', color: '#F3BA2F' },
  { id: 'sol',          symbol: 'SOL',        name: 'Solana',       icon: '◎', color: '#9945FF' },
  { id: 'xrp',          symbol: 'XRP',        name: 'XRP',          icon: 'X', color: '#00AAE4' },
  { id: 'ltc',          symbol: 'LTC',        name: 'Litecoin',     icon: 'Ł', color: '#BFBBBB' },
  { id: 'usdcbsc',      symbol: 'USDC',       name: 'USD Coin',     icon: '$', color: '#2775CA' },
  { id: 'doge',         symbol: 'DOGE',       name: 'Dogecoin',     icon: 'Ð', color: '#C2A633' },
  { id: 'maticpolygon', symbol: 'MATIC',      name: 'Polygon',      icon: '⬡', color: '#8247E5' },
]

const STABLECOINS = ['usdttrc20', 'usdterc20', 'usdcbsc']
const COINGECKO_IDS = {
  btc: 'bitcoin', eth: 'ethereum', bnbbsc: 'binancecoin',
  trx: 'tron', sol: 'solana', ltc: 'litecoin', doge: 'dogecoin',
  xrp: 'ripple', maticpolygon: 'matic-network'
}

function authHeaders() {
  const token = localStorage.getItem('sx_token')
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
}

const S = {
  label: { fontFamily: "'Courier New',monospace", fontSize: 7, letterSpacing: '0.38em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: 8, display: 'block' },
  input: { width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', padding: '13px 16px', color: '#fff', fontFamily: "'Courier New',monospace", fontSize: 14, outline: 'none', boxSizing: 'border-box', letterSpacing: '0.06em', transition: 'border-color 0.2s' },
  btn: { width: '100%', background: '#fff', color: '#000', border: 'none', padding: '13px 0', fontFamily: "'Courier New',monospace", fontSize: 9, letterSpacing: '0.35em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 700, marginTop: 16 },
  btnGhost: { width: '100%', background: 'transparent', color: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.08)', padding: '12px 0', fontFamily: "'Courier New',monospace", fontSize: 8, letterSpacing: '0.3em', textTransform: 'uppercase', cursor: 'pointer', marginTop: 8 },
  err: { background: 'rgba(255,80,80,0.06)', border: '1px solid rgba(255,80,80,0.2)', padding: '10px 14px', fontFamily: "'Courier New',monospace", fontSize: 9, letterSpacing: '0.1em', color: 'rgba(255,80,80,0.7)', marginBottom: 16 },
  card: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', padding: '28px 24px', borderTop: '2px solid #C0C0C0' },
  section: { marginBottom: 24 },
}

export default function DepositPage() {
  const router = useRouter()
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [depositInfo, setDepositInfo] = useState(null)
  const [copied, setCopied] = useState(false)
  const [polling, setPolling] = useState(false)
  const [cryptoAmount, setCryptoAmount] = useState(null)
  const [fetchingPrice, setFetchingPrice] = useState(false)
  const [minDeposit, setMinDeposit] = useState(50)
  const pollRef = useRef(null)
  const priceRef = useRef(null)

  const MIN = minDeposit

  useEffect(() => {
    fetch('/api/public/settings')
      .then(r => r.json())
      .then(d => {
        const min = d.settings?.find(s => s.key === 'min_deposit')
        if (min) setMinDeposit(Number(min.value))
      }).catch(() => {})
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('status') === 'success') {
      window.history.replaceState({}, '', '/dashboard/deposit')
      const deposit_id = localStorage.getItem('sx_deposit_id')
      if (deposit_id) {
        setDepositInfo({ completed: true, method: 'invoice' })
        localStorage.removeItem('sx_deposit_id')
      }
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
      if (priceRef.current) clearTimeout(priceRef.current)
    }
  }, [])

  useEffect(() => {
    if (amount && currency && !STABLECOINS.includes(currency)) {
      if (priceRef.current) clearTimeout(priceRef.current)
      priceRef.current = setTimeout(fetchCryptoPrice, 500)
    } else {
      setCryptoAmount(null)
    }
  }, [amount, currency])

  async function fetchCryptoPrice() {
    const geckoId = COINGECKO_IDS[currency]
    if (!geckoId || !amount || Number(amount) <= 0) return
    setFetchingPrice(true)
    try {
      const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${geckoId}&vs_currencies=usd`)
      const data = await res.json()
      const price = data[geckoId]?.usd
      if (price) {
        setCryptoAmount({
          amount: (Number(amount) / price).toFixed(6),
          symbol: CURRENCIES.find(c => c.id === currency)?.symbol
        })
      }
    } catch {}
    setFetchingPrice(false)
  }

  async function handleDeposit(method = 'auto') {
    if (!amount || Number(amount) < MIN) return setError(`Minimum deposit is $${MIN}`)
    if (!currency) return setError('Please select a currency')
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/deposit', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ amount: Number(amount), currency, method })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed'); setLoading(false); return }

      if (data.method === 'invoice' && data.pay_link) {
        localStorage.setItem('sx_deposit_id', data.deposit_id)
        window.location.href = data.pay_link
        return
      }

      const adjustedAmount = +(Number(amount) * 1.02).toFixed(2)
      const adjustedCrypto = cryptoAmount
        ? { ...cryptoAmount, amount: (Number(cryptoAmount.amount) * 1.02).toFixed(6) }
        : null
      setDepositInfo({ ...data, displayAmount: adjustedAmount, cryptoAmount: adjustedCrypto })
      startPolling(data.deposit_id)
    } catch { setError('Something went wrong. Please try again.') }
    setLoading(false)
  }

  function startPolling(deposit_id) {
    setPolling(true)
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch('/api/deposit/check', {
          method: 'POST', headers: authHeaders(),
          body: JSON.stringify({ deposit_id })
        })
        const data = await res.json()
        if (data.status === 'completed') {
          clearInterval(pollRef.current)
          setPolling(false)
          setDepositInfo(prev => ({ ...prev, completed: true }))
        }
      } catch {}
    }, 5000)
  }

  async function copyAddress() {
    if (!depositInfo?.address) return
    await navigator.clipboard.writeText(depositInfo.address)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  // Completed
  if (depositInfo?.completed) return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: "'Courier New',monospace", fontSize: 'clamp(18px,3vw,28px)', fontWeight: 400, color: '#fff', marginBottom: 6 }}>Deposit Confirmed</div>
        <div style={{ fontFamily: "'Courier New',monospace", fontSize: 8, letterSpacing: '0.38em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase' }}>Your balance has been updated</div>
      </div>
      <div style={S.card}>
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>✓</div>
          <div style={{ fontFamily: "'Courier New',monospace", fontSize: 14, color: '#C0C0C0', letterSpacing: '0.06em', marginBottom: 8 }}>Payment Received</div>
          <div style={{ fontFamily: "'Courier New',monospace", fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 28 }}>Your balance has been credited successfully</div>
          <button style={S.btn} onClick={() => { setDepositInfo(null); setAmount(''); setCurrency('') }}>Make Another Deposit</button>
          <button style={S.btnGhost} onClick={() => router.push('/dashboard/invest')}>Browse Investment Plans →</button>
        </div>
      </div>
    </div>
  )

  // Static address
  if (depositInfo && !depositInfo.completed && depositInfo.method === 'static') return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: "'Courier New',monospace", fontSize: 'clamp(18px,3vw,28px)', fontWeight: 400, color: '#fff', marginBottom: 6 }}>Send Payment</div>
        <div style={{ fontFamily: "'Courier New',monospace", fontSize: 8, letterSpacing: '0.38em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase' }}>
          {polling ? '● Waiting for confirmation...' : 'Send to the address below'}
        </div>
      </div>
      <div style={S.card}>
        <div style={S.section}>
          <div style={S.label}>Amount to Send</div>
          <div style={{ fontFamily: "'Courier New',monospace", fontSize: 28, color: '#fff', letterSpacing: '-0.02em' }}>
            ${Number(depositInfo.displayAmount).toLocaleString()}
          </div>
          <div style={{ fontFamily: "'Courier New',monospace", fontSize: 8, color: 'rgba(255,255,255,0.2)', marginTop: 4, letterSpacing: '0.08em' }}>
            includes 2% processing fee · ${Number(depositInfo.amount).toLocaleString()} will be credited
          </div>
          {depositInfo.cryptoAmount && (
            <div style={{ fontFamily: "'Courier New',monospace", fontSize: 11, color: 'rgba(192,192,192,0.6)', marginTop: 6 }}>
              ≈ {depositInfo.cryptoAmount.amount} {depositInfo.cryptoAmount.symbol}
            </div>
          )}
        </div>

        <div style={S.section}>
          <div style={S.label}>{depositInfo.currency} ({depositInfo.network}) Address</div>
          <div onClick={copyAddress} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(192,192,192,0.2)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
            <div style={{ flex: 1, fontFamily: "'Courier New',monospace", fontSize: 10, color: '#C0C0C0', wordBreak: 'break-all', letterSpacing: '0.04em' }}>
              {depositInfo.address}
            </div>
            <div style={{ fontFamily: "'Courier New',monospace", fontSize: 8, letterSpacing: '0.2em', color: copied ? '#C0C0C0' : 'rgba(255,255,255,0.3)', textTransform: 'uppercase', flexShrink: 0 }}>
              {copied ? 'Copied ✓' : 'Copy'}
            </div>
          </div>
        </div>

        <div style={{ background: 'rgba(255,80,80,0.04)', border: '1px solid rgba(255,80,80,0.12)', padding: '12px 14px', marginBottom: 16 }}>
          <div style={{ fontFamily: "'Courier New',monospace", fontSize: 8, color: 'rgba(255,80,80,0.6)', letterSpacing: '0.1em', lineHeight: 1.9 }}>
            Only send {depositInfo.currency} on the {depositInfo.network} network. Sending other assets will result in permanent loss.
          </div>
        </div>

        <div style={{ background: 'rgba(192,192,192,0.04)', border: '1px solid rgba(192,192,192,0.1)', padding: '12px 14px', marginBottom: 16 }}>
          <div style={{ fontFamily: "'Courier New',monospace", fontSize: 8, color: 'rgba(192,192,192,0.4)', letterSpacing: '0.1em', lineHeight: 1.9 }}>
            Some wallets may show a risk warning — this is a false positive. The address is generated by OxaPay, our verified payment processor.
          </div>
        </div>

        <button style={S.btnGhost} onClick={() => { setDepositInfo(null); clearInterval(pollRef.current); setPolling(false) }}>
          ← Make a Different Deposit
        </button>
      </div>
    </div>
  )

  // Deposit form
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: "'Courier New',monospace", fontSize: 'clamp(18px,3vw,28px)', fontWeight: 400, color: '#fff', marginBottom: 6 }}>
          Make a Deposit
        </div>
        <div style={{ fontFamily: "'Courier New',monospace", fontSize: 8, letterSpacing: '0.38em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase' }}>
          Fund your account · Minimum $50
        </div>
      </div>

      <div style={S.card}>
        {error && <div style={S.err}>{error}</div>}

        {/* Amount */}
        <div style={S.section}>
          <label style={S.label}>Amount (USD)</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontFamily: "'Courier New',monospace", fontSize: 14, color: 'rgba(255,255,255,0.3)' }}>$</span>
            <input
              type="number"
              placeholder={`Minimum $${MIN}`}
              value={amount}
              onChange={e => { setAmount(e.target.value); setError('') }}
              style={{ ...S.input, paddingLeft: 28 }}
            />
          </div>

          {currency && !STABLECOINS.includes(currency) && amount && Number(amount) > 0 && (
            <div style={{ fontFamily: "'Courier New',monospace", fontSize: 9, color: 'rgba(192,192,192,0.5)', letterSpacing: '0.1em', marginTop: 8 }}>
              {fetchingPrice ? 'Fetching price...' : cryptoAmount ? `≈ ${cryptoAmount.amount} ${cryptoAmount.symbol}` : ''}
            </div>
          )}

          <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
            {[50, 100, 500, 1000, 5000].map(a => (
              <button key={a} onClick={() => setAmount(String(a))} style={{
                background: amount == a ? 'rgba(192,192,192,0.1)' : 'transparent',
                border: `1px solid ${amount == a ? 'rgba(192,192,192,0.3)' : 'rgba(255,255,255,0.08)'}`,
                color: amount == a ? '#C0C0C0' : 'rgba(255,255,255,0.3)',
                fontFamily: "'Courier New',monospace", fontSize: 8, letterSpacing: '0.2em',
                padding: '6px 12px', cursor: 'pointer', textTransform: 'uppercase',
              }}>
                ${a.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Currency */}
        <div style={S.section}>
          <label style={S.label}>Select Currency</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
            {CURRENCIES.map(c => (
              <button key={c.id} onClick={() => { setCurrency(c.id); setError('') }} style={{
                background: currency === c.id ? `${c.color}12` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${currency === c.id ? c.color + '44' : 'rgba(255,255,255,0.07)'}`,
                padding: '10px 6px', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 5, cursor: 'pointer', transition: 'all 0.15s',
              }}>
                <span style={{ fontSize: 16, color: currency === c.id ? c.color : 'rgba(255,255,255,0.4)' }}>{c.icon}</span>
                <span style={{ fontFamily: "'Courier New',monospace", fontSize: 7, letterSpacing: '0.12em', color: currency === c.id ? '#fff' : 'rgba(255,255,255,0.25)', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.4 }}>
                {c.symbol}
                </span>
              </button>
            ))}
          </div>

          {currency === 'usdterc20' && (
            <div style={{ background: 'rgba(192,192,192,0.04)', border: '1px solid rgba(192,192,192,0.1)', padding: '10px 14px', marginTop: 10 }}>
              <div style={{ fontFamily: "'Courier New',monospace", fontSize: 8, color: 'rgba(192,192,192,0.5)', letterSpacing: '0.1em', lineHeight: 1.9 }}>
                ERC20 has high gas fees ($10–$50+). Consider USDT TRC20 instead — same coin, fees under $1.
              </div>
            </div>
          )}
        </div>

        {/* How it works */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ fontFamily: "'Courier New',monospace", fontSize: 7, letterSpacing: '0.35em', color: 'rgba(192,192,192,0.4)', textTransform: 'uppercase', marginBottom: 10 }}>How it works</div>
          {['Click below to go to a secure payment page', 'Select your crypto and complete the payment', 'Balance is credited automatically after confirmation', `Minimum deposit is $${MIN}`].map((t, i) => (
            <div key={i} style={{ fontFamily: "'Courier New',monospace", fontSize: 8, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em', lineHeight: 2, display: 'flex', gap: 8 }}>
              <span style={{ color: 'rgba(192,192,192,0.3)' }}>·</span> {t}
            </div>
          ))}
        </div>

        <button style={{ ...S.btn, opacity: loading ? 0.6 : 1 }} onClick={() => handleDeposit('auto')} disabled={loading}>
          {loading ? 'Preparing Payment...' : 'Proceed to Payment →'}
        </button>
        <button style={S.btnGhost} onClick={() => handleDeposit('static')} disabled={loading}>
          Use Direct Wallet Address Instead
        </button>
      </div>
    </div>
  )
}