'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

// ── STARFIELD CANVAS ──────────────────────────────────────────
function Starfield() {
  const ref = useRef(null)
  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    let W = cv.width = window.innerWidth
    let H = cv.height = window.innerHeight
    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.2 + 0.2, o: Math.random() * 0.6 + 0.1,
      s: Math.random() * 0.15 + 0.02
    }))
    let frame
    function draw() {
      ctx.clearRect(0, 0, W, H)
      stars.forEach(s => {
        s.y += s.s
        if (s.y > H) { s.y = 0; s.x = Math.random() * W }
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${s.o})`
        ctx.fill()
      })
      frame = requestAnimationFrame(draw)
    }
    draw()
    const resize = () => { W = cv.width = window.innerWidth; H = cv.height = window.innerHeight }
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={ref} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }} />
}

// ── RADAR SWEEP ────────────────────────────────────────────────
function RadarSweep({ size = 80 }) {
  const ref = useRef(null)
  useEffect(() => {
    const cv = ref.current; if (!cv) return
    const ctx = cv.getContext('2d')
    let angle = 0, frame
    function draw() {
      ctx.clearRect(0, 0, size, size)
      const cx = size / 2, cy = size / 2, r = size / 2 - 4
      // Circles
      ctx.strokeStyle = 'rgba(0,212,255,0.12)'; ctx.lineWidth = 0.5
      ;[r * 0.33, r * 0.66, r].forEach(rad => { ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.stroke() })
      // Cross
      ctx.beginPath(); ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r); ctx.stroke()
      // Sweep
      const grad = ctx.createConicalGradient ? null : null
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(angle)
      const g = ctx.createLinearGradient(0, 0, r, 0)
      g.addColorStop(0, 'rgba(0,212,255,0.5)')
      g.addColorStop(1, 'rgba(0,212,255,0)')
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r, -0.3, 0); ctx.closePath()
      ctx.fillStyle = g; ctx.fill()
      ctx.restore()
      angle += 0.03
      frame = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(frame)
  }, [])
  return <canvas ref={ref} width={size} height={size} style={{ display: 'block' }} />
}

// ── MINI CHART ─────────────────────────────────────────────────
function MiniChart({ prices }) {
  if (!prices || prices.length < 2) return null
  const W = 200, H = 48
  const min = Math.min(...prices), max = Math.max(...prices)
  const range = max - min || 1
  const pts = prices.map((p, i) => {
    const x = (i / (prices.length - 1)) * W
    const y = H - ((p - min) / range) * (H - 8) - 4
    return `${x},${y}`
  }).join(' ')
  const area = `M0,${H} L${pts.split(' ').map(p => p).join(' L')} L${W},${H} Z`
  return (
    <svg width={W} height={H} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#00D4FF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#cg)" />
      <polyline points={pts} fill="none" stroke="#00D4FF" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

// ── PROGRESS ARC ───────────────────────────────────────────────
function ProgressArc({ pct, size = 56 }) {
  const r = size / 2 - 5
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#00D4FF" strokeWidth="3"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1s ease' }} />
    </svg>
  )
}

// ── PLAN PERKS ─────────────────────────────────────────────────
const PLAN_PERKS = {
  Bronze: [], Starter: [],
  Growth: ['2 years X Premium free', '2 years Grok AI free', 'Private members group', 'SpaceX merch shipped to you'],
  Premium: ['Everything in Growth', '2 years Starlink internet free', '2 years Tesla FSD free', 'X blue tick verification', 'Free Tesla charging — 1 year', '1 Elon event invite'],
  Elite: ['Everything in Premium', 'Starlink & FSD extended to 3 years', 'Early Tesla & SpaceX product access', 'SpaceX launch viewing invite', 'Dedicated account manager', '2 Elon event invites'],
  Platinum: ['Everything in Elite', 'Tesla vehicle discount', '3 Elon event invites', 'Private contact for updates anytime', 'VIP SpaceX launch viewing', 'Lifetime community access'],
}

// ── MAIN ───────────────────────────────────────────────────────
export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [investments, setInvestments] = useState([])
  const [spce, setSpce] = useState(160.00)
  const [priceHistory, setPriceHistory] = useState([160])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [scanLine, setScanLine] = useState(0)
  const token = typeof window !== 'undefined' ? localStorage.getItem('sx_token') : null

  useEffect(() => {
    if (!token) { router.push('/login'); return }
    const params = new URLSearchParams(window.location.search)
    if (params.get('deposit') === 'success') window.history.replaceState({}, '', '/dashboard')
    fetch('/api/auth', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { if (d.error) router.push('/login'); else setUser(d) })
    fetch('/api/plans', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { setInvestments(d.investments || []); setLoading(false) })
    // Live price
    const iv = setInterval(() => {
      setSpce(p => {
        const next = Math.max(150, p + (Math.random() - 0.48) * 0.5)
        setPriceHistory(h => [...h.slice(-49), next])
        return next
      })
    }, 2000)
    // Scan line
    const sl = setInterval(() => setScanLine(l => (l + 1) % 100), 30)
    return () => { clearInterval(iv); clearInterval(sl) }
  }, [])

  const activeInv = investments.filter(i => i.status === 'active')
  const totalInvested = activeInv.reduce((s, i) => s + i.amount, 0)
  const weeklyReturn = activeInv.reduce((s, i) => s + i.weekly_return, 0)
  const highestPlan = activeInv.length > 0
    ? activeInv.reduce((best, i) => {
        const order = ['Bronze','Starter','Growth','Premium','Elite','Platinum']
        const curr = order.indexOf(i.investment_plans?.name)
        const b = order.indexOf(best?.investment_plans?.name)
        return curr > b ? i : best
      }, activeInv[0])
    : null
  const userPerks = highestPlan ? PLAN_PERKS[highestPlan.investment_plans?.name] || [] : []
  const daysLeft = (inv) => {
    if (!inv.end_date) return 0
    return Math.max(0, Math.ceil((new Date(inv.end_date) - new Date()) / 86400000))
  }
  const planProgress = (inv) => {
    if (!inv.end_date || !inv.created_at) return 0
    const total = new Date(inv.end_date) - new Date(inv.created_at)
    const elapsed = Date.now() - new Date(inv.created_at)
    return Math.min(100, Math.round((elapsed / total) * 100))
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Courier New',monospace" }}>
      <div style={{ textAlign: 'center' }}>
        <RadarSweep size={80} />
        <div style={{ fontSize: 9, letterSpacing: '0.4em', color: 'rgba(0,212,255,0.5)', marginTop: 16, textTransform: 'uppercase' }}>Initializing Mission Control...</div>
      </div>
    </div>
  )

  const NAV = [
    { id: 'dashboard', label: 'Dashboard', icon: '▦' },
    { id: 'invest', label: 'Invest', icon: '◈', action: () => router.push('/dashboard/invest') },
    { id: 'withdraw', label: 'Withdraw', icon: '↓', action: () => router.push('/dashboard/withdraw') },
    { id: 'perks', label: 'My Perks', icon: '★' },
    { id: 'profile', label: 'Profile', icon: '◉', action: () => router.push('/dashboard/profile') },
  ]

  const prcUp = priceHistory.length > 1 && spce >= priceHistory[priceHistory.length - 2]

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: "'Courier New',monospace", display: 'flex', overflow: 'hidden' }}>
      <Starfield />

      {/* SIDEBAR */}
      <div style={{
        position: 'fixed', left: 0, top: 0, bottom: 0, width: 220,
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(0,212,255,0.1)', zIndex: 100,
        display: 'flex', flexDirection: 'column', padding: '28px 0',
        transform: sidebarOpen || window.innerWidth > 768 ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease',
      }}>
        {/* Logo */}
        <div style={{ padding: '0 20px 28px', borderBottom: '1px solid rgba(0,212,255,0.08)' }}>
          <div style={{ fontSize: 12, letterSpacing: '0.4em', color: '#fff', textTransform: 'uppercase' }}>SpaceX</div>
          <div style={{ fontSize: 12, letterSpacing: '0.4em', color: 'rgba(0,212,255,0.7)', textTransform: 'uppercase' }}>Stocks</div>
          <div style={{ fontSize: 7, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.2)', marginTop: 4, textTransform: 'uppercase' }}>Mission Control</div>
        </div>

        {/* User */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(0,212,255,0.3),rgba(0,212,255,0.05))', border: '1px solid rgba(0,212,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, marginBottom: 8 }}>
            {user?.full_name?.[0] || 'U'}
          </div>
          <div style={{ fontSize: 12, color: '#fff' }}>{user?.full_name}</div>
          <div style={{ fontSize: 8, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.25)', marginTop: 2, textTransform: 'uppercase' }}>
            {highestPlan ? highestPlan.investment_plans?.name + ' Member' : 'Explorer'}
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => { if (n.action) n.action(); else setActiveTab(n.id); setSidebarOpen(false) }} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 20px', background: activeTab === n.id ? 'rgba(0,212,255,0.08)' : 'transparent',
              border: 'none', borderLeft: activeTab === n.id ? '2px solid #00D4FF' : '2px solid transparent',
              color: activeTab === n.id ? '#00D4FF' : 'rgba(255,255,255,0.4)',
              fontFamily: "'Courier New',monospace", fontSize: 10, letterSpacing: '0.25em',
              cursor: 'pointer', textAlign: 'left', textTransform: 'uppercase', transition: 'all 0.2s',
            }}>
              <span style={{ fontSize: 14 }}>{n.icon}</span>{n.label}
            </button>
          ))}
        </nav>

        {/* Radar */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(0,212,255,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <RadarSweep size={40} />
          <div>
            <div style={{ fontSize: 7, letterSpacing: '0.3em', color: 'rgba(0,212,255,0.5)', textTransform: 'uppercase' }}>System Status</div>
            <div style={{ fontSize: 9, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>● Online</div>
          </div>
        </div>

        <button onClick={() => { localStorage.removeItem('sx_token'); router.push('/login') }} style={{ margin: '8px 16px', padding: '8px', background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.2)', fontFamily: "'Courier New',monospace", fontSize: 8, letterSpacing: '0.25em', cursor: 'pointer', textTransform: 'uppercase' }}>
          Sign Out
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ marginLeft: window.innerWidth > 768 ? 220 : 0, flex: 1, position: 'relative', zIndex: 10, overflowY: 'auto', minHeight: '100vh' }}>

        {/* Mobile header */}
        <div style={{ display: window.innerWidth <= 768 ? 'flex' : 'none', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(0,212,255,0.08)', position: 'sticky', top: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)', zIndex: 50 }}>
          <button onClick={() => setSidebarOpen(o => !o)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}>☰</button>
          <div style={{ fontSize: 11, letterSpacing: '0.4em', textTransform: 'uppercase' }}>SpaceX Stocks</div>
          <div style={{ width: 24 }} />
        </div>

        <div style={{ padding: 'clamp(16px,3vw,32px)' }}>

          {/* ── DASHBOARD TAB ── */}
          {activeTab === 'dashboard' && (
            <>
              {/* Top bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 'clamp(20px,3vw,28px)', fontWeight: 400, letterSpacing: '-0.01em' }}>Hello, {user?.full_name?.split(' ')[0]}.</div>
                  <div style={{ fontSize: 8, letterSpacing: '0.4em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', marginTop: 4 }}>Mission Control · Your Portfolio</div>
                </div>
                <div style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)', padding: '12px 20px', minWidth: 220 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20 }}>
                    <div>
                      <div style={{ fontSize: 7, letterSpacing: '0.35em', color: 'rgba(0,212,255,0.6)', textTransform: 'uppercase', marginBottom: 4 }}>SPCE · Live</div>
                      <div style={{ fontSize: 22, letterSpacing: '-0.02em', color: prcUp ? '#fff' : 'rgba(255,255,255,0.7)' }}>${spce.toFixed(2)}</div>
                      <div style={{ fontSize: 9, color: prcUp ? '#00D4FF' : 'rgba(255,80,80,0.7)', marginTop: 2 }}>
                        {prcUp ? '▲' : '▼'} {((spce - 120) / 120 * 100).toFixed(2)}% since IPO
                      </div>
                    </div>
                    <MiniChart prices={priceHistory} />
                  </div>
                </div>
              </div>

              {/* Scan line effect on cards */}
              <div style={{ position: 'relative', marginBottom: 20 }}>
                <div style={{ position: 'absolute', top: `${scanLine}%`, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(0,212,255,0.15),transparent)', zIndex: 5, pointerEvents: 'none', transition: 'top 0.03s linear' }} />

                {/* Balance cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 1, background: 'rgba(0,212,255,0.04)' }}>
                  {[
                    { label: 'Available Balance', val: `$${(user?.balance||0).toLocaleString()}`, sub: 'Ready to invest', color: '#00D4FF' },
                    { label: 'Withdrawal Balance', val: `$${(user?.withdrawal_balance||0).toLocaleString()}`, sub: 'Ready to withdraw', color: '#fff' },
                    { label: 'Total Invested', val: `$${totalInvested.toLocaleString()}`, sub: `${activeInv.length} active plan${activeInv.length!==1?'s':''}`, color: 'rgba(0,212,255,0.7)' },
                    { label: 'Weekly Return', val: `$${weeklyReturn.toLocaleString()}`, sub: 'Paid every 7 days', color: '#fff' },
                    { label: 'Total Earned', val: `$${(user?.total_profit||0).toLocaleString()}`, sub: 'All time profits', color: 'rgba(0,212,255,0.7)' },
                  ].map((c, i) => (
                    <div key={i} style={{ background: '#000', padding: '20px 18px', border: '1px solid rgba(255,255,255,0.04)', borderTop: `2px solid ${c.color}`, position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient(ellipse at top left, ${c.color}08, transparent 70%)`, pointerEvents: 'none' }} />
                      <div style={{ fontSize: 7, letterSpacing: '0.38em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: 10 }}>{c.label}</div>
                      <div style={{ fontSize: 'clamp(18px,2.5vw,26px)', letterSpacing: '-0.02em', color: c.color }}>{c.val}</div>
                      <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', marginTop: 4 }}>{c.sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick actions */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 10, marginBottom: 28 }}>
                {[
                  { label: 'Invest Now', icon: '◈', action: () => router.push('/dashboard/invest'), primary: true },
                  { label: 'Withdraw', icon: '↓', action: () => router.push('/dashboard/withdraw') },
                  { label: 'My Perks', icon: '★', action: () => setActiveTab('perks') },
                  { label: 'Profile', icon: '◉', action: () => router.push('/dashboard/profile') },
                ].map((a, i) => (
                  <button key={i} onClick={a.action} style={{
                    padding: '16px 12px', background: a.primary ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.03)',
                    border: a.primary ? '1px solid rgba(0,212,255,0.3)' : '1px solid rgba(255,255,255,0.07)',
                    color: a.primary ? '#00D4FF' : 'rgba(255,255,255,0.6)',
                    fontFamily: "'Courier New',monospace", cursor: 'pointer', textAlign: 'center',
                    transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  }}>
                    <span style={{ fontSize: 20 }}>{a.icon}</span>
                    <span style={{ fontSize: 8, letterSpacing: '0.28em', textTransform: 'uppercase' }}>{a.label}</span>
                  </button>
                ))}
              </div>

              {/* Active investments */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ fontSize: 8, letterSpacing: '0.42em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Active Missions</div>
                  <button onClick={() => router.push('/dashboard/invest')} style={{ fontSize: 8, letterSpacing: '0.25em', color: 'rgba(0,212,255,0.5)', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase' }}>+ New Investment</button>
                </div>
                {activeInv.length === 0 ? (
                  <div style={{ border: '1px solid rgba(255,255,255,0.04)', padding: '32px', textAlign: 'center' }}>
                    <div style={{ fontSize: 28, marginBottom: 12, opacity: 0.3 }}>🚀</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em', marginBottom: 16 }}>No active missions. Start your first investment to begin earning weekly returns.</div>
                    <button onClick={() => router.push('/dashboard/invest')} style={{ background: '#fff', color: '#000', border: 'none', padding: '10px 24px', fontFamily: "'Courier New',monospace", fontSize: 9, letterSpacing: '0.3em', cursor: 'pointer', textTransform: 'uppercase' }}>View Plans →</button>
                  </div>
                ) : (
                  activeInv.map(inv => {
                    const pct = planProgress(inv)
                    const dl = daysLeft(inv)
                    return (
                      <div key={inv.id} style={{ background: 'rgba(0,212,255,0.02)', border: '1px solid rgba(0,212,255,0.1)', padding: '18px 20px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                        <ProgressArc pct={pct} size={56} />
                        <div style={{ flex: 1, minWidth: 120 }}>
                          <div style={{ fontSize: 13, marginBottom: 4 }}>{inv.investment_plans?.name} <span style={{ fontSize: 8, color: 'rgba(0,212,255,0.5)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>· Active</span></div>
                          <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em' }}>${inv.amount.toLocaleString()} invested · {dl} days remaining</div>
                          <div style={{ marginTop: 8, height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 1, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,rgba(0,212,255,0.5),#00D4FF)', transition: 'width 1s ease' }} />
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 7, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: 4 }}>Weekly</div>
                          <div style={{ fontSize: 18, color: '#00D4FF' }}>${inv.weekly_return.toLocaleString()}</div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Mission timeline */}
              <div style={{ border: '1px solid rgba(255,255,255,0.04)', padding: '18px 20px' }}>
                <div style={{ fontSize: 8, letterSpacing: '0.42em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 16 }}>Mission Feed</div>
                {[
                  { icon: '🚀', text: 'Falcon 9 · Starlink Group 15-4 · Launch Successful', time: '2h ago', color: 'rgba(0,212,255,0.5)' },
                  { icon: '📡', text: 'SPCE opened at $160.00 — +33.3% since IPO', time: '6h ago', color: 'rgba(255,255,255,0.4)' },
                  { icon: '🛸', text: 'Starship Flight 9 · Orbital Test · Scheduled', time: '2d away', color: 'rgba(255,200,0,0.5)' },
                  { icon: '💰', text: 'Weekly returns processed for all active plans', time: '3d ago', color: 'rgba(0,212,255,0.4)' },
                ].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                    <span style={{ fontSize: 14 }}>{f.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, color: f.color, letterSpacing: '0.04em', lineHeight: 1.6 }}>{f.text}</div>
                    </div>
                    <div style={{ fontSize: 7, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.2)', whiteSpace: 'nowrap' }}>{f.time}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── PERKS TAB ── */}
          {activeTab === 'perks' && (
            <>
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 'clamp(20px,3vw,28px)', fontWeight: 400, marginBottom: 6 }}>My Perks</div>
                <div style={{ fontSize: 8, letterSpacing: '0.4em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', marginBottom: 24 }}>
                  {highestPlan ? `${highestPlan.investment_plans?.name} Member — ${userPerks.length} perks unlocked` : 'No active plan — invest to unlock perks'}
                </div>

                {!highestPlan && (
                  <div style={{ border: '1px solid rgba(255,255,255,0.06)', padding: '32px', textAlign: 'center', marginBottom: 24 }}>
                    <div style={{ fontSize: 28, marginBottom: 12 }}>🔒</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em', lineHeight: 2, marginBottom: 16 }}>Perks unlock from the Growth plan ($5,000) upward.<br />The higher your plan, the more exclusive your benefits.</div>
                    <button onClick={() => router.push('/dashboard/invest')} style={{ background: '#fff', color: '#000', border: 'none', padding: '10px 24px', fontFamily: "'Courier New',monospace", fontSize: 9, letterSpacing: '0.3em', cursor: 'pointer', textTransform: 'uppercase' }}>View Plans →</button>
                  </div>
                )}

                {/* Active perks */}
                {userPerks.length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 8, letterSpacing: '0.4em', color: 'rgba(0,212,255,0.5)', textTransform: 'uppercase', marginBottom: 14 }}>Unlocked Perks</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 10 }}>
                      {userPerks.map((perk, i) => (
                        <div key={i} style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.15)', padding: '16px 18px', position: 'relative', overflow: 'hidden' }}>
                          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(0,212,255,0.5),transparent)' }} />
                          <div style={{ fontSize: 16, marginBottom: 8 }}>
                            {perk.includes('Tesla') ? '🚗' : perk.includes('Starlink') ? '🛰️' : perk.includes('X Premium') || perk.includes('Grok') ? '𝕏' : perk.includes('event') || perk.includes('Elon') ? '🎟️' : perk.includes('launch') ? '🚀' : perk.includes('merch') ? '📦' : perk.includes('community') ? '👥' : '✦'}
                          </div>
                          <div style={{ fontSize: 10, letterSpacing: '0.04em', color: '#fff', lineHeight: 1.6 }}>{perk}</div>
                          <div style={{ fontSize: 7, letterSpacing: '0.25em', color: 'rgba(0,212,255,0.5)', marginTop: 8, textTransform: 'uppercase' }}>Unlocked</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Locked perks — show next tier */}
                <div>
                  <div style={{ fontSize: 8, letterSpacing: '0.4em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: 14 }}>Upgrade to Unlock More</div>
                  {Object.entries(PLAN_PERKS).filter(([plan]) => {
                    const order = ['Bronze','Starter','Growth','Premium','Elite','Platinum']
                    const curr = highestPlan ? order.indexOf(highestPlan.investment_plans?.name) : -1
                    return order.indexOf(plan) > curr && PLAN_PERKS[plan].length > 0
                  }).slice(0, 2).map(([plan, perks]) => (
                    <div key={plan} style={{ border: '1px solid rgba(255,255,255,0.05)', padding: '16px 18px', marginBottom: 8, opacity: 0.5 }}>
                      <div style={{ fontSize: 9, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 10 }}>🔒 {plan} Plan</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {perks.map((p, i) => (
                          <div key={i} style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', padding: '4px 10px', border: '1px solid rgba(255,255,255,0.06)', letterSpacing: '0.04em' }}>{p}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button onClick={() => router.push('/dashboard/invest')} style={{ marginTop: 12, background: 'transparent', border: '1px solid rgba(0,212,255,0.2)', color: 'rgba(0,212,255,0.6)', padding: '10px 24px', fontFamily: "'Courier New',monospace", fontSize: 9, letterSpacing: '0.28em', cursor: 'pointer', textTransform: 'uppercase' }}>Upgrade Plan →</button>
                </div>
              </div>

              {/* Contact for perk activation */}
              <div style={{ border: '1px solid rgba(255,255,255,0.05)', padding: '18px 20px', background: 'rgba(255,255,255,0.01)' }}>
                <div style={{ fontSize: 8, letterSpacing: '0.38em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: 8 }}>Activate Your Perks</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em', lineHeight: 2 }}>
                  To activate your unlocked perks, contact our team with your account email and plan details.<br />
                  <span style={{ color: 'rgba(0,212,255,0.6)' }}>invest@spacestocks.finance</span>
                </div>
              </div>
            </>
          )}

        </div>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <div style={{ display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.95)', borderTop: '1px solid rgba(0,212,255,0.1)', zIndex: 200, padding: '8px 0 12px' }} id="mobile-nav">
        {NAV.map(n => (
          <button key={n.id} onClick={() => { if (n.action) n.action(); else setActiveTab(n.id) }} style={{
            flex: 1, display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            background: 'none', border: 'none', color: activeTab === n.id ? '#00D4FF' : 'rgba(255,255,255,0.3)',
            fontFamily: "'Courier New',monospace", fontSize: 7, letterSpacing: '0.2em', cursor: 'pointer',
            padding: '6px 0', textTransform: 'uppercase', width: '20%',
          }}>
            <span style={{ fontSize: 16 }}>{n.icon}</span>
            {n.label}
          </button>
        ))}
      </div>

      <style>{`
        @media(max-width:768px){
          #mobile-nav{display:flex!important}
          body{padding-bottom:64px}
        }
        @media(min-width:769px){
          #sidebar-overlay{display:none!important}
        }
      `}</style>
    </div>
  )
}