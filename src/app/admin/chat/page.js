'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminChatPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState([])
  const [selected, setSelected] = useState(null)
  const [messages, setMessages] = useState([])
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userTyping, setUserTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const pollRef = useRef(null)
  const adminTypingRef = useRef(null)

  useEffect(() => {
    fetchSessions()
    const interval = setInterval(fetchSessions, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (selected) {
      fetchMessages(selected.session_id)
      clearInterval(pollRef.current)
      pollRef.current = setInterval(() => fetchMessages(selected.session_id), 3000)
    }
    return () => clearInterval(pollRef.current)
  }, [selected])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, userTyping])

  async function fetchSessions() {
    try {
      const res = await fetch('/api/chat/session', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sx_token')}` }
      })
      if (res.ok) {
        const data = await res.json()
        setSessions(data.sessions || [])
       if (selected) {
          const updated = (data.sessions || []).find(s => s.session_id === selected.session_id)
          if (updated && updated.status !== selected.status) {
            setSelected(prev => ({ ...prev, status: updated.status }))
          }
        }
      }
    } catch {}
    finally { setLoading(false) }
  }

  async function fetchMessages(session_id) {
    try {
      const res = await fetch(`/api/chat?session_id=${session_id}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
        setUserTyping(data.user_typing || false)
      }
    } catch {}
  }

  async function handleAdminTyping() {
    if (!selected) return
    if (adminTypingRef.current) clearTimeout(adminTypingRef.current)
    await fetch('/api/chat/typing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: selected.session_id, is_admin: true, typing: true })
    }).catch(() => {})
    adminTypingRef.current = setTimeout(async () => {
      await fetch('/api/chat/typing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: selected.session_id, is_admin: true, typing: false })
      }).catch(() => {})
    }, 3000)
  }

  async function sendReply() {
    if (!reply.trim() || !selected || sending) return
    const msg = reply.trim()
    setReply('')
    setSending(true)
    if (adminTypingRef.current) clearTimeout(adminTypingRef.current)
    await fetch('/api/chat/typing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: selected.session_id, is_admin: true, typing: false })
    }).catch(() => {})
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: selected.session_id,
          message: msg,
          sender: 'Support',
          is_admin: true
        })
      })
      fetchMessages(selected.session_id)
    } catch {}
    finally { setSending(false) }
  }

  async function closeChat(session_id) {
    try {
      await fetch('/api/chat/session', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('sx_token')}` },
        body: JSON.stringify({ session_id, status: 'closed' })
      })
      fetchSessions()
      if (selected?.session_id === session_id) {
        setSelected(prev => prev ? { ...prev, status: 'closed' } : null)
      }
    } catch {}
  }

  async function reopenChat(session_id) {
    try {
      await fetch('/api/chat/session', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('sx_token')}` },
        body: JSON.stringify({ session_id, status: 'open' })
      })
      fetchSessions()
      if (selected?.session_id === session_id) {
        setSelected(prev => prev ? { ...prev, status: 'open' } : null)
      }
    } catch {}
  }

  function renderMessage(msg) {
    const isImage = msg.message?.startsWith('[IMAGE]')
    const imageUrl = isImage ? msg.message.replace('[IMAGE] ', '') : null
    if (isImage) {
      return (
        <img src={imageUrl} alt="Attachment"
          style={{ maxWidth: '200px', cursor: 'pointer', display: 'block' }}
          onClick={() => window.open(imageUrl, '_blank')} />
      )
    }
    return msg.message
  }

  const openSessions = sessions.filter(s => s.status !== 'closed')
  const closedSessions = sessions.filter(s => s.status === 'closed')
  const totalUnread = sessions.reduce((sum, s) => sum + (s.unread || 0), 0)

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: "'Courier New',monospace" }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: 10, letterSpacing: '0.4em', color: '#fff', textTransform: 'uppercase' }}>
          SpaceX Stocks · Admin
          {totalUnread > 0 && (
            <span style={{ background: 'rgba(255,80,80,0.8)', color: '#fff', fontSize: 8, padding: '2px 8px', marginLeft: 12 }}>
              {totalUnread} unread
            </span>
          )}
        </div>
        <button onClick={() => router.push('/admin')} style={{ fontSize: 8, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit' }}>← Dashboard</button>
      </nav>

      <div style={{ height: 'calc(100vh - 57px)', display: 'grid', gridTemplateColumns: '300px 1fr' }}>
        <style>{`
          .chat-row { display:flex; align-items:center; gap:12px; padding:14px 16px; cursor:pointer; border-bottom:1px solid rgba(255,255,255,0.04); transition:background 0.2s; }
          .chat-row:hover { background:rgba(192,192,192,0.04); }
          .chat-row.active { background:rgba(192,192,192,0.08); }
          .msg-bubble-admin { background:#fff; color:#000; padding:10px 14px; font-size:11px; line-height:1.6; max-width:70%; align-self:flex-end; font-family:'Courier New',monospace; }
          .msg-bubble-user { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); color:#fff; padding:10px 14px; font-size:11px; line-height:1.6; max-width:70%; align-self:flex-start; font-family:'Courier New',monospace; }
          .admin-input { width:100%; background:transparent; border:1px solid rgba(255,255,255,0.1); padding:12px 16px; color:#fff; font-family:'Courier New',monospace; font-size:11px; outline:none; }
          .admin-input:focus { border-color:rgba(192,192,192,0.3); }
          .admin-input::placeholder { color:rgba(255,255,255,0.2); }
          .typing-dot { width:5px; height:5px; background:#C0C0C0; border-radius:50%; display:inline-block; animation:typingBounce 1.2s infinite; }
          .typing-dot:nth-child(2) { animation-delay:0.2s; }
          .typing-dot:nth-child(3) { animation-delay:0.4s; }
          @keyframes typingBounce { 0%,60%,100%{transform:translateY(0);opacity:0.4} 30%{transform:translateY(-5px);opacity:1} }
        `}</style>

        {/* Sessions list */}
        <div style={{ borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 7, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>
            Active ({openSessions.length})
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 20, textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>Loading...</div>
            ) : openSessions.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>No active chats</div>
            ) : openSessions.map(session => (
              <div key={session.session_id} className={`chat-row ${selected?.session_id === session.session_id ? 'active' : ''}`} onClick={() => setSelected(session)}>
                <div style={{ width: 34, height: 34, background: 'rgba(192,192,192,0.08)', border: '1px solid rgba(192,192,192,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#C0C0C0', flexShrink: 0 }}>
                  {session.user_name?.charAt(0) || '?'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.user_name || 'Visitor'}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {session.last_message?.startsWith('[IMAGE]') ? '📎 Image attachment' : session.last_message}
                  </div>
                </div>
                {session.unread > 0 && (
                  <div style={{ background: 'rgba(255,80,80,0.8)', color: '#fff', width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, flexShrink: 0 }}>
                    {session.unread}
                  </div>
                )}
              </div>
            ))}

            {closedSessions.length > 0 && (
              <>
                <div style={{ padding: '10px 16px', fontSize: 7, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.15)', textTransform: 'uppercase', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  Closed ({closedSessions.length})
                </div>
                {closedSessions.map(session => (
                  <div key={session.session_id} className={`chat-row ${selected?.session_id === session.session_id ? 'active' : ''}`} onClick={() => setSelected(session)} style={{ opacity: 0.6 }}>
                    <div style={{ width: 34, height: 34, background: 'rgba(255,255,255,0.04)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
                      {session.user_name?.charAt(0) || '?'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.user_name || 'Visitor'}</div>
                      <div style={{ fontSize: 7, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.15)', textTransform: 'uppercase' }}>Closed</div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Chat window */}
        {selected ? (
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, color: '#fff' }}>{selected.user_name || 'Visitor'}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em' }}>{selected.user_email || 'No email'}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {selected.status === 'closed' ? (
                  <button onClick={() => reopenChat(selected.session_id)}
                    style={{ background: 'rgba(192,192,192,0.08)', border: '1px solid rgba(192,192,192,0.25)', color: '#C0C0C0', padding: '7px 16px', fontSize: 8, letterSpacing: '0.25em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Reopen
                  </button>
                ) : (
                  <button onClick={() => closeChat(selected.session_id)}
                    style={{ background: 'rgba(255,80,80,0.06)', border: '1px solid rgba(255,80,80,0.2)', color: 'rgba(255,80,80,0.7)', padding: '7px 16px', fontSize: 8, letterSpacing: '0.25em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Close Chat
                  </button>
                )}
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messages.map((msg, i) => (
                <div key={msg.id || i} style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className={msg.is_admin ? 'msg-bubble-admin' : 'msg-bubble-user'}>
                    {renderMessage(msg)}
                  </div>
                  <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', marginTop: 3, textAlign: msg.is_admin ? 'right' : 'left' }}>
                    {msg.is_admin ? 'You' : msg.sender} · {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}

              {userTyping && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="msg-bubble-user" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '10px 14px' }}>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                  <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', marginTop: 3 }}>User is typing...</div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {selected.status !== 'closed' ? (
              <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8 }}>
                <input className="admin-input" placeholder="Type your reply..."
                  value={reply}
                  onChange={e => { setReply(e.target.value); handleAdminTyping() }}
                  onKeyDown={e => e.key === 'Enter' && sendReply()} />
                <button onClick={sendReply} disabled={sending || !reply.trim()}
                  style={{ background: '#fff', border: 'none', padding: '0 20px', color: '#000', fontSize: 12, cursor: 'pointer', flexShrink: 0, opacity: sending ? 0.6 : 1, fontFamily: 'inherit' }}>
                  →
                </button>
              </div>
            ) : (
              <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center', fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>
                This chat is closed. Reopen to continue.
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.1 }}>💬</div>
              <div style={{ fontSize: 9, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>Select a conversation</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}