'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const S = {
  wrap: { minHeight: '100vh', background: '#000', color: '#fff', fontFamily: "'Courier New',monospace" },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  logo: { fontSize: 10, letterSpacing: '0.4em', color: '#fff', textTransform: 'uppercase' },
  back: { fontSize: 8, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit', textTransform: 'uppercase' },
  layout: { display: 'flex', height: 'calc(100vh - 57px)' },
  sessions: { width: 260, borderRight: '1px solid rgba(255,255,255,0.06)', overflowY: 'auto', flexShrink: 0 },
  session: (sel) => ({ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', background: sel ? 'rgba(255,255,255,0.04)' : 'transparent' }),
  sName: { fontSize: 11, marginBottom: 3 },
  sMeta: { fontSize: 8, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em' },
  chatArea: { flex: 1, display: 'flex', flexDirection: 'column' },
  messages: { flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 },
  msgWrap: (admin) => ({ display: 'flex', justifyContent: admin ? 'flex-end' : 'flex-start' }),
  msg: (admin) => ({ maxWidth: '72%', padding: '10px 14px', fontSize: 11, lineHeight: 1.7, letterSpacing: '0.03em', background: admin ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: admin ? '#fff' : 'rgba(255,255,255,0.7)' }),
  inputRow: { display: 'flex', gap: 8, padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' },
  input: { flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 14px', color: '#fff', fontFamily: "'Courier New',monospace", fontSize: 12, outline: 'none' },
  sendBtn: { background: '#fff', color: '#000', border: 'none', padding: '10px 18px', fontFamily: "'Courier New',monospace", fontSize: 9, letterSpacing: '0.25em', cursor: 'pointer', fontWeight: 700, textTransform: 'uppercase' },
  typing: { padding: '6px 20px', fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em' },
  empty: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.15)', textTransform: 'uppercase' },
  dot: { display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.3)', margin: '0 2px', animation: 'bounce 1s ease-in-out infinite' },
}

export default function AdminChatPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState([])
  const [active, setActive] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [userTyping, setUserTyping] = useState(false)
  const bottomRef = useRef(null)
  const typingTimer = useRef(null)

  const token = typeof window !== 'undefined' ? localStorage.getItem('sx_token') : null

  // Load sessions
  useEffect(() => {
    if (!token) { router.push('/login'); return }
    const loadSessions = () => {
      fetch('/api/admin/chat/sessions', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then(d => setSessions(d.sessions || []))
    }
    loadSessions()
    const iv = setInterval(loadSessions, 5000)
    return () => clearInterval(iv)
  }, [])

  // Poll messages
  useEffect(() => {
    if (!active) return
    const poll = () => {
      fetch(`/api/chat?session_id=${active.session_id}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => {
          setMessages(d.messages || [])
          setUserTyping(d.user_typing || false)
          bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
        })
    }
    poll()
    const iv = setInterval(poll, 3000)
    return () => clearInterval(iv)
  }, [active])

  const sendMessage = async () => {
    if (!text.trim() || !active) return
    const msg = text; setText('')
    await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ session_id: active.session_id, message: msg, sender: 'Support', is_admin: true }),
    })
  }

  const handleTyping = () => {
    fetch('/api/typing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ session_id: active?.session_id, is_admin: true, typing: true }),
    })
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      fetch('/api/typing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ session_id: active?.session_id, is_admin: true, typing: false }),
      })
    }, 3000)
  }

  return (
    <div style={S.wrap}>
      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}`}</style>
      <nav style={S.nav}>
        <div style={S.logo}>SpaceX Stocks · Live Chat</div>
        <button style={S.back} onClick={() => router.push('/admin')}>← Admin</button>
      </nav>
      <div style={S.layout}>
        <div style={S.sessions}>
          <div style={{ padding: '10px 14px', fontSize: 7, letterSpacing: '0.38em', color: 'rgba(255,255,255,0.2)', borderBottom: '1px solid rgba(255,255,255,0.04)', textTransform: 'uppercase' }}>Sessions ({sessions.length})</div>
          {sessions.map(s => (
            <div key={s.session_id} style={S.session(active?.session_id === s.session_id)} onClick={() => setActive(s)}>
              <div style={S.sName}>{s.user_name || 'Visitor'}</div>
              <div style={S.sMeta}>{s.last_message?.substring(0, 30) || '—'}</div>
              <div style={{ ...S.sMeta, marginTop: 3 }}>{s.status}</div>
            </div>
          ))}
        </div>
        {active ? (
          <div style={S.chatArea}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 9, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)' }}>
              {active.user_name} {active.user_email ? `· ${active.user_email}` : ''}
            </div>
            <div style={S.messages}>
              {messages.map(m => (
                <div key={m.id} style={S.msgWrap(m.is_admin)}>
                  <div style={S.msg(m.is_admin)}>
                    {m.message}
                    <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.2)', marginTop: 4, letterSpacing: '0.1em' }}>{new Date(m.created_at).toLocaleTimeString()}</div>
                  </div>
                </div>
              ))}
              {userTyping && (
                <div style={S.typing}>
                  User is typing <span style={S.dot}></span><span style={{ ...S.dot, animationDelay: '0.2s' }}></span><span style={{ ...S.dot, animationDelay: '0.4s' }}></span>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            <div style={S.inputRow}>
              <input style={S.input} value={text} onChange={e => { setText(e.target.value); handleTyping() }}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                placeholder="Type a message..." />
              <button style={S.sendBtn} onClick={sendMessage}>Send</button>
            </div>
          </div>
        ) : (
          <div style={S.empty}>Select a session</div>
        )}
      </div>
    </div>
  )
}
