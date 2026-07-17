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
  status text not null default 'new' check (status in ('new', 'read', 'replied', 'archived')),
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
