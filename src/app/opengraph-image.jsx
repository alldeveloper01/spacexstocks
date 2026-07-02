import { ImageResponse } from '@vercel/og'

export const runtime = 'edge'
export const alt = 'SpaceX Stocks — Private Investment Access'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#000000',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: "'Courier New', monospace",
        }}
      >
        {/* Stars */}
        {[
          [87,43],[234,112],[456,67],[612,23],[789,89],[923,34],[1087,78],[1143,156],
          [34,198],[167,267],[312,189],[534,234],[678,167],[845,212],[1034,178],[1167,234],
          [56,378],[189,445],[345,367],[123,523],[267,589],[1089,456],[1156,389],[1034,534],
          [967,578],[834,456],[712,523],[589,489],[445,556],[378,612],[78,312],[156,89],
          [890,312],[1100,267],[423,456],[567,89],[234,456],[789,234],[1034,312],[678,456],
        ].map(([x,y], i) => (
          <div key={i} style={{
            position: 'absolute', left: x, top: y,
            width: i % 3 === 0 ? 2 : 1.5, height: i % 3 === 0 ? 2 : 1.5,
            borderRadius: '50%', background: '#ffffff',
            opacity: 0.2 + (i % 5) * 0.1,
            display: 'flex',
          }} />
        ))}

        {/* Globe - right side */}
        <div style={{
          position: 'absolute', right: -40, top: '50%',
          transform: 'translateY(-50%)',
          width: 520, height: 520,
          borderRadius: '50%',
          border: '1px solid rgba(192,192,192,0.2)',
          background: 'rgba(8,8,12,0.98)',
          display: 'flex',
          overflow: 'hidden',
        }}>
          {/* Sun glow */}
          <div style={{
            position: 'absolute', top: -80, right: -80,
            width: 400, height: 400, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(192,192,192,0.4) 0%, transparent 70%)',
            display: 'flex',
          }} />
          {/* Grid lines */}
          <div style={{
            position: 'absolute', inset: 0,
            border: '0.5px solid rgba(192,192,192,0.06)',
            borderRadius: '50%', display: 'flex',
          }} />
        </div>

        {/* Outer orbit ring */}
        <div style={{
          position: 'absolute', right: -80, top: '50%',
          transform: 'translateY(-50%)',
          width: 600, height: 600, borderRadius: '50%',
          border: '0.5px solid rgba(192,192,192,0.05)',
          display: 'flex',
        }} />

        {/* Satellite dots */}
        {[[730,180],[820,420],[640,500],[760,310]].map(([x,y],i) => (
          <div key={i} style={{
            position: 'absolute', left: x, top: y,
            width: 5, height: 5, borderRadius: '50%',
            background: '#C0C0C0', opacity: 0.6 + i*0.1,
            display: 'flex',
          }} />
        ))}

        {/* Logo top left */}
        <div style={{
          position: 'absolute', top: 48, left: 68,
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          <div style={{
            fontSize: 13, letterSpacing: 6, color: 'rgba(255,255,255,0.9)',
            textTransform: 'uppercase', display: 'flex',
          }}>
            SPACEX STOCKS
          </div>
          <div style={{
            fontSize: 9, letterSpacing: 4, color: 'rgba(255,255,255,0.2)',
            textTransform: 'uppercase', display: 'flex',
          }}>
            SPACESTOCKS.FINANCE
          </div>
        </div>

        {/* Eyebrow */}
        <div style={{
          position: 'absolute', top: 136, left: 68,
          fontSize: 12, letterSpacing: 5, color: 'rgba(255,255,255,0.28)',
          textTransform: 'uppercase', display: 'flex',
        }}>
          EST. 2025  ·  INVITATION ONLY
        </div>

        {/* Main headline */}
        <div style={{
          position: 'absolute', top: 188, left: 64,
          display: 'flex', flexDirection: 'column', gap: 0,
        }}>
          <div style={{
            fontSize: 96, fontWeight: 400, color: '#ffffff',
            letterSpacing: -2, lineHeight: 1, display: 'flex',
            fontFamily: 'Georgia, serif',
          }}>
            THE FUTURE
          </div>
          <div style={{
            fontSize: 96, fontWeight: 400, color: '#ffffff',
            letterSpacing: -2, lineHeight: 1, display: 'flex',
            fontFamily: 'Georgia, serif',
          }}>
            IS
          </div>
          <div style={{
            fontSize: 96, fontWeight: 400, color: 'rgba(192,192,192,0.45)',
            letterSpacing: -2, lineHeight: 1, display: 'flex',
            fontFamily: 'Georgia, serif',
          }}>
            TRADEABLE.
          </div>
        </div>

        {/* Divider */}
        <div style={{
          position: 'absolute', bottom: 120, left: 68,
          width: 160, height: 0.5,
          background: 'rgba(255,255,255,0.1)',
          display: 'flex',
        }} />

        {/* Stats */}
        <div style={{
          position: 'absolute', bottom: 60, left: 68,
          display: 'flex', gap: 48,
        }}>
          {[
            { n: '$2.4B+', l: 'UNDER MANAGEMENT' },
            { n: '4,200+', l: 'ACTIVE MEMBERS' },
            { n: '98.4%', l: 'PAYOUT RATE' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ fontSize: 24, color: '#ffffff', letterSpacing: -0.5, display: 'flex' }}>
                {s.n}
              </div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.22)', letterSpacing: 3, display: 'flex' }}>
                {s.l}
              </div>
            </div>
          ))}
        </div>

        {/* Ticker bar */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 36, background: 'rgba(255,255,255,0.02)',
          borderTop: '0.5px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', paddingLeft: 40, gap: 48,
        }}>
          {[
            'SPCE  $160.00  ▲ +33.3%',
            'TSLA  $248.71  ▲ +3.72%',
            'BTC  $67,420  ▲ +1.86%',
            'NVDA  $1,087  ▼ -1.40%',
            'XAI  $94.20  ▲ +8.30%',
          ].map((t, i) => (
            <div key={i} style={{
              fontSize: 11, color: i === 0 ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)',
              letterSpacing: 1.5, display: 'flex',
            }}>
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}