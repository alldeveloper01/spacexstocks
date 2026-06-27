import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const VALID_FROM = [
  'invest@spacestocks.finance',
  'support@spacestocks.finance',
  'noreply@spacestocks.finance',
  'compliance@spacestocks.finance',
  'verification@spacestocks.finance',
]

export function buildEmailTemplate({ title, body, fromLabel = 'SpaceX Stocks' }) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:#000000; font-family:'Courier Prime','Courier New',monospace; color:#e0e0e0; }
  .wrap { max-width:580px; margin:0 auto; padding:40px 20px; }
  .header { text-align:center; padding-bottom:28px; border-bottom:1px solid rgba(255,255,255,0.08); }
  .logo { font-size:22px; letter-spacing:0.18em; }
  .logo-main { color:#ffffff; }
  .logo-sub { color:#888888; }
  .tagline { font-size:9px; letter-spacing:0.45em; color:rgba(255,255,255,0.2); margin-top:6px; text-transform:uppercase; }
  .body { padding:36px 0 28px; }
  .title { font-size:18px; letter-spacing:0.06em; color:#ffffff; margin-bottom:20px; font-weight:700; }
  .content { font-size:13px; line-height:2; color:rgba(255,255,255,0.55); letter-spacing:0.04em; }
  .divider { height:1px; background:rgba(255,255,255,0.06); margin:28px 0; }
  .footer { font-size:10px; letter-spacing:0.18em; color:rgba(255,255,255,0.18); text-align:center; line-height:2; text-transform:uppercase; }
  .footer a { color:rgba(255,255,255,0.28); text-decoration:none; }
  .btn { display:inline-block; background:#ffffff; color:#000000; padding:12px 28px; font-family:'Courier New',monospace; font-size:11px; letter-spacing:0.3em; text-decoration:none; font-weight:700; margin-top:20px; text-transform:uppercase; }
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <div class="logo">
      <span class="logo-main">SPACEX</span><span class="logo-sub"> STOCKS</span>
    </div>
    <div class="tagline">Private Investment Access · spacestocks.finance</div>
  </div>
  <div class="body">
    <div class="title">${title}</div>
    <div class="content">${body}</div>
  </div>
  <div class="divider"></div>
  <div class="footer">
    <p>© ${new Date().getFullYear()} SpaceX Stocks · spacestocks.finance</p>
    <p style="margin-top:6px">
      <a href="mailto:invest@spacestocks.finance">invest@spacestocks.finance</a>
    </p>
    <p style="margin-top:6px;font-size:9px;color:rgba(255,255,255,0.1)">
      This email was sent from ${fromLabel}. If you did not request this, please ignore.
    </p>
  </div>
</div>
</body>
</html>`
}

export async function sendEmail({ to, subject, title, body, from = 'noreply@spacestocks.finance', fromName = 'SpaceX Stocks' }) {
  const html = buildEmailTemplate({ title, body })
  return await resend.emails.send({
    from: `${fromName} <${from}>`,
    to,
    subject,
    html,
  })
}

export { resend, VALID_FROM }
