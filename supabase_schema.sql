-- VIVICHILD ACADEMY — SUPABASE SETUP
-- Run this entire file in Supabase Dashboard → SQL Editor.
-- It creates the CMS database, security policies, enquiries and image storage.

create extension if not exists pgcrypto;

create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(select 1 from public.admins where user_id = auth.uid());
$$;

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text,
  excerpt text,
  content jsonb not null default '[]'::jsonb,
  metadesc text,
  date date default current_date,
  status text not null default 'Draft' check (status in ('Draft','Published')),
  image_url text,
  alt text,
  author text default 'School Admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Parent',
  relation text,
  quote text not null,
  status text not null default 'Draft' check (status in ('Draft','Published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('gallery','student-life')),
  title text not null default 'School Photo',
  category text,
  alt text,
  description text,
  status text not null default 'Published' check (status in ('Draft','Published')),
  url text not null,
  storage_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  child_age text,
  programme text,
  message text,
  source_page text,
  status text not null default 'New' check (status in ('New','Read','Replied','Archived')),
  created_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;
alter table public.admins enable row level security;
alter table public.articles enable row level security;
alter table public.reviews enable row level security;
alter table public.media enable row level security;
alter table public.enquiries enable row level security;

drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings" on public.site_settings
for select using (true);

drop policy if exists "Admins manage site settings" on public.site_settings;
create policy "Admins manage site settings" on public.site_settings
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can see their admin record" on public.admins;
create policy "Admins can see their admin record" on public.admins
for select using (auth.uid() = user_id);

drop policy if exists "Public can read published articles" on public.articles;
create policy "Public can read published articles" on public.articles
for select using (status = 'Published' or public.is_admin());

drop policy if exists "Admins manage articles" on public.articles;
create policy "Admins manage articles" on public.articles
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public can read published reviews" on public.reviews;
create policy "Public can read published reviews" on public.reviews
for select using (status = 'Published' or public.is_admin());

drop policy if exists "Admins manage reviews" on public.reviews;
create policy "Admins manage reviews" on public.reviews
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public can read published media" on public.media;
create policy "Public can read published media" on public.media
for select using (status = 'Published' or public.is_admin());

drop policy if exists "Admins manage media" on public.media;
create policy "Admins manage media" on public.media
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Anyone can submit an enquiry" on public.enquiries;
create policy "Anyone can submit an enquiry" on public.enquiries
for insert with check (true);

drop policy if exists "Admins read enquiries" on public.enquiries;
create policy "Admins read enquiries" on public.enquiries
for select using (public.is_admin());

drop policy if exists "Admins update enquiries" on public.enquiries;
create policy "Admins update enquiries" on public.enquiries
for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins delete enquiries" on public.enquiries;
create policy "Admins delete enquiries" on public.enquiries
for delete using (public.is_admin());

-- Public image bucket. Files are readable by visitors, but only admins can upload/change/delete.
insert into storage.buckets (id, name, public)
values ('site-media', 'site-media', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can view site media" on storage.objects;
create policy "Public can view site media" on storage.objects
for select using (bucket_id = 'site-media');

drop policy if exists "Admins upload site media" on storage.objects;
create policy "Admins upload site media" on storage.objects
for insert with check (bucket_id = 'site-media' and public.is_admin());

drop policy if exists "Admins update site media" on storage.objects;
create policy "Admins update site media" on storage.objects
for update using (bucket_id = 'site-media' and public.is_admin())
with check (bucket_id = 'site-media' and public.is_admin());

drop policy if exists "Admins delete site media" on storage.objects;
create policy "Admins delete site media" on storage.objects
for delete using (bucket_id = 'site-media' and public.is_admin());

insert into public.site_settings (id, settings)
values (1, '{
  "schoolName":"ViviChild Academy",
  "tagline":"Nurturing young minds. Building bright futures.",
  "phone":"+233 59 475 2241",
  "email":"",
  "address":"Gbawe, Weija-Gbawe Municipal, Greater Accra, Ghana",
  "siteUrl":"",
  "logoUrl":"",
  "heroImageUrl":"",
  "faviconUrl":"",
  "theme":"forest",
  "layout":"classic",
  "headerStyle":"solid",
  "radius":"16px",
  "colors":{"primary":"#4f3f9a","primaryDark":"#382d70","accent":"#f9c21c","ink":"#263238","muted":"#68777d","background":"#f5f7fa","card":"#ffffff"},
  "fonts":{"heading":"Poppins","body":"Nunito Sans"},
  "social":{"facebook":"","instagram":"","tiktok":"","whatsapp":""},
  "seoDescription":"A caring and inspiring learning environment where children develop academically, socially, creatively and morally.",
  "footerText":"Nurturing young minds and building bright futures.",
  "content":{}
}'::jsonb)
on conflict (id) do nothing;

-- IMPORTANT: after creating your first Auth user, run:
-- insert into public.admins (user_id) values ('PASTE_AUTH_USER_UUID_HERE');
