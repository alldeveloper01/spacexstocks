'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const S = {
  wrap: { minHeight: '100vh', background: '#000', color: '#fff', fontFamily: "'Courier New',monospace", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  logo: { fontSize: 14, letterSpacing: '0.45em', color: '#fff', textTransform: 'uppercase', marginBottom: 6 },
  sub: { fontSize: 8, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: 48 },
  box: { width: '100%', maxWidth: 380, background: '#000', border: '1px solid rgba(255,255,255,0.08)', padding: 32 },
  tabs: { display: 'flex', marginBottom: 28, borderBottom: '1px solid rgba(255,255,255,0.06)' },
  tab: (a) => ({ flex: 1, padding: '10px 0', textAlign: 'center', fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit', color: a ? '#fff' : 'rgba(255,255,255,0.3)', borderBottom: a ? '1px solid #fff' : '1px solid transparent', marginBottom: -1 }),
  label: { fontSize: 8, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', marginBottom: 7, display: 'block' },
  input: { width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', padding: '12px 14px', color: '#fff', fontFamily: "'Courier New',monospace", fontSize: 12, outline: 'none', marginBottom: 14, letterSpacing: '0.06em', display: 'block' },
  btn: { width: '100%', background: '#fff', color: '#000', border: 'none', padding: 13, fontFamily: "'Courier New',monospace", fontSize: 10, letterSpacing: '0.35em', cursor: 'pointer', fontWeight: 700, textTransform: 'uppercase', marginTop: 6 },
  err: { color: 'rgba(255,80,80,0.7)', fontSize: 9, letterSpacing: '0.15em', marginTop: 10, textAlign: 'center' },
  info: { fontSize: 9, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.2)', lineHeight: 1.9, textAlign: 'center', marginTop: 20 },
}

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', full_name: '', invite_code: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async () => {
    setError('')
    if (!form.email || !form.password) { setError('All fields required'); return }
    if (tab === 'register' && (!form.full_name || !form.invite_code)) { setError('All fields required'); return }
    setLoading(true)
    try {
      const r = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: tab, ...form }),
      })
      const d = await r.json()
      if (d.error) { setError(d.error); setLoading(false); return }
      localStorage.setItem('sx_token', d.token)
      router.push(d.user?.role === 'admin' ? '/admin' : '/dashboard')
    } catch { setError('Something went wrong') }
    setLoading(false)
  }

  return (
    <div style={S.wrap}>
      <div style={S.logo}>SpaceX Stocks</div>
      <div style={S.sub}>Private Investment Access</div>
      <div style={S.box}>
        <div style={S.tabs}>
          <button style={S.tab(tab === 'login')} onClick={() => setTab('login')}>Sign In</button>
          <button style={S.tab(tab === 'register')} onClick={() => setTab('register')}>Register</button>
        </div>
        {tab === 'register' && (
          <>
            <label style={S.label}>Full Name</label>
            <input style={S.input} type="text" placeholder="Your full name" value={form.full_name} onChange={set('full_name')} />
          </>
        )}
        <label style={S.label}>Email Address</label>
        <input style={S.input} type="email" placeholder="your@email.com" value={form.email} onChange={set('email')} />
        <label style={S.label}>Password</label>
        <input style={S.input} type="password" placeholder="••••••••" value={form.password} onChange={set('password')} />
        {tab === 'register' && (
          <>
            <label style={S.label}>Invitation Code</label>
            <input style={S.input} type="text" placeholder="Enter your invitation code" value={form.invite_code} onChange={set('invite_code')} style={{ ...S.input, textTransform: 'uppercase' }} />
          </>
        )}
        {error && <div style={S.err}>{error}</div>}
        <button style={S.btn} onClick={submit} disabled={loading}>{loading ? 'Please wait...' : tab === 'login' ? 'Sign In →' : 'Create Account →'}</button>
        <div style={S.info}>
          {tab === 'register' ? 'Registration requires a valid invitation code. Contact invest@spacestocks.finance to request access.' : 'Access is by invitation only. Contact invest@spacestocks.finance if you need help.'}
        </div>
      </div>
    </div>
  )
}
