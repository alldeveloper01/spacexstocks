'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const S = {
  wrap: { minHeight: '100vh', background: '#000', color: '#fff', fontFamily: "'Courier New',monospace" },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  logo: { fontSize: 10, letterSpacing: '0.4em', color: '#fff', textTransform: 'uppercase' },
  back: { fontSize: 8, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit', textTransform: 'uppercase' },
  main: { maxWidth: 1100, margin: '0 auto', padding: '28px 16px' },
  title: { fontSize: 20, fontWeight: 400, marginBottom: 4 },
  sub: { fontSize: 8, letterSpacing: '0.38em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', marginBottom: 24 },
  search: { width: '100%', maxWidth: 340, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 14px', color: '#fff', fontFamily: "'Courier New',monospace", fontSize: 11, outline: 'none', marginBottom: 20, letterSpacing: '0.06em' },
  card: { background: '#000', border: '1px solid rgba(255,255,255,0.06)', padding: '18px 20px', marginBottom: 1 },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 12 },
  name: { fontSize: 14, letterSpacing: '0.03em' },
  email: { fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginTop: 3 },
  stats: { display: 'flex', gap: 20, flexWrap: 'wrap' },
  stat: { textAlign: 'right' },
  statVal: { fontSize: 14 },
  statLabel: { fontSize: 7, letterSpacing: '0.28em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginTop: 2 },
  actions: { display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.04)' },
  btn: (v) => ({
    padding: '6px 14px', fontSize: 8, letterSpacing: '0.22em', cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase', border: 'none',
    background: v === 'primary' ? '#fff' : 'rgba(255,255,255,0.06)',
    color: v === 'primary' ? '#000' : 'rgba(255,255,255,0.5)',
  }),
  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modalBox: { background: '#111', border: '1px solid rgba(255,255,255,0.1)', padding: 28, width: '100%', maxWidth: 380 },
  mTitle: { fontSize: 14, marginBottom: 20, fontWeight: 400 },
  label: { fontSize: 7, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', marginBottom: 7, display: 'block' },
  input: { width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', padding: '11px 14px', color: '#fff', fontFamily: "'Courier New',monospace", fontSize: 12, outline: 'none', marginBottom: 16, display: 'block' },
  mBtns: { display: 'flex', gap: 10, marginTop: 4 },
  badge: (kyc) => ({ fontSize: 7, letterSpacing: '0.25em', padding: '2px 8px', textTransform: 'uppercase', background: kyc ? 'rgba(255,255,255,0.06)' : 'rgba(255,80,80,0.06)', color: kyc ? 'rgba(255,255,255,0.5)' : 'rgba(255,80,80,0.4)', border: `1px solid ${kyc ? 'rgba(255,255,255,0.08)' : 'rgba(255,80,80,0.1)'}`, marginLeft: 8 }),
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null) // { user, action }
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [generatedCode, setGeneratedCode] = useState('')

  const token = typeof window !== 'undefined' ? localStorage.getItem('sx_token') : null

  useEffect(() => {
    if (!token) { router.push('/login'); return }
    fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { setUsers(d.users || []); setFiltered(d.users || []) })
  }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(users.filter(u => u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)))
  }, [search, users])

  const doAction = async () => {
    if (!modal) return
    setLoading(true); setMsg('')
    const body = { user_id: modal.user.id, action: modal.action }
    if (modal.action === 'credit_balance' || modal.action === 'credit_withdrawal') body.amount = parseFloat(amount)
    const r = await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    })
    const d = await r.json()
    if (d.code) { setGeneratedCode(d.code); setMsg(`Code generated: ${d.code}`) }
    else if (d.ok) {
      setMsg('Done')
      if (modal.action === 'verify_kyc') setUsers(us => us.map(u => u.id === modal.user.id ? { ...u, kyc_verified: true } : u))
      if (modal.action === 'credit_balance') setUsers(us => us.map(u => u.id === modal.user.id ? { ...u, balance: u.balance + parseFloat(amount) } : u))
      if (modal.action === 'credit_withdrawal') setUsers(us => us.map(u => u.id === modal.user.id ? { ...u, withdrawal_balance: u.withdrawal_balance + parseFloat(amount) } : u))
    }
    setLoading(false)
  }

  return (
    <div style={S.wrap}>
      <nav style={S.nav}>
        <div style={S.logo}>SpaceX Stocks · Users</div>
        <button style={S.back} onClick={() => router.push('/admin')}>← Admin</button>
      </nav>
      <main style={S.main}>
        <div style={S.title}>Members <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }}>({users.length})</span></div>
        <div style={S.sub}>All registered members</div>
        <input style={S.search} placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
        {filtered.map(u => (
          <div key={u.id} style={S.card}>
            <div style={S.cardTop}>
              <div>
                <div style={S.name}>{u.full_name}<span style={S.badge(u.kyc_verified)}>{u.kyc_verified ? 'KYC ✓' : 'No KYC'}</span></div>
                <div style={S.email}>{u.email} · Joined {new Date(u.created_at).toLocaleDateString()}</div>
                <div style={{ ...S.email, marginTop: 3 }}>Invite: {u.invite_code}</div>
              </div>
              <div style={S.stats}>
                <div style={S.stat}><div style={S.statVal}>${(u.balance || 0).toLocaleString()}</div><div style={S.statLabel}>Balance</div></div>
                <div style={S.stat}><div style={S.statVal}>${(u.withdrawal_balance || 0).toLocaleString()}</div><div style={S.statLabel}>Withdrawable</div></div>
                <div style={S.stat}><div style={S.statVal}>${(u.total_deposited || 0).toLocaleString()}</div><div style={S.statLabel}>Deposited</div></div>
                <div style={S.stat}><div style={S.statVal}>${(u.total_profit || 0).toLocaleString()}</div><div style={S.statLabel}>Profit</div></div>
              </div>
            </div>
            <div style={S.actions}>
              <button style={S.btn('primary')} onClick={() => { setModal({ user: u, action: 'credit_balance' }); setAmount(''); setMsg('') }}>Credit Balance</button>
              <button style={S.btn()} onClick={() => { setModal({ user: u, action: 'credit_withdrawal' }); setAmount(''); setMsg('') }}>Credit Withdrawal</button>
              <button style={S.btn()} onClick={() => { setModal({ user: u, action: 'verify_kyc' }); setMsg('') }}>Verify KYC</button>
              <button style={S.btn()} onClick={() => { setModal({ user: u, action: 'generate_invite' }); setGeneratedCode(''); setMsg('') }}>Generate Invite</button>
            </div>
          </div>
        ))}
      </main>

      {modal && (
        <div style={S.modal} onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div style={S.modalBox}>
            <div style={S.mTitle}>
              {modal.action === 'credit_balance' && `Credit Balance — ${modal.user.full_name}`}
              {modal.action === 'credit_withdrawal' && `Credit Withdrawal — ${modal.user.full_name}`}
              {modal.action === 'verify_kyc' && `Verify KYC — ${modal.user.full_name}`}
              {modal.action === 'generate_invite' && `Generate Invite Code`}
            </div>
            {(modal.action === 'credit_balance' || modal.action === 'credit_withdrawal') && (
              <><label style={S.label}>Amount (USD)</label><input style={S.input} type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} /></>
            )}
            {msg && <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.18em', marginBottom: 14 }}>{msg}</div>}
            {generatedCode && <div style={{ fontSize: 16, letterSpacing: '0.25em', marginBottom: 14, color: '#fff' }}>{generatedCode}</div>}
            <div style={S.mBtns}>
              <button style={S.btn('primary')} onClick={doAction} disabled={loading}>{loading ? 'Wait...' : 'Confirm'}</button>
              <button style={S.btn()} onClick={() => setModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
