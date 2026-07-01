'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const S = {
  wrap: { minHeight: '100vh', background: '#000', color: '#fff', fontFamily: "'Courier New',monospace" },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  logo: { fontSize: 10, letterSpacing: '0.4em', color: '#fff', textTransform: 'uppercase' },
  back: { fontSize: 8, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit', textTransform: 'uppercase' },
  layout: { display: 'flex', height: 'calc(100vh - 57px)' },
  list: { width: 300, borderRight: '1px solid rgba(255,255,255,0.06)', overflowY: 'auto', flexShrink: 0 },
  listItem: (sel, read) => ({ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', background: sel ? 'rgba(255,255,255,0.04)' : 'transparent', opacity: read ? 0.5 : 1 }),
  liFrom: { fontSize: 11, letterSpacing: '0.04em', marginBottom: 3, color: '#fff' },
  liSub: { fontSize: 9, letterSpacing: '0.04em', color: 'rgba(255,255,255,0.4)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  liDate: { fontSize: 7, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.2)' },
  email: { flex: 1, overflowY: 'auto', padding: 28 },
  eFrom: { fontSize: 9, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 4 },
  eSub: { fontSize: 20, fontWeight: 400, marginBottom: 6 },
  eTo: { fontSize: 9, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.2)', marginBottom: 24 },
  eBody: { fontSize: 12, lineHeight: 2, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.04em', whiteSpace: 'pre-wrap', marginBottom: 28 },
  divider: { height: 1, background: 'rgba(255,255,255,0.06)', margin: '20px 0' },
  label: { fontSize: 7, letterSpacing: '0.38em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', marginBottom: 8, display: 'block' },
  textarea: { width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', padding: '11px 14px', color: '#fff', fontFamily: "'Courier New',monospace", fontSize: 12, outline: 'none', marginBottom: 12, minHeight: 100, resize: 'vertical', lineHeight: 1.8 },
  btn: { background: '#fff', color: '#000', border: 'none', padding: '10px 24px', fontFamily: "'Courier New',monospace", fontSize: 9, letterSpacing: '0.28em', cursor: 'pointer', fontWeight: 700, textTransform: 'uppercase' },
  empty: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.15)', textTransform: 'uppercase' },
  unread: { width: 5, height: 5, borderRadius: '50%', background: '#fff', display: 'inline-block', marginRight: 6 },
  attBtn: { display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 14px', cursor: 'pointer', fontFamily: "'Courier New',monospace", marginRight: 8, marginBottom: 8 },
  attLabel: { fontSize: 7, letterSpacing: '0.38em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', marginBottom: 10, display: 'block' },
}

export default function InboxPage() {
  const router = useRouter()
  const [emails, setEmails] = useState([])
  const [selected, setSelected] = useState(null)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [msg, setMsg] = useState('')

  const token = typeof window !== 'undefined' ? localStorage.getItem('sx_token') : null

  useEffect(() => {
    if (!token) { router.push('/login'); return }
    fetch('/api/admin/inbox', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setEmails(d.emails || []))
    const interval = setInterval(() => {
      fetch('/api/admin/inbox', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then(d => setEmails(d.emails || []))
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const openEmail = async (email) => {
    setSelected(email)
    setReply('')
    setMsg('')
    if (!email.read) {
      await fetch('/api/admin/inbox', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email_id: email.id, action: 'read' }),
      })
      setEmails(es => es.map(e => e.id === email.id ? { ...e, read: true } : e))
    }
  }

  const sendReply = async () => {
    if (!reply.trim() || !selected) return
    setSending(true)
    const r = await fetch('/api/admin/inbox/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        to: selected.from_address,
        subject: `Re: ${selected.subject}`,
        body: reply,
        email_id: selected.id
      }),
    })
    const d = await r.json()
    if (d.success) { setMsg('✓ Reply sent'); setReply('') } else setMsg('Failed to send')
    setSending(false)
  }

  const openAttachment = async (att) => {
    try {
      const res = await fetch(`/api/admin/inbox/attachment?email_id=${selected.email_id}&attachment_id=${att.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.download_url) window.open(data.download_url, '_blank')
    } catch {}
  }

  const unread = emails.filter(e => !e.read).length

  return (
    <div style={S.wrap}>
      <nav style={S.nav}>
        <div style={S.logo}>SpaceX Stocks · Inbox {unread > 0 && `(${unread})`}</div>
        <button style={S.back} onClick={() => router.push('/admin')}>← Admin</button>
      </nav>
      <div style={S.layout}>
        <div style={S.list}>
          {emails.length === 0 && <div style={{ padding: 20, fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.2em' }}>No emails</div>}
          {emails.map(e => (
            <div key={e.id} style={S.listItem(selected?.id === e.id, e.read)} onClick={() => openEmail(e)}>
              <div style={S.liFrom}>{!e.read && <span style={S.unread}></span>}{e.from_address}</div>
              <div style={S.liSub}>{e.subject}</div>
              <div style={S.liDate}>{new Date(e.received_at).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
        {selected ? (
          <div style={S.email}>
            <div style={S.eFrom}>From: {selected.from_address}</div>
            <div style={S.eSub}>{selected.subject}</div>
            <div style={S.eTo}>To: {selected.to_address} · {new Date(selected.received_at).toLocaleString()}</div>
            <div style={S.eBody}>
            {selected.body_text 
            ? selected.body_text 
            : selected.body_html 
            ? <div dangerouslySetInnerHTML={{ __html: selected.body_html }} />
            : '(no content)'}
            </div>

            {selected.attachments && selected.attachments.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <span style={S.attLabel}>📎 Attachments ({selected.attachments.length})</span>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  {selected.attachments.map((att, i) => (
                    <button key={i} style={S.attBtn} onClick={() => openAttachment(att)}>
                      <span style={{ fontSize: 14 }}>{att.content_type?.startsWith('image/') ? '🖼️' : '📄'}</span>
                      <span style={{ fontSize: 9, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)' }}>{att.filename}</span>
                      {att.size && <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)' }}>({Math.round(att.size / 1024)}KB)</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={S.divider}></div>
            <label style={S.label}>Reply</label>
            <textarea style={S.textarea} value={reply} onChange={e => setReply(e.target.value)} placeholder={`Reply to ${selected.from_address}...`} />
            {msg && <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginBottom: 10, letterSpacing: '0.18em' }}>{msg}</div>}
            <button style={S.btn} onClick={sendReply} disabled={sending}>{sending ? 'Sending...' : 'Send Reply →'}</button>
          </div>
        ) : (
          <div style={S.empty}>Select an email</div>
        )}
      </div>
    </div>
  )
}