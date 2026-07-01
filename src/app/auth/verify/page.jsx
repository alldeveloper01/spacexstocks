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
  input: { width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', padding: '16px 14px', color: '#fff', fontFamily: "'Courier New',monospace", fontSize: 28, outline: 'none', marginBottom: 14, letterSpacing: '0.35em', display: 'block', boxSizing: 'border-box', textAlign: 'center' },
  btn: { width: '100%', background: '#fff', color: '#000', border: 'none', padding: 13, fontFamily: "'Courier New',monospace", fontSize: 10, letterSpacing: '0.35em', cursor: 'pointer', fontWeight: 700, textTransform: 'uppercase', marginTop: 6 },
  btnGhost: { width: '100%', background: 'transparent', color: 'rgba(255,255,255,0.25)', border: 'none', padding: 10, fontFamily: "'Courier New',monospace", fontSize: 8, letterSpacing: '0.25em', cursor: 'pointer', textTransform: 'uppercase', marginTop: 8 },
  err: { color: 'rgba(255,80,80,0.7)', fontSize: 9, letterSpacing: '0.15em', marginTop: 10, textAlign: 'center' },
  info: { fontSize: 9, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.2)', lineHeight: 1.9, textAlign: 'center', marginTop: 20 },
}

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const router = useRouter()
  const params = useSearchParams()
  const email = params.get('email') || ''

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [countdown])

  const handleVerify = async () => {
    if (otp.length !== 6) return
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    })
    const data = await res.json()
    setLoading(false)
    if (data.success) {
      localStorage.setItem('sx_token', data.token)
      router.push(data.role === 'admin' ? '/admin' : '/dashboard')
    } else {
      setError(data.error || 'Verification failed')
    }
  }

  const handleResend = async () => {
    setResending(true)
    await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    setResending(false)
    setCountdown(60)
  }

  return (
    <div style={S.wrap}>
      <div style={S.logo} onClick={() => router.push('/landing.html')}>SpaceX Stocks</div>
      <div style={S.sub}>Mission Control</div>
      <div style={S.box}>
        <div style={S.header}>
          <p style={S.headerTitle}>Verify Identity</p>
          <p style={S.headerSub}>
            Code sent to <span style={{ color: 'rgba(255,255,255,0.5)' }}>{email}</span>
          </p>
        </div>

        <input
          type="text"
          maxLength={6}
          placeholder="000000"
          style={S.input}
          value={otp}
          onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
          onKeyDown={e => e.key === 'Enter' && handleVerify()}
          autoFocus
        />

        {error && <div style={S.err}>{error}</div>}

        <button style={{ ...S.btn, opacity: otp.length !== 6 || loading ? 0.5 : 1 }}
          onClick={handleVerify} disabled={loading || otp.length !== 6}>
          {loading ? 'Verifying...' : 'Verify →'}
        </button>

        <button style={{ ...S.btnGhost, opacity: countdown > 0 || resending ? 0.4 : 1 }}
          onClick={handleResend} disabled={resending || countdown > 0}>
          {countdown > 0 ? `Resend code in ${countdown}s` : resending ? 'Sending...' : 'Resend code'}
        </button>

        <div style={S.info}>
          Check your spam folder if you don't see it within a minute.
        </div>
      </div>
    </div>
  )
}