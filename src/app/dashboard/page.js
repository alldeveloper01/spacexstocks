'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

function RadarSweep({ size = 80 }) {
  const ref = useRef(null)
  useEffect(() => {
    const cv = ref.current; if (!cv) return
    const ctx = cv.getContext('2d')
    let angle = 0, frame
    function draw() {
      ctx.clearRect(0, 0, size, size)
      const cx = size/2, cy = size/2, r = size/2 - 4
      ctx.strokeStyle = 'rgba(192,192,192,0.12)'; ctx.lineWidth = 0.5
      ;[r*0.33,r*0.66,r].forEach(rad=>{ctx.beginPath();ctx.arc(cx,cy,rad,0,Math.PI*2);ctx.stroke()})
      ctx.beginPath();ctx.moveTo(cx-r,cy);ctx.lineTo(cx+r,cy);ctx.stroke()
      ctx.beginPath();ctx.moveTo(cx,cy-r);ctx.lineTo(cx,cy+r);ctx.stroke()
      ctx.save();ctx.translate(cx,cy);ctx.rotate(angle)
      const g=ctx.createLinearGradient(0,0,r,0)
      g.addColorStop(0,'rgba(192,192,192,0.5)');g.addColorStop(1,'rgba(192,192,192,0)')
      ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,r,-0.3,0);ctx.closePath()
      ctx.fillStyle=g;ctx.fill();ctx.restore()
      angle+=0.03;frame=requestAnimationFrame(draw)
    }
    draw()
    return ()=>cancelAnimationFrame(frame)
  },[])
  return <canvas ref={ref} width={size} height={size} style={{display:'block'}}/>
}

function MiniChart({ prices }) {
  if (!prices||prices.length<2) return null
  const W=200,H=48,min=Math.min(...prices),max=Math.max(...prices),range=max-min||1
  const pts=prices.map((p,i)=>`${(i/(prices.length-1))*W},${H-((p-min)/range)*(H-8)-4}`).join(' ')
  const areaPoints=`0,${H} ${pts.split(' ').join(' ')} ${W},${H}`
  return (
    <svg width={W} height={H} style={{display:'block',overflow:'visible'}}>
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C0C0C0" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="#C0C0C0" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#cg)"/>
      <polyline points={pts} fill="none" stroke="#C0C0C0" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  )
}

function ProgressArc({ pct, size=52 }) {
  const r=size/2-5,circ=2*Math.PI*r,dash=(pct/100)*circ
  return (
    <svg width={size} height={size} style={{transform:'rotate(-90deg)',flexShrink:0}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2.5"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#C0C0C0" strokeWidth="2.5"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{transition:'stroke-dasharray 1s ease'}}/>
    </svg>
  )
}

function LoadingScreen() {
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'70vh',flexDirection:'column',gap:24}}>
      <RadarSweep size={72}/>
      <div style={{fontFamily:"'Courier New',monospace",fontSize:8,letterSpacing:'0.5em',color:'rgba(192,192,192,0.4)',textTransform:'uppercase'}}>
        Initializing Mission Control
      </div>
      <div style={{display:'flex',gap:4}}>
        {[0,1,2].map(i=>(
          <div key={i} style={{
            width:4,height:4,background:'rgba(192,192,192,0.4)',
            animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite`,
          }}/>
        ))}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:0.2}50%{opacity:1}}`}</style>
    </div>
  )
}

function TopupModal({ inv, allPlans, user, token, onClose, onSuccess }) {
  const [mode, setMode] = useState('topup') // 'topup' | 'upgrade'
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const currentPlanIndex = allPlans.findIndex(p => p.id === inv.plan_id)
  const nextPlan = currentPlanIndex < allPlans.length - 1 ? allPlans[currentPlanIndex + 1] : null
  const upgradeCost = nextPlan ? Math.max(0, nextPlan.min_amount - inv.amount) : 0

  const plan = inv.investment_plans
  const rate = plan.weekly_return / plan.min_amount

  const previewExtra = amount && !isNaN(amount)
    ? Math.floor(parseFloat(amount) * rate)
    : 0

  async function handleSubmit() {
    setError('')
    setLoading(true)
    try {
      const body = mode === 'topup'
        ? { investment_id: inv.id, action: 'topup', amount: parseFloat(amount) }
        : { investment_id: inv.id, action: 'upgrade' }

      const res = await fetch('/api/plans/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setLoading(false); return }
      onSuccess(data, mode)
    } catch { setError('Something went wrong') }
    setLoading(false)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 20
    }}>
      <div style={{
        background: '#000', border: '1px solid rgba(192,192,192,0.2)',
        padding: 28, width: '100%', maxWidth: 420, position: 'relative'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 14, right: 16,
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)',
          fontSize: 18, cursor: 'pointer', fontFamily: 'inherit'
        }}>×</button>

        <div style={{ fontFamily: "'Courier New',monospace", fontSize: 8, letterSpacing: '0.4em', color: 'rgba(192,192,192,0.5)', textTransform: 'uppercase', marginBottom: 16 }}>
          {inv.investment_plans?.name} Plan
        </div>

        {/* Mode tabs */}
        <div style={{ display: 'flex', gap: 1, marginBottom: 24, background: 'rgba(255,255,255,0.04)', padding: 3 }}>
          {['topup', ...(nextPlan ? ['upgrade'] : [])].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); setAmount('') }} style={{
              flex: 1, padding: '9px 0',
              background: mode === m ? 'rgba(192,192,192,0.1)' : 'transparent',
              border: 'none',
              borderBottom: mode === m ? '1px solid #C0C0C0' : '1px solid transparent',
              color: mode === m ? '#C0C0C0' : 'rgba(255,255,255,0.3)',
              fontFamily: "'Courier New',monospace",
              fontSize: 8, letterSpacing: '0.28em', textTransform: 'uppercase', cursor: 'pointer'
            }}>
              {m === 'topup' ? 'Top Up' : `Upgrade to ${nextPlan?.name}`}
            </button>
          ))}
        </div>

        {mode === 'topup' && (
          <>
            <div style={{ fontFamily: "'Courier New',monospace", fontSize: 9, color: 'rgba(255,255,255,0.3)', lineHeight: 2, marginBottom: 20, padding: '10px 14px', border: '1px solid rgba(255,255,255,0.05)' }}>
              Current weekly: <span style={{ color: '#C0C0C0' }}>${inv.weekly_return.toLocaleString()}</span><br/>
              Your balance: <span style={{ color: '#C0C0C0' }}>${(user?.balance || 0).toLocaleString()}</span>
            </div>

            <label style={{ fontFamily: "'Courier New',monospace", fontSize: 7, letterSpacing: '0.38em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>
              Top-Up Amount (USD) · Min $100
            </label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Enter amount"
              style={{ width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', padding: '12px 14px', color: '#fff', fontFamily: "'Courier New',monospace", fontSize: 14, outline: 'none', marginBottom: 12, boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
              {[100, 500, 1000, 2000].map(v => (
                <button key={v} onClick={() => setAmount(String(v))} style={{
                  padding: '5px 10px', fontSize: 8, letterSpacing: '0.18em',
                  cursor: 'pointer', background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.4)', fontFamily: 'inherit'
                }}>${v.toLocaleString()}</button>
              ))}
            </div>

            {previewExtra > 0 && (
              <div style={{ background: 'rgba(192,192,192,0.04)', border: '1px solid rgba(192,192,192,0.12)', padding: '12px 14px', marginBottom: 16 }}>
                <div style={{ fontFamily: "'Courier New',monospace", fontSize: 8, color: 'rgba(192,192,192,0.5)', letterSpacing: '0.1em', marginBottom: 4 }}>PREVIEW</div>
                <div style={{ fontFamily: "'Courier New',monospace", fontSize: 12, color: '#C0C0C0' }}>
                  +${previewExtra.toLocaleString()} / week → New total: ${(inv.weekly_return + previewExtra).toLocaleString()} / week
                </div>
              </div>
            )}
          </>
        )}

        {mode === 'upgrade' && nextPlan && (
          <div style={{ fontFamily: "'Courier New',monospace", fontSize: 9, color: 'rgba(255,255,255,0.3)', lineHeight: 2.2, marginBottom: 20, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ marginBottom: 8, color: 'rgba(192,192,192,0.6)', fontSize: 10 }}>
              {inv.investment_plans?.name} → {nextPlan.name}
            </div>
            Upgrade cost: <span style={{ color: '#C0C0C0' }}>${upgradeCost.toLocaleString()}</span><br/>
            New weekly return: <span style={{ color: '#C0C0C0' }}>${nextPlan.weekly_return.toLocaleString()}</span><br/>
            New duration: <span style={{ color: '#C0C0C0' }}>{nextPlan.duration_days} days</span><br/>
            Your balance: <span style={{ color: upgradeCost > (user?.balance || 0) ? 'rgba(255,80,80,0.7)' : '#C0C0C0' }}>${(user?.balance || 0).toLocaleString()}</span>
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(255,80,80,0.06)', border: '1px solid rgba(255,80,80,0.2)', padding: '10px 14px', fontFamily: "'Courier New',monospace", fontSize: 9, color: 'rgba(255,80,80,0.7)', marginBottom: 16 }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || (mode === 'topup' && (!amount || parseFloat(amount) < 100))}
          style={{
            width: '100%', background: '#fff', color: '#000', border: 'none',
            padding: 13, fontFamily: "'Courier New',monospace",
            fontSize: 9, letterSpacing: '0.35em', cursor: 'pointer',
            fontWeight: 700, textTransform: 'uppercase',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Processing...' : mode === 'topup' ? 'Confirm Top-Up →' : `Upgrade to ${nextPlan?.name} →`}
        </button>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [investments, setInvestments] = useState([])
  const [allPlans, setAllPlans] = useState([])
  const [spce, setSpce] = useState(153.23)
  const [priceHistory, setPriceHistory] = useState([153.23])
  const [ipoChangePct, setIpoChangePct] = useState('13.50')
  const [dayChangePct, setDayChangePct] = useState('0.15')
  const [loading, setLoading] = useState(true)
  const [scanLine, setScanLine] = useState(0)
  const [greeting, setGreeting] = useState('Hello')
  const [topupInv, setTopupInv] = useState(null)
  const [topupSuccess, setTopupSuccess] = useState(null)
  const token = typeof window !== 'undefined' ? localStorage.getItem('sx_token') : null

  useEffect(() => {
    const h = new Date().getHours()
    if (h < 12) setGreeting('Good morning')
    else if (h < 17) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [])

  const loadData = () => {
    fetch('/api/auth', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { if (d.error) router.push('/login'); else setUser(d) })

    fetch('/api/plans', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => {
        setInvestments(d.investments || [])
        setAllPlans(d.plans || [])
        setLoading(false)
      })
  }

  useEffect(() => {
    if (!token) { router.push('/login'); return }
    loadData()

    const fetchPrice = async () => {
      try {
        const r = await fetch('/api/public/spcx-price')
        const d = await r.json()
        const p = parseFloat(d.price)
        setSpce(p)
        setPriceHistory(h => [...h.slice(-49), p])
        setIpoChangePct(d.ipo_change_pct)
        setDayChangePct(d.change_pct)
      } catch {}
    }
    fetchPrice()
    const iv = setInterval(fetchPrice, 60000)
    const sl = setInterval(() => setScanLine(l => (l + 1) % 100), 30)
    return () => { clearInterval(iv); clearInterval(sl) }
  }, [])

  const activeInv = investments.filter(i => i.status === 'active')
  const totalInvested = activeInv.reduce((s, i) => s + i.amount, 0)
  const weeklyReturn = activeInv.reduce((s, i) => s + i.weekly_return, 0)
  const daysLeft = inv => !inv.end_date ? 0 : Math.max(0, Math.ceil((new Date(inv.end_date) - new Date()) / 86400000))
  const planProgress = inv => {
    if (!inv.end_date || !inv.created_at) return 0
    return Math.min(100, Math.round((Date.now() - new Date(inv.created_at)) / (new Date(inv.end_date) - new Date(inv.created_at)) * 100))
  }

  const isHighestPlan = inv => {
    const idx = allPlans.findIndex(p => p.id === inv.plan_id)
    return idx === allPlans.length - 1
  }

  if (loading) return <LoadingScreen />

  const dayUp = parseFloat(dayChangePct) >= 0
  const ipoUp = parseFloat(ipoChangePct) >= 0

  return (
    <div>
      {topupInv && (
        <TopupModal
          inv={topupInv}
          allPlans={allPlans}
          user={user}
          token={token}
          onClose={() => { setTopupInv(null); setTopupSuccess(null) }}
          onSuccess={(data, mode) => {
            setTopupInv(null)
            setTopupSuccess({ data, mode })
            loadData()
          }}
        />
      )}

      {topupSuccess && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: '#000', border: '1px solid rgba(192,192,192,0.3)',
          padding: '14px 24px', zIndex: 999,
          fontFamily: "'Courier New',monospace", fontSize: 9,
          letterSpacing: '0.18em', color: '#C0C0C0', textTransform: 'uppercase',
          whiteSpace: 'nowrap'
        }}>
          {topupSuccess.mode === 'topup'
            ? `✓ Top-up confirmed — +$${topupSuccess.data.extra_weekly?.toLocaleString()} weekly`
            : `✓ Upgraded to ${topupSuccess.data.new_plan} — $${topupSuccess.data.new_weekly?.toLocaleString()} / week`
          }
          <button onClick={() => setTopupSuccess(null)} style={{ marginLeft: 16, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 14 }}>×</button>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontFamily: "'Courier New',monospace", fontSize: 8, letterSpacing: '0.42em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: 8 }}>
            {greeting},
          </div>
          <div style={{ fontFamily: "'Courier New',monospace", fontSize: 'clamp(24px,4vw,36px)', fontWeight: 400, letterSpacing: '-0.01em', color: '#fff' }}>
            {user?.full_name?.split(' ')[0]}.
          </div>
          <div style={{ fontFamily: "'Courier New',monospace", fontSize: 7, letterSpacing: '0.38em', color: 'rgba(255,255,255,0.18)', textTransform: 'uppercase', marginTop: 6 }}>
            Mission Control · Your Portfolio
          </div>
        </div>

        {/* SPCX ticker */}
        <div style={{ background: 'rgba(192,192,192,0.04)', border: '1px solid rgba(192,192,192,0.12)', padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24 }}>
            <div>
              <div style={{ fontFamily: "'Courier New',monospace", fontSize: 7, letterSpacing: '0.38em', color: 'rgba(192,192,192,0.5)', textTransform: 'uppercase', marginBottom: 6 }}>
                SPCX · Live
              </div>
              <div style={{ fontFamily: "'Courier New',monospace", fontSize: 24, letterSpacing: '-0.02em', color: '#fff' }}>
                ${spce.toFixed(2)}
              </div>
              <div style={{ fontFamily: "'Courier New',monospace", fontSize: 9, color: dayUp ? '#C0C0C0' : 'rgba(255,80,80,0.7)', marginTop: 4 }}>
                {dayUp ? '▲' : '▼'} {dayChangePct}% today
              </div>
              <div style={{ fontFamily: "'Courier New',monospace", fontSize: 8, color: 'rgba(255,255,255,0.2)', marginTop: 2 }}>
                {ipoUp ? '+' : ''}{ipoChangePct}% since IPO · $135
              </div>
            </div>
            <MiniChart prices={priceHistory} />
          </div>
        </div>
      </div>

      {/* Balance cards */}
      <div style={{ position: 'relative', marginBottom: 24 }}>
        <div style={{ position: 'absolute', top: `${scanLine}%`, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(192,192,192,0.1),transparent)', zIndex: 5, pointerEvents: 'none' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 1, background: 'rgba(192,192,192,0.04)' }}>
          {[
            { label: 'Available Balance', val: `$${(user?.balance || 0).toLocaleString()}`, sub: 'Ready to invest', accent: '#C0C0C0' },
            { label: 'Withdrawal Balance', val: `$${(user?.withdrawal_balance || 0).toLocaleString()}`, sub: 'Ready to withdraw', accent: 'rgba(255,255,255,0.6)' },
            { label: 'Total Invested', val: `$${totalInvested.toLocaleString()}`, sub: `${activeInv.length} active plan${activeInv.length !== 1 ? 's' : ''}`, accent: 'rgba(192,192,192,0.6)' },
            { label: 'Weekly Return', val: `$${weeklyReturn.toLocaleString()}`, sub: 'Paid every 7 days', accent: 'rgba(255,255,255,0.6)' },
            { label: 'Total Earned', val: `$${(user?.total_profit || 0).toLocaleString()}`, sub: 'All time profits', accent: 'rgba(192,192,192,0.5)' },
          ].map((c, i) => (
            <div key={i} style={{ background: '#000', padding: '20px 18px', borderTop: `2px solid ${c.accent}`, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient(ellipse at top left,${c.accent}08,transparent 70%)`, pointerEvents: 'none' }} />
              <div style={{ fontFamily: "'Courier New',monospace", fontSize: 7, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: 10 }}>
                {c.label}
              </div>
              <div style={{ fontFamily: "'Courier New',monospace", fontSize: 'clamp(18px,2.5vw,26px)', letterSpacing: '-0.02em', color: c.accent }}>
                {c.val}
              </div>
              <div style={{ fontFamily: "'Courier New',monospace", fontSize: 8, color: 'rgba(255,255,255,0.18)', marginTop: 6, letterSpacing: '0.06em' }}>
                {c.sub}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(110px,1fr))', gap: 8, marginBottom: 28 }}>
        {[
          { label: 'Invest Now', icon: '◈', path: '/dashboard/invest', primary: true },
          { label: 'Withdraw', icon: '↓', path: '/dashboard/withdraw' },
          { label: 'Store', icon: '◇', path: '/dashboard/store' },
          { label: 'My Perks', icon: '★', path: '/dashboard/perks' },
        ].map((a, i) => (
          <button key={i} onClick={() => router.push(a.path)} style={{
            padding: '18px 12px',
            background: a.primary ? 'rgba(192,192,192,0.08)' : 'rgba(255,255,255,0.02)',
            border: a.primary ? '1px solid rgba(192,192,192,0.25)' : '1px solid rgba(255,255,255,0.06)',
            color: a.primary ? '#C0C0C0' : 'rgba(255,255,255,0.4)',
            fontFamily: "'Courier New',monospace",
            cursor: 'pointer', textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
            transition: 'all 0.2s',
          }}>
            <span style={{ fontSize: 20 }}>{a.icon}</span>
            <span style={{ fontSize: 7, letterSpacing: '0.28em', textTransform: 'uppercase' }}>{a.label}</span>
          </button>
        ))}
      </div>

      {/* Active missions */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontFamily: "'Courier New',monospace", fontSize: 7, letterSpacing: '0.42em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase' }}>
            Active Missions
          </div>
          <button onClick={() => router.push('/dashboard/invest')} style={{
            fontFamily: "'Courier New',monospace", fontSize: 7, letterSpacing: '0.28em',
            color: 'rgba(192,192,192,0.5)', background: 'none', border: 'none',
            cursor: 'pointer', textTransform: 'uppercase',
          }}>
            + New Investment
          </button>
        </div>

        {activeInv.length === 0 ? (
          <div style={{ border: '1px solid rgba(255,255,255,0.05)', padding: '48px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 16, opacity: 0.2 }}>🚀</div>
            <div style={{ fontFamily: "'Courier New',monospace", fontSize: 9, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.1em', lineHeight: 2, marginBottom: 24 }}>
              No active missions.<br />Start your first investment to begin earning weekly returns.
            </div>
            <button onClick={() => router.push('/dashboard/invest')} style={{
              background: '#fff', color: '#000', border: 'none',
              padding: '11px 28px', fontFamily: "'Courier New',monospace",
              fontSize: 9, letterSpacing: '0.35em', cursor: 'pointer',
              fontWeight: 700, textTransform: 'uppercase',
            }}>
              View Plans →
            </button>
          </div>
        ) : (
          <div style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
            {activeInv.map((inv, i) => (
              <div key={inv.id}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '18px 20px', flexWrap: 'wrap',
                  borderBottom: i < activeInv.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                }}>
                  <ProgressArc pct={planProgress(inv)} size={48} />
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <div style={{ fontFamily: "'Courier New',monospace", fontSize: 12, color: '#fff', letterSpacing: '0.06em' }}>
                        {inv.investment_plans?.name}
                      </div>
                      <span style={{
                        fontFamily: "'Courier New',monospace", fontSize: 7,
                        letterSpacing: '0.25em', textTransform: 'uppercase',
                        padding: '2px 8px', background: 'rgba(192,192,192,0.08)',
                        color: 'rgba(192,192,192,0.6)', border: '1px solid rgba(192,192,192,0.15)',
                      }}>
                        Active
                      </span>
                    </div>
                    <div style={{ fontFamily: "'Courier New',monospace", fontSize: 8, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em', marginBottom: 10 }}>
                      ${inv.amount.toLocaleString()} invested · {daysLeft(inv)} days remaining
                    </div>
                    <div style={{ height: 2, background: 'rgba(255,255,255,0.05)' }}>
                      <div style={{ height: '100%', width: `${planProgress(inv)}%`, background: 'linear-gradient(90deg,rgba(192,192,192,0.3),#C0C0C0)', transition: 'width 1s ease' }} />
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: "'Courier New',monospace", fontSize: 7, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: 4 }}>
                      Weekly Return
                    </div>
                    <div style={{ fontFamily: "'Courier New',monospace", fontSize: 20, letterSpacing: '-0.02em', color: '#C0C0C0' }}>
                      ${inv.weekly_return.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Top-up / Upgrade buttons */}
                <div style={{
                  display: 'flex', gap: 8, padding: '12px 20px',
                  borderBottom: i < activeInv.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  background: 'rgba(255,255,255,0.01)'
                }}>
                  <button onClick={() => setTopupInv(inv)} style={{
                    padding: '7px 16px', fontFamily: "'Courier New',monospace",
                    fontSize: 7, letterSpacing: '0.28em', textTransform: 'uppercase',
                    background: 'transparent', border: '1px solid rgba(192,192,192,0.2)',
                    color: 'rgba(192,192,192,0.6)', cursor: 'pointer', transition: 'all 0.2s'
                  }}>
                    ↑ Top Up
                  </button>
                  {!isHighestPlan(inv) && (
                    <button onClick={() => { setTopupInv(inv) }} style={{
                      padding: '7px 16px', fontFamily: "'Courier New',monospace",
                      fontSize: 7, letterSpacing: '0.28em', textTransform: 'uppercase',
                      background: 'rgba(192,192,192,0.06)', border: '1px solid rgba(192,192,192,0.15)',
                      color: 'rgba(192,192,192,0.5)', cursor: 'pointer', transition: 'all 0.2s'
                    }}>
                      ⬆ Upgrade Plan
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mission feed */}
      <div>
        <div style={{ fontFamily: "'Courier New',monospace", fontSize: 7, letterSpacing: '0.42em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', marginBottom: 16 }}>
          Mission Feed
        </div>
        <div style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          {[
            { icon: '🚀', text: 'Falcon 9 · Starlink Group 15-4 · Launch Successful', time: '2h ago', color: 'rgba(192,192,192,0.6)' },
            { icon: '📡', text: `SPCX live at $${spce.toFixed(2)} — ${ipoUp ? '+' : ''}${ipoChangePct}% since IPO`, time: 'Now', color: 'rgba(255,255,255,0.45)' },
            { icon: '🛸', text: 'Starship Flight 9 · Orbital Test · Scheduled', time: '2d away', color: 'rgba(255,200,0,0.5)' },
            { icon: '💰', text: 'Weekly returns processed for all active plans', time: '3d ago', color: 'rgba(192,192,192,0.4)' },
          ].map((f, i, arr) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 14,
              padding: '14px 20px',
              borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
            }}>
              <span style={{ fontSize: 14, flexShrink: 0, opacity: 0.7 }}>{f.icon}</span>
              <div style={{ flex: 1, fontFamily: "'Courier New',monospace", fontSize: 10, color: f.color, letterSpacing: '0.04em', lineHeight: 1.8 }}>
                {f.text}
              </div>
              <div style={{ fontFamily: "'Courier New',monospace", fontSize: 7, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.18)', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>
                {f.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}