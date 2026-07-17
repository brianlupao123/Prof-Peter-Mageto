import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { neon } from '@neondatabase/serverless';

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '200kb' }));

const JWT_SECRET = process.env.JWT_SECRET || 'prof-mageto-preview-secret';
const ADMIN_EMAIL = String(process.env.ADMIN_EMAIL || 'profmagteo@gmail.com').toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Test@123';
const ADMIN_PASSWORD_HASH = bcrypt.hashSync(ADMIN_PASSWORD, 10);
const db = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

const runtime = globalThis.__MAGETO_RUNTIME__ || { users: [], messages: [], contentUpdates: [], rate: new Map() };
globalThis.__MAGETO_RUNTIME__ = runtime;

const siteSettings = {
  siteName: 'The Peter Mageto Leadership Portfolio',
  profileName: 'Rev. Professor Peter Mageto',
  title: 'Fifth Vice Chancellor of Africa University',
  institution: 'Africa University',
  status: 'Full-stack client review build',
  storage: db ? 'neon-postgres' : 'runtime-memory',
  roadmap: [
    'Client-approved portrait and biography',
    'Dedicated biography, speeches, publications, media and gallery pages',
    'Neon-backed admin CMS for communications staff to update approved content',
    'Official office inbox workflow with spam protection and email delivery',
    'Custom domain, analytics, monitoring and communications approval',
  ],
};

const publications = [
  { title: 'Victim Theology', type: 'Book', theme: 'Theology and ethics' },
  { title: 'Corporate and personal ethics for sustainable development', type: 'Article', theme: 'Ethics and development' },
  { title: 'Book Review: European Traditions in the Study of Religion in Africa', type: 'Review', theme: 'Religion in Africa' },
];

function limitRequests(req, res, next) {
  const key = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'local';
  const now = Date.now();
  const windowMs = 60_000;
  const max = 80;
  const record = runtime.rate.get(key) || { count: 0, resetAt: now + windowMs };
  if (record.resetAt < now) {
    record.count = 0;
    record.resetAt = now + windowMs;
  }
  record.count += 1;
  runtime.rate.set(key, record);
  if (record.count > max) return res.status(429).json({ message: 'Too many requests. Try again shortly.' });
  next();
}

app.use('/api', limitRequests);

function signUser(user) {
  const token = jwt.sign({ id: user.id, email: user.email, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '1d' });
  return { token, user };
}

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token) return res.status(401).json({ message: 'Missing token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (_error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

function verifyAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user?.isAdmin) return next();
    return res.status(403).json({ message: 'Admin access required' });
  });
}

function publicUser(row) {
  return { id: row.id, email: row.email, name: row.name, isAdmin: Boolean(row.is_admin ?? row.isAdmin) };
}

function normalizeMessage(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject,
    message: row.message,
    status: row.status,
    source: row.source,
    createdAt: row.created_at || row.createdAt,
  };
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'prof-mageto-api', mode: 'serverless', storage: db ? 'neon-postgres' : 'runtime-memory' });
});

app.get('/api/site-settings', (_req, res) => res.json({ settings: siteSettings }));
app.get('/api/publications', (_req, res) => res.json({ publications }));

app.get('/api/auth/me', verifyToken, async (req, res) => {
  if (db && req.user.id !== 'admin-prof-mageto') {
    const rows = await db`select id, email, name, is_admin from users where id = ${req.user.id} limit 1`;
    if (rows[0]) return res.json({ user: publicUser(rows[0]) });
  }
  res.json({ user: { id: req.user.id, email: req.user.email, name: req.user.email, isAdmin: req.user.isAdmin } });
});

app.post('/api/auth/login', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

  if (db) {
    const rows = await db`select id, email, name, password_hash, is_admin from users where email = ${email} limit 1`;
    const user = rows[0];
    if (user && await bcrypt.compare(password, user.password_hash)) return res.json(signUser(publicUser(user)));
  }

  if (email === ADMIN_EMAIL && await bcrypt.compare(password, ADMIN_PASSWORD_HASH)) {
    return res.json(signUser({ id: 'admin-prof-mageto', email, name: 'Prof. Mageto Admin', isAdmin: true }));
  }

  const user = runtime.users.find((item) => item.email === email);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ message: 'Invalid credentials' });
  res.json(signUser({ id: user.id, email: user.email, name: user.name, isAdmin: false }));
});

app.post('/api/auth/register', async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  if (!name || !email || password.length < 6) return res.status(400).json({ message: 'Name, valid email and 6+ character password are required' });
  if (email === ADMIN_EMAIL) return res.status(409).json({ message: 'Account already exists' });

  const passwordHash = await bcrypt.hash(password, 10);
  if (db) {
    try {
      const rows = await db`insert into users (name, email, password_hash, is_admin) values (${name}, ${email}, ${passwordHash}, false) returning id, name, email, is_admin`;
      return res.status(201).json(signUser(publicUser(rows[0])));
    } catch (error) {
      if (String(error.message).includes('duplicate')) return res.status(409).json({ message: 'Account already exists' });
      throw error;
    }
  }

  if (runtime.users.some((item) => item.email === email)) return res.status(409).json({ message: 'Account already exists' });
  const user = { id: 'user-' + Date.now(), name, email, passwordHash, isAdmin: false };
  runtime.users.push(user);
  res.status(201).json(signUser({ id: user.id, name, email, isAdmin: false }));
});

app.post('/api/contact', async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const subject = String(req.body.subject || 'Portfolio enquiry').trim();
  const message = String(req.body.message || req.body.body || '').trim();
  if (!name || !email || !message) return res.status(400).json({ message: 'Name, email and message are required' });

  if (db) {
    const rows = await db`insert into messages (name, email, subject, message, source) values (${name}, ${email}, ${subject}, ${message}, 'prof-mageto-portfolio') returning *`;
    return res.status(201).json({ success: true, message: 'Message received', data: normalizeMessage(rows[0]) });
  }

  const item = { id: 'msg-' + Date.now(), name, email, subject, message, status: 'new', source: 'prof-mageto-portfolio', createdAt: new Date().toISOString() };
  runtime.messages.unshift(item);
  res.status(201).json({ success: true, message: 'Message received', data: item });
});

app.get('/api/messages', verifyAdmin, async (_req, res) => {
  if (db) {
    const rows = await db`select * from messages order by created_at desc limit 200`;
    return res.json({ messages: rows.map(normalizeMessage) });
  }
  res.json({ messages: runtime.messages });
});

app.patch('/api/messages/:id/status', verifyAdmin, async (req, res) => {
  const status = String(req.body.status || '').trim().toLowerCase();
  if (!['new', 'read', 'replied', 'archived'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
  if (db) {
    const rows = await db`update messages set status = ${status}, updated_at = now() where id = ${req.params.id} returning *`;
    if (!rows[0]) return res.status(404).json({ message: 'Message not found' });
    return res.json({ message: normalizeMessage(rows[0]) });
  }
  const found = runtime.messages.find((item) => item.id === req.params.id);
  if (!found) return res.status(404).json({ message: 'Message not found' });
  found.status = status;
  res.json({ message: found });
});

app.post('/api/content-updates', verifyAdmin, async (req, res) => {
  const title = String(req.body.title || '').trim();
  const body = String(req.body.body || '').trim();
  if (!title || !body) return res.status(400).json({ message: 'Title and body are required' });
  if (db) {
    const rows = await db`insert into content_updates (title, body, author_email) values (${title}, ${body}, ${req.user.email}) returning *`;
    return res.status(201).json({ update: rows[0] });
  }
  const update = { id: 'update-' + Date.now(), title, body, authorEmail: req.user.email, createdAt: new Date().toISOString() };
  runtime.contentUpdates.unshift(update);
  res.status(201).json({ update });
});

app.get('/api/content-updates', async (_req, res) => {
  if (db) {
    const rows = await db`select id, title, body, author_email as "authorEmail", created_at as "createdAt" from content_updates order by created_at desc limit 50`;
    return res.json({ updates: rows });
  }
  res.json({ updates: runtime.contentUpdates });
});

export default app;

if (process.env.RUN_API_SERVER === 'true') {
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`Prof. Mageto API listening on ${port}`));
}
