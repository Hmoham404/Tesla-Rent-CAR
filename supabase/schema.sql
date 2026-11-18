-- Run once in the Supabase SQL editor. Catalog remains in the source JSON file.
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  created_at timestamptz not null default now()
);
alter table public.bookings enable row level security;
revoke all on public.bookings from anon, authenticated;
grant select, insert, update on public.bookings to service_role;
create index if not exists bookings_created_at_idx on public.bookings (created_at desc);
-- No public policy: all operations pass through the Vercel server API.
-- ADMIN_ACCESS_CODE, ADMIN_SESSION_SECRET and SERVICE_ROLE key stay server-side.
