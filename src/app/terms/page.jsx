import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service — SpaceX Stocks',
  description: 'SpaceX Stocks Terms of Service. Read the terms and conditions governing your use of our private investment platform.'
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
  .section:nth-child(1){animation-delay:.05s}
  .section:nth-child(2){animation-delay:.1s}
  .section:nth-child(3){animation-delay:.15s}
  .section:nth-child(4){animation-delay:.2s}
  .section:nth-child(5){animation-delay:.25s}
  .section:nth-child(6){animation-delay:.3s}
  .section:nth-child(7){animation-delay:.35s}
  .section:nth-child(8){animation-delay:.4s}
  .section:nth-child(9){animation-delay:.45s}
  .section:nth-child(10){animation-delay:.5s}
  .section:nth-child(11){animation-delay:.55s}
  .section:nth-child(12){animation-delay:.6s}
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

export default function TermsPage() {
  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>
      <style>{S}</style>

      <nav className="nav">
        <Link href="/" className="nav-logo">SpaceX Stocks<span>spacestocks.finance</span></Link>
        <a href="/" className="nav-back">← Back to Home</a>
      </nav>

      <div className="hero">
        <div className="eyebrow">Legal · Platform Terms</div>
        <h1>Terms of Service</h1>
        <div className="date">Effective January 1, 2026 · Last Updated July 2026</div>
      </div>

      <div className="body">
        <div className="warning">
          <p>IMPORTANT: Please read these Terms of Service carefully before using the SpaceX Stocks platform. By accessing or using our services, you agree to be bound by these terms. If you do not agree, do not use our platform.</p>
        </div>

        <div className="section">
          <h2>1. Acceptance of Terms</h2>
          <p>These Terms of Service ("Terms") constitute a legally binding agreement between you ("User," "you," or "your") and SpaceX Stocks ("we," "us," or "our"), governing your access to and use of the SpaceX Stocks private investment platform, website, and all associated services (collectively, the "Services").</p>
          <p>By creating an account, accessing our platform, or using any of our services, you acknowledge that you have read, understood, and agree to be bound by these Terms, our Privacy Policy, Risk Disclosure, and AML Policy, all of which are incorporated herein by reference.</p>
        </div>

        <div className="section">
          <h2>2. Eligibility</h2>
          <p>To use our Services, you must meet all of the following requirements:</p>
          <ul>
            <li>Be at least 18 years of age or the legal age of majority in your jurisdiction</li>
            <li>Have the legal capacity to enter into binding contracts</li>
            <li>Not be a resident of a jurisdiction where our services are prohibited by law</li>
            <li>Not be subject to any sanctions, embargoes, or restrictions imposed by any government authority</li>
            <li>Have received a valid invitation code from an existing member or platform administrator</li>
            <li>Provide accurate, complete, and current information during registration</li>
            <li>Successfully complete our identity verification (KYC) process when required</li>
          </ul>
        </div>

        <div className="section">
          <h2>3. Account Registration and Security</h2>
          <h3>3.1 Account Creation</h3>
          <p>You must register for an account using a valid invitation code to access our investment services. You agree to provide accurate, truthful, and complete information and to keep your account information current. Each user may maintain only one account. Creating multiple accounts is prohibited and may result in immediate termination of all associated accounts.</p>
          <h3>3.2 Account Security</h3>
          <p>You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to immediately notify us of any unauthorized access or suspected breach of your account security. SpaceX Stocks will not be liable for any loss or damage arising from your failure to protect your account credentials.</p>
          <h3>3.3 OTP Authentication</h3>
          <p>Our platform employs email-based one-time password (OTP) authentication for all login attempts. You are required to maintain access to your registered email address. We strongly recommend keeping your email account secure and updating your registered email address promptly if it changes.</p>
        </div>

        <div className="section">
          <h2>4. Investment Services</h2>
          <h3>4.1 Investment Plans</h3>
          <p>SpaceX Stocks offers structured investment plans with defined terms, minimum investment amounts, weekly return amounts, and duration periods. By activating an investment plan, you acknowledge that:</p>
          <ul>
            <li>The minimum investment amount varies by plan tier, starting from $1,000</li>
            <li>Investment capital is deducted from your deposit balance upon plan activation</li>
            <li>Weekly returns are credited to your withdrawal balance throughout the plan duration</li>
            <li>Investment plans cannot be cancelled or modified once activated</li>
            <li>Returns are not guaranteed and are subject to market conditions</li>
          </ul>
          <h3>4.2 Member Perks</h3>
          <p>Higher investment plan tiers include real-world perks such as Starlink internet access, Tesla self-driving software, X Premium subscriptions, SpaceX launch event invitations, and more. These perks are provided as described in the relevant plan details at the time of investment. Perks are non-transferable and subject to availability and third-party terms.</p>
        </div>

        <div className="section">
          <h2>5. Deposits and Withdrawals</h2>
          <h3>5.1 Deposits</h3>
          <p>All deposits are processed exclusively through our cryptocurrency payment gateway (OxaPay). Minimum deposit amounts are subject to change at our discretion. Deposits are credited to your account following blockchain network confirmation. We are not responsible for delays caused by network congestion or blockchain processing times.</p>
          <h3>5.2 Withdrawals</h3>
          <p>Withdrawal requests are subject to manual review and approval by our compliance team within 24 hours. We reserve the right to request additional verification before processing withdrawal requests. Withdrawals require successful completion of our KYC verification process for accounts with withdrawal balances of $5,000 or more. All withdrawals are processed in TRX (TRON network).</p>
          <h3>5.3 Dual Balance System</h3>
          <p>Our platform maintains separate deposit and withdrawal balances. Deposited funds are credited to your deposit balance for investment activities. Weekly returns are credited to your withdrawal balance. Only funds in your withdrawal balance may be withdrawn from the platform.</p>
        </div>

        <div className="section">
          <h2>6. Prohibited Activities</h2>
          <p>You agree not to engage in any of the following prohibited activities:</p>
          <ul>
            <li>Money laundering, terrorist financing, or any illegal financial activities</li>
            <li>Using automated systems, bots, or scripts to access our platform</li>
            <li>Attempting to hack, probe, or test the vulnerability of our systems</li>
            <li>Creating multiple accounts or using false identities</li>
            <li>Sharing or selling invitation codes without authorisation</li>
            <li>Sharing account access with third parties</li>
            <li>Using our platform in any jurisdiction where it is prohibited by law</li>
            <li>Circumventing or attempting to circumvent our security or KYC measures</li>
          </ul>
        </div>

        <div className="section">
          <h2>7. Invitation Code Policy</h2>
          <p>Access to SpaceX Stocks is strictly invitation-only. Invitation codes are issued by the platform and by existing members at our discretion. Each code may only be used once. Codes are non-transferable and may not be sold. Misuse of invitation codes, including fraudulent distribution or use, will result in immediate account termination and forfeiture of any associated balances.</p>
        </div>

        <div className="section">
          <h2>8. Intellectual Property</h2>
          <p>All content on the SpaceX Stocks platform, including but not limited to text, graphics, logos, interface design, and code, is the exclusive property of SpaceX Stocks and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written consent. SpaceX Stocks is not affiliated with, endorsed by, or connected to Space Exploration Technologies Corp. (SpaceX) in any way.</p>
        </div>

        <div className="section">
          <h2>9. Disclaimers and Limitation of Liability</h2>
          <div className="warning">
            <p>THE SERVICES ARE PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, SPACEX STOCKS DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED. IN NO EVENT SHALL SPACEX STOCKS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING OUT OF YOUR USE OF OUR SERVICES.</p>
          </div>
          <p>SpaceX Stocks is not responsible for losses arising from market volatility, blockchain network delays, third-party service failures, or any circumstances beyond our reasonable control.</p>
        </div>

        <div className="section">
          <h2>10. Termination</h2>
          <p>SpaceX Stocks reserves the right to suspend or terminate your account at any time, with or without notice, for any violation of these Terms, suspicious activity, or for any other reason at our sole discretion. Upon termination, your right to access our platform ceases immediately. Any outstanding balances will be processed in accordance with our standard withdrawal procedures, subject to compliance requirements.</p>
        </div>

        <div className="section">
          <h2>11. Modifications to Terms</h2>
          <p>We reserve the right to modify these Terms at any time. We will provide notice of material changes by posting updated Terms on our platform and sending email notification where applicable. Your continued use of our services after such modifications constitutes acceptance of the updated Terms.</p>
        </div>

        <div className="section">
          <h2>12. Contact</h2>
          <p>For questions regarding these Terms of Service, please contact us:</p>
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
          <Link href="/privacy">Privacy</Link>
          <Link href="/aml">AML</Link>
          <Link href="/risk">Risk</Link>
          <Link href="/">Home</Link>
        </div>
      </div>
    </div>
  )
}