import bcrypt from 'bcryptjs';
import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;
const email = String(process.env.ADMIN_EMAIL || 'profmagteo@gmail.com').trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || 'Test@123';
const name = process.env.ADMIN_NAME || 'Prof. Mageto Admin';

if (!databaseUrl) {
  console.error('DATABASE_URL is required to seed the admin account.');
  process.exit(1);
}

const sql = neon(databaseUrl);
const passwordHash = await bcrypt.hash(password, 10);

await sql`
  insert into users (name, email, password_hash, is_admin)
  values (${name}, ${email}, ${passwordHash}, true)
  on conflict (email)
  do update set name = excluded.name, password_hash = excluded.password_hash, is_admin = true, updated_at = now()
`;

console.log(`Admin seeded: ${email}`);
