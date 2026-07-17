import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL is required to alter table.');
  process.exit(1);
}

const sql = neon(databaseUrl);

try {
  console.log('Running ALTER TABLE messages...');
  await sql`alter table messages drop constraint if exists messages_status_check;`;
  await sql`alter table messages add constraint messages_status_check check (status in ('new', 'read', 'replied', 'resolved', 'archived'));`;
  
  console.log('Running ALTER TABLE hero_slides...');
  await sql`ALTER TABLE hero_slides ADD COLUMN IF NOT EXISTS background_image_url TEXT`;
  await sql`ALTER TABLE hero_slides ADD COLUMN IF NOT EXISTS cta_label TEXT`;
  await sql`ALTER TABLE hero_slides ADD COLUMN IF NOT EXISTS cta_href TEXT`;
  console.log('Done.');
} catch (error) {
  console.error('Failed to alter table:', error);
  process.exit(1);
}
