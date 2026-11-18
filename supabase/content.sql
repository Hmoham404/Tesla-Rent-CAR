create table if not exists public.site_content (
  id text primary key check (id = 'main'),
  payload jsonb not null
);
alter table public.site_content enable row level security;
-- Reading and writing pass through the server; no public write policy.
revoke all on public.site_content from anon, authenticated;
grant all on public.site_content to service_role;
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('site-media','site-media',true,2097152,array['image/webp'])
on conflict (id) do update set public=true,file_size_limit=2097152,allowed_mime_types=array['image/webp'];
-- Uploads use the authenticated admin API and server service-role key.
