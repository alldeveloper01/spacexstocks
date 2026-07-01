'use client'
import { useState, useEffect, useRef } from 'react'

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState('intro')
  const [sessionId, setSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: '' })
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(0)
  const [closed, setClosed] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [adminTyping, setAdminTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const pollRef = useRef(null)
  const typingRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    const savedSession = localStorage.getItem('sx_chat_session')
    const savedStep = localStorage.getItem('sx_chat_step')
    const savedForm = localStorage.getItem('sx_chat_form')
    const savedClosed = localStorage.getItem('sx_chat_closed')
    if (savedSession) {
      setSessionId(savedSession)
      if (savedStep === 'chat') {
        setStep('chat')
        if (savedForm) setForm(JSON.parse(savedForm))
        if (savedClosed === 'true') setClosed(true)
      }
    }
  }, [])

  useEffect(() => {
    if (sessionId && step === 'chat') {
      fetchMessages()
      pollRef.current = setInterval(fetchMessages, 3000)
    }
    return () => clearInterval(pollRef.current)
  }, [sessionId, step])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, adminTyping])

  async function fetchMessages() {
    if (!sessionId) return
    try {
      const res = await fetch(`/api/chat?session_id=${sessionId}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
        setAdminTyping(data.admin_typing || false)
        if (data.closed) { setClosed(true); localStorage.setItem('sx_chat_closed', 'true') }
        if (!open) setUnread(data.messages?.filter(m => m.is_admin && !m.read).length || 0)
      }
    } catch {}
  }

  async function handleTyping() {
    if (!sessionId) return
    if (typingRef.current) clearTimeout(typingRef.current)
    await fetch('/api/chat/typing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: sessionId, is_admin: false, typing: true }) }).catch(() => {})
    typingRef.current = setTimeout(async () => {
      await fetch('/api/chat/typing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: sessionId, is_admin: false, typing: false }) }).catch(() => {})
    }, 3000)
  }

  async function handleStartChat() {
    if (!form.name || !form.email) return
    setLoading(true)
    try {
      const newSessionId = `sx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: newSessionId, message: form.subject || 'Hello, I need help.', sender: form.name, user_email: form.email, user_name: form.name, is_admin: false })
      })
      setSessionId(newSessionId); setStep('chat'); setClosed(false)
      localStorage.setItem('sx_chat_session', newSessionId)
      localStorage.setItem('sx_chat_step', 'chat')
      localStorage.setItem('sx_chat_form', JSON.stringify(form))
      localStorage.removeItem('sx_chat_closed')
      fetchMessages()
    } catch {}
    setLoading(false)
  }

  async function sendMessage(messageText) {
    const msg = messageText || input.trim()
    if (!msg || sending) return
    setInput(''); setSending(true)
    if (typingRef.current) clearTimeout(typingRef.current)
    await fetch('/api/chat/typing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: sessionId, is_admin: false, typing: false }) }).catch(() => {})
    setMessages(prev => [...prev, { id: Date.now(), message: msg, is_admin: false, sender: form.name, created_at: new Date().toISOString() }])
    try {
      await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: sessionId, message: msg, sender: form.name, user_email: form.email, user_name: form.name, is_admin: false }) })
      fetchMessages()
    } catch {}
    setSending(false)
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0]; if (!file) return
    setUploadingImage(true)
    const reader = new FileReader()
    reader.onload = async () => { await sendMessage(`[IMAGE] ${reader.result}`); setUploadingImage(false) }
    reader.readAsDataURL(file)
  }

  function startNewChat() {
    ['sx_chat_session', 'sx_chat_step', 'sx_chat_form', 'sx_chat_closed'].forEach(k => localStorage.removeItem(k))
    setSessionId(null); setStep('intro'); setMessages([]); setForm({ name: '', email: '', subject: '' }); setUnread(0); setClosed(false); setAdminTyping(false)
  }

  if (!mounted) return null

  return (
    <>
      <style>{`
        .sx-chat { position:fixed; bottom:24px; right:24px; z-index:9999; font-family:'Courier New',monospace; }
        .sx-bubble { width:52px; height:52px; background:#fff; border:none; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 4px 20px rgba(0,0,0,0.4); transition:transform 0.2s; position:relative; }
        .sx-bubble:hover { transform:scale(1.06); }
        .sx-unread { position:absolute; top:-3px; right:-3px; background:rgba(255,80,80,0.9); color:#fff; width:18px; height:18px; border-radius:50%; font-size:9px; font-weight:700; display:flex; align-items:center; justify-content:center; }
        .sx-window { position:absolute; bottom:68px; right:0; width:340px; height:500px; background:#0a0a0a; border:1px solid rgba(192,192,192,0.12); display:flex; flex-direction:column; box-shadow:0 20px 60px rgba(0,0,0,0.6); animation:sxSlide 0.2s ease; }
        @keyframes sxSlide { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .sx-header { background:#000; border-bottom:1px solid rgba(192,192,192,0.1); padding:14px 18px; display:flex; align-items:center; justify-content:space-between; }
        .sx-body { flex:1; overflow-y:auto; padding:14px; display:flex; flex-direction:column; gap:10px; }
        .sx-body::-webkit-scrollbar { width:2px; }
        .sx-body::-webkit-scrollbar-thumb { background:rgba(192,192,192,0.15); }
        .sx-input-area { border-top:1px solid rgba(192,192,192,0.08); padding:10px 14px; display:flex; gap:8px; align-items:center; }
        .sx-input { flex:1; background:transparent; border:1px solid rgba(255,255,255,0.1); padding:9px 12px; color:#fff; font-family:'Courier New',monospace; font-size:11px; outline:none; }
        .sx-input::placeholder { color:rgba(255,255,255,0.2); }
        .sx-send { width:34px; height:34px; background:#fff; border:none; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:13px; flex-shrink:0; color:#000; }
        .sx-send:disabled { opacity:0.4; cursor:not-allowed; }
        .sx-attach { width:34px; height:34px; background:transparent; border:1px solid rgba(255,255,255,0.1); display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; color:rgba(255,255,255,0.4); font-size:14px; }
        .sx-form { padding:18px; display:flex; flex-direction:column; gap:12px; flex:1; overflow-y:auto; }
        .sx-form-input { width:100%; background:transparent; border:1px solid rgba(255,255,255,0.1); padding:10px 12px; color:#fff; font-family:'Courier New',monospace; font-size:11px; outline:none; box-sizing:border-box; }
        .sx-form-input::placeholder { color:rgba(255,255,255,0.2); }
        .sx-form-btn { width:100%; background:#fff; border:none; padding:12px; color:#000; font-family:'Courier New',monospace; font-size:8px; font-weight:700; letter-spacing:0.35em; text-transform:uppercase; cursor:pointer; }
        .sx-form-btn:disabled { opacity:0.5; cursor:not-allowed; }
        .sx-label { font-size:7px; letter-spacing:0.3em; text-transform:uppercase; color:rgba(255,255,255,0.2); margin-bottom:4px; }
        .typing-dot { width:5px; height:5px; background:#C0C0C0; border-radius:50%; display:inline-block; animation:sxTyping 1.2s infinite; }
        .typing-dot:nth-child(2) { animation-delay:0.2s; }
        .typing-dot:nth-child(3) { animation-delay:0.4s; }
        @keyframes sxTyping { 0%,60%,100%{transform:translateY(0);opacity:0.3} 30%{transform:translateY(-5px);opacity:1} }
        @media(max-width:480px) { .sx-window { width:calc(100vw - 32px); right:-8px; } }
      `}</style>

      <div className="sx-chat">
        {open && (
          <div className="sx-window">
            {/* Header */}
            <div className="sx-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, background: 'rgba(192,192,192,0.08)', border: '1px solid rgba(192,192,192,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>💬</div>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: '0.3em', color: '#fff', textTransform: 'uppercase' }}>SpaceX Stocks</div>
                  <div style={{ fontSize: 8, letterSpacing: '0.15em', color: closed ? 'rgba(255,80,80,0.6)' : 'rgba(192,192,192,0.5)', marginTop: 2 }}>
                    {closed ? '● Chat Closed' : '● Support Online'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {step === 'chat' && (
                  <button onClick={startNewChat} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)', padding: '5px 10px', fontSize: 7, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit' }}>New</button>
                )}
                <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 18, lineHeight: 1, fontFamily: 'inherit' }}>×</button>
              </div>
            </div>

            {step === 'intro' ? (
              <div className="sx-form">
                <div>
                  <div style={{ fontSize: 16, color: '#fff', letterSpacing: '0.04em', marginBottom: 6 }}>Hello 👋</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', lineHeight: 1.8, letterSpacing: '0.06em' }}>Welcome to SpaceX Stocks support. Fill in your details and we'll be right with you.</div>
                </div>
                <div><div className="sx-label">Your Name *</div><input className="sx-form-input" placeholder="Full name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
                <div><div className="sx-label">Email Address *</div><input className="sx-form-input" type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
                <div><div className="sx-label">How can we help?</div><input className="sx-form-input" placeholder="Brief description..." value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} /></div>
                <button className="sx-form-btn" onClick={handleStartChat} disabled={loading || !form.name || !form.email}>
                  {loading ? 'Starting...' : 'Start Chat →'}
                </button>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textAlign: 'center', letterSpacing: '0.08em' }}>Typical response time: under 5 minutes</div>
              </div>
            ) : (
              <>
                <div className="sx-body">
                  <div style={{ alignSelf: 'flex-start' }}>
                    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '10px 14px', fontSize: 11, color: '#fff', lineHeight: 1.7, maxWidth: '80%' }}>
                      Hello {form.name}! 👋 Thank you for contacting SpaceX Stocks support. Our team will be with you shortly.
                    </div>
                    <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', marginTop: 3 }}>Support Team</div>
                  </div>

                  {messages.map((msg, i) => {
                    const isImage = msg.message?.startsWith('[IMAGE]')
                    const imageUrl = isImage ? msg.message.replace('[IMAGE] ', '') : null
                    return (
                      <div key={msg.id || i} style={{ alignSelf: msg.is_admin ? 'flex-start' : 'flex-end', maxWidth: '80%' }}>
                        <div style={{ background: msg.is_admin ? 'rgba(255,255,255,0.04)' : '#fff', border: msg.is_admin ? '1px solid rgba(255,255,255,0.08)' : 'none', padding: '10px 14px', fontSize: 11, color: msg.is_admin ? '#fff' : '#000', lineHeight: 1.7 }}>
                          {isImage ? <img src={imageUrl} alt="img" style={{ maxWidth: '100%', cursor: 'pointer' }} onClick={() => window.open(imageUrl, '_blank')} /> : msg.message}
                        </div>
                        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', marginTop: 3, textAlign: msg.is_admin ? 'left' : 'right' }}>
                          {msg.is_admin ? 'Support' : 'You'} · {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    )
                  })}

                  {adminTyping && (
                    <div style={{ alignSelf: 'flex-start' }}>
                      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '10px 14px', display: 'flex', gap: 4, alignItems: 'center' }}>
                        <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                      </div>
                      <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', marginTop: 3 }}>Support is typing...</div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {closed ? (
                  <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', marginBottom: 10, letterSpacing: '0.08em' }}>This chat has been closed by support.</div>
                    <button onClick={startNewChat} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', padding: '7px 16px', fontSize: 8, letterSpacing: '0.25em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit' }}>Start New Chat</button>
                  </div>
                ) : (
                  <div className="sx-input-area">
                    <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*,.pdf" onChange={handleImageUpload} />
                    <button className="sx-attach" onClick={() => fileInputRef.current?.click()}>{uploadingImage ? '⏳' : '📎'}</button>
                    <input className="sx-input" placeholder="Type a message..." value={input} onChange={e => { setInput(e.target.value); handleTyping() }} onKeyDown={e => e.key === 'Enter' && sendMessage()} />
                    <button className="sx-send" onClick={() => sendMessage()} disabled={sending || !input.trim()}>→</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <button className="sx-bubble" onClick={() => { setOpen(!open); setUnread(0) }}>
          {open ? <span style={{ color: '#000', fontSize: 18 }}>×</span> : <span style={{ fontSize: 20 }}>💬</span>}
          {!open && unread > 0 && <span className="sx-unread">{unread}</span>}
        </button>
      </div>
    </>
  )
}