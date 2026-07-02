'use client'
import Link from 'next/link'

const FAQS = [
  {
    category: 'About SpaceX Stocks',
    items: [
      {
        q: 'What is SpaceX Stocks?',
        a: 'SpaceX Stocks is a private, invitation-only investment platform that gives members managed exposure to SpaceX (SPCX), Tesla, Starlink, and X Corp. Our expert trading team manages all positions on your behalf. You deposit, we trade, you receive weekly returns.'
      },
      {
        q: 'Is SpaceX Stocks affiliated with SpaceX or Elon Musk?',
        a: 'No. SpaceX Stocks is an independent private investment platform. We are not affiliated with, endorsed by, or connected to Space Exploration Technologies Corp. (SpaceX), Tesla Inc., X Corp., Starlink, or Elon Musk. We provide managed investment exposure to publicly traded and discussed securities.'
      },
      {
        q: 'How is SpaceX Stocks different from buying shares directly?',
        a: 'Buying SPCX shares directly requires a brokerage account, market knowledge, and active management. SpaceX Stocks eliminates all of that. You deposit once, our team trades for you, and you receive weekly returns automatically. You also get access to exclusive member perks not available through any brokerage.'
      },
      {
        q: 'When did SpaceX go public?',
        a: 'SpaceX completed its IPO in 2025, with SPCX opening at $160 per share. SpaceX Stocks was built in anticipation of this event, positioning members ahead of the public listing.'
      },
    ]
  },
  {
    category: 'Getting Started',
    items: [
      {
        q: 'How do I join SpaceX Stocks?',
        a: 'SpaceX Stocks is invitation-only. You need a valid invitation code from an existing member or from our team to register. Once you have a code, go to spacestocks.finance, enter your code, and complete the registration process.'
      },
      {
        q: 'How do I get an invitation code?',
        a: 'Invitation codes are issued by existing members and by our team at our discretion. You can contact us at invest@spacestocks.finance to request access, or reach an existing member who can invite you.'
      },
      {
        q: 'Is there a minimum age to join?',
        a: 'You must be at least 18 years of age to create an account and use our services.'
      },
      {
        q: 'What countries can join?',
        a: 'SpaceX Stocks is available to members in most countries worldwide. We currently have members in over 60 countries. Some jurisdictions may be restricted due to local regulations. Contact us at invest@spacestocks.finance to confirm availability in your country.'
      },
    ]
  },
  {
    category: 'Deposits & Withdrawals',
    items: [
      {
        q: 'How do I deposit funds?',
        a: 'All deposits are made in cryptocurrency through our secure payment gateway powered by OxaPay. We accept BTC, ETH, USDT (TRC20 and ERC20), TRX, BNB, SOL, XRP, LTC, DOGE, USDC, and MATIC. Your deposit balance is credited automatically after blockchain confirmation.'
      },
      {
        q: 'What is the minimum deposit?',
        a: 'The minimum deposit varies and is set by our platform administrators. Check the deposit page in your dashboard for the current minimum. Investment plans start from $1,000.'
      },
      {
        q: 'How do I withdraw my returns?',
        a: 'Withdrawal requests are submitted from your dashboard. We support multiple cryptocurrencies for withdrawal including TRX, USDT, BTC, ETH, BNB, SOL, XRP, and LTC. Withdrawals are processed within 24 hours by our compliance team.'
      },
      {
        q: 'What is the difference between my deposit balance and withdrawal balance?',
        a: 'Your deposit balance holds funds available for investing. When you activate an investment plan, capital is deducted from your deposit balance. Your weekly returns are credited to your withdrawal balance, which is the balance you can withdraw to your crypto wallet.'
      },
      {
        q: 'Are there withdrawal fees?',
        a: 'SpaceX Stocks does not charge withdrawal fees. Standard blockchain network fees apply depending on the cryptocurrency and network you choose.'
      },
    ]
  },
  {
    category: 'Investment Plans & Returns',
    items: [
      {
        q: 'How do the investment plans work?',
        a: 'Each plan has a minimum investment amount, a weekly return amount, and a duration. When you activate a plan, your investment is deployed by our trading team. Every 7 days, your weekly return is credited to your withdrawal balance. At the end of the plan duration, you can reinvest or withdraw.'
      },
      {
        q: 'What investment plans are available?',
        a: 'We offer six tiers: Bronze ($1,000 min, $1,800/week, 21 days), Starter ($2,000 min, $2,100/week, 28 days), Growth ($5,000 min, $3,200/week, 42 days), Premium ($10,000 min, $5,500/week, 56 days), Elite ($20,000 min, $8,100/week, 120 days), and Platinum ($50,000 min, $16,000/week, 180 days).'
      },
      {
        q: 'Are returns guaranteed?',
        a: 'No. All investments carry risk and returns are not guaranteed. The weekly return amounts shown on our investment plans are targets based on our current trading performance and market conditions. Past performance is not indicative of future results. Please read our Risk Disclosure carefully before investing.'
      },
      {
        q: 'Can I have multiple active investment plans?',
        a: 'Yes. You can activate multiple investment plans simultaneously, provided you have sufficient balance in your account.'
      },
      {
        q: 'Can I top up or upgrade my plan?',
        a: 'Yes. From your dashboard, you can top up an active plan with additional funds to increase your weekly returns proportionally, or upgrade to the next tier plan to access higher returns and perks.'
      },
    ]
  },
  {
    category: 'Member Perks',
    items: [
      {
        q: 'What perks do members get?',
        a: 'Perks are unlocked based on your investment plan tier. Growth members receive 2 years of X Premium and Grok AI access. Premium members add Starlink internet, Tesla self-driving software, and X blue tick verification. Elite and Platinum members unlock additional years, launch event invitations, VIP SpaceX access, and Tesla discounts.'
      },
      {
        q: 'When do I receive my perks?',
        a: 'Perks are coordinated by our member services team after your investment plan is activated and verified. Contact invest@spacestocks.finance for perk delivery details specific to your tier.'
      },
    ]
  },
  {
    category: 'Security & Verification',
    items: [
      {
        q: 'Is my account secure?',
        a: 'Yes. We use JWT-based authentication with email OTP (one-time password) verification for every login. Your credentials are never stored in plain text. All data is transmitted over SSL/TLS encryption.'
      },
      {
        q: 'What is KYC and when is it required?',
        a: 'KYC (Know Your Customer) is an identity verification process. Our compliance team may request KYC verification based on account activity, transaction patterns, or other compliance criteria. You will be notified in your dashboard if verification is required.'
      },
      {
        q: 'Will SpaceX Stocks ever ask for my password or OTP?',
        a: 'Never. SpaceX Stocks will never ask for your OTP, password, or private keys via email, phone, or chat. If anyone claiming to be from SpaceX Stocks asks for this information, it is a scam.'
      },
    ]
  },
]

const S = `
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#000;color:#fff;font-family:'Courier New',monospace;overflow-x:hidden}
  .nav{position:sticky;top:0;z-index:100;background:rgba(0,0,0,.96);border-bottom:1px solid rgba(255,255,255,.06);padding:18px 40px;display:flex;align-items:center;justify-content:space-between;backdrop-filter:blur(20px)}
  .nav-logo{font-size:10px;letter-spacing:.45em;color:#fff;text-transform:uppercase;text-decoration:none}
  .nav-logo span{display:block;font-size:7px;letter-spacing:.28em;color:rgba(255,255,255,.2);margin-top:2px}
  .nav-back{font-size:8px;letter-spacing:.28em;color:rgba(255,255,255,.3);text-transform:uppercase;text-decoration:none;transition:color .3s}
  .nav-back:hover{color:#fff}
  .hero{padding:80px 40px 52px;max-width:860px;margin:0 auto;opacity:0;animation:fadeUp .8s ease forwards}
  .eyebrow{font-size:7px;letter-spacing:.5em;color:rgba(255,255,255,.25);text-transform:uppercase;margin-bottom:20px;display:flex;align-items:center;gap:14px}
  .eyebrow::before{content:'';width:28px;height:1px;background:rgba(255,255,255,.25);flex-shrink:0}
  h1{font-size:clamp(32px,6vw,60px);font-weight:400;letter-spacing:-.01em;margin-bottom:12px}
  h1 em{color:rgba(255,255,255,.25);font-style:normal}
  .hero-sub{font-size:13px;letter-spacing:.03em;line-height:2;color:rgba(255,255,255,.35);max-width:560px;margin-top:16px}
  .body{max-width:860px;margin:0 auto;padding:0 40px 80px}
  .category{margin-bottom:52px;opacity:0;animation:fadeUp .7s ease forwards}
  .category:nth-child(1){animation-delay:.05s}.category:nth-child(2){animation-delay:.1s}.category:nth-child(3){animation-delay:.15s}.category:nth-child(4){animation-delay:.2s}.category:nth-child(5){animation-delay:.25s}.category:nth-child(6){animation-delay:.3s}
  .cat-label{font-size:7px;letter-spacing:.45em;color:rgba(255,255,255,.2);text-transform:uppercase;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,.05)}
  .faq-item{border-bottom:1px solid rgba(255,255,255,.04);padding:20px 0}
  .faq-q{font-size:13px;letter-spacing:.03em;color:rgba(255,255,255,.8);margin-bottom:10px;line-height:1.6;cursor:pointer;display:flex;justify-content:space-between;align-items:flex-start;gap:16px}
  .faq-q span{color:rgba(255,255,255,.2);font-size:16px;flex-shrink:0;margin-top:2px}
  .faq-a{font-size:12px;letter-spacing:.03em;line-height:2.1;color:rgba(255,255,255,.38);display:none}
  .faq-item.open .faq-a{display:block}
  .faq-item.open .faq-q span{transform:rotate(45deg)}
  .faq-q span{transition:transform .2s;display:inline-block}
  .cta-block{margin-top:52px;border:1px solid rgba(255,255,255,.06);padding:40px;text-align:center}
  .cta-h{font-size:clamp(20px,3vw,32px);font-weight:400;margin-bottom:8px}
  .cta-sub{font-size:8px;letter-spacing:.3em;color:rgba(255,255,255,.2);text-transform:uppercase;margin-bottom:24px}
  .cta-btn{display:inline-block;background:#fff;color:#000;padding:13px 36px;font-family:'Courier New',monospace;font-size:9px;letter-spacing:.38em;text-transform:uppercase;text-decoration:none;font-weight:700}
  .footer{max-width:860px;margin:0 auto;padding:28px 40px 52px;border-top:1px solid rgba(255,255,255,.05);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
  .footer-copy{font-size:7px;letter-spacing:.2em;color:rgba(255,255,255,.15);text-transform:uppercase}
  .footer-links{display:flex;gap:18px}
  .footer-links a{font-size:7px;letter-spacing:.2em;color:rgba(255,255,255,.2);text-transform:uppercase;text-decoration:none;transition:color .3s}
  .footer-links a:hover{color:rgba(255,255,255,.5)}
  @keyframes fadeUp{to{opacity:1;transform:translateY(0)}}
  @media(max-width:768px){.nav{padding:14px 20px}.hero{padding:52px 20px 36px}.body{padding:0 20px 60px}.footer{padding:20px 20px 40px}.cta-block{padding:28px 20px}}
`

export default function FAQPage() {
  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>
      <style>{S}</style>

      <nav className="nav">
        <Link href="/" className="nav-logo">SpaceX Stocks<span>spacestocks.finance</span></Link>
        <a href="/" className="nav-back">← Back to Home</a>
      </nav>

      <div className="hero">
        <div className="eyebrow">Knowledge Base</div>
        <h1>Frequently Asked<br/><em>Questions</em></h1>
        <p className="hero-sub">Everything you need to know about investing through SpaceX Stocks — from how our plans work to deposits, withdrawals, perks, and security.</p>
      </div>

      <div className="body">
        {FAQS.map((cat, ci) => (
          <div key={ci} className="category">
            <div className="cat-label">{cat.category}</div>
            {cat.items.map((item, ii) => (
              <div key={ii} className="faq-item" id={`faq-${ci}-${ii}`}>
                <div className="faq-q" onClick={() => {
                  const el = document.getElementById(`faq-${ci}-${ii}`)
                  el?.classList.toggle('open')
                }}>
                  {item.q}
                  <span>+</span>
                </div>
                <div className="faq-a">{item.a}</div>
              </div>
            ))}
          </div>
        ))}

        <div className="cta-block">
          <div className="cta-h">Ready to join the mission?</div>
          <div className="cta-sub">Invitation required · Weekly returns · Crypto in, crypto out</div>
          <a href="/" className="cta-btn">Request Access →</a>
        </div>
      </div>

      <div className="footer">
        <div className="footer-copy">© 2026 SpaceX Stocks · spacestocks.finance</div>
        <div className="footer-links">
          <Link href="/about">About</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/risk">Risk</Link>
        </div>
      </div>
    </div>
  )
}