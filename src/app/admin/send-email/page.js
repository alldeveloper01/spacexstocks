'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const FROM_OPTIONS = [
  'noreply@spacestocks.finance',
  'invest@spacestocks.finance',
  'support@spacestocks.finance',
  'compliance@spacestocks.finance',
  'verification@spacestocks.finance',
]

const S = {
  wrap: { minHeight: '100vh', background: '#000', color: '#fff', fontFamily: "'Courier New',monospace" },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  logo: { fontSize: 10, letterSpacing: '0.4em', color: '#fff', textTransform: 'uppercase' },
  back: { fontSize: 8, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit', textTransform: 'uppercase' },
  main: { maxWidth: 680, margin: '0 auto', padding: '32px 16px' },
  title: { fontSize: 20, fontWeight: 400, marginBottom: 4 },
  sub: { fontSize: 8, letterSpacing: '0.38em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', marginBottom: 32 },
  label: { fontSize: 7, letterSpacing: '0.38em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', marginBottom: 7, display: 'block' },
  input: { width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', padding: '11px 14px', color: '#fff', fontFamily: "'Courier New',monospace", fontSize: 12, outline: 'none', marginBottom: 18, letterSpacing: '0.04em', display: 'block' },
  select: { width: '100%', background: '#000', border: '1px solid rgba(255,255,255,0.1)', padding: '11px 14px', color: '#fff', fontFamily: "'Courier New',monospace", fontSize: 12, outline: 'none', marginBottom: 18 },
  textarea: { width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', padding: '11px 14px', color: '#fff', fontFamily: "'Courier New',monospace", fontSize: 12, outline: 'none', marginBottom: 18, minHeight: 180, resize: 'vertical', letterSpacing: '0.04em', lineHeight: 1.8 },
  btn: { background: '#fff', color: '#000', border: 'none', padding: '12px 28px', fontFamily: "'Courier New',monospace", fontSize: 9, letterSpacing: '0.32em', cursor: 'pointer', fontWeight: 700, textTransform: 'uppercase' },
  msg: (ok) => ({ fontSize: 9, letterSpacing: '0.18em', color: ok ? 'rgba(255,255,255,0.5)' : 'rgba(255,80,80,0.6)', marginTop: 12 }),
  info: { fontSize: 9, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.2)', lineHeight: 1.8, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: 20 },
}

export default function SendEmailPage() {
  const router = useRouter()
  const [form, setForm] = useState({ to: '', from: FROM_OPTIONS[0], subject: '', title: '', body: '' })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState({ text: '', ok: false })

  const token = typeof window !== 'undefined' ? localStorage.getItem('sx_token') : null
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const send = async () => {
    if (!form.to || !form.subject || !form.body) { setMsg({ text: 'To, subject and body required', ok: false }); return }
    setLoading(true)
    try {
      const r = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })
      const d = await r.json()
      if (d.error) { setMsg({ text: d.error, ok: false }) } else { setMsg({ text: '✓ Email sent successfully', ok: true }); setForm(f => ({ ...f, to: '', subject: '', title: '', body: '' })) }
    } catch { setMsg({ text: 'Something went wrong', ok: false }) }
    setLoading(false)
  }

  return (
    <div style={S.wrap}>
      <nav style={S.nav}>
        <div style={S.logo}>SpaceX Stocks · Admin</div>
        <button style={S.back} onClick={() => router.push('/admin')}>← Admin</button>
      </nav>
      <main style={S.main}>
        <div style={S.title}>Send Email</div>
        <div style={S.sub}>Branded SpaceX Stocks template</div>
        <div style={S.info}>All emails use the SpaceX Stocks branded HTML template — black background, monospace font, white logo. Body supports basic HTML tags.</div>
        <label style={S.label}>To (email address)</label>
        <input style={S.input} type="email" placeholder="member@email.com" value={form.to} onChange={set('to')} />
        <label style={S.label}>From</label>
        <select style={S.select} value={form.from} onChange={set('from')}>
          {FROM_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <label style={S.label}>Subject Line</label>
        <input style={S.input} type="text" placeholder="Email subject" value={form.subject} onChange={set('subject')} />
        <label style={S.label}>Email Title (shown large at top)</label>
        <input style={S.input} type="text" placeholder="Optional — defaults to subject" value={form.title} onChange={set('title')} />
        <label style={S.label}>Body (HTML allowed)</label>
        <textarea style={S.textarea} placeholder="Email body text. You can use <br> for line breaks and <strong> for bold." value={form.body} onChange={set('body')} />
        {msg.text && <div style={S.msg(msg.ok)}>{msg.text}</div>}
        <button style={S.btn} onClick={send} disabled={loading}>{loading ? 'Sending...' : 'Send Email →'}</button>
      </main>
    </div>
  )
}
