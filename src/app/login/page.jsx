'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const S = {
  wrap: { minHeight: '100vh', background: '#000', color: '#fff', fontFamily: "'Courier New',monospace", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  logo: { fontSize: 14, letterSpacing: '0.45em', color: '#fff', textTransform: 'uppercase', marginBottom: 6, cursor: 'pointer' },
  sub: { fontSize: 8, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: 48 },
  box: { width: '100%', maxWidth: 380, background: '#000', border: '1px solid rgba(255,255,255,0.08)', padding: 32 },
  header: { marginBottom: 28, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.06)' },
  headerTitle: { fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#fff', margin: 0 },
  headerSub: { fontSize: 8, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.2)', marginTop: 4, marginBottom: 0 },
  label: { fontSize: 8, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', marginBottom: 7, display: 'block' },
  input: { width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', padding: '12px 14px', color: '#fff', fontFamily: "'Courier New',monospace", fontSize: 12, outline: 'none', marginBottom: 14, letterSpacing: '0.06em', display: 'block', boxSizing: 'border-box' },
  btn: { width: '100%', background: '#fff', color: '#000', border: 'none', padding: 13, fontFamily: "'Courier New',monospace", fontSize: 10, letterSpacing: '0.35em', cursor: 'pointer', fontWeight: 700, textTransform: 'uppercase', marginTop: 6 },
  err: { color: 'rgba(255,80,80,0.7)', fontSize: 9, letterSpacing: '0.15em', marginTop: 10, textAlign: 'center' },
  info: { fontSize: 9, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.2)', lineHeight: 1.9, textAlign: 'center', marginTop: 20 },
}

export default function LoginPage() {
  const router = useRouter()
  const params = useSearchParams()
  const inviteCode = params.get('code') || ''
  const isRegister = !!inviteCode

  const [form, setForm] = useState({ email: '', password: '', full_name: '', invite_code: inviteCode })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (inviteCode) setForm(f => ({ ...f, invite_code: inviteCode }))
  }, [inviteCode])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async () => {
    setError('')
    if (!form.email || !form.password) { setError('All fields required'); return }
    if (isRegister && !form.full_name) { setError('Full name required'); return }
    setLoading(true)
    try {
      const r = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: isRegister ? 'register' : 'login', ...form }),
      })
      const d = await r.json()
      if (d.error) { setError(d.error); setLoading(false); return }
      if (isRegister) {
        localStorage.setItem('sx_token', d.token)
        router.push('/dashboard')
      } else {
        router.push(`/auth/verify?email=${encodeURIComponent(form.email)}`)
      }
    } catch { setError('Something went wrong') }
    setLoading(false)
  }

  return (
    <div style={S.wrap}>
      <div style={S.logo} onClick={() => router.push('/landing.html')}>SpaceX Stocks</div>
      <div style={S.sub}>Private Investment Access</div>
      <div style={S.box}>

        <div style={S.header}>
          <p style={S.headerTitle}>{isRegister ? 'Create Account' : 'Member Login'}</p>
          <p style={S.headerSub}>
            {isRegister
              ? 'Invitation verified · Complete your registration'
              : 'Enter your credentials to access the platform'}
          </p>
        </div>

        {isRegister && (
          <>
            <label style={S.label}>Full Name</label>
            <input style={S.input} type="text" placeholder="Your full name" value={form.full_name} onChange={set('full_name')} />
          </>
        )}

        <label style={S.label}>Email Address</label>
        <input style={S.input} type="email" placeholder="your@email.com" value={form.email} onChange={set('email')} />

        <label style={S.label}>Password</label>
        <input style={S.input} type="password" placeholder="••••••••" value={form.password} onChange={set('password')}
          onKeyDown={e => e.key === 'Enter' && submit()} />

        {error && <div style={S.err}>{error}</div>}

        <button style={S.btn} onClick={submit} disabled={loading}>
          {loading ? 'Please wait...' : isRegister ? 'Create Account →' : 'Sign In →'}
        </button>

        <div style={S.info}>
          {isRegister
            ? 'Your account grants access to the SpaceX Stocks private investment platform.'
            : 'Access is by invitation only. Contact invest@spacestocks.finance if you need help.'}
        </div>
      </div>
    </div>
  )
}