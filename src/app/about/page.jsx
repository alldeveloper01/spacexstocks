import Link from 'next/link'

export const metadata = {
  title: 'About — SpaceX Stocks',
  description: 'SpaceX Stocks is a private investment platform giving members managed exposure to SpaceX, Tesla, Starlink, and X Corp. Weekly returns, exclusive perks, invitation only.'
}

const S = `
  *{margin:0;padding:0;box-sizing:border-box}
  html{scroll-behavior:smooth}
  body{background:#000;color:#fff;font-family:'Courier New',monospace;overflow-x:hidden}

  .nav{position:sticky;top:0;z-index:100;background:rgba(0,0,0,.96);border-bottom:1px solid rgba(255,255,255,.06);padding:18px 40px;display:flex;align-items:center;justify-content:space-between;backdrop-filter:blur(20px)}
  .nav-logo{font-size:10px;letter-spacing:.45em;color:#fff;text-transform:uppercase;text-decoration:none}
  .nav-logo span{display:block;font-size:7px;letter-spacing:.28em;color:rgba(255,255,255,.2);margin-top:2px}
  .nav-back{font-size:8px;letter-spacing:.28em;color:rgba(255,255,255,.3);text-transform:uppercase;text-decoration:none;transition:color .3s}
  .nav-back:hover{color:#fff}

  .hero{padding:100px 60px 80px;max-width:1100px;margin:0 auto;opacity:0;animation:fadeUp .9s ease forwards}
  .eyebrow{font-size:7px;letter-spacing:.5em;color:rgba(255,255,255,.25);text-transform:uppercase;margin-bottom:20px;display:flex;align-items:center;gap:14px}
  .eyebrow::before{content:'';width:28px;height:1px;background:rgba(255,255,255,.25);flex-shrink:0}
  h1{font-size:clamp(36px,7vw,80px);font-weight:400;letter-spacing:-.01em;line-height:1.02;margin-bottom:24px}
  h1 em{color:rgba(255,255,255,.25);font-style:normal}
  .lead{font-size:14px;letter-spacing:.04em;line-height:2.2;color:rgba(255,255,255,.4);max-width:620px}

  .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:rgba(255,255,255,.05);margin:80px 60px 0;max-width:1100px;opacity:0;animation:fadeUp .8s .2s ease forwards}
  .stat{background:#000;padding:40px 32px;text-align:center}
  .stat-n{font-size:48px;font-weight:400;letter-spacing:-.02em;color:#fff;display:block;margin-bottom:8px}
  .stat-l{font-size:7px;letter-spacing:.38em;color:rgba(255,255,255,.2);text-transform:uppercase}

  .section{padding:80px 60px;max-width:1100px;margin:0 auto}
  .section-eyebrow{font-size:7px;letter-spacing:.5em;color:rgba(255,255,255,.25);text-transform:uppercase;margin-bottom:16px;display:flex;align-items:center;gap:14px}
  .section-eyebrow::before{content:'';width:28px;height:1px;background:rgba(255,255,255,.25);flex-shrink:0}
  h2{font-size:clamp(24px,4vw,44px);font-weight:400;letter-spacing:-.01em;margin-bottom:28px;line-height:1.1}
  h2 em{color:rgba(255,255,255,.25);font-style:normal}
  p{font-size:13px;letter-spacing:.03em;line-height:2.2;color:rgba(255,255,255,.4);margin-bottom:16px}
  p strong{color:rgba(255,255,255,.7)}

  .story-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}

  .values{background:rgba(255,255,255,.02);border-top:1px solid rgba(255,255,255,.05);border-bottom:1px solid rgba(255,255,255,.05)}
  .values-inner{padding:80px 60px;max-width:1100px;margin:0 auto}
  .values-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:rgba(255,255,255,.04);margin-top:48px}
  .value-card{background:#000;padding:32px 28px;position:relative;overflow:hidden;transition:background .3s}
  .value-card::after{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent);transform:scaleX(0);transition:transform .5s}
  .value-card:hover::after{transform:scaleX(1)}
  .value-card:hover{background:rgba(255,255,255,.015)}
  .value-n{font-size:7px;letter-spacing:.42em;color:rgba(255,255,255,.15);margin-bottom:14px;text-transform:uppercase}
  .value-t{font-size:13px;letter-spacing:.06em;color:rgba(255,255,255,.8);margin-bottom:10px}
  .value-b{font-size:11px;letter-spacing:.03em;line-height:2;color:rgba(255,255,255,.3)}

  .timeline{margin-top:48px}
  .timeline-item{display:flex;gap:32px;margin-bottom:40px;opacity:0;animation:fadeUp .6s ease forwards}
  .tl-year{font-size:28px;font-weight:400;letter-spacing:-.02em;color:rgba(255,255,255,.2);flex-shrink:0;width:80px;padding-top:4px}
  .tl-content{border-left:1px solid rgba(255,255,255,.06);padding-left:28px;padding-bottom:28px}
  .tl-title{font-size:8px;letter-spacing:.38em;color:rgba(255,255,255,.5);text-transform:uppercase;margin-bottom:8px}
  .tl-desc{font-size:12px;letter-spacing:.03em;line-height:2;color:rgba(255,255,255,.3);margin:0}

  .cta-block{margin:0 60px 80px;border:1px solid rgba(255,255,255,.08);padding:60px;text-align:center;position:relative;overflow:hidden}
  .cta-block::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 60% 80% at 50% 50%,rgba(255,255,255,.03) 0%,transparent 70%)}
  .cta-h{font-size:clamp(28px,4vw,48px);font-weight:400;letter-spacing:-.01em;margin-bottom:14px}
  .cta-h em{color:rgba(255,255,255,.25);font-style:normal}
  .cta-sub{font-size:9px;letter-spacing:.28em;color:rgba(255,255,255,.25);text-transform:uppercase;margin-bottom:36px}
  .cta-btn{display:inline-block;background:#fff;color:#000;padding:14px 36px;font-family:'Courier New',monospace;font-size:9px;letter-spacing:.38em;text-transform:uppercase;text-decoration:none;font-weight:700;transition:opacity .3s}
  .cta-btn:hover{opacity:.85}

  .footer{max-width:1100px;margin:0 auto;padding:32px 60px;border-top:1px solid rgba(255,255,255,.05);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
  .footer-copy{font-size:7px;letter-spacing:.2em;color:rgba(255,255,255,.15);text-transform:uppercase}
  .footer-links{display:flex;gap:20px}
  .footer-links a{font-size:7px;letter-spacing:.2em;color:rgba(255,255,255,.2);text-transform:uppercase;text-decoration:none;transition:color .3s}
  .footer-links a:hover{color:rgba(255,255,255,.5)}

  @keyframes fadeUp{to{opacity:1;transform:translateY(0)}}
  .timeline-item:nth-child(1){animation-delay:.1s}
  .timeline-item:nth-child(2){animation-delay:.2s}
  .timeline-item:nth-child(3){animation-delay:.3s}
  .timeline-item:nth-child(4){animation-delay:.4s}
  .timeline-item:nth-child(5){animation-delay:.5s}

  @media(max-width:900px){
  .nav{padding:14px 20px}
  .hero{padding:60px 20px 48px;max-width:100%}
  .section{padding:52px 20px}
  .story-grid{grid-template-columns:1fr;gap:0}
  .values-inner{padding:52px 20px}
  .values-grid{grid-template-columns:1fr}
  .cta-block{margin:0 20px 60px;padding:40px 20px}
  .footer{padding:24px 20px}
  .timeline-item{gap:16px}
  .tl-year{width:60px;font-size:22px}
  .stats-outer{padding:0 20px!important}
  .stats-grid{grid-template-columns:1fr!important}
}
`

export default function AboutPage() {
  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>
      <style>{S}</style>

      <nav className="nav">
        <Link href="/" className="nav-logo">
          SpaceX Stocks
          <span>spacestocks.finance</span>
        </Link>
        <Link href="/" className="nav-back">← Back to Home</Link>
      </nav>

      <div className="hero">
        <div className="eyebrow">Private Investment · Est. 2025</div>
        <h1>The future belongs<br />to those who <em>invest in it</em></h1>
        <p className="lead">SpaceX Stocks is a private, invitation-only investment platform giving members managed exposure to the most consequential companies in human history — SpaceX, Tesla, Starlink, and X Corp. Weekly returns. Real perks. No noise.</p>
      </div>

      <div className="stats" style={{ margin: '80px auto 0', padding: '0 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1px', background: 'rgba(255,255,255,.05)' }} className="stats-grid">
          {[
            { n: '$2.4B+', l: 'Under Management' },
            { n: '4,200+', l: 'Active Members' },
            { n: '98.4%', l: 'Payout Rate' },
          ].map((s, i) => (
            <div key={i} style={{ background: '#000', padding: '40px 32px', textAlign: 'center' }}>
              <span style={{ fontSize: '48px', fontWeight: 400, letterSpacing: '-.02em', color: '#fff', display: 'block', marginBottom: '8px' }}>{s.n}</span>
              <span style={{ fontSize: '7px', letterSpacing: '.38em', color: 'rgba(255,255,255,.2)', textTransform: 'uppercase' }}>{s.l}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section-eyebrow">Our Mission</div>
        <h2>Built for those who<br />see <em>what others miss</em></h2>
        <div className="story-grid">
          <div>
            <p>SpaceX Stocks was built on a simple conviction: the companies Elon Musk is building will define the next century of human civilization. SpaceX dominates orbital launch. Starlink is becoming the backbone of global internet. Tesla is leading the electrification of transport. X Corp is reshaping information.</p>
            <p>These are not ordinary investments. These are stakes in the infrastructure of the future. And for too long, access to them has been reserved for institutional investors and the ultra-wealthy.</p>
          </div>
          <div>
            <p><strong>We changed that.</strong> SpaceX Stocks gives our members managed, weekly-return exposure to this portfolio — without the complexity, the minimums, or the gatekeeping of traditional finance.</p>
            <p>Our team trades on your behalf. You deposit once, watch your balance grow weekly, and withdraw on your terms. No trading knowledge required. No waiting months for results. Just clear, consistent returns from the most exciting portfolio in the world.</p>
          </div>
        </div>
      </div>

      <div className="values">
        <div className="values-inner">
          <div className="section-eyebrow">Why Members Choose Us</div>
          <h2>Six reasons this<br /><em>platform is different</em></h2>
          <div className="values-grid">
            {[
              { n: '01', t: 'We Trade, You Earn', b: "You don't need to understand stock markets. Our expert team handles every trade. You deposit, we trade, you receive weekly returns. Simple." },
              { n: '02', t: 'Tied To SpaceX', b: 'Your returns are tied to the most watched company on earth right now. SpaceX went public at $160 — and this is just the beginning.' },
              { n: '03', t: 'Weekly Payouts', b: 'Returns are credited to your withdrawal balance every single week. No quarterly wait. No lockup periods. You see results from week one.' },
              { n: '04', t: 'Crypto In, Crypto Out', b: 'Deposit and withdraw in crypto. Fast, borderless, and available to anyone with an internet connection. No banks. No delays.' },
              { n: '05', t: 'Invitation Only', b: 'Access is controlled. Every member entered through a personal invite code. This keeps our community exclusive and our platform focused on serious investors.' },
              { n: '06', t: 'Real-World Perks', b: 'Higher tiers unlock tangible benefits — Starlink internet, Tesla self-driving, X Blue, launch event invites. Returns are just the beginning.' },
            ].map((v, i) => (
              <div key={i} className="value-card">
                <div className="value-n">{v.n}</div>
                <div className="value-t">{v.t}</div>
                <div className="value-b">{v.b}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-eyebrow">Our Journey</div>
        <h2>How we got <em>here</em></h2>
        <div className="timeline">
          {[
            { year: '2024', title: 'The Idea', desc: "SpaceX's IPO filing confirmed what we already knew: this was the most important company of the decade. We started building a platform to give everyday investors managed access." },
            { year: '2025', title: 'Platform Launch', desc: 'SpaceX Stocks launched as an invitation-only platform. First 100 members onboarded. First weekly returns processed on schedule. Zero payment delays.' },
            { year: '2025', title: 'SpaceX Goes Public', desc: 'SPCE opens at $160. Our members had already been positioned. First-mover advantage validated. Weekly return cadence proven across hundreds of active plans.' },
            { year: '2026', title: '$2.4B Under Management', desc: 'Platform scaled to 4,200+ members across 60+ countries. Payout rate maintained at 98.4%. Perks program launched — Starlink, Tesla, X Premium all live.' },
            { year: '2026', title: 'What\'s Next', desc: 'Expanding plan tiers, launching SpaceX news intelligence feed, and opening limited referral slots for existing members to grow the community.' },
          ].map((t, i) => (
            <div key={i} className="timeline-item" style={{ opacity: 0, transform: 'translateY(16px)' }}>
              <div className="tl-year">{t.year}</div>
              <div className="tl-content">
                <div className="tl-title">{t.title}</div>
                <p className="tl-desc">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="cta-block">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="cta-h">Ready to invest in<br /><em>the future</em>?</div>
          <div className="cta-sub">Invitation required · Weekly returns · Crypto in, crypto out</div>
          <Link href="/login" className="cta-btn">Member Login →</Link>
        </div>
      </div>

      <div className="footer">
        <div className="footer-copy">© 2026 SpaceX Stocks · spacestocks.finance</div>
        <div className="footer-links">
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/aml">AML</Link>
          <Link href="/risk">Risk</Link>
        </div>
      </div>
    </div>
  )
}