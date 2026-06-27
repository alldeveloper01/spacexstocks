'use client'
import { useState, useEffect, useRef } from 'react'

const S = {
  bubble: { position: 'fixed', bottom: 24, right: 24, zIndex: 9999, cursor: 'pointer', width: 48, height: 48, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.4)', border: 'none', fontFamily: 'inherit' },
  window: { position: 'fixed', bottom: 84, right: 24, zIndex: 9999, width: 320, background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', maxHeight: 440, fontFamily: "'Courier New',monospace" },
  header: { padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  hTitle: { fontSize: 10, letterSpacing: '0.3em', color: '#fff', textTransform: 'uppercase' },
  hSub: { fontSize: 7, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.25)', marginTop: 2, textTransform: 'uppercase' },
  close: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 16, cursor: 'pointer', fontFamily: 'inherit' },
  messages: { flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 },
  msgWrap: (admin) => ({ display: 'flex', justifyContent: admin ? 'flex-end' : 'flex-start' }),
  msg: (admin) => ({ maxWidth: '80%', padding: '8px 12px', fontSize: 11, lineHeight: 1.7, background: admin ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)', color: admin ? '#fff' : 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.06)' }),
  typing: { padding: '4px 12px', fontSize: 9, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.12em' },
  inputRow: { display: 'flex', borderTop: '1px solid rgba(255,255,255,0.07)' },
  input: { flex: 1, background: 'transparent', border: 'none', padding: '10px 12px', color: '#fff', fontFamily: "'Courier New',monospace", fontSize: 11, outline: 'none' },
  sendBtn: { background: '#fff', color: '#000', border: 'none', padding: '0 16px', fontFamily: "'Courier New',monospace", fontSize: 9, letterSpacing: '0.2em', cursor: 'pointer', fontWeight: 700, textTransform: 'uppercase' },
  nameRow: { padding: 12, borderBottom: '1px solid rgba(255,255,255,0.07)' },
  nameInput: { width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 10px', color: '#fff', fontFamily: "'Courier New',monospace", fontSize: 11, outline: 'none', marginBottom: 8, display: 'block' },
  startBtn: { width: '100%', background: '#fff', color: '#000', border: 'none', padding: 9, fontFamily: "'Courier New',monospace", fontSize: 9, letterSpacing: '0.25em', cursor: 'pointer', fontWeight: 700, textTransform: 'uppercase' },
  dot: { display: 'inline-block', width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.35)', margin: '0 2px', animation: 'chatbounce 1s ease-in-out infinite' },
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [started, setStarted] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sessionId] = useState(() => `sx_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`)
  const [adminTyping, setAdminTyping] = useState(false)
  const bottomRef = useRef(null)
  const typingTimer = useRef(null)

  // Poll messages when open
  useEffect(() => {
    if (!open || !started) return
    const poll = () => {
      fetch(`/api/chat?session_id=${sessionId}`)
        .then(r => r.json())
        .then(d => {
          setMessages(d.messages || [])
          setAdminTyping(d.admin_typing || false)
          bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
        })
    }
    poll()
    const iv = setInterval(poll, 3000)
    return () => clearInterval(iv)
  }, [open, started])

  const start = async () => {
    if (!name.trim()) return
    // Send opening message
    await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId, message: `Hi, I'm ${name}. I'd like to know more about SpaceX Stocks.`,
        sender: name, user_name: name, user_email: email || null, is_admin: false,
      }),
    })
    setStarted(true)
  }

  const send = async () => {
    if (!text.trim()) return
    const msg = text; setText('')
    await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, message: msg, sender: name, is_admin: false }),
    })
    // Clear typing
    clearTimeout(typingTimer.current)
    fetch('/api/typing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: sessionId, is_admin: false, typing: false }) })
  }

  const handleTyping = () => {
    fetch('/api/typing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: sessionId, is_admin: false, typing: true }) })
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      fetch('/api/typing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: sessionId, is_admin: false, typing: false }) })
    }, 3000)
  }

  return (
    <>
      <style>{`@keyframes chatbounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}`}</style>
      {open && (
        <div style={S.window}>
          <div style={S.header}>
            <div><div style={S.hTitle}>SpaceX Stocks Support</div><div style={S.hSub}>We typically reply within minutes</div></div>
            <button style={S.close} onClick={() => setOpen(false)}>×</button>
          </div>

          {!started ? (
            <div style={S.nameRow}>
              <div style={{ fontSize: 9, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', lineHeight: 1.8, marginBottom: 12 }}>
                Hello! Have a question about our investment plans or perks? We're here to help.
              </div>
              <input style={S.nameInput} placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
              <input style={S.nameInput} placeholder="Email (optional)" value={email} onChange={e => setEmail(e.target.value)} />
              <button style={S.startBtn} onClick={start}>Start Chat →</button>
            </div>
          ) : (
            <>
              <div style={S.messages}>
                {messages.map(m => (
                  <div key={m.id} style={S.msgWrap(m.is_admin)}>
                    <div style={S.msg(m.is_admin)}>{m.message}</div>
                  </div>
                ))}
                {adminTyping && (
                  <div style={S.typing}>
                    Support is typing <span style={S.dot}></span><span style={{ ...S.dot, animationDelay: '0.2s' }}></span><span style={{ ...S.dot, animationDelay: '0.4s' }}></span>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
              <div style={S.inputRow}>
                <input style={S.input} value={text} onChange={e => { setText(e.target.value); handleTyping() }}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), send())}
                  placeholder="Type a message..." />
                <button style={S.sendBtn} onClick={send}>Send</button>
              </div>
            </>
          )}
        </div>
      )}
      <button style={S.bubble} onClick={() => setOpen(o => !o)}>{open ? '×' : '💬'}</button>
    </>
  )
}
