'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const S = {
  wrap: { minHeight: '100vh', background: '#000', color: '#fff', fontFamily: "'Courier New', monospace" },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 28px', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  logo: { fontSize: 11, letterSpacing: '0.45em', color: '#fff', textTransform: 'uppercase' },
  navRight: { display: 'flex', gap: 20, alignItems: 'center' },
  navLink: { fontSize: 9, letterSpacing: '0.28em', color: 'rgba(255,255,255,0.35)', textDecoration: 'none', textTransform: 'uppercase', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit' },
  main: { maxWidth: 1100, margin: '0 auto', padding: '32px 20px' },
  greeting: { fontSize: 'clamp(22px,3vw,32px)', fontWeight: 400, marginBottom: 8, letterSpacing: '-0.01em' },
  sub: { fontSize: 9, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', marginBottom: 36 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 1, background: 'rgba(255,255,255,0.04)', marginBottom: 32 },
  statCard: { background: '#000', padding: '22px 20px', border: '1px solid rgba(255,255,255,0.05)' },
  statLabel: { fontSize: 7, letterSpacing: '0.38em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: 10 },
  statVal: { fontSize: 26, letterSpacing: '-0.02em', color: '#fff' },
  statSub: { fontSize: 8, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.2)', marginTop: 4 },
  section: { marginBottom: 28 },
  sectionHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 9, letterSpacing: '0.45em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' },
  sectionLink: { fontSize: 8, letterSpacing: '0.28em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit' },
  invCard: { background: '#000', border: '1px solid rgba(255,255,255,0.07)', padding: '20px', marginBottom: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 16, alignItems: 'center' },
  invPlan: { fontSize: 13, letterSpacing: '0.05em' },
  invAmt: { fontSize: 11, color: 'rgba(255,255,255,0.5)' },
  invReturn: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  badge: (status) => ({
    display: 'inline-block', padding: '3px 10px', fontSize: 7, letterSpacing: '0.3em', textTransform: 'uppercase',
    background: status === 'active' ? 'rgba(255,255,255,0.08)' : status === 'completed' ? 'rgba(255,255,255,0.04)' : 'rgba(255,80,80,0.08)',
    color: status === 'active' ? 'rgba(255,255,255,0.7)' : status === 'completed' ? 'rgba(255,255,255,0.3)' : 'rgba(255,80,80,0.6)',
    border: `1px solid ${status === 'active' ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)'}`,
  }),
  btn: { background: '#fff', color: '#000', border: 'none', padding: '11px 24px', fontFamily: "'Courier New', monospace", fontSize: 9, letterSpacing: '0.3em', cursor: 'pointer', textTransform: 'uppercase' },
  btnGhost: { background: 'transparent', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.15)', padding: '10px 22px', fontFamily: "'Courier New', monospace", fontSize: 9, letterSpacing: '0.28em', cursor: 'pointer', textTransform: 'uppercase' },
  empty: { textAlign: 'center', padding: '40px', fontSize: 11, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em', border: '1px solid rgba(255,255,255,0.04)' },
  spceBar: { background: '#000', border: '1px solid rgba(255,255,255,0.06)', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  spceLabel: { fontSize: 8, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase' },
  spcePrice: { fontSize: 20, letterSpacing: '-0.02em' },
  spceChg: { fontSize: 9, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.5)' },
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [investments, setInvestments] = useState([])
  const [spcePrice, setSpcePrice] = useState(160.00)
  const [loading, setLoading] = useState(true)

  const token = typeof window !== 'undefined' ? localStorage.getItem('sx_token') : null

  useEffect(() => {
    if (!token) { router.push('/login'); return }

    // Check for deposit success return
    const params = new URLSearchParams(window.location.search)
    if (params.get('deposit') === 'success') {
      const depositId = params.get('deposit_id') || localStorage.getItem('sx_deposit_id')
      if (depositId) localStorage.removeItem('sx_deposit_id')
      window.history.replaceState({}, '', '/dashboard')
    }

    fetch('/api/auth', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.error) { router.push('/login'); return } setUser(d) })

    fetch('/api/plans', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setInvestments(d.investments || []); setLoading(false) })

    // Simulate live SPCE price
    const iv = setInterval(() => setSpcePrice(p => Math.max(150, p + (Math.random() - 0.48) * 0.5)), 2500)
    return () => clearInterval(iv)
  }, [])

  const activeInv = investments.filter(i => i.status === 'active')
  const totalInvested = activeInv.reduce((s, i) => s + i.amount, 0)
  const weeklyReturn = activeInv.reduce((s, i) => s + i.weekly_return, 0)

  const daysLeft = (inv) => {
    if (!inv.end_date) return '—'
    const d = Math.ceil((new Date(inv.end_date) - new Date()) / 86400000)
    return d > 0 ? `${d} days left` : 'Ending soon'
  }

  if (loading) return (
    <div style={{ ...S.wrap, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 9, letterSpacing: '0.45em', color: 'rgba(255,255,255,0.2)' }}>LOADING...</div>
    </div>
  )

  return (
    <div style={S.wrap}>
      {/* Nav */}
      <nav style={S.nav}>
        <div style={S.logo}>SpaceX Stocks</div>
        <div style={S.navRight}>
          <button style={S.navLink} onClick={() => router.push('/dashboard/invest')}>Invest</button>
          <button style={S.navLink} onClick={() => router.push('/dashboard/withdraw')}>Withdraw</button>
          <button style={S.navLink} onClick={() => router.push('/dashboard/profile')}>Profile</button>
          <button style={S.navLink} onClick={() => { localStorage.removeItem('sx_token'); router.push('/login') }}>Sign Out</button>
        </div>
      </nav>

      <main style={S.main}>
        {/* Greeting */}
        <div style={S.greeting}>Hello, {user?.full_name?.split(' ')[0]}.</div>
        <div style={S.sub}>Mission Control · Your Portfolio</div>

        {/* Live SPCE price bar */}
        <div style={S.spceBar}>
          <div>
            <div style={S.spceLabel}>SpaceX · SPCE · Live Price</div>
            <div style={S.spcePrice}>${spcePrice.toFixed(2)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={S.spceLabel}>Since IPO ($120)</div>
            <div style={S.spceChg}>▲ +{((spcePrice - 120) / 120 * 100).toFixed(2)}%</div>
          </div>
        </div>

        {/* Stats */}
        <div style={S.statsGrid}>
          <div style={S.statCard}>
            <div style={S.statLabel}>Available Balance</div>
            <div style={S.statVal}>${(user?.balance || 0).toLocaleString()}</div>
            <div style={S.statSub}>Ready to invest</div>
          </div>
          <div style={S.statCard}>
            <div style={S.statLabel}>Withdrawal Balance</div>
            <div style={S.statVal}>${(user?.withdrawal_balance || 0).toLocaleString()}</div>
            <div style={S.statSub}>Ready to withdraw</div>
          </div>
          <div style={S.statCard}>
            <div style={S.statLabel}>Total Invested</div>
            <div style={S.statVal}>${totalInvested.toLocaleString()}</div>
            <div style={S.statSub}>Across {activeInv.length} active plan{activeInv.length !== 1 ? 's' : ''}</div>
          </div>
          <div style={S.statCard}>
            <div style={S.statLabel}>Weekly Return</div>
            <div style={S.statVal}>${weeklyReturn.toLocaleString()}</div>
            <div style={S.statSub}>Paid every 7 days</div>
          </div>
          <div style={S.statCard}>
            <div style={S.statLabel}>Total Earned</div>
            <div style={S.statVal}>${(user?.total_profit || 0).toLocaleString()}</div>
            <div style={S.statSub}>All time profits</div>
          </div>
        </div>

        {/* Active investments */}
        <div style={S.section}>
          <div style={S.sectionHead}>
            <div style={S.sectionTitle}>Active Plans</div>
            <button style={S.sectionLink} onClick={() => router.push('/dashboard/invest')}>+ New Investment</button>
          </div>

          {activeInv.length === 0 ? (
            <div style={S.empty}>
              No active plans. Start your first investment to begin earning weekly returns.
              <div style={{ marginTop: 20 }}>
                <button style={S.btn} onClick={() => router.push('/dashboard/invest')}>View Plans →</button>
              </div>
            </div>
          ) : (
            activeInv.map(inv => (
              <div key={inv.id} style={S.invCard}>
                <div>
                  <div style={S.invPlan}>{inv.investment_plans?.name || 'Plan'}</div>
                  <div style={{ ...S.invAmt, marginTop: 4 }}>{daysLeft(inv)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 8, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: 4 }}>Invested</div>
                  <div style={S.invAmt}>${inv.amount.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: 8, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: 4 }}>Weekly Return</div>
                  <div style={S.invReturn}>${inv.weekly_return.toLocaleString()}/wk</div>
                </div>
                <div style={S.badge(inv.status)}>{inv.status}</div>
              </div>
            ))
          )}
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button style={S.btn} onClick={() => router.push('/dashboard/invest')}>Invest Now</button>
          <button style={S.btnGhost} onClick={() => router.push('/dashboard/withdraw')}>Withdraw Funds</button>
          <button style={S.btnGhost} onClick={() => router.push('/dashboard/profile')}>My Profile</button>
        </div>
      </main>
    </div>
  )
}
