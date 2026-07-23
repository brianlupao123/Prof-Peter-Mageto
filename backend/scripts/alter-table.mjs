import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL is required to alter table.');
  process.exit(1);
}

const sql = neon(databaseUrl);

try {
  console.log('Ensuring pgcrypto extension...');
  await sql`create extension if not exists pgcrypto`;

  console.log('Repairing users table shape...');
  await sql`alter table users add column if not exists name text`;
  await sql`update users set name = coalesce(nullif(name, ''), email, 'Portfolio User') where name is null or name = ''`;
  await sql`alter table users alter column name set not null`;
  await sql`alter table users add column if not exists email text`;
  await sql`alter table users add column if not exists password_hash text`;
  await sql`alter table users add column if not exists is_admin boolean not null default false`;
  await sql`alter table users add column if not exists created_at timestamptz not null default now()`;
  await sql`alter table users add column if not exists updated_at timestamptz not null default now()`;
  await sql`create unique index if not exists users_email_unique on users (email)`;

  console.log('Running ALTER TABLE messages...');
  await sql`alter table messages drop constraint if exists messages_status_check`;
  await sql`alter table messages add constraint messages_status_check check (status in ('new', 'read', 'replied', 'resolved', 'archived'))`;

  console.log('Ensuring page_likes table...');
  await sql`create table if not exists page_likes (page_key text primary key, count integer not null default 0)`;

  console.log('Running ALTER TABLE hero_slides...');
  await sql`alter table hero_slides add column if not exists background_image_url text`;
  await sql`alter table hero_slides add column if not exists cta_label text`;
  await sql`alter table hero_slides add column if not exists cta_href text`;
  await sql`alter table hero_slides add column if not exists focal_position text default 'center center'`;
  await sql`alter table hero_slides add column if not exists overlay_strength integer default 68`;
  await sql`alter table hero_slides add column if not exists card_visibility boolean default true`;

  console.log('Running ALTER TABLE sources_list...');
  await sql`alter table sources_list add column if not exists publisher text`;
  await sql`alter table sources_list add column if not exists source_type text`;
  await sql`alter table sources_list add column if not exists published_date date`;
  await sql`alter table sources_list add column if not exists verified boolean not null default false`;
  await sql`alter table sources_list add column if not exists retired boolean not null default false`;
  console.log('Done.');
} catch (error) {
  console.error('Failed to alter table:', error);
  process.exit(1);
}

