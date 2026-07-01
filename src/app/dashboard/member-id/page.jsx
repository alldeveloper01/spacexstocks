'use client'

import { useEffect, useRef, useState } from 'react'

function authHeaders() {
  const token = localStorage.getItem('sx_token')
  return { 'Authorization': `Bearer ${token}` }
}

function GlobeWatermark({ size = 320, opacity = 0.06 }) {
  const ref = useRef(null)
  useEffect(() => {
    const cv = ref.current; if (!cv) return
    const ctx = cv.getContext('2d')
    const cx = size / 2, cy = size / 2, r = size * 0.42
    ctx.strokeStyle = `rgba(255,255,255,${opacity})`
    ctx.lineWidth = 0.8

    // Outer circle
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke()

    // Latitude lines
    for (let lat = -60; lat <= 60; lat += 30) {
      const yr = r * Math.cos(lat * Math.PI / 180)
      const xoff = r * Math.sin(lat * Math.PI / 180)
      ctx.beginPath()
      ctx.ellipse(cx, cy - xoff * 0, yr, Math.abs(r * Math.sin(lat * Math.PI / 180) * 0.3) || r * 0.1, 0, 0, Math.PI * 2)
      ctx.stroke()
    }

    // Longitude lines
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI
      ctx.beginPath()
      ctx.ellipse(cx, cy, r * Math.abs(Math.sin(angle)) || r * 0.1, r, angle, 0, Math.PI * 2)
      ctx.stroke()
    }

    // Continent dots
    ctx.fillStyle = `rgba(255,255,255,${opacity * 1.5})`
    const dots = [
      [cx - 80, cy - 30], [cx - 70, cy - 20], [cx - 90, cy - 10],
      [cx - 60, cy + 10], [cx - 75, cy + 20], [cx - 85, cy],
      [cx + 20, cy - 40], [cx + 30, cy - 30], [cx + 15, cy - 20],
      [cx + 40, cy - 10], [cx + 25, cy], [cx + 35, cy + 10],
      [cx + 60, cy - 20], [cx + 70, cy - 10], [cx + 55, cy],
      [cx - 20, cy + 30], [cx - 10, cy + 40], [cx - 30, cy + 50],
      [cx - 15, cy + 55], [cx + 5, cy + 45],
      [cx + 80, cy + 10], [cx + 90, cy + 20], [cx + 75, cy + 30],
    ]
    dots.forEach(([x, y]) => {
      ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill()
    })

    // Location pins
    ctx.fillStyle = `rgba(255,255,255,${opacity * 4})`
    ;[[cx - 75, cy - 25], [cx - 60, cy + 15], [cx + 25, cy - 35]].forEach(([x, y]) => {
      ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = `rgba(255,255,255,${opacity * 3})`
      ctx.lineWidth = 0.5
      ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.stroke()
    })

  }, [])
  return <canvas ref={ref} width={size} height={size} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
}

function QRCode({ value, size = 80 }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!value || !ref.current) return
    import('qrcode').then(QR => {
      QR.toCanvas(ref.current, value, {
        width: size,
        margin: 1,
        color: { dark: '#ffffff', light: '#00000000' }
      })
    })
  }, [value])
  return <canvas ref={ref} width={size} height={size} style={{ display: 'block' }} />
}

export default function MemberIDPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const cardRef = useRef(null)

  useEffect(() => {
    fetch('/api/auth', { headers: authHeaders() })
      .then(r => r.json())
      .then(d => { setUser(d); setLoading(false) })
  }, [])

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      if (!cardRef.current) return
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#000',
        scale: 3,
        useCORS: true,
        logging: false,
      })
      const link = document.createElement('a')
      link.download = `spacexstocks-${user?.member_number || 'member'}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (e) { console.error(e) }
    setDownloading(false)
  }

  const handleShare = async () => {
    if (navigator.share) {
      navigator.share({
        title: 'SpaceX Stocks Member',
        text: `I'm a ${user?.active_tier || 'Explorer'} member of SpaceX Stocks — the private investment platform. Member #${user?.member_number}`,
        url: 'https://spacestocks.finance'
      })
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ fontFamily: "'Courier New',monospace", fontSize: 9, letterSpacing: '0.4em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>Loading...</div>
    </div>
  )

  const memberNumber = user?.member_number || '000000'
  const tier = user?.active_tier || 'Explorer'
  const joinDate = user?.member_since
    ? new Date(user.member_since).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : 'N/A'
  const qrValue = `https://spacestocks.finance/member/${memberNumber}`

  const TIER_COLORS = {
    Bronze: '#CD7F32',
    Starter: '#C0C0C0',
    Growth: '#C0C0C0',
    Premium: '#FFD700',
    Elite: '#FFD700',
    Platinum: '#E5E4E2',
    Explorer: '#888888',
  }
  const tierColor = TIER_COLORS[tier] || '#C0C0C0'

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontFamily: "'Courier New',monospace", fontSize: 'clamp(18px,3vw,28px)', fontWeight: 400, color: '#fff', letterSpacing: '0.06em', marginBottom: 6 }}>
          Member ID
        </div>
        <div style={{ fontFamily: "'Courier New',monospace", fontSize: 8, letterSpacing: '0.38em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase' }}>
          Your exclusive SpaceX Stocks identity card
        </div>
      </div>

      <div style={{ maxWidth: 520 }}>
        {/* THE CARD */}
        <div ref={cardRef} style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1.586',
          background: 'linear-gradient(145deg, #0a0a0a 0%, #111111 40%, #0d0d0d 100%)',
          border: `1px solid ${tierColor}22`,
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}>
          {/* Globe watermark — centered large */}
          <GlobeWatermark size={340} opacity={0.055} />

          {/* Diagonal light streak */}
          <div style={{
            position: 'absolute', top: -40, right: -60,
            width: 180, height: 400,
            background: `linear-gradient(135deg, ${tierColor}06, transparent)`,
            transform: 'rotate(-30deg)',
            pointerEvents: 'none',
          }} />

          {/* Top edge line */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 2,
            background: `linear-gradient(90deg, transparent, ${tierColor}, transparent)`,
          }} />

          {/* Left edge accent */}
          <div style={{
            position: 'absolute', top: 0, left: 0, bottom: 0, width: 2,
            background: `linear-gradient(180deg, ${tierColor}, transparent 60%)`,
          }} />

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 2, height: '100%', padding: '22px 26px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>

            {/* TOP ROW */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontFamily: "'Courier New',monospace", fontSize: 8, letterSpacing: '0.5em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', marginBottom: 3 }}>
                  SpaceX Stocks
                </div>
                <div style={{ fontFamily: "'Courier New',monospace", fontSize: 7, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.12)', textTransform: 'uppercase' }}>
                  Private Investment Access
                </div>
              </div>
              <div style={{
                fontFamily: "'Courier New',monospace",
                fontSize: 7, letterSpacing: '0.35em', textTransform: 'uppercase',
                color: tierColor,
                border: `1px solid ${tierColor}44`,
                padding: '4px 10px',
                background: `${tierColor}0d`,
              }}>
                {tier}
              </div>
            </div>

            {/* MIDDLE — Member name large */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Courier New',monospace", fontSize: 'clamp(20px,4vw,28px)', fontWeight: 400, color: '#ffffff', letterSpacing: '0.12em', textTransform: 'uppercase', textShadow: `0 0 40px ${tierColor}33` }}>
                {user?.full_name || 'Member'}
              </div>
              <div style={{ fontFamily: "'Courier New',monospace", fontSize: 7, letterSpacing: '0.4em', color: 'rgba(255,255,255,0.15)', textTransform: 'uppercase', marginTop: 6 }}>
                Verified Member
              </div>
            </div>

            {/* BOTTOM ROW */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>

              {/* Left — member details */}
              <div style={{ display: 'flex', gap: 24 }}>
                <div>
                  <div style={{ fontFamily: "'Courier New',monospace", fontSize: 6, letterSpacing: '0.38em', color: 'rgba(255,255,255,0.18)', textTransform: 'uppercase', marginBottom: 4 }}>
                    Member Since
                  </div>
                  <div style={{ fontFamily: "'Courier New',monospace", fontSize: 10, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em' }}>
                    {joinDate}
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: "'Courier New',monospace", fontSize: 6, letterSpacing: '0.38em', color: 'rgba(255,255,255,0.18)', textTransform: 'uppercase', marginBottom: 4 }}>
                    Member No.
                  </div>
                  <div style={{ fontFamily: "'Courier New',monospace", fontSize: 10, color: tierColor, letterSpacing: '0.12em' }}>
                    #{memberNumber}
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: "'Courier New',monospace", fontSize: 6, letterSpacing: '0.38em', color: 'rgba(255,255,255,0.18)', textTransform: 'uppercase', marginBottom: 4 }}>
                    Platform
                  </div>
                  <div style={{ fontFamily: "'Courier New',monospace", fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em' }}>
                    spacestocks.finance
                  </div>
                </div>
              </div>

              {/* Right — QR code */}
              <div style={{ flexShrink: 0, padding: 4, background: '#000', border: `1px solid ${tierColor}22` }}>
                <QRCode value={qrValue} size={64} />
              </div>
            </div>

          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button onClick={handleDownload} disabled={downloading} style={{
            flex: 1, padding: '13px 0',
            background: '#fff', color: '#000',
            border: 'none', fontFamily: "'Courier New',monospace",
            fontSize: 8, letterSpacing: '0.35em', textTransform: 'uppercase',
            cursor: downloading ? 'not-allowed' : 'pointer',
            opacity: downloading ? 0.6 : 1, fontWeight: 700,
          }}>
            {downloading ? 'Generating...' : 'Download Card'}
          </button>
          <button onClick={handleShare} style={{
            padding: '13px 24px',
            background: 'transparent', color: 'rgba(255,255,255,0.35)',
            border: '1px solid rgba(255,255,255,0.1)',
            fontFamily: "'Courier New',monospace",
            fontSize: 8, letterSpacing: '0.35em', textTransform: 'uppercase',
            cursor: 'pointer',
          }}>
            Share
          </button>
        </div>

        <div style={{ fontFamily: "'Courier New',monospace", fontSize: 7, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.1)', textAlign: 'center', marginTop: 10, textTransform: 'uppercase' }}>
          Card design adapts to your membership tier
        </div>
      </div>
    </div>
  )
}