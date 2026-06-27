# SpaceX Stocks — Setup Guide

## Stack
- Next.js 14 (App Router)
- Supabase (database + auth storage)
- OxaPay (crypto payments)
- Resend (email)
- Vercel (deployment)

---

## 1. Supabase Setup
1. Create a new Supabase project at supabase.com
2. Go to SQL Editor and run the full contents of `supabase/schema.sql`
3. Copy your Project URL and anon key from Settings > API

---

## 2. Environment Variables
Copy `.env.local` and fill in:
- `NEXT_PUBLIC_SUPABASE_URL` — from Supabase Settings > API
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from Supabase Settings > API
- `SUPABASE_SERVICE_ROLE_KEY` — from Supabase Settings > API (service role)
- `JWT_SECRET` — any random string, min 32 chars
- `OXAPAY_MERCHANT_KEY` — from OxaPay dashboard
- `OXAPAY_API_KEY` — from OxaPay dashboard (for HMAC webhook verification)
- `RESEND_API_KEY` — from Resend dashboard
- `PUSHOVER_USER_KEY` + `PUSHOVER_APP_TOKEN` — from Pushover app

---

## 3. Resend Setup
1. Add `spacestocks.finance` domain in Resend
2. Create these email aliases in your DNS/Resend:
   - invest@spacestocks.finance
   - support@spacestocks.finance
   - noreply@spacestocks.finance
   - compliance@spacestocks.finance
   - verification@spacestocks.finance
3. Set inbound webhook URL to:
   `https://www.spacestocks.finance/api/email/inbound`
   (MUST use www prefix — non-www returns 307 redirect)

---

## 4. Vercel Deployment
1. Push to GitHub
2. Import to Vercel
3. Add all env vars in Vercel dashboard
4. Deploy
5. Add custom domain `spacestocks.finance` in Vercel

---

## 5. Create First Admin User
After deployment, register normally then run in Supabase SQL editor:
```sql
update users set role = 'admin' where email = 'your@email.com';
```

---

## 6. Generate First Invite Code
In Supabase SQL editor:
```sql
insert into invite_codes (code, created_by)
select 'SPACEX2026', id from users where role = 'admin' limit 1;
```

---

## 7. OxaPay Webhook
Set your OxaPay webhook URL to:
`https://www.spacestocks.finance/api/deposit/webhook`

---

## Key Fixes Applied (from Meridian Capital experience)
- OxaPay: uses `payment_url` not `pay_link` in invoice response
- OxaPay: `order_id` max 50 chars
- OxaPay: webhook status is `"Paid"` with capital P
- OxaPay: actual amount from `txs[0].value` not `sent_amount`
- OxaPay: HMAC header is uppercase `HMAC`, sha512
- OxaPay: static address shows 2% fee to user (`amount * 1.02`)
- Chat: session always upserted on first message
- Resend inbound: body fetched separately via `resend.emails.receiving.get(email_id)`
- Resend inbound: webhook must use www prefix
- `export const dynamic = 'force-dynamic'` at top of all API routes
