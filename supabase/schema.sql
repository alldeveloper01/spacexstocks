-- USERS
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  full_name text,
  role text default 'user',
  balance numeric default 0,
  withdrawal_balance numeric default 0,
  total_profit numeric default 0,
  total_deposited numeric default 0,
  kyc_verified boolean default false,
  invite_code text unique,
  referred_by uuid references users(id),
  created_at timestamptz default now()
);

-- INVESTMENT PLANS
create table if not exists investment_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  min_amount numeric not null,
  weekly_return numeric default 0,
  target_profit numeric default 0,
  duration_days integer not null,
  target_multiplier numeric default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- USER INVESTMENTS
create table if not exists user_investments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  plan_id uuid references investment_plans(id),
  amount numeric not null,
  weekly_return numeric default 0,
  target_profit numeric default 0,
  status text default 'active',
  start_date timestamptz default now(),
  end_date timestamptz,
  created_at timestamptz default now()
);

-- DEPOSITS
create table if not exists deposits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  amount numeric not null,
  currency text,
  status text default 'pending',
  oxapay_address text,
  oxapay_track_id text,
  order_id text,
  created_at timestamptz default now()
);

-- WITHDRAWALS
create table if not exists withdrawals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  amount numeric not null,
  wallet_address text not null,
  currency text default 'TRX',
  status text default 'pending',
  admin_note text,
  created_at timestamptz default now()
);

-- KYC
create table if not exists kyc_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  document_type text,
  document_number text,
  document_url text,
  selfie_url text,
  status text default 'pending',
  admin_note text,
  created_at timestamptz default now()
);

-- CHAT MESSAGES
create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  sender text not null,
  message text not null,
  is_admin boolean default false,
  created_at timestamptz default now()
);

-- CHAT SESSIONS
create table if not exists chat_sessions (
  session_id text primary key,
  status text default 'open',
  user_name text,
  user_email text,
  last_message text,
  user_typing boolean default false,
  admin_typing boolean default false,
  user_typing_at timestamptz,
  admin_typing_at timestamptz,
  updated_at timestamptz default now()
);

-- EMAIL INBOX
create table if not exists emails (
  id uuid primary key default gen_random_uuid(),
  email_id text unique not null,
  from_address text,
  to_address text,
  subject text,
  body_html text,
  body_text text,
  read boolean default false,
  attachments jsonb default '[]',
  received_at timestamptz default now()
);

-- EMAIL REPLIES
create table if not exists email_replies (
  id uuid primary key default gen_random_uuid(),
  email_id uuid references emails(id),
  from_address text,
  to_address text,
  subject text,
  body text,
  sent_at timestamptz default now()
);

-- INVITE CODES
create table if not exists invite_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  created_by uuid references users(id),
  used_by uuid references users(id),
  used_at timestamptz,
  created_at timestamptz default now()
);

-- Insert investment plans
insert into investment_plans (name, min_amount, weekly_return, target_profit, duration_days, target_multiplier) values
  ('Bronze',   1000,  1800,  5400,   21,  0),
  ('Starter',  2000,  2100,  8400,   28,  0),
  ('Growth',   5000,  3200,  19200,  42,  0),
  ('Premium',  10000, 5500,  44000,  56,  0),
  ('Elite',    20000, 8100,  129600, 120, 0),
  ('Platinum', 50000, 16000, 384000, 180, 0)
on conflict do nothing;
