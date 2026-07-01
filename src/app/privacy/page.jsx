import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy — SpaceX Stocks',
  description: 'SpaceX Stocks Privacy Policy. Learn how we collect, use, and protect your personal information on our private investment platform.'
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
  .highlight p{font-size:12px;letter-spacing:.03em;line-height:2;color:rgba(255,255,255,.4);margin:0}
  .section{margin-bottom:52px;opacity:0;animation:fadeUp .7s ease forwards}
  .section:nth-child(1){animation-delay:.05s}.section:nth-child(2){animation-delay:.1s}.section:nth-child(3){animation-delay:.15s}.section:nth-child(4){animation-delay:.2s}.section:nth-child(5){animation-delay:.25s}.section:nth-child(6){animation-delay:.3s}.section:nth-child(7){animation-delay:.35s}.section:nth-child(8){animation-delay:.4s}.section:nth-child(9){animation-delay:.45s}.section:nth-child(10){animation-delay:.5s}.section:nth-child(11){animation-delay:.55s}
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

export default function PrivacyPage() {
  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>
      <style>{S}</style>

      <nav className="nav">
        <Link href="/" className="nav-logo">SpaceX Stocks<span>spacestocks.finance</span></Link>
        <Link href="/" className="nav-back">← Back to Home</Link>
      </nav>

      <div className="hero">
        <div className="eyebrow">Legal · Data & Privacy</div>
        <h1>Privacy Policy</h1>
        <div className="date">Effective January 1, 2026 · Last Updated July 2026</div>
      </div>

      <div className="body">
        <div className="highlight">
          <p>This Privacy Policy describes how SpaceX Stocks collects, uses, discloses, and safeguards your information when you use our platform and services. We take your privacy seriously. Please read this policy carefully.</p>
        </div>

        <div className="section">
          <h2>1. Information We Collect</h2>
          <h3>1.1 Personal Identification Information</h3>
          <p>When you register for an account or use our services, we collect information that identifies you, including:</p>
          <ul>
            <li>Full legal name and email address</li>
            <li>Country of residence</li>
            <li>Government-issued identification documents (for KYC verification)</li>
            <li>Photographic identification including selfie with ID document</li>
            <li>Member number and invitation code used for registration</li>
          </ul>
          <h3>1.2 Financial Information</h3>
          <p>To facilitate deposits, withdrawals, and investment activities, we collect:</p>
          <ul>
            <li>Cryptocurrency wallet addresses used for withdrawals</li>
            <li>Transaction history and deposit records</li>
            <li>Investment plan details and active plan status</li>
            <li>Account balances including deposit and withdrawal balance</li>
            <li>Payment receipts from our payment processor (OxaPay)</li>
          </ul>
          <h3>1.3 Technical and Usage Information</h3>
          <p>We automatically collect certain technical information when you access our platform:</p>
          <ul>
            <li>IP address, browser type, and operating system</li>
            <li>Country and region of access (via Vercel geolocation headers)</li>
            <li>Pages visited and features used</li>
            <li>Login timestamps and session data</li>
            <li>Device type (desktop or mobile)</li>
          </ul>
        </div>

        <div className="section">
          <h2>2. How We Use Your Information</h2>
          <p>SpaceX Stocks uses the information we collect for the following purposes:</p>
          <ul>
            <li><strong>Account Management:</strong> To create, maintain, and secure your account and verify your identity</li>
            <li><strong>Service Delivery:</strong> To process transactions, activate investment plans, and credit weekly returns</li>
            <li><strong>Regulatory Compliance:</strong> To comply with KYC/AML requirements and applicable financial regulations</li>
            <li><strong>Communications:</strong> To send OTP verification codes, account notifications, and important service updates</li>
            <li><strong>Security:</strong> To detect, investigate, and prevent fraudulent transactions and unauthorized access</li>
            <li><strong>Platform Monitoring:</strong> To track site visits and monitor platform health via Pushover notifications</li>
          </ul>
        </div>

        <div className="section">
          <h2>3. Information Sharing and Disclosure</h2>
          <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following limited circumstances:</p>
          <h3>3.1 Service Providers</h3>
          <p>We engage trusted third-party service providers who assist in operating our platform, including OxaPay (cryptocurrency payment processing), Resend (email delivery), Supabase (database infrastructure), and Vercel (hosting and deployment). These providers are contractually obligated to maintain the confidentiality of your information and may not use it for their own purposes.</p>
          <h3>3.2 Legal Requirements</h3>
          <p>We may disclose your information when required by law, court order, or governmental authority, or when we believe in good faith that disclosure is necessary to protect our rights, your safety, or the safety of others.</p>
          <h3>3.3 KYC Verification</h3>
          <p>Identity verification documents submitted through our KYC process are reviewed by our compliance team and may be shared with relevant regulatory authorities where required by applicable law.</p>
        </div>

        <div className="section">
          <h2>4. Data Security</h2>
          <p>SpaceX Stocks implements industry-standard security measures to protect your personal information, including:</p>
          <ul>
            <li>SSL/TLS encryption for all data transmission</li>
            <li>Bcrypt hashing for all stored passwords and sensitive credentials</li>
            <li>JWT-based authentication with 30-day token expiry</li>
            <li>Email-based OTP authentication for all account access</li>
            <li>Service role key isolation — public API keys cannot modify sensitive data</li>
            <li>Strict access controls limiting personnel access to personal data</li>
          </ul>
          <div className="highlight">
            <p>While we implement robust security measures, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security of your information and encourage you to maintain strong email account security.</p>
          </div>
        </div>

        <div className="section">
          <h2>5. Data Retention</h2>
          <p>We retain your personal information for as long as your account remains active or as needed to provide our services. Financial records including transaction history and investment details are retained for a minimum of 5 years in accordance with standard financial compliance requirements. Upon account closure, certain data may be retained for regulatory compliance purposes. KYC documents are retained for the period required by applicable law.</p>
        </div>

        <div className="section">
          <h2>6. Your Rights</h2>
          <p>Depending on your jurisdiction, you may have the following rights regarding your personal information:</p>
          <ul>
            <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
            <li><strong>Correction:</strong> Request correction of inaccurate or incomplete personal information</li>
            <li><strong>Deletion:</strong> Request deletion of your personal information, subject to legal retention requirements</li>
            <li><strong>Objection:</strong> Object to certain processing of your personal information</li>
          </ul>
          <p>To exercise any of these rights, please contact us at support@spacestocks.finance.</p>
        </div>

        <div className="section">
          <h2>7. Cookies and Session Data</h2>
          <p>Our platform uses authentication tokens stored in your browser's local storage to maintain your logged-in session. We do not use advertising cookies or third-party tracking cookies. Session tokens expire automatically and can be cleared by logging out of your account.</p>
        </div>

        <div className="section">
          <h2>8. Children's Privacy</h2>
          <p>Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from minors. If we become aware that we have collected personal information from a minor, we will take immediate steps to delete such information and terminate the associated account.</p>
        </div>

        <div className="section">
          <h2>9. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. We will notify you of any material changes by posting the updated policy on our platform. Your continued use of our services after such changes constitutes acceptance of the updated policy.</p>
        </div>

        <div className="section">
          <h2>10. Contact Us</h2>
          <p>If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:</p>
          <ul>
            <li>Email: support@spacestocks.finance</li>
            <li>Invest: invest@spacestocks.finance</li>
            <li>Website: spacestocks.finance</li>
          </ul>
        </div>
      </div>

      <div className="footer">
        <div className="footer-copy">© 2026 SpaceX Stocks · spacestocks.finance</div>
        <div className="footer-links">
          <Link href="/terms">Terms</Link>
          <Link href="/aml">AML</Link>
          <Link href="/risk">Risk</Link>
          <Link href="/">Home</Link>
        </div>
      </div>
    </div>
  )
}