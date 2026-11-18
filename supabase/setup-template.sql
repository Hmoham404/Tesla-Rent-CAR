-- TESLA Rent Car - execute the COMPLETE generated SETUP.sql in Supabase SQL Editor.
-- Idempotent. No existing reservations or catalogue entries are deleted.
begin;
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  created_at timestamptz not null default now()
);
create index if not exists bookings_created_at_idx on public.bookings (created_at desc);
alter table public.bookings enable row level security;
revoke all on public.bookings from public, anon, authenticated;
grant select, insert, update on public.bookings to service_role;

create table if not exists public.site_content (
  id text primary key check (id = 'main'),
  payload jsonb not null check (jsonb_typeof(payload) = 'object')
);
alter table public.site_content enable row level security;
revoke all on public.site_content from public, anon, authenticated;
grant select, insert, update on public.site_content to service_role;

-- Photos are public; uploads pass through the authenticated server API.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('site-media','site-media',true,2097152,array['image/webp'])
on conflict (id) do update set public=true,file_size_limit=2097152,
  allowed_mime_types=array['image/webp'];
-- No anonymous table policies: only the server service-role key accesses data.
