-- Run this once in your Supabase project's SQL editor
-- (Project -> SQL Editor -> New query -> paste -> Run).

-- 1. Profiles table: one row per signed-up user, holds their role.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admins can read all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- 2. Auto-create a profile row whenever someone signs up.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Contact messages table: signed-in visitors can send a message; only
--    admins can read the inbox.
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "Signed-in users can send a message"
  on public.messages for insert
  with check (auth.uid() = user_id);

create policy "Users can read their own sent messages"
  on public.messages for select
  using (auth.uid() = user_id);

create policy "Admins can read all messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- 4. Seed the admin account.
-- Do NOT insert a password here — Supabase Auth manages passwords securely
-- and this file is safe to commit to a public repo.
-- Steps to seed the admin:
--   a) Go to the deployed site's /sign-up page and create the account with
--      the admin's real email and a strong password (or create the user
--      directly in Supabase Dashboard -> Authentication -> Users -> Add user).
--   b) Then run the line below, replacing the email:
--
--   update public.profiles set role = 'admin'
--   where email = 'REPLACE_WITH_ADMIN_EMAIL';
