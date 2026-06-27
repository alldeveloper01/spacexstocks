'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const S = {
  wrap: { minHeight: '100vh', background: '#000', color: '#fff', fontFamily: "'Courier New',monospace" },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  logo: { fontSize: 10, letterSpacing: '0.4em', color: '#fff', textTransform: 'uppercase' },
  back: { fontSize: 8, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit', textTransform: 'uppercase' },
  main: { maxWidth: 900, margin: '0 auto', padding: '28px 16px' },
  title: { fontSize: 20, fontWeight: 400, marginBottom: 4 },
  sub: { fontSize: 8, letterSpacing: '0.38em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', marginBottom: 20 },
  tabs: { display: 'flex', marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.06)' },
  tab: (a) => ({ padding: '9px 20px', fontSize: 8, letterSpacing: '0.28em', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit', textTransform: 'uppercase', color: a ? '#fff' : 'rgba(255,255,255,0.3)', borderBottom: a ? '1px solid #fff' : '1px solid transparent', marginBottom: -1 }),
  card: { background: '#000', border: '1px solid rgba(255,255,255,0.06)', padding: '16px 18px', marginBottom: 1 },
  top: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
  name: { fontSize: 13 },
  meta: { fontSize: 8, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.1em', marginTop: 3 },
  wallet: { fontSize: 9, color: 'rgba(255,255,255,0.2)', marginTop: 3, wordBreak: 'break-all', fontFamily: "'Courier New',monospace" },
  amount: { fontSize: 20, letterSpacing: '-0.01em' },
  amtLabel: { fontSize: 7, letterSpacing: '0.28em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginTop: 2 },
  actions: { display: 'flex', gap: 8, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', flexWrap: 'wrap' },
  btn: (v) => ({ padding: '6px 14px', fontSize: 8, letterSpacing: '0.22em', cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase', border: 'none', background: v === 'approve' ? '#fff' : v === 'reject' ? 'rgba(255,80,80,0.1)' : 'rgba(255,255,255,0.06)', color: v === 'approve' ? '#000' : v === 'reject' ? 'rgba(255,80,80,0.6)' : 'rgba(255,255,255,0.5)' }),
  badge: (s) => ({ fontSize: 7, letterSpacing: '0.25em', padding: '3px 10px', textTransform: 'uppercase', background: s === 'approved' ? 'rgba(255,255,255,0.06)' : s === 'rejected' ? 'rgba(255,80,80,0.06)' : 'rgba(255,200,0,0.06)', color: s === 'approved' ? 'rgba(255,255,255,0.5)' : s === 'rejected' ? 'rgba(255,80,80,0.5)' : 'rgba(255,200,0,0.5)', border: '1px solid rgba(255,255,255,0.06)' }),
}

export default function AdminWithdrawalsPage() {
  const router = useRouter()
  const [withdrawals, setWithdrawals] = useState([])
  const [tab, setTab] = useState('pending')
  const token = typeof window !== 'undefined' ? localStorage.getItem('sx_token') : null

  useEffect(() => {
    if (!token) { router.push('/login'); return }
    fetch('/api/admin/withdrawals', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setWithdrawals(d.withdrawals || []))
  }, [])

  const filtered = withdrawals.filter(w => tab === 'all' ? true : w.status === tab)

  const action = async (id, act) => {
    const note = act === 'reject' ? prompt('Rejection reason (optional):') : null
    await fetch('/api/admin/withdrawals', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ withdrawal_id: id, action: act, admin_note: note }),
    })
    setWithdrawals(ws => ws.map(w => w.id === id ? { ...w, status: act === 'approve' ? 'approved' : 'rejected' } : w))
  }

  return (
    <div style={S.wrap}>
      <nav style={S.nav}>
        <div style={S.logo}>SpaceX Stocks · Withdrawals</div>
        <button style={S.back} onClick={() => router.push('/admin')}>← Admin</button>
      </nav>
      <main style={S.main}>
        <div style={S.title}>Withdrawals <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }}>({filtered.length})</span></div>
        <div style={S.sub}>Review and process member withdrawal requests</div>
        <div style={S.tabs}>
          {['pending', 'approved', 'rejected', 'all'].map(t => (
            <button key={t} style={S.tab(tab === t)} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>
        {filtered.map(w => (
          <div key={w.id} style={S.card}>
            <div style={S.top}>
              <div>
                <div style={S.name}>{w.users?.full_name}</div>
                <div style={S.meta}>{w.users?.email} · {new Date(w.created_at).toLocaleString()}</div>
                <div style={S.wallet}>{w.wallet_address}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={S.amount}>${w.amount.toLocaleString()}</div>
                <div style={S.amtLabel}>{w.currency}</div>
                <div style={{ marginTop: 6 }}><span style={S.badge(w.status)}>{w.status}</span></div>
              </div>
            </div>
            {w.status === 'pending' && (
              <div style={S.actions}>
                <button style={S.btn('approve')} onClick={() => action(w.id, 'approve')}>Approve & Send</button>
                <button style={S.btn('reject')} onClick={() => action(w.id, 'reject')}>Reject</button>
              </div>
            )}
            {w.admin_note && <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', marginTop: 8, letterSpacing: '0.08em' }}>Note: {w.admin_note}</div>}
          </div>
        ))}
        {filtered.length === 0 && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', padding: '20px 0' }}>No {tab} withdrawals</div>}
      </main>
    </div>
  )
}
