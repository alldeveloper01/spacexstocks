'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const S = {
  wrap: { minHeight: '100vh', background: '#000', color: '#fff', fontFamily: "'Courier New',monospace" },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', gap: 12 },
  logo: { fontSize: 10, letterSpacing: '0.4em', color: '#fff', textTransform: 'uppercase' },
  navLinks: { display: 'flex', gap: 16, flexWrap: 'wrap' },
  nl: { fontSize: 8, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit' },
  main: { maxWidth: 1100, margin: '0 auto', padding: '28px 16px' },
  title: { fontSize: 20, fontWeight: 400, marginBottom: 4 },
  sub: { fontSize: 8, letterSpacing: '0.38em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', marginBottom: 28 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 1, background: 'rgba(255,255,255,0.04)', marginBottom: 28 },
  card: { background: '#000', padding: '18px 16px', border: '1px solid rgba(255,255,255,0.04)' },
  cardLabel: { fontSize: 7, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: 8 },
  cardVal: { fontSize: 22, letterSpacing: '-0.02em' },
  cardSub: { fontSize: 8, color: 'rgba(255,255,255,0.2)', marginTop: 4 },
  section: { marginBottom: 24 },
  sHead: { fontSize: 8, letterSpacing: '0.4em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', marginBottom: 12 },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', border: '1px solid rgba(255,255,255,0.04)', marginBottom: 1, background: 'rgba(255,255,255,0.01)', flexWrap: 'wrap', gap: 8 },
  btn: (variant) => ({
    padding: '6px 14px', fontSize: 8, letterSpacing: '0.22em', cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase',
    background: variant === 'primary' ? '#fff' : 'transparent',
    color: variant === 'primary' ? '#000' : 'rgba(255,255,255,0.4)',
    border: variant === 'primary' ? 'none' : '1px solid rgba(255,255,255,0.12)',
  }),
}

export default function AdminPage() {
  const router = useRouter()
  const [stats, setStats] = useState({})
  const [users, setUsers] = useState([])
  const [investments, setInvestments] = useState([])
  const [withdrawals, setWithdrawals] = useState([])
  const [loading, setLoading] = useState(true)

  const token = typeof window !== 'undefined' ? localStorage.getItem('sx_token') : null

  useEffect(() => {
    if (!token) { router.push('/login'); return }
    Promise.all([
      fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/admin/investments', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/admin/withdrawals', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([u, inv, w]) => {
      setUsers(u.users || [])
      setInvestments(inv.investments || [])
      setWithdrawals(w.withdrawals || [])
      const totalDeposited = (u.users || []).reduce((s, u) => s + (u.total_deposited || 0), 0)
      const totalProfit = (u.users || []).reduce((s, u) => s + (u.total_profit || 0), 0)
      const activeInv = (inv.investments || []).filter(i => i.status === 'active')
      const pendingW = (w.withdrawals || []).filter(i => i.status === 'pending')
      setStats({ totalDeposited, totalProfit, activeInv: activeInv.length, pendingW: pendingW.length, totalUsers: (u.users || []).length })
      setLoading(false)
    })
  }, [])

  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').slice(0, 5)
  const activeInvestments = investments.filter(i => i.status === 'active').slice(0, 5)

  const handleWithdrawal = async (id, action) => {
    await fetch('/api/admin/withdrawals', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ withdrawal_id: id, action }),
    })
    setWithdrawals(ws => ws.map(w => w.id === id ? { ...w, status: action === 'approve' ? 'approved' : 'rejected' } : w))
  }

  const handlePayWeekly = async (id) => {
    await fetch('/api/admin/investments', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ investment_id: id, action: 'pay_weekly' }),
    })
    alert('Weekly return paid')
  }

  const handleComplete = async (id) => {
    if (!confirm('Mark this investment as complete and credit total profit?')) return
    await fetch('/api/admin/investments', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ investment_id: id, action: 'complete' }),
    })
    setInvestments(inv => inv.map(i => i.id === id ? { ...i, status: 'completed' } : i))
  }

  if (loading) return <div style={{ ...S.wrap, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ fontSize: 9, letterSpacing: '0.4em', color: 'rgba(255,255,255,0.2)' }}>LOADING...</div></div>

  return (
    <div style={S.wrap}>
      <nav style={S.nav}>
        <div style={S.logo}>SpaceX Stocks · Admin</div>
        <div style={S.navLinks}>
  <button style={S.nl} onClick={() => router.push('/admin/users')}>Users</button>
  <button style={S.nl} onClick={() => router.push('/admin/investments')}>Investments</button>
  <button style={S.nl} onClick={() => router.push('/admin/withdrawals')}>Withdrawals</button>
  <button style={S.nl} onClick={() => router.push('/admin/store')}>Store</button>
  <button style={S.nl} onClick={() => router.push('/admin/kyc')}>KYC</button>
  <button style={S.nl} onClick={() => router.push('/admin/settings')}>Settings</button>
  <button style={S.nl} onClick={() => router.push('/admin/broadcast')}>Broadcast</button>
  <button style={S.nl} onClick={() => router.push('/admin/chat')}>Live Chat</button>
  <button style={S.nl} onClick={() => router.push('/admin/inbox')}>Inbox</button>
  <button style={S.nl} onClick={() => router.push('/admin/send-email')}>Send Email</button>
  <button style={S.nl} onClick={() => { localStorage.removeItem('sx_token'); router.push('/login') }}>Sign Out</button>
</div>
      </nav>

      <main style={S.main}>
        <div style={S.title}>Mission Control</div>
        <div style={S.sub}>Admin Dashboard</div>

        <div style={S.grid}>
          <div style={S.card}><div style={S.cardLabel}>Total Members</div><div style={S.cardVal}>{stats.totalUsers || 0}</div></div>
          <div style={S.card}><div style={S.cardLabel}>Total Deposited</div><div style={S.cardVal}>${(stats.totalDeposited || 0).toLocaleString()}</div></div>
          <div style={S.card}><div style={S.cardLabel}>Active Investments</div><div style={S.cardVal}>{stats.activeInv || 0}</div></div>
          <div style={S.card}><div style={S.cardLabel}>Pending Withdrawals</div><div style={S.cardVal}>{stats.pendingW || 0}</div><div style={S.cardSub}>Needs action</div></div>
          <div style={S.card}><div style={S.cardLabel}>Total Profits Paid</div><div style={S.cardVal}>${(stats.totalProfit || 0).toLocaleString()}</div></div>
        </div>

        {/* Pending withdrawals */}
        <div style={S.section}>
          <div style={S.sHead}>Pending Withdrawals ({pendingWithdrawals.length})</div>
          {pendingWithdrawals.length === 0 && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', padding: '14px 0' }}>No pending withdrawals</div>}
          {pendingWithdrawals.map(w => (
            <div key={w.id} style={S.row}>
              <div>
                <div style={{ fontSize: 12 }}>{w.users?.full_name}</div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', marginTop: 3 }}>${w.amount.toLocaleString()} · {w.currency} · {new Date(w.created_at).toLocaleDateString()}</div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', marginTop: 2, wordBreak: 'break-all' }}>{w.wallet_address}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={S.btn('primary')} onClick={() => handleWithdrawal(w.id, 'approve')}>Approve</button>
                <button style={S.btn()} onClick={() => handleWithdrawal(w.id, 'reject')}>Reject</button>
              </div>
            </div>
          ))}
          {withdrawals.filter(w => w.status === 'pending').length > 5 && (
            <button style={{ ...S.btn(), marginTop: 8, fontSize: 8 }} onClick={() => router.push('/admin/withdrawals')}>View All →</button>
          )}
        </div>

        {/* Active investments */}
        <div style={S.section}>
          <div style={S.sHead}>Active Investments ({activeInvestments.length})</div>
          {activeInvestments.map(inv => (
            <div key={inv.id} style={S.row}>
              <div>
                <div style={{ fontSize: 12 }}>{inv.users?.full_name} <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>· {inv.investment_plans?.name}</span></div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', marginTop: 3 }}>${inv.amount.toLocaleString()} invested · ${inv.weekly_return.toLocaleString()}/wk · {inv.end_date ? new Date(inv.end_date).toLocaleDateString() : '—'}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={S.btn('primary')} onClick={() => handlePayWeekly(inv.id)}>Pay Weekly</button>
                <button style={S.btn()} onClick={() => handleComplete(inv.id)}>Complete</button>
              </div>
            </div>
          ))}
          {investments.filter(i => i.status === 'active').length > 5 && (
            <button style={{ ...S.btn(), marginTop: 8 }} onClick={() => router.push('/admin/investments')}>View All →</button>
          )}
        </div>

        {/* Recent users */}
        <div style={S.section}>
          <div style={S.sHead}>Recent Members</div>
          {users.slice(0, 5).map(u => (
            <div key={u.id} style={S.row}>
              <div>
                <div style={{ fontSize: 12 }}>{u.full_name}</div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', marginTop: 3 }}>{u.email} · Joined {new Date(u.created_at).toLocaleDateString()}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11 }}>${(u.balance || 0).toLocaleString()} bal</div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', marginTop: 3 }}>${(u.total_deposited || 0).toLocaleString()} deposited</div>
              </div>
            </div>
          ))}
          <button style={{ ...S.btn(), marginTop: 8 }} onClick={() => router.push('/admin/users')}>View All Members →</button>
        </div>
      </main>
    </div>
  )
}
