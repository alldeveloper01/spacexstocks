'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const PLAN_COLORS = { Bronze: '#CD7F32', Starter: '#C9A84C', Growth: '#2196F3', Premium: '#9C27B0', Elite: '#FF9800', Platinum: '#4CAF50' }

const S = {
  wrap: { minHeight: '100vh', background: '#000', color: '#fff', fontFamily: "'Courier New',monospace" },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  logo: { fontSize: 10, letterSpacing: '0.4em', color: '#fff', textTransform: 'uppercase' },
  back: { fontSize: 8, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit', textTransform: 'uppercase' },
  main: { maxWidth: 1100, margin: '0 auto', padding: '28px 16px' },
  title: { fontSize: 20, fontWeight: 400, marginBottom: 4 },
  sub: { fontSize: 8, letterSpacing: '0.38em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', marginBottom: 20 },
  tabs: { display: 'flex', gap: 0, marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.06)' },
  tab: (a) => ({ padding: '9px 20px', fontSize: 8, letterSpacing: '0.28em', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit', textTransform: 'uppercase', color: a ? '#fff' : 'rgba(255,255,255,0.3)', borderBottom: a ? '1px solid #fff' : '1px solid transparent', marginBottom: -1 }),
  card: { background: '#000', border: '1px solid rgba(255,255,255,0.06)', padding: '16px 18px', marginBottom: 1, borderLeft: '3px solid' },
  top: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
  name: { fontSize: 13 },
  meta: { fontSize: 8, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.1em', marginTop: 3 },
  nums: { display: 'flex', gap: 20, flexWrap: 'wrap', textAlign: 'right' },
  num: { textAlign: 'right' },
  nv: { fontSize: 14 },
  nl: { fontSize: 7, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginTop: 2 },
  actions: { display: 'flex', gap: 8, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)' },
  btn: (v) => ({ padding: '6px 14px', fontSize: 8, letterSpacing: '0.22em', cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase', border: 'none', background: v === 'primary' ? '#fff' : 'rgba(255,255,255,0.06)', color: v === 'primary' ? '#000' : 'rgba(255,255,255,0.5)' }),
}

export default function AdminInvestmentsPage() {
  const router = useRouter()
  const [investments, setInvestments] = useState([])
  const [tab, setTab] = useState('active')
  const token = typeof window !== 'undefined' ? localStorage.getItem('sx_token') : null

  useEffect(() => {
    if (!token) { router.push('/login'); return }
    fetch('/api/admin/investments', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setInvestments(d.investments || []))
  }, [])

  const filtered = investments.filter(i => tab === 'all' ? true : i.status === tab)

  const action = async (id, act) => {
    if (act === 'complete' && !confirm('Complete this plan and credit total profit to member?')) return
    await fetch('/api/admin/investments', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ investment_id: id, action: act }),
    })
    if (act === 'complete') setInvestments(inv => inv.map(i => i.id === id ? { ...i, status: 'completed' } : i))
    if (act === 'pay_weekly') alert('Weekly return paid and email sent')
  }

  const color = (inv) => PLAN_COLORS[inv.investment_plans?.name] || '#fff'
  const daysLeft = (inv) => {
    if (!inv.end_date) return '—'
    const d = Math.ceil((new Date(inv.end_date) - new Date()) / 86400000)
    return d > 0 ? `${d}d left` : 'Ending'
  }

  return (
    <div style={S.wrap}>
      <nav style={S.nav}>
        <div style={S.logo}>SpaceX Stocks · Investments</div>
        <button style={S.back} onClick={() => router.push('/admin')}>← Admin</button>
      </nav>
      <main style={S.main}>
        <div style={S.title}>Investments <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }}>({filtered.length})</span></div>
        <div style={S.sub}>Manage all member investment plans</div>
        <div style={S.tabs}>
          {['active', 'completed', 'all'].map(t => (
            <button key={t} style={S.tab(tab === t)} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>
        {filtered.map(inv => (
          <div key={inv.id} style={{ ...S.card, borderLeftColor: color(inv) }}>
            <div style={S.top}>
              <div>
                <div style={S.name}>{inv.users?.full_name} <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>· {inv.investment_plans?.name}</span></div>
                <div style={S.meta}>{inv.users?.email} · Started {new Date(inv.start_date || inv.created_at).toLocaleDateString()} · {daysLeft(inv)}</div>
              </div>
              <div style={S.nums}>
                <div style={S.num}><div style={S.nv}>${inv.amount.toLocaleString()}</div><div style={S.nl}>Invested</div></div>
                <div style={S.num}><div style={S.nv}>${inv.weekly_return.toLocaleString()}</div><div style={S.nl}>Weekly</div></div>
                <div style={S.num}><div style={S.nv}>${inv.target_profit.toLocaleString()}</div><div style={S.nl}>Total Return</div></div>
              </div>
            </div>
            {inv.status === 'active' && (
              <div style={S.actions}>
                <button style={S.btn('primary')} onClick={() => action(inv.id, 'pay_weekly')}>Pay Weekly Return</button>
                <button style={S.btn()} onClick={() => action(inv.id, 'complete')}>Mark Complete</button>
              </div>
            )}
            {inv.status === 'completed' && (
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.2em', paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.04)', textTransform: 'uppercase' }}>Completed — ${inv.target_profit.toLocaleString()} credited</div>
            )}
          </div>
        ))}
      </main>
    </div>
  )
}
