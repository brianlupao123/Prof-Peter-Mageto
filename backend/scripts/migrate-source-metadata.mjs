import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL is required to migrate source metadata.');
  process.exit(1);
}

const sql = neon(databaseUrl);

const sourceBackfill = [
  { label: 'Africa University official Vice Chancellor profile', publisher: 'Africa University', sourceType: 'official', verified: true, retired: false },
  { label: 'Africa University faculty directory profile', publisher: 'Africa University', sourceType: 'official', verified: true, retired: false },
  { label: 'UM News: 5th Vice Chancellor installation', publisher: 'United Methodist News', sourceType: 'press', publishedDate: '2022-03-01', verified: true, retired: false },
  { label: 'Africa University 2023/27 Strategic Plan launch', publisher: 'Africa University News', sourceType: 'official', verified: true, retired: false },
  { label: 'Wikipedia biography', publisher: 'Wikipedia', sourceType: 'contextual', verified: false, retired: false },
  { label: 'ResearchGate - Spiritual Gullibility in Search of Health', publisher: 'ResearchGate', sourceType: 'scholarly', verified: false, retired: true },
  { label: 'Amani Partners feature profile', publisher: 'Amani Partners', sourceType: 'contextual', verified: false, retired: false },
  { label: 'Africa University official contact page', publisher: 'Africa University', sourceType: 'official', verified: true, retired: false },
];

try {
  const before = await sql`select count(*)::int as count from sources_list`;

  await sql`alter table sources_list add column if not exists publisher text`;
  await sql`alter table sources_list add column if not exists source_type text`;
  await sql`alter table sources_list add column if not exists published_date date`;
  await sql`alter table sources_list add column if not exists verified boolean not null default false`;
  await sql`alter table sources_list add column if not exists retired boolean not null default false`;

  for (const source of sourceBackfill) {
    await sql`
      update sources_list
      set
        publisher = ${source.publisher},
        source_type = ${source.sourceType},
        published_date = ${source.publishedDate || null},
        verified = ${source.verified},
        retired = ${source.retired}
      where label = ${source.label}
    `;
  }

  const after = await sql`select count(*)::int as count from sources_list`;
  const rows = await sql`
    select label, url, sort_order, publisher, source_type, published_date, verified, retired
    from sources_list
    order by sort_order asc
  `;

  console.log(JSON.stringify({ beforeCount: before[0].count, afterCount: after[0].count, rows }, null, 2));
} catch (error) {
  console.error('Failed to migrate source metadata:', error.message);
  process.exit(1);
}
