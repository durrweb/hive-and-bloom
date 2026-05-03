-- Run this in Supabase Dashboard → SQL Editor
-- Creates the inbox tables for the internal email system

create table if not exists public.customers (
  id         uuid        primary key default gen_random_uuid(),
  email      text        unique not null,
  name       text,
  created_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id               uuid        primary key default gen_random_uuid(),
  customer_id      uuid        not null references public.customers(id) on delete cascade,
  subject          text,
  status           text        not null default 'open',
  last_message_at  timestamptz not null default now(),
  created_at       timestamptz not null default now(),
  constraint conversations_status_check check (status in ('open', 'resolved'))
);

create table if not exists public.messages (
  id                uuid        primary key default gen_random_uuid(),
  conversation_id   uuid        not null references public.conversations(id) on delete cascade,
  direction         text        not null,
  from_email        text,
  to_email          text,
  subject           text,
  body_html         text,
  body_text         text,
  resend_message_id text,
  in_reply_to       text,
  created_at        timestamptz not null default now(),
  constraint messages_direction_check check (direction in ('inbound', 'outbound'))
);

create index if not exists idx_conversations_customer  on public.conversations(customer_id);
create index if not exists idx_conversations_last_msg  on public.conversations(last_message_at desc);
create index if not exists idx_messages_conversation   on public.messages(conversation_id);
create index if not exists idx_messages_resend_id      on public.messages(resend_message_id);

alter table public.customers     enable row level security;
alter table public.conversations  enable row level security;
alter table public.messages       enable row level security;

-- Authenticated staff get full access
create policy "staff_full_access" on public.customers
  for all to authenticated using (true) with check (true);

create policy "staff_full_access" on public.conversations
  for all to authenticated using (true) with check (true);

create policy "staff_full_access" on public.messages
  for all to authenticated using (true) with check (true);
