create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null default 'Portfolio enquiry',
  message text not null,
  status text not null default 'new' check (status in ('new', 'read', 'replied', 'resolved', 'archived')),
  source text not null default 'prof-mageto-portfolio',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists content_updates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  author_email text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_status_created on messages (status, created_at desc);
create index if not exists idx_content_updates_created on content_updates (created_at desc);

create table if not exists page_likes (
  page_key text primary key,
  count integer not null default 0
);

-- ============================================================
-- Profile CRUD system - additive migration
-- ============================================================
create table if not exists profile (
  id integer primary key default 1,
  full_name text not null default 'Rev. Professor Peter Mageto',
  title text not null default 'Fifth Vice Chancellor of Africa University',
  email text,
  phone text,
  phone_secondary text,
  address text,
  portrait_url text,
  logo_url text,
  updated_at timestamptz not null default now(),
  constraint profile_single_row check (id = 1)
);
insert into profile (id) values (1) on conflict (id) do nothing;

create table if not exists hero_slides (
  page_key text not null,
  eyebrow text,
  heading text not null,
  subheading text,
  body text,
  panel_caption text,
  background_image_url text,
  cta_label text,
  cta_href text,
  sort_order integer not null default 0,
  id uuid primary key default gen_random_uuid()
);
create index if not exists idx_hero_slides_page on hero_slides (page_key, sort_order);

create table if not exists credentials (id uuid primary key default gen_random_uuid(), label text not null, sort_order integer not null default 0);
create table if not exists career_entries (id uuid primary key default gen_random_uuid(), role text not null, place text not null, note text, sort_order integer not null default 0);
create table if not exists publications (id uuid primary key default gen_random_uuid(), title text not null, sort_order integer not null default 0);
create table if not exists research_themes (id uuid primary key default gen_random_uuid(), label text not null, sort_order integer not null default 0);
create table if not exists strategy_goals (id uuid primary key default gen_random_uuid(), label text not null, sort_order integer not null default 0);
create table if not exists sources_list (id uuid primary key default gen_random_uuid(), label text not null, url text not null, sort_order integer not null default 0);
create table if not exists social_links (id uuid primary key default gen_random_uuid(), platform text not null, url text not null, sort_order integer not null default 0);

create index if not exists idx_credentials_sort on credentials (sort_order);
create index if not exists idx_career_sort on career_entries (sort_order);
create index if not exists idx_publications_sort on publications (sort_order);
create index if not exists idx_research_sort on research_themes (sort_order);
create index if not exists idx_strategy_sort on strategy_goals (sort_order);
create index if not exists idx_sources_sort on sources_list (sort_order);
create index if not exists idx_social_links_sort on social_links (sort_order);

-- Fix messages status constraint to allow 'resolved' (run this against existing DB)
alter table messages drop constraint if exists messages_status_check;
alter table messages add constraint messages_status_check check (status in ('new', 'read', 'replied', 'resolved', 'archived'));

