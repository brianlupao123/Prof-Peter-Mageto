import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL is required to migrate office messages.');
  process.exit(1);
}

const sql = neon(databaseUrl);

try {
  await sql`create extension if not exists pgcrypto`;

  await sql`
    create table if not exists office_messages (
      id uuid primary key default gen_random_uuid(),
      title text not null,
      body text not null,
      type text not null default 'message',
      published_date date,
      source_url text,
      published boolean not null default false,
      sort_order integer not null default 0,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `;

  await sql`
    alter table office_messages
    drop constraint if exists office_messages_type_check
  `;

  await sql`
    alter table office_messages
    add constraint office_messages_type_check
    check (type in ('message', 'speech', 'statement', 'address'))
  `;

  await sql`
    create index if not exists idx_office_messages_public
    on office_messages (published, published_date desc, sort_order asc)
  `;

  const rows = await sql`
    select id, title, type, published_date, source_url, published, sort_order
    from office_messages
    order by sort_order asc, published_date desc nulls last, created_at desc
  `;

  console.log(JSON.stringify({ ok: true, count: rows.length, rows }, null, 2));
} catch (error) {
  console.error('Failed to migrate office messages:', error.message);
  process.exit(1);
}
