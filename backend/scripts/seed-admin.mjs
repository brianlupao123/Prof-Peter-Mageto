import bcrypt from 'bcryptjs';
import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;
const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
if (!email) {
  console.error('ADMIN_EMAIL env var is required to seed the admin account.');
  process.exit(1);
}
if (!password) {
  console.error('ADMIN_PASSWORD env var is required - refusing to seed a default password.');
  process.exit(1);
}
const name = process.env.ADMIN_NAME || 'Prof. Mageto Admin';
const username = email.split('@')[0] || 'admin';

if (!databaseUrl) {
  console.error('DATABASE_URL is required to seed the admin account.');
  process.exit(1);
}

const sql = neon(databaseUrl);
const passwordHash = await bcrypt.hash(password, 10);

try {
  await sql`
    insert into users (name, email, password_hash, is_admin, username, hashed_password, full_name)
    values (${name}, ${email}, ${passwordHash}, true, ${username}, ${passwordHash}, ${name})
    on conflict (email)
    do update set
      name = excluded.name,
      password_hash = excluded.password_hash,
      is_admin = true,
      username = excluded.username,
      hashed_password = excluded.hashed_password,
      full_name = excluded.full_name,
      updated_at = now()
  `;
} catch (error) {
  if (error.code !== '42703') throw error;
  await sql`
    insert into users (name, email, password_hash, is_admin)
    values (${name}, ${email}, ${passwordHash}, true)
    on conflict (email)
    do update set name = excluded.name, password_hash = excluded.password_hash, is_admin = true, updated_at = now()
  `;
}

console.log(`Admin seeded: ${email}`);
