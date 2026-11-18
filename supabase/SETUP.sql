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

-- Initial public catalogue; an existing catalogue is preserved.
insert into public.site_content (id,payload) values ('main','{"vehicles":[{"id":"mercedes-amg-gt","brand":"Mercedes-Benz","name":"AMG GT","category":"Sport","price":120,"image":"/images/mercedes.webp","fuel":"Essence","transmission":"Automatique","seats":2,"tag":"L’élégance à l’état pur","featured":true,"description":"Des lignes sculptées et une présence unique. Un coupé de caractère pour transformer chaque déplacement en un moment privilégié.","features":["Climatisation automatique","Apple CarPlay","Caméra de recul","Intérieur cuir"]},{"id":"porsche-panamera","brand":"Porsche","name":"Panamera Turbo","category":"Berline","price":290,"image":"/images/porsche.webp","fuel":"Essence","transmission":"Automatique","seats":4,"tag":"Une icône. Votre moment.","featured":true,"description":"Une silhouette intemporelle et le plaisir de la route à chaque virage. Une expérience singulière pour les passionnés de belles mécaniques.","features":["Sièges sport","Navigation GPS","Palettes au volant","Toit panoramique"]},{"id":"honda-cr-v","brand":"Honda","name":"CR-V","category":"SUV","price":195,"image":"/images/range.webp","fuel":"Diesel","transmission":"Automatique","seats":5,"tag":"Voyez la route en grand","featured":true,"description":"Une présence affirmée, un espace généreux et un confort remarquable. Prenez de la hauteur et profitez du voyage, à votre rythme.","features":["Transmission intégrale","Caméra 360°","Intérieur cuir","Grand coffre"]},{"id":"bmw-m5","brand":"BMW","name":"M5","category":"Berline","price":110,"image":"/images/bmw.webp","fuel":"Essence","transmission":"Automatique","seats":5,"tag":"Le plaisir au quotidien","featured":false,"description":"L’équilibre entre confort et dynamisme. Une berline pensée pour accompagner vos escapades comme vos rendez-vous professionnels.","features":["Navigation GPS","Bluetooth","Climatisation","Régulateur de vitesse"]},{"id":"audi-rs6","brand":"Audi","name":"RS6 Avant","category":"Break","price":130,"image":"/images/audi.webp","fuel":"Essence","transmission":"Automatique","seats":5,"tag":"Le sens du détail","featured":false,"description":"Le caractère sportif et la liberté d’un break. Un intérieur soigné et une silhouette affirmée pour voyager avec distinction.","features":["Cockpit numérique","Apple CarPlay","Aide au stationnement","Phares LED"]},{"id":"bmw-m4","brand":"BMW","name":"M4 Coupé","category":"Sport","price":65,"image":"/images/mini.webp","fuel":"Essence","transmission":"Automatique","seats":4,"tag":"Le caractère à chaque virage","featured":false,"description":"Une silhouette affirmée et un esprit sportif. Explorez de nouveaux horizons dans un coupé qui ne passe pas inaperçu.","features":["Bluetooth","Climatisation","Capteurs de stationnement","USB"]},{"id":"029c4c0f-be87-4f98-9a43-b58beed66e4e","brand":"BMW","name":"X1","category":"Citadine","price":90,"image":"/images/published/d6e2fd47-379f-4076-be9d-497f20051d40.webp","images":[],"fuel":"Essence","transmission":"Automatique","seats":5,"tag":"","featured":false,"active":true,"description":"","features":[]}],"media":[{"id":"516fc132-4dbb-4782-bbcd-c10451d53eef","url":"/images/published/d6e2fd47-379f-4076-be9d-497f20051d40.webp","alt":"556753165_1331953891966413_5978325466400990572_n"}],"theme":{"light":"#c61f32","dark":"#f04b60","logo":"/logo.webp","hero":"/images/monastir-ribat.webp"}}'::jsonb)
on conflict (id) do nothing;
commit;
