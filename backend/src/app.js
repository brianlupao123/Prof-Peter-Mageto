import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { neon } from '@neondatabase/serverless';
import { put } from '@vercel/blob';

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
  if (!['new', 'read', 'replied', 'resolved', 'archived'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
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

// ============================================================
// Profile CRUD routes
// ============================================================
const profileFallback = globalThis.__MAGETO_PROFILE__ || {
  profile: {
    id: 1,
    full_name: 'Rev. Professor Peter Mageto',
    title: 'Fifth Vice Chancellor of Africa University',
    email: null,
    phone: null,
    phone_secondary: null,
    address: 'Africa University | Old Mutare, Zimbabwe',
    portrait_url: null,
    logo_url: null,
  },
  heroSlides: [
    { id: 'overview-1', page_key: 'overview', eyebrow: 'Africa University Vice Chancellor', heading: 'Rev. Professor Peter Mageto', subheading: 'The fifth Vice Chancellor of Africa University, a theological ethics scholar and institutional leader advancing pan-African education through justice, equity, collaboration, and student-centered transformation.', panel_caption: 'Leadership anchored in people and values.', sort_order: 0 },
    { id: 'leadership-1', page_key: 'leadership', eyebrow: 'Leadership', heading: 'Institutional leadership across higher education and ministry.', subheading: "Prof. Mageto's public leadership story connects ethics, formation, academic quality, student welfare, and pan-African mission.", panel_caption: "Guiding Africa University's mission and people.", sort_order: 0 },
    { id: 'scholarship-1', page_key: 'scholarship', eyebrow: 'Scholarship', heading: 'Academic foundation in theology, ethics, and African studies.', subheading: 'His research and publications engage ethics, HIV/AIDS, education, peace, and reconciliation across the continent.', panel_caption: 'Scholarship in service of the institution.', sort_order: 0 },
    { id: 'strategy-1', page_key: 'strategy', eyebrow: 'Strategy', heading: "Africa University's Strategic Plan 2023-2027.", subheading: "Student access, staff investment, financial stewardship, partnerships, and internationalized research define the plan's five priorities.", panel_caption: 'Leading the plan from the front.', sort_order: 0 },
    { id: 'roadmap-1', page_key: 'roadmap', eyebrow: 'Roadmap', heading: "What's next for this platform.", subheading: "A transparent list of what's approved, what's in progress, and what's planned before public launch.", panel_caption: 'Building toward full launch.', sort_order: 0 },
    { id: 'contact-1', page_key: 'contact', eyebrow: 'Contact', heading: 'Reach the Office of the Vice Chancellor.', subheading: 'Official Africa University channels, plus a direct message form for signed-in visitors.', panel_caption: 'Open channels, real follow-up.', sort_order: 0 },
    { id: 'sources-1', page_key: 'sources', eyebrow: 'Sources', heading: 'Every claim on this site, traceable.', subheading: "Verified against Africa University's official site, UM News, and public coverage.", panel_caption: 'Built on public record, not guesswork.', sort_order: 0 },
  ],
  credentials: [
    { id: 'cred-1', label: 'Ph.D. in Theological Ethics, Garrett-Evangelical Theological Seminary, USA', sort_order: 0 },
    { id: 'cred-2', label: 'Master of Theological Studies, Garrett-Evangelical Theological Seminary, USA', sort_order: 1 },
    { id: 'cred-3', label: "Bachelor of Divinity, St Paul's United Theological College, Kenya", sort_order: 2 },
    { id: 'cred-4', label: 'Postgraduate certificate in African Studies, Northwestern University', sort_order: 3 },
  ],
  careerEntries: [
    { id: 'career-1', role: 'Vice Chancellor', place: 'Africa University, Zimbabwe', note: 'Leads the pan-African United Methodist-related institution as its fifth Vice Chancellor.', sort_order: 0 },
    { id: 'career-2', role: 'Deputy Vice Chancellor and Interim Vice Chancellor', place: 'Africa University', note: 'Served in senior academic leadership before his installation as Vice Chancellor.', sort_order: 1 },
    { id: 'career-3', role: 'Vice Chancellor and Professor of Ethics', place: 'University of Kigali, Rwanda', note: 'Advanced institutional leadership, academic quality, and ethical scholarship.', sort_order: 2 },
  ],
  publications: [
    { id: 'pub-1', title: 'Victim Theology', sort_order: 0 },
    { id: 'pub-2', title: 'Corporate and personal ethics for sustainable development', sort_order: 1 },
    { id: 'pub-3', title: 'Book Review: European Traditions in the Study of Religion in Africa', sort_order: 2 },
  ],
  researchThemes: ['Ethics', 'Theology', 'HIV/AIDS', 'Education', 'Peace', 'Reconciliation'].map((label, sort_order) => ({ id: 'theme-' + sort_order, label, sort_order })),
  strategyGoals: ['Enhance student access and success', 'Invest in and empower staff', 'Increase financial stewardship and institutional sustainability', 'Cultivate strategic partnerships and economic competitiveness', 'Internationalize research, teaching, and learning'].map((label, sort_order) => ({ id: 'goal-' + sort_order, label, sort_order })),
  sources: [
    { id: 'source-1', label: 'Africa University official Vice Chancellor profile', url: 'https://africau.edu/about/vice-chancellor/', sort_order: 0 },
    { id: 'source-2', label: 'UM News profile on Prof. Mageto', url: 'https://www.umnews.org/news/new-vice-chancellor-fulfills-calling-at-africa-university', sort_order: 1 },
    { id: 'source-3', label: 'Africa University 2023/27 Strategic Plan launch', url: 'https://aunews.africau.edu/africa-universitys-vice-chancellor-launches-2023-27-strategic-plan/', sort_order: 2 },
    { id: 'source-4', label: 'Africa University official contact page', url: 'https://africau.edu/about/contact-us/', sort_order: 3 },
  ],
  socialLinks: [{ id: 'social-1', platform: 'website', url: 'https://africau.edu/about/vice-chancellor/', sort_order: 0 }],
  activity: [],
};
globalThis.__MAGETO_PROFILE__ = profileFallback;

const REPEATABLE_TABLES = {
  credentials: { key: 'credentials', table: 'credentials', columns: ['label'] },
  'career-entries': { key: 'careerEntries', table: 'career_entries', columns: ['role', 'place', 'note'] },
  publications: { key: 'publications', table: 'publications', columns: ['title'] },
  'research-themes': { key: 'researchThemes', table: 'research_themes', columns: ['label'] },
  'strategy-goals': { key: 'strategyGoals', table: 'strategy_goals', columns: ['label'] },
  sources: { key: 'sources', table: 'sources_list', columns: ['label', 'url'] },
  'social-links': { key: 'socialLinks', table: 'social_links', columns: ['platform', 'url'] },
};

function toCamel(snake) { return snake.replace(/_([a-z])/g, (_, c) => c.toUpperCase()); }
function resolveTable(collection) { return REPEATABLE_TABLES[collection] || null; }
async function logActivity(dbRef, authorEmail, title, body) {
  const entry = { id: 'activity-' + Date.now(), title, body, author_email: authorEmail, created_at: new Date().toISOString() };
  profileFallback.activity.unshift(entry);
  if (!dbRef) return;
  try { await dbRef`insert into content_updates (title, body, author_email) values (${title}, ${body}, ${authorEmail})`; } catch (_error) {}
}

app.get('/api/profile', async (_req, res) => {
  if (!db) return res.json(profileFallback);
  const [profileRows, slides, credentialsRows, careerRows, pubRows, themeRows, goalRows, sourceRows, socialRows] = await Promise.all([
    db`select * from profile where id = 1`,
    db`select * from hero_slides order by page_key asc, sort_order asc`,
    db`select * from credentials order by sort_order asc`,
    db`select * from career_entries order by sort_order asc`,
    db`select * from publications order by sort_order asc`,
    db`select * from research_themes order by sort_order asc`,
    db`select * from strategy_goals order by sort_order asc`,
    db`select * from sources_list order by sort_order asc`,
    db`select * from social_links order by sort_order asc`,
  ]);
  res.json({ profile: profileRows[0] || profileFallback.profile, heroSlides: slides, credentials: credentialsRows, careerEntries: careerRows, publications: pubRows, researchThemes: themeRows, strategyGoals: goalRows, sources: sourceRows, socialLinks: socialRows });
});

app.get('/api/activity', verifyAdmin, async (_req, res) => {
  if (!db) return res.json({ activity: profileFallback.activity });
  const rows = await db`select * from content_updates order by created_at desc limit 25`;
  res.json({ activity: rows });
});

app.put('/api/profile', verifyAdmin, async (req, res) => {
  const body = req.body || {};
  if (!db) {
    profileFallback.profile = { ...profileFallback.profile, ...body, full_name: body.fullName || body.full_name || profileFallback.profile.full_name, phone_secondary: body.phoneSecondary || body.phone_secondary || profileFallback.profile.phone_secondary, portrait_url: body.portraitUrl || body.portrait_url || profileFallback.profile.portrait_url, logo_url: body.logoUrl || body.logo_url || profileFallback.profile.logo_url, updated_at: new Date().toISOString() };
    await logActivity(null, req.user.email, 'Updated profile', 'Core profile fields changed.');
    return res.json({ profile: profileFallback.profile });
  }
  const rows = await db`update profile set full_name = coalesce(${body.fullName}, full_name), title = coalesce(${body.title}, title), email = coalesce(${body.email}, email), phone = coalesce(${body.phone}, phone), phone_secondary = coalesce(${body.phoneSecondary}, phone_secondary), address = coalesce(${body.address}, address), portrait_url = coalesce(${body.portraitUrl}, portrait_url), logo_url = coalesce(${body.logoUrl}, logo_url), updated_at = now() where id = 1 returning *`;
  await logActivity(db, req.user.email, 'Updated profile', 'Core profile fields changed.');
  res.json({ profile: rows[0] });
});

app.post('/api/uploads', verifyAdmin, express.raw({ type: '*/*', limit: '8mb' }), async (req, res) => {
  const filename = String(req.query.filename || 'upload-' + Date.now());
  if (!process.env.BLOB_READ_WRITE_TOKEN) return res.status(503).json({ message: 'Blob storage not configured' });
  const blob = await put(filename, req.body, { access: 'public', addRandomSuffix: true });
  await logActivity(db, req.user.email, 'Uploaded an image', blob.url);
  res.status(201).json({ url: blob.url });
});

app.get('/api/hero-slides/:pageKey', async (req, res) => {
  const rows = db ? await db`select * from hero_slides where page_key = ${req.params.pageKey} order by sort_order asc` : profileFallback.heroSlides.filter((slide) => slide.page_key === req.params.pageKey);
  res.json({ heroSlides: rows });
});

app.post('/api/hero-slides/:pageKey', verifyAdmin, async (req, res) => {
  const slide = { id: 'slide-' + Date.now(), page_key: req.params.pageKey, sort_order: req.body.sortOrder ?? 0, eyebrow: req.body.eyebrow, heading: req.body.heading, subheading: req.body.subheading, body: req.body.body, panel_caption: req.body.panelCaption, background_image_url: req.body.backgroundImageUrl };
  if (!slide.heading) return res.status(400).json({ message: 'heading is required' });
  if (!db) { profileFallback.heroSlides.push(slide); await logActivity(null, req.user.email, 'Added banner slide', slide.heading); return res.status(201).json({ heroSlide: slide }); }
  const rows = await db`insert into hero_slides (page_key, eyebrow, heading, subheading, body, panel_caption, background_image_url, sort_order) values (${slide.page_key}, ${slide.eyebrow}, ${slide.heading}, ${slide.subheading}, ${slide.body}, ${slide.panel_caption}, ${slide.background_image_url}, ${slide.sort_order}) returning *`;
  await logActivity(db, req.user.email, 'Added banner slide', slide.heading);
  res.status(201).json({ heroSlide: rows[0] });
});

app.put('/api/:collection/:id', verifyAdmin, async (req, res, next) => {
  const cfg = resolveTable(req.params.collection);
  if (!cfg) return next();
  const values = cfg.columns.map((col) => req.body[toCamel(col)] ?? req.body[col]);
  if (!db) {
    const item = profileFallback[cfg.key].find((row) => row.id === req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    cfg.columns.forEach((col, index) => { item[col] = values[index]; });
    await logActivity(null, req.user.email, 'Edited ' + req.params.collection + ' item', String(values[0] || req.params.id));
    return res.json({ item });
  }
  const setClauses = cfg.columns.map((col, i) => col + ' = $' + (i + 1));
  const rows = await db.query('update ' + cfg.table + ' set ' + setClauses.join(', ') + ' where id = $' + (values.length + 1) + ' returning *', [...values, req.params.id]);
  if (!rows[0]) return res.status(404).json({ message: 'Not found' });
  await logActivity(db, req.user.email, 'Edited ' + req.params.collection + ' item', String(values[0] || req.params.id));
  res.json({ item: rows[0] });
});

app.post('/api/:collection', verifyAdmin, async (req, res, next) => {
  const cfg = resolveTable(req.params.collection);
  if (!cfg) return next();
  const values = cfg.columns.map((col) => req.body[toCamel(col)] ?? req.body[col]);
  if (values.some((value) => value == null || value === '')) return res.status(400).json({ message: cfg.columns.join(', ') + ' are required' });
  if (!db) {
    const item = { id: req.params.collection + '-' + Date.now(), sort_order: profileFallback[cfg.key].length };
    cfg.columns.forEach((col, index) => { item[col] = values[index]; });
    profileFallback[cfg.key].push(item);
    await logActivity(null, req.user.email, 'Added ' + req.params.collection + ' item', String(values[0]));
    return res.status(201).json({ item });
  }
  const placeholders = cfg.columns.map((_, i) => '$' + (i + 1));
  const rows = await db.query('insert into ' + cfg.table + ' (' + cfg.columns.join(', ') + ') values (' + placeholders.join(', ') + ') returning *', values);
  await logActivity(db, req.user.email, 'Added ' + req.params.collection + ' item', String(values[0]));
  res.status(201).json({ item: rows[0] });
});

app.delete('/api/:collection/:id', verifyAdmin, async (req, res, next) => {
  const cfg = resolveTable(req.params.collection);
  if (!cfg) return next();
  if (!db) {
    const before = profileFallback[cfg.key].length;
    profileFallback[cfg.key] = profileFallback[cfg.key].filter((row) => row.id !== req.params.id);
    if (profileFallback[cfg.key].length === before) return res.status(404).json({ message: 'Not found' });
    await logActivity(null, req.user.email, 'Deleted ' + req.params.collection + ' item', req.params.id);
    return res.json({ deleted: true });
  }
  const rows = await db.query('delete from ' + cfg.table + ' where id = $1 returning id', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ message: 'Not found' });
  await logActivity(db, req.user.email, 'Deleted ' + req.params.collection + ' item', req.params.id);
  res.json({ deleted: true });
});

export default app;

if (process.env.RUN_API_SERVER === 'true') {
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`Prof. Mageto API listening on ${port}`));
}
