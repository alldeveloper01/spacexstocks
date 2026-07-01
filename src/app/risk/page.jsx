import Link from 'next/link'

export const metadata = {
  title: 'Risk Disclosure — SpaceX Stocks',
  description: 'SpaceX Stocks Risk Disclosure Statement. Understanding the risks associated with our private investment platform before you invest.'
}

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
  .date{font-size:7px;letter-spacing:.38em;color:rgba(255,255,255,.18);text-transform:uppercase;margin-top:14px}
  .body{max-width:860px;margin:0 auto;padding:0 40px 80px}
  .highlight{background:rgba(255,255,255,.03);border-left:2px solid rgba(192,192,192,.3);padding:20px 24px;margin:24px 0}
  .warning{background:rgba(255,80,80,.04);border-left:2px solid rgba(255,80,80,.35);padding:20px 24px;margin:24px 0}
  .highlight p,.warning p{font-size:12px;letter-spacing:.03em;line-height:2;color:rgba(255,255,255,.4);margin:0}
  .warning p{color:rgba(255,80,80,.65)}
  .section{margin-bottom:52px;opacity:0;animation:fadeUp .7s ease forwards}
  .section:nth-child(1){animation-delay:.05s}.section:nth-child(2){animation-delay:.1s}.section:nth-child(3){animation-delay:.15s}.section:nth-child(4){animation-delay:.2s}.section:nth-child(5){animation-delay:.25s}.section:nth-child(6){animation-delay:.3s}.section:nth-child(7){animation-delay:.35s}.section:nth-child(8){animation-delay:.4s}
  h2{font-size:clamp(16px,2.5vw,22px);font-weight:400;letter-spacing:-.01em;margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,.05);color:#fff}
  h3{font-size:7px;letter-spacing:.4em;color:rgba(192,192,192,.5);text-transform:uppercase;margin:20px 0 10px}
  p{font-size:12px;letter-spacing:.03em;line-height:2.1;color:rgba(255,255,255,.4);margin-bottom:12px}
  ul{list-style:none;padding:0;margin-bottom:12px}
  li{font-size:12px;letter-spacing:.03em;line-height:2.1;color:rgba(255,255,255,.38);padding:3px 0 3px 18px;position:relative}
  li::before{content:'—';position:absolute;left:0;color:rgba(255,255,255,.15)}
  li strong{color:rgba(255,255,255,.65)}
  .footer{max-width:860px;margin:0 auto;padding:28px 40px 52px;border-top:1px solid rgba(255,255,255,.05);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
  .footer-copy{font-size:7px;letter-spacing:.2em;color:rgba(255,255,255,.15);text-transform:uppercase}
  .footer-links{display:flex;gap:18px}
  .footer-links a{font-size:7px;letter-spacing:.2em;color:rgba(255,255,255,.2);text-transform:uppercase;text-decoration:none;transition:color .3s}
  .footer-links a:hover{color:rgba(255,255,255,.5)}
  @keyframes fadeUp{to{opacity:1;transform:translateY(0)}}
  @media(max-width:768px){.nav{padding:14px 20px}.hero{padding:52px 20px 36px}.body{padding:0 20px 60px}.footer{padding:20px 20px 40px}}
`

export default function RiskPage() {
  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>
      <style>{S}</style>

      <nav className="nav">
        <Link href="/" className="nav-logo">SpaceX Stocks<span>spacestocks.finance</span></Link>
        <Link href="/" className="nav-back">← Back to Home</Link>
      </nav>

      <div className="hero">
        <div className="eyebrow">Legal · Risk Statement</div>
        <h1>Risk Disclosure</h1>
        <div className="date">Effective January 1, 2026 · Last Updated July 2026</div>
      </div>

      <div className="body">
        <div className="warning">
          <p>WARNING: Investment activities involve substantial risk of loss. You may lose some or all of your invested capital. Only invest funds you can afford to lose. Past performance is not indicative of future results. Weekly return amounts shown on investment plans are targets, not guarantees.</p>
        </div>

        <div className="section">
          <h2>1. General Investment Risks</h2>
          <p>Before using SpaceX Stocks' investment services, you must carefully consider whether such activities are appropriate for you in light of your financial circumstances, investment objectives, level of experience, and risk tolerance. SpaceX Stocks strongly recommends that you seek independent financial, legal, and tax advice before making any investment decisions.</p>
          <div className="highlight">
            <p>All investments carry risk. The value of investments can go down as well as up. You should never invest money that you cannot afford to lose entirely. SpaceX Stocks does not provide personalised financial advice. The returns shown on our investment plans are target amounts based on our current trading performance and market conditions, not contractual guarantees.</p>
          </div>
        </div>

        <div className="section">
          <h2>2. Cryptocurrency and Digital Asset Risks</h2>
          <h3>2.1 Market Volatility</h3>
          <p>Cryptocurrency markets are highly volatile and unpredictable. Digital asset prices can fluctuate dramatically within short periods, resulting in significant gains or losses. The cryptocurrency market operates 24 hours a day, 7 days a week, and prices can change substantially at any time. All deposits and withdrawals on our platform are processed in cryptocurrency, meaning the fiat value of your transactions may differ from expected amounts.</p>
          <h3>2.2 Regulatory Risk</h3>
          <p>The regulatory landscape for cryptocurrencies and digital assets is evolving rapidly and varies significantly across jurisdictions. Changes in laws, regulations, or government policies could adversely affect the value of digital assets and our ability to operate in certain markets. You are responsible for understanding and complying with all regulations applicable to cryptocurrency in your jurisdiction.</p>
          <h3>2.3 Technology Risk</h3>
          <p>Blockchain technology and cryptocurrency networks are subject to technical risks including software bugs, protocol vulnerabilities, network attacks, and unforeseen technical failures. Network congestion may delay the processing of deposits and withdrawals. Transactions once confirmed on the blockchain are irreversible.</p>
          <h3>2.4 Irreversibility of Transactions</h3>
          <p>Cryptocurrency transactions are irreversible once confirmed. Sending cryptocurrency to an incorrect wallet address will result in permanent loss of funds. SpaceX Stocks is not responsible for funds sent to incorrect addresses provided by users during the withdrawal process.</p>
        </div>

        <div className="section">
          <h2>3. Platform-Specific Risks</h2>
          <h3>3.1 Investment Plan Risks</h3>
          <p>While our structured investment plans display weekly return amounts and total return projections, these figures represent targets based on our current trading performance. Actual returns may be lower or higher. Market disruptions, extreme volatility, regulatory changes, or other unforeseen circumstances may affect plan performance. Investment capital is not accessible during an active plan period.</p>
          <h3>3.2 Withdrawal Risks</h3>
          <p>Withdrawal requests are subject to manual review and approval. Processing times may vary and are typically completed within 24 hours. Accounts with withdrawal balances of $5,000 or more must complete KYC verification before withdrawal approval. In cases of suspected fraud or compliance review, withdrawals may be delayed or suspended pending investigation.</p>
          <h3>3.3 KYC Verification Risks</h3>
          <p>Failure to complete identity verification when required may result in inability to withdraw funds. KYC verification fees, where applicable, must be paid before processing can proceed. Providing false or fraudulent documents during KYC verification will result in account termination and may be reported to relevant authorities.</p>
        </div>

        <div className="section">
          <h2>4. Operational Risks</h2>
          <h3>4.1 Platform Availability</h3>
          <p>Our platform may experience downtime due to scheduled maintenance, technical failures, cyberattacks, or other unforeseen circumstances. During such periods, you may be unable to access your account, view balances, or submit withdrawal requests. SpaceX Stocks is not liable for losses incurred during periods of platform unavailability.</p>
          <h3>4.2 Cybersecurity Risks</h3>
          <p>Despite our security measures, no online platform is completely immune to cybersecurity threats. Hacking attempts, phishing attacks, and malware could potentially compromise account security. We strongly recommend using a unique, strong password for your registered email account and enabling two-factor authentication on your email provider. SpaceX Stocks will never ask for your OTP via email, phone, or chat.</p>
          <h3>4.3 Third-Party Service Risks</h3>
          <p>Our platform relies on third-party service providers including OxaPay (payments), Supabase (database), Resend (email), and Vercel (hosting). Service disruptions, security incidents, or failures at these third-party providers could affect our platform's functionality and your ability to access services or complete transactions.</p>
        </div>

        <div className="section">
          <h2>5. Financial Risks</h2>
          <h3>5.1 Capital Loss Risk</h3>
          <p>There is a risk that you may lose all or a significant portion of your invested capital. Weekly return targets are not guaranteed. You should only deposit funds that you can afford to lose without materially affecting your financial stability or lifestyle. Do not invest borrowed money, emergency funds, or money required for essential living expenses.</p>
          <h3>5.2 Currency and Exchange Rate Risk</h3>
          <p>All account balances are denominated in USD. Cryptocurrency exchange rates fluctuate constantly, meaning the actual fiat value received in your local currency may differ from expected amounts at the time of deposit or withdrawal. Exchange rate movements can materially affect the real-world value of your returns when converted to fiat currency.</p>
          <h3>5.3 No Regulatory Protection</h3>
          <p>SpaceX Stocks is a private investment platform. Investments made on our platform are not covered by government-backed investor compensation schemes such as FSCS (UK), SIPC (US), or equivalent protections in other jurisdictions. Your capital is not protected by these schemes.</p>
        </div>

        <div className="section">
          <h2>6. Legal and Tax Risks</h2>
          <p>Investment returns and cryptocurrency transactions may have tax implications depending on your jurisdiction. You are solely responsible for understanding and complying with all applicable tax laws and regulations in your country of residence. We recommend consulting a qualified tax advisor regarding the tax treatment of your investment activities and cryptocurrency transactions.</p>
          <p>The availability of our services may be restricted in certain jurisdictions. It is your sole responsibility to ensure that your use of our platform complies with all applicable laws and regulations where you are located. We reserve the right to restrict or terminate access to our services in jurisdictions where we determine it is necessary to comply with local laws.</p>
        </div>

        <div className="section">
          <h2>7. Non-Affiliation Disclosure</h2>
          <p>SpaceX Stocks is a private investment platform and is not affiliated with, endorsed by, sponsored by, or connected to Space Exploration Technologies Corp. (SpaceX), Tesla Inc., X Corp., Starlink, or any company associated with Elon Musk. The use of these company names refers to publicly traded or discussed securities and companies in which our managed portfolio may have exposure. Any trademarks referenced belong to their respective owners.</p>
        </div>

        <div className="section">
          <h2>8. Acknowledgment of Risk</h2>
          <div className="warning">
            <p>By using SpaceX Stocks' services, you acknowledge that: (1) You have read and understood this Risk Disclosure Statement in full; (2) You understand that all investments carry risk and that you may lose your entire invested capital; (3) You are making investment decisions based on your own independent judgment; (4) You are not relying on any representations made by SpaceX Stocks regarding guaranteed investment returns; (5) You have sought independent financial advice where appropriate for your circumstances.</p>
          </div>
        </div>

        <div className="section">
          <h2>9. Contact Us</h2>
          <p>If you have questions about the risks associated with our services, please contact us before investing:</p>
          <ul>
            <li>Email: invest@spacestocks.finance</li>
            <li>Support: support@spacestocks.finance</li>
            <li>Website: spacestocks.finance</li>
          </ul>
        </div>
      </div>

      <div className="footer">
        <div className="footer-copy">© 2026 SpaceX Stocks · spacestocks.finance</div>
        <div className="footer-links">
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/aml">AML</Link>
          <Link href="/">Home</Link>
        </div>
      </div>
    </div>
  )
}