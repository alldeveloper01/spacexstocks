import Link from 'next/link'

export const metadata = {
  title: 'AML Policy — SpaceX Stocks',
  description: 'SpaceX Stocks Anti-Money Laundering Policy. Our commitment to preventing financial crime and maintaining compliance on our private investment platform.'
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

export default function AMLPage() {
  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>
      <style>{S}</style>

      <nav className="nav">
        <Link href="/" className="nav-logo">SpaceX Stocks<span>spacestocks.finance</span></Link>
        <a href="/" className="nav-back">← Back to Home</a>
      </nav>

      <div className="hero">
        <div className="eyebrow">Legal · Compliance</div>
        <h1>AML Policy</h1>
        <div className="date">Effective January 1, 2026 · Last Updated July 2026</div>
      </div>

      <div className="body">
        <div className="highlight">
          <p>SpaceX Stocks is committed to the highest standards of Anti-Money Laundering (AML) and Counter-Terrorist Financing (CTF) compliance. This policy outlines our framework for detecting, preventing, and reporting financial crime across our platform.</p>
        </div>

        <div className="section">
          <h2>1. Introduction and Commitment</h2>
          <p>SpaceX Stocks maintains a robust Anti-Money Laundering and Counter-Terrorist Financing ("AML/CTF") compliance program in accordance with applicable international standards, including the Financial Action Task Force (FATF) recommendations and relevant regulatory frameworks.</p>
          <p>We are committed to ensuring that our platform is not used as a vehicle for money laundering, terrorist financing, fraud, or any other financial crime. This commitment extends to all personnel and users of our platform.</p>
        </div>

        <div className="section">
          <h2>2. Definition of Money Laundering</h2>
          <p>Money laundering is the process by which proceeds of criminal activity are disguised to conceal their illicit origins. This typically involves three stages:</p>
          <ul>
            <li><strong>Placement:</strong> Introducing illegal funds into the financial system</li>
            <li><strong>Layering:</strong> Conducting complex financial transactions to obscure the trail</li>
            <li><strong>Integration:</strong> Reintroducing laundered funds into the legitimate economy</li>
          </ul>
          <p>Terrorist financing involves providing financial support for terrorist activities, regardless of whether the funds originate from legitimate or criminal sources.</p>
        </div>

        <div className="section">
          <h2>3. Know Your Customer (KYC) Program</h2>
          <h3>3.1 Customer Identification</h3>
          <p>All users of the SpaceX Stocks platform who reach the withdrawal threshold of $5,000 in their withdrawal balance are required to complete our identity verification process. Our KYC program includes:</p>
          <ul>
            <li>Verification of government-issued photo identification documents</li>
            <li>Biometric verification through selfie with identification document</li>
            <li>Admin review and approval of submitted documents</li>
            <li>Optional KYC verification fee as determined by our compliance team</li>
            <li>Ongoing monitoring of account activity for suspicious patterns</li>
          </ul>
          <h3>3.2 Acceptable Identification Documents</h3>
          <p>We accept the following forms of government-issued identification:</p>
          <ul>
            <li>Valid national passport</li>
            <li>Government-issued national identity card</li>
            <li>Valid driver's licence (where accepted as primary ID in your jurisdiction)</li>
            <li>Residence permit issued by competent authority</li>
          </ul>
          <h3>3.3 Enhanced Due Diligence</h3>
          <p>SpaceX Stocks applies enhanced due diligence measures to users who present higher AML/CTF risks, including those from high-risk jurisdictions, users conducting unusually large transactions, and users with inconsistent account activity patterns.</p>
        </div>

        <div className="section">
          <h2>4. Transaction Monitoring</h2>
          <p>We implement transaction monitoring measures to detect suspicious activity, including:</p>
          <ul>
            <li>Review of all deposit transactions processed through our payment gateway</li>
            <li>Monitoring of rapid succession of deposits and withdrawal requests</li>
            <li>Analysis of transaction amounts inconsistent with stated investment goals</li>
            <li>Detection of structuring activities designed to avoid reporting thresholds</li>
            <li>Review of geographic risk factors based on user country of access</li>
            <li>Flagging of accounts with unusual withdrawal patterns relative to deposits</li>
          </ul>
        </div>

        <div className="section">
          <h2>5. Suspicious Activity Reporting</h2>
          <p>SpaceX Stocks maintains procedures for identifying and responding to suspicious activity. When suspicious activity is identified, our compliance team will:</p>
          <ul>
            <li>Document all relevant information and evidence</li>
            <li>Freeze affected accounts pending investigation where appropriate</li>
            <li>File reports with relevant authorities as required by applicable law</li>
            <li>Cooperate fully with law enforcement and regulatory investigations</li>
            <li>Maintain strict confidentiality regarding ongoing investigations</li>
          </ul>
          <div className="warning">
            <p>We are prohibited by law from informing any person that a suspicious activity report has been filed or that an investigation is underway. This is known as the "tipping-off" prohibition.</p>
          </div>
        </div>

        <div className="section">
          <h2>6. Sanctions Compliance</h2>
          <p>SpaceX Stocks will not conduct business with individuals, entities, or jurisdictions subject to applicable international sanctions. We screen users against applicable sanctions frameworks including those maintained by:</p>
          <ul>
            <li>United Nations Security Council (UNSC)</li>
            <li>United States Office of Foreign Assets Control (OFAC)</li>
            <li>European Union consolidated sanctions list</li>
            <li>UK Office of Financial Sanctions Implementation (OFSI)</li>
          </ul>
          <p>Any accounts found to be in violation of our sanctions policy will be immediately frozen and reported to relevant authorities. Associated balances may be forfeited as required by applicable law.</p>
        </div>

        <div className="section">
          <h2>7. Prohibited Activities</h2>
          <p>The following activities are strictly prohibited on our platform:</p>
          <ul>
            <li>Depositing funds derived from criminal activity of any kind</li>
            <li>Using our platform to transfer or conceal proceeds of crime</li>
            <li>Financing or supporting terrorist organisations or activities</li>
            <li>Evading taxes or other financial obligations through our platform</li>
            <li>Violating applicable sanctions or export controls</li>
            <li>Accessing our platform from sanctioned jurisdictions</li>
            <li>Using false identity documents during KYC verification</li>
            <li>Operating multiple accounts to circumvent AML controls</li>
          </ul>
        </div>

        <div className="section">
          <h2>8. Record Keeping</h2>
          <p>SpaceX Stocks maintains comprehensive records of all customer identification information, transaction records, and AML/CTF compliance activities. These records are retained for a minimum period of five years, or longer where required by applicable law. Records are maintained in a manner that enables us to reconstruct individual transactions and identify users upon request by competent authorities.</p>
        </div>

        <div className="section">
          <h2>9. Consequences of AML Policy Violations</h2>
          <p>Violations of this AML Policy may result in:</p>
          <ul>
            <li>Immediate suspension or permanent termination of your account</li>
            <li>Freezing of account balances pending investigation</li>
            <li>Reporting to relevant law enforcement and regulatory authorities</li>
            <li>Forfeiture of funds identified as proceeds of crime</li>
            <li>Civil and criminal liability under applicable laws</li>
          </ul>
        </div>

        <div className="section">
          <h2>10. Contact Our Compliance Team</h2>
          <p>If you have questions about our AML policy or wish to report suspicious activity, please contact our compliance team:</p>
          <ul>
            <li>Email: compliance@spacestocks.finance</li>
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
          <Link href="/risk">Risk</Link>
          <Link href="/">Home</Link>
        </div>
      </div>
    </div>
  )
}