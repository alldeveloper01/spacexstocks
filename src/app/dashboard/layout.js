'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'

function Starfield() {
  const ref = useRef(null)
  useEffect(() => {
    const cv = ref.current; if (!cv) return
    const ctx = cv.getContext('2d')
    let W = cv.width = window.innerWidth
    let H = cv.height = window.innerHeight
    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.2 + 0.2, o: Math.random() * 0.5 + 0.1,
      s: Math.random() * 0.12 + 0.02
    }))
    let frame
    function draw() {
      ctx.clearRect(0, 0, W, H)
      stars.forEach(s => {
        s.y += s.s; if (s.y > H) { s.y = 0; s.x = Math.random() * W }
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${s.o})`; ctx.fill()
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

function RadarSweep({ size = 40 }) {
  const ref = useRef(null)
  useEffect(() => {
    const cv = ref.current; if (!cv) return
    const ctx = cv.getContext('2d')
    let angle = 0, frame
    function draw() {
      ctx.clearRect(0, 0, size, size)
      const cx = size / 2, cy = size / 2, r = size / 2 - 3
      ctx.strokeStyle = 'rgba(192,192,192,0.15)'; ctx.lineWidth = 0.5
      ;[r * 0.4, r * 0.7, r].forEach(rad => { ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.stroke() })
      ctx.beginPath(); ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r); ctx.stroke()
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle)
      const g = ctx.createLinearGradient(0, 0, r, 0)
      g.addColorStop(0, 'rgba(192,192,192,0.6)'); g.addColorStop(1, 'rgba(192,192,192,0)')
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r, -0.4, 0); ctx.closePath()
      ctx.fillStyle = g; ctx.fill(); ctx.restore()
      angle += 0.04; frame = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(frame)
  }, [])
  return <canvas ref={ref} width={size} height={size} style={{ display: 'block' }} />
}

export default function DashboardLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const token = typeof window !== 'undefined' ? localStorage.getItem('sx_token') : null

  useEffect(() => {
    if (!token) { router.push('/login'); return }
    fetch('/api/auth', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { if (d.error) router.push('/login'); else setUser(d) })
  }, [])

  const NAV = [
  { label: 'Dashboard', icon: '▦', path: '/dashboard' },
  { label: 'Deposit', icon: '↑', path: '/dashboard/deposit' },
  { label: 'Invest', icon: '◈', path: '/dashboard/invest' },
  { label: 'Withdraw', icon: '↓', path: '/dashboard/withdraw' },
  { label: 'Store', icon: '◇', path: '/dashboard/store' },
  { label: 'My Perks', icon: '★', path: '/dashboard/perks' },
  { label: 'Audit Log', icon: '≡', path: '/dashboard/audit' },
  { label: 'Activity', icon: '◎', path: '/dashboard/activity' },
  { label: 'Member ID', icon: '▣', path: '/dashboard/member-id' },
  { label: 'Profile', icon: '◉', path: '/dashboard/profile' },
]

const MOBILE_NAV = [
  { label: 'Home', icon: '▦', path: '/dashboard' },
  { label: 'Deposit', icon: '↑', path: '/dashboard/deposit' },
  { label: 'Invest', icon: '◈', path: '/dashboard/invest' },
  { label: 'Withdraw', icon: '↓', path: '/dashboard/withdraw' },
  { label: 'Profile', icon: '◉', path: '/dashboard/profile' },
]

  const isActive = (path) => path === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(path)

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: "'Courier New',monospace", display: 'flex' }}>
      <Starfield />

      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 99 }} />
      )}

      {/* SIDEBAR */}
      <div style={{
        position: 'fixed', left: 0, top: 0, bottom: 0, width: 220, zIndex: 100,
        background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(192,192,192,0.1)',
        display: 'flex', flexDirection: 'column', padding: '24px 0',
        transition: 'transform 0.3s ease',
      }} className={`sidebar ${mobileOpen ? 'open' : ''}`}>

        {/* Logo */}
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid rgba(192,192,192,0.08)', cursor: 'pointer' }}
          onClick={() => router.push('/landing.html')}>
          <div style={{ fontSize: 13, letterSpacing: '0.45em', color: '#fff', textTransform: 'uppercase', lineHeight: 1.2 }}>SPACEX</div>
          <div style={{ fontSize: 13, letterSpacing: '0.45em', color: 'rgba(192,192,192,0.8)', textTransform: 'uppercase', lineHeight: 1.2 }}>STOCKS</div>
          <div style={{ fontSize: 7, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.18)', marginTop: 6, textTransform: 'uppercase' }}>Mission Control</div>
        </div>

        {/* User */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(192,192,192,0.08)', border: '1px solid rgba(192,192,192,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#C0C0C0', marginBottom: 10 }}>
            {user?.full_name?.[0] || 'U'}
          </div>
          <div style={{ fontSize: 12, color: '#fff', marginBottom: 2 }}>{user?.full_name || '—'}</div>
          <div style={{ fontSize: 7, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase' }}>
            {user?.active_tier || 'Explorer'} Member
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 0', overflowY: 'auto' }}>
          {NAV.map(n => (
            <button key={n.path} onClick={() => { router.push(n.path); setMobileOpen(false) }} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 20px', background: isActive(n.path) ? 'rgba(192,192,192,0.07)' : 'transparent',
              border: 'none', borderLeft: `2px solid ${isActive(n.path) ? '#C0C0C0' : 'transparent'}`,
              color: isActive(n.path) ? '#C0C0C0' : 'rgba(255,255,255,0.38)',
              fontFamily: "'Courier New',monospace", fontSize: 10, letterSpacing: '0.25em',
              cursor: 'pointer', textAlign: 'left', textTransform: 'uppercase', transition: 'all 0.15s',
            }}>
              <span style={{ fontSize: 13, width: 16, textAlign: 'center' }}>{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>

        {/* Radar */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(192,192,192,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <RadarSweep size={38} />
          <div>
            <div style={{ fontSize: 7, letterSpacing: '0.28em', color: 'rgba(192,192,192,0.45)', textTransform: 'uppercase' }}>System</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>● Online</div>
          </div>
        </div>

        <button onClick={() => { localStorage.removeItem('sx_token'); router.push('/login') }} style={{ margin: '6px 16px 0', padding: 9, background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.18)', fontFamily: "'Courier New',monospace", fontSize: 8, letterSpacing: '0.25em', cursor: 'pointer', textTransform: 'uppercase' }}>
          Sign Out
        </button>
      </div>

      {/* MAIN */}
      <div style={{ marginLeft: 220, flex: 1, position: 'relative', zIndex: 10, minHeight: '100vh' }} className="main-content">
        <div className="mobile-topbar" style={{ display: 'none', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid rgba(192,192,192,0.08)', position: 'sticky', top: 0, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(20px)', zIndex: 50 }}>
          <button onClick={() => setMobileOpen(o => !o)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: 18, cursor: 'pointer', padding: 4 }}>☰</button>
          <div style={{ fontSize: 10, letterSpacing: '0.4em', color: '#fff', textTransform: 'uppercase' }}>SpaceX Stocks</div>
          <div style={{ width: 28 }} />
        </div>

        <div style={{ padding: 'clamp(16px,3vw,32px)', paddingBottom: 80 }}>
          {children}
        </div>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <div className="mobile-bottom-nav" style={{ display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.96)', borderTop: '1px solid rgba(192,192,192,0.1)', zIndex: 200, padding: '6px 0 10px' }}>
        {MOBILE_NAV.map(n => (
          <button key={n.path} onClick={() => router.push(n.path)} style={{
            display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            background: 'none', border: 'none', color: isActive(n.path) ? '#C0C0C0' : 'rgba(255,255,255,0.28)',
            fontFamily: "'Courier New',monospace", fontSize: 6, letterSpacing: '0.18em',
            cursor: 'pointer', padding: '5px 0', width: '20%', textTransform: 'uppercase',
          }}>
            <span style={{ fontSize: 15 }}>{n.icon}</span>
            {n.label}
          </button>
        ))}
      </div>

<style>{`
  :root { --accent: #C0C0C0; --accent-dim: rgba(192,192,192,0.6); --accent-subtle: rgba(192,192,192,0.08); --accent-border: rgba(192,192,192,0.15); }
  @media(max-width:768px){
    .sidebar{ transform: translateX(-100%)!important; transition: transform 0.3s ease!important; }
    .sidebar.open{ transform: translateX(0)!important; }
    .main-content{ margin-left:0!important; }
    .mobile-topbar{ display:flex!important; }
    .mobile-bottom-nav{ display:flex!important; }
  }
`}</style>
    </div>
  )
}