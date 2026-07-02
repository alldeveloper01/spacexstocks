import { supabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'

export async function generateMetadata({ params }) {
  return {
    title: 'Verified Member — SpaceX Stocks',
    description: 'This QR code belongs to a verified SpaceX Stocks member. Private investment access. Weekly returns. Invitation only.',
    openGraph: {
      title: 'Verified SpaceX Stocks Member',
      description: 'Private investment platform. Weekly returns. Invitation only.',
      images: ['https://www.spacestocks.finance/spacex_stocks_og_image.jpg'],
    }
  }
}

export default async function MemberVerifyPage({ params }) {
  const { id } = params

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('member_number, member_since, full_name')
    .eq('member_number', id)
    .single()

  const S = `
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{background:#000;color:#fff;font-family:'Courier New',monospace;min-height:100vh;overflow-x:hidden}

    .stars{position:fixed;inset:0;z-index:0;pointer-events:none}
    .content{position:relative;z-index:1;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 24px}

    .badge{display:inline-flex;align-items:center;gap:10px;border:1px solid rgba(192,192,192,0.2);padding:10px 20px;margin-bottom:32px;background:rgba(192,192,192,0.04)}
    .badge-dot{width:6px;height:6px;border-radius:50%;background:#C0C0C0;animation:pulse 2s ease-in-out infinite}
    .badge-text{font-size:8px;letter-spacing:.4em;color:rgba(192,192,192,0.7);text-transform:uppercase}

    .verified-block{text-align:center;margin-bottom:48px;max-width:480px}
    .member-label{font-size:7px;letter-spacing:.5em;color:rgba(255,255,255,.2);text-transform:uppercase;margin-bottom:16px;display:flex;align-items:center;justify-content:center;gap:12px}
    .member-label::before,.member-label::after{content:'';flex:1;max-width:40px;height:1px;background:rgba(255,255,255,.12)}
    .member-number{font-size:clamp(28px,6vw,48px);letter-spacing:.1em;color:#C0C0C0;margin-bottom:8px;font-weight:400}
    .member-since{font-size:8px;letter-spacing:.3em;color:rgba(255,255,255,.2);text-transform:uppercase}

    .divider{width:1px;height:48px;background:linear-gradient(to bottom,transparent,rgba(255,255,255,.1),transparent);margin:0 auto 48px}

    .headline{font-size:clamp(32px,7vw,64px);font-weight:400;text-align:center;line-height:1.05;letter-spacing:-.01em;margin-bottom:16px}
    .headline em{color:rgba(255,255,255,.25);font-style:normal}
    .tagline{font-size:9px;letter-spacing:.4em;color:rgba(255,255,255,.2);text-transform:uppercase;text-align:center;margin-bottom:48px}

    .stats{display:flex;justify-content:center;gap:0;margin-bottom:48px;border:1px solid rgba(255,255,255,.06);max-width:480px;width:100%}
    .stat{flex:1;padding:20px 16px;text-align:center;border-right:1px solid rgba(255,255,255,.06)}
    .stat:last-child{border-right:none}
    .stat-n{font-size:clamp(16px,3vw,22px);color:#fff;display:block;margin-bottom:4px;letter-spacing:-.02em}
    .stat-l{font-size:6px;letter-spacing:.3em;color:rgba(255,255,255,.18);text-transform:uppercase}

    .pitch{max-width:480px;width:100%;margin-bottom:40px}
    .pitch-item{display:flex;gap:14px;margin-bottom:14px;padding:14px 16px;border:1px solid rgba(255,255,255,.04);background:rgba(255,255,255,.01)}
    .pitch-icon{font-size:16px;flex-shrink:0;opacity:.7}
    .pitch-text{font-size:10px;color:rgba(255,255,255,.4);line-height:1.9;letter-spacing:.03em}
    .pitch-text strong{color:rgba(255,255,255,.7)}

    .cta-block{text-align:center;max-width:480px;width:100%}
    .cta-sub{font-size:8px;letter-spacing:.35em;color:rgba(255,255,255,.18);text-transform:uppercase;margin-bottom:20px}
    .cta-btn{display:inline-block;background:#fff;color:#000;padding:14px 40px;font-family:'Courier New',monospace;font-size:9px;letter-spacing:.38em;text-transform:uppercase;text-decoration:none;font-weight:700;margin-bottom:12px}
    .cta-note{font-size:7px;letter-spacing:.2em;color:rgba(255,255,255,.12);text-transform:uppercase}

    .footer-logo{margin-top:52px;text-align:center}
    .footer-logo-main{font-size:9px;letter-spacing:.5em;color:rgba(255,255,255,.2);text-transform:uppercase}
    .footer-logo-sub{font-size:7px;letter-spacing:.3em;color:rgba(255,255,255,.1);text-transform:uppercase;margin-top:4px}

    @keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}

    @media(max-width:480px){
      .stats{flex-direction:column}
      .stat{border-right:none;border-bottom:1px solid rgba(255,255,255,.06)}
      .stat:last-child{border-bottom:none}
    }
  `

  const memberSince = user?.member_since
    ? new Date(user.member_since).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Early 2025'

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1.0" />
        <title>Verified Member — SpaceX Stocks</title>
        <style>{S}</style>
      </head>
      <body>
        {/* Starfield canvas */}
        <canvas className="stars" id="stars" />

        <div className="content">
          {/* Live badge */}
          <div className="badge">
            <div className="badge-dot" />
            <div className="badge-text">Verified SpaceX Stocks Member</div>
          </div>

          {/* Member number */}
          <div className="verified-block">
            <div className="member-label">Member Identity</div>
            <div className="member-number">{user?.member_number || id}</div>
            <div className="member-since">Active since {memberSince}</div>
          </div>

          <div className="divider" />

          {/* Headline */}
          <div className="headline">The future<br/>is <em>tradeable.</em></div>
          <div className="tagline">SpaceX · Tesla · Starlink · X Corp</div>

          {/* Stats */}
          <div className="stats">
            {[
              { n: '$2.4B+', l: 'Under Management' },
              { n: '4,200+', l: 'Active Members' },
              { n: '98.4%', l: 'Payout Rate' },
            ].map((s, i) => (
              <div key={i} className="stat">
                <span className="stat-n">{s.n}</span>
                <span className="stat-l">{s.l}</span>
              </div>
            ))}
          </div>

          {/* Pitch points */}
          <div className="pitch">
            {[
              { icon: '◈', text: <><strong>We trade, you earn.</strong> Our expert team manages every position. You deposit once, receive weekly returns, and withdraw on your terms.</> },
              { icon: '🚀', text: <><strong>Tied to the most watched company on earth.</strong> SpaceX went public at $160. Your returns move with the momentum of the decade's defining company.</> },
              { icon: '★', text: <><strong>More than returns.</strong> Higher plan tiers unlock Starlink internet, Tesla self-driving, X Premium, SpaceX launch event invites, and more — real-world perks, not promises.</> },
              { icon: '⬡', text: <><strong>Invitation only.</strong> Every member entered through a personal invite code. Access is controlled. The community is intentional.</> },
            ].map((p, i) => (
              <div key={i} className="pitch-item">
                <span className="pitch-icon">{p.icon}</span>
                <div className="pitch-text">{p.text}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="cta-block">
            <div className="cta-sub">Ready to join the mission?</div>
            <a href="/#request-access" className="cta-btn">Request Access →</a>
            <div className="cta-note">Invitation code required · Weekly returns · Crypto in, crypto out</div>
          </div>

          {/* Footer logo */}
          <div className="footer-logo">
            <div className="footer-logo-main">SpaceX Stocks</div>
            <div className="footer-logo-sub">spacestocks.finance</div>
          </div>
        </div>

        <script dangerouslySetInnerHTML={{ __html: `
          var cv=document.getElementById('stars'),ctx=cv.getContext('2d');
          function resize(){cv.width=window.innerWidth;cv.height=window.innerHeight;}
          resize();window.addEventListener('resize',resize);
          var stars=Array.from({length:120},function(){return{x:Math.random(),y:Math.random(),r:Math.random()*0.8+0.2,o:Math.random()*0.5+0.1};});
          function draw(){
            ctx.clearRect(0,0,cv.width,cv.height);
            stars.forEach(function(s){
              ctx.beginPath();ctx.arc(s.x*cv.width,s.y*cv.height,s.r,0,Math.PI*2);
              ctx.fillStyle='rgba(255,255,255,'+s.o+')';ctx.fill();
            });
          }
          draw();
        `}} />
      </body>
    </html>
  )
}