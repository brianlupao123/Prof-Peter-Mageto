import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { neon } from '@neondatabase/serverless';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is required to init database.');
  process.exit(1);
}

const sql = neon(databaseUrl);
const schemaPath = path.join(__dirname, '../schema.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf8');

console.log('Running schema.sql...');

// Split by semi-colon to execute commands if multiple, but neon() allows batching?
// Actually neon() allows running the whole string.
try {
  const statements = schemaSql.split(';').map(s => s.trim()).filter(Boolean);
  for (const statement of statements) {
    await sql(statement);
  }
  console.log('Schema created successfully.');
} catch (e) {
  console.error('Error creating schema:', e);
}
