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
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta name="color-scheme" content="dark">
</head>
<body style="margin:0;padding:0;background-color:#000000;font-family:'Courier New',Courier,monospace;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#000000;">
  <tr>
    <td align="center" style="padding:40px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">

        <!-- Header -->
        <tr>
          <td style="text-align:center;padding-bottom:28px;border-bottom:1px solid #1a1a1a;">
            <div style="font-size:20px;letter-spacing:6px;color:#ffffff;font-family:'Courier New',monospace;">
              SPACEX <span style="color:#666666;">STOCKS</span>
            </div>
            <div style="font-size:9px;letter-spacing:4px;color:#333333;margin-top:6px;text-transform:uppercase;">
              Private Investment Access
            </div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 0 28px;">
            <div style="font-size:18px;letter-spacing:2px;color:#ffffff;margin-bottom:20px;font-weight:700;font-family:'Courier New',monospace;">
              ${title}
            </div>
            <div style="font-size:13px;line-height:2.2;color:#cccccc;letter-spacing:1px;font-family:'Courier New',monospace;">
              ${body}
            </div>
          </td>
        </tr>

        <!-- Divider -->
        <tr>
          <td style="padding:0;border-top:1px solid #1a1a1a;"></td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding-top:24px;text-align:center;">
            <div style="font-size:9px;letter-spacing:2px;color:#333333;line-height:2;text-transform:uppercase;font-family:'Courier New',monospace;">
              <p style="margin:0;">© ${new Date().getFullYear()} SpaceX Stocks · spacestocks.finance</p>
              <p style="margin:6px 0 0;">
                <a href="mailto:invest@spacestocks.finance" style="color:#444444;text-decoration:none;">invest@spacestocks.finance</a>
              </p>
              <p style="margin:6px 0 0;font-size:8px;color:#222222;">
                If you did not request this, please ignore this email.
              </p>
            </div>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
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