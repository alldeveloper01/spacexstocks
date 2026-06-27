'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const S = {
  wrap: { minHeight: '100vh', background: '#000', color: '#fff', fontFamily: "'Courier New',monospace" },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 28px', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  logo: { fontSize: 11, letterSpacing: '0.45em', color: '#fff', textTransform: 'uppercase' },
  back: { fontSize: 9, letterSpacing: '0.28em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit' },
  main: { maxWidth: 560, margin: '0 auto', padding: '36px 20px' },
  title: { fontSize: 'clamp(20px,3vw,28px)', fontWeight: 400, marginBottom: 6 },
  sub: { fontSize: 8, letterSpacing: '0.38em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', marginBottom: 32 },
  section: { marginBottom: 28 },
  sHead: { fontSize: 7, letterSpacing: '0.42em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.05)' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  rowLabel: { fontSize: 9, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)' },
  rowVal: { fontSize: 12, letterSpacing: '0.06em' },
  inviteBox: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, cursor: 'pointer' },
  inviteCode: { fontSize: 18, letterSpacing: '0.25em', color: '#fff' },
  copyHint: { fontSize: 7, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' },
  badge: (ok) => ({ fontSize: 8, letterSpacing: '0.25em', padding: '4px 12px', textTransform: 'uppercase', background: ok ? 'rgba(255,255,255,0.06)' : 'rgba(255,80,80,0.06)', color: ok ? 'rgba(255,255,255,0.6)' : 'rgba(255,80,80,0.5)', border: `1px solid ${ok ? 'rgba(255,255,255,0.08)' : 'rgba(255,80,80,0.1)'}` }),
  btn: { background: '#fff', color: '#000', border: 'none', padding: '11px 24px', fontFamily: "'Courier New',monospace", fontSize: 9, letterSpacing: '0.3em', cursor: 'pointer', fontWeight: 700, textTransform: 'uppercase', marginTop: 16 },
  btnDanger: { background: 'transparent', color: 'rgba(255,80,80,0.5)', border: '1px solid rgba(255,80,80,0.15)', padding: '10px 22px', fontFamily: "'Courier New',monospace", fontSize: 9, letterSpacing: '0.28em', cursor: 'pointer', textTransform: 'uppercase', marginTop: 8 },
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [copied, setCopied] = useState(false)
  const token = typeof window !== 'undefined' ? localStorage.getItem('sx_token') : null

  useEffect(() => {
    if (!token) { router.push('/login'); return }
    fetch('/api/auth', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { if (d.error) router.push('/login'); else setUser(d) })
  }, [])

  const copyInvite = () => {
    if (!user?.invite_code) return
    navigator.clipboard.writeText(user.invite_code)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const signOut = () => { localStorage.removeItem('sx_token'); router.push('/login') }

  if (!user) return <div style={{ ...S.wrap, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ fontSize: 9, letterSpacing: '0.4em', color: 'rgba(255,255,255,0.2)' }}>LOADING...</div></div>

  return (
    <div style={S.wrap}>
      <nav style={S.nav}>
        <div style={S.logo}>SpaceX Stocks</div>
        <button style={S.back} onClick={() => router.push('/dashboard')}>← Dashboard</button>
      </nav>
      <main style={S.main}>
        <div style={S.title}>My Profile</div>
        <div style={S.sub}>Account · Membership · Settings</div>

        {/* Account info */}
        <div style={S.section}>
          <div style={S.sHead}>Account Details</div>
          <div style={S.row}><div style={S.rowLabel}>Full Name</div><div style={S.rowVal}>{user.full_name}</div></div>
          <div style={S.row}><div style={S.rowLabel}>Email</div><div style={S.rowVal}>{user.email}</div></div>
          <div style={S.row}><div style={S.rowLabel}>Member Since</div><div style={S.rowVal}>{new Date(user.created_at || Date.now()).toLocaleDateString()}</div></div>
          <div style={S.row}><div style={S.rowLabel}>KYC Status</div><div><span style={S.badge(user.kyc_verified)}>{user.kyc_verified ? 'Verified' : 'Not Verified'}</span></div></div>
        </div>

        {/* Balances */}
        <div style={S.section}>
          <div style={S.sHead}>Balances</div>
          <div style={S.row}><div style={S.rowLabel}>Available Balance</div><div style={S.rowVal}>${(user.balance || 0).toLocaleString()}</div></div>
          <div style={S.row}><div style={S.rowLabel}>Withdrawal Balance</div><div style={S.rowVal}>${(user.withdrawal_balance || 0).toLocaleString()}</div></div>
          <div style={S.row}><div style={S.rowLabel}>Total Deposited</div><div style={S.rowVal}>${(user.total_deposited || 0).toLocaleString()}</div></div>
          <div style={S.row}><div style={S.rowLabel}>Total Profit Earned</div><div style={S.rowVal}>${(user.total_profit || 0).toLocaleString()}</div></div>
        </div>

        {/* Invite code */}
        <div style={S.section}>
          <div style={S.sHead}>Your Invitation Code</div>
          <div style={{ fontSize: 9, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)', lineHeight: 1.9, marginBottom: 10 }}>
            Share this code with people you want to invite. They'll need it to register.
          </div>
          <div style={S.inviteBox} onClick={copyInvite}>
            <div style={S.inviteCode}>{user.invite_code || '—'}</div>
            <div style={S.copyHint}>{copied ? 'Copied ✓' : 'Tap to copy'}</div>
          </div>
        </div>

        {/* Support */}
        <div style={S.section}>
          <div style={S.sHead}>Support</div>
          <div style={{ fontSize: 9, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)', lineHeight: 2 }}>
            For any questions, account issues, or perk activation, contact us at:<br />
            <span style={{ color: 'rgba(255,255,255,0.55)' }}>invest@spacestocks.finance</span>
          </div>
        </div>

        <button style={S.btnDanger} onClick={signOut}>Sign Out</button>
      </main>
    </div>
  )
}
