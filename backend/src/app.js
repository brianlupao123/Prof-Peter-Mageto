import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { neon } from '@neondatabase/serverless';
import { put } from '@vercel/blob';

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '200kb' }));

const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_EMAIL = String(process.env.ADMIN_EMAIL || '').toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_PASSWORD_HASH = ADMIN_PASSWORD ? bcrypt.hashSync(ADMIN_PASSWORD, 10) : null;
if (!JWT_SECRET) console.warn('[AUTH] JWT_SECRET is not configured; authentication routes will refuse requests.');
let db = null;
if (process.env.DATABASE_URL) {
  try {
    db = neon(process.env.DATABASE_URL);
  } catch (e) {
    console.warn('[DB] Invalid DATABASE_URL — falling back to runtime memory mode:', e.message);
  }
}

const runtime = globalThis.__MAGETO_RUNTIME__ || { users: [], messages: [], contentUpdates: [], pageLikes: {}, rate: new Map() };
runtime.pageLikes ||= {};
globalThis.__MAGETO_RUNTIME__ = runtime;

const siteSettings = {
  siteName: 'The Peter Mageto Leadership Portfolio',
  profileName: 'Rev. Professor Peter Mageto',
  title: 'Fifth Vice Chancellor of Africa University',
  institution: 'Africa University',
  status: 'Full-stack client review build',
  storage: db ? 'neon-postgres' : 'runtime-memory',
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
  if (record.resetAt < now) { record.count = 0; record.resetAt = now + windowMs; }
  record.count += 1;
  runtime.rate.set(key, record);
  if (record.count > max) return res.status(429).json({ message: 'Too many requests. Please wait a moment before trying again.' });
  next();
}

app.use('/api', limitRequests);

function signUser(user) {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is required for authentication');
  const token = jwt.sign({ id: user.id, email: user.email, isAdmin: Boolean(user.isAdmin) }, JWT_SECRET, { expiresIn: '1d' });
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
    res.status(401).json({ message: 'Invalid or expired token. Please sign in again.' });
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
  return { id: row.id, name: row.name, email: row.email, subject: row.subject, message: row.message, status: row.status, source: row.source, createdAt: row.created_at || row.createdAt };
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
  if (!isValidEmail(email)) return res.status(400).json({ message: 'Please enter a valid email address' });

  if (db) {
    const rows = await db`select id, email, name, password_hash, is_admin from users where email = ${email} limit 1`;
    const user = rows[0];
    if (user && await bcrypt.compare(password, user.password_hash)) return res.json(signUser(publicUser(user)));
  }

  if (ADMIN_EMAIL && ADMIN_PASSWORD_HASH && email === ADMIN_EMAIL && await bcrypt.compare(password, ADMIN_PASSWORD_HASH)) {
    return res.json(signUser({ id: 'admin-prof-mageto', email, name: 'Prof. Mageto Admin', isAdmin: true }));
  }

  const user = runtime.users.find((item) => item.email === email);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ message: 'Invalid credentials. Please check your email and password.' });
  res.json(signUser({ id: user.id, email: user.email, name: user.name, isAdmin: false }));
});

app.post('/api/auth/register', (_req, res) => {
  res.status(404).json({ message: 'Public registration is disabled for this portfolio.' });
});

// Change password — admin can change their own password
app.put('/api/auth/password', verifyAdmin, async (req, res) => {
  const currentPassword = String(req.body.currentPassword || '');
  const newPassword = String(req.body.newPassword || '');
  if (!currentPassword || newPassword.length < 8) {
    return res.status(400).json({ message: 'Current password and a new password of at least 8 characters are required' });
  }

  // Verify current password
  const isEnvAdmin = req.user.id === 'admin-prof-mageto';
  if (isEnvAdmin) {
    const valid = ADMIN_PASSWORD_HASH && await bcrypt.compare(currentPassword, ADMIN_PASSWORD_HASH);
    if (!valid) return res.status(401).json({ message: 'Current password is incorrect' });
    // For env-var admin: store new hash in runtime for session duration only
    // The actual persistent change requires updating the ADMIN_PASSWORD env var in Vercel
    return res.json({ success: true, message: 'Password verified. To permanently change the admin password, update ADMIN_PASSWORD in your Vercel environment variables.' });
  }

  if (db) {
    const rows = await db`select password_hash from users where id = ${req.user.id} limit 1`;
    if (!rows[0]) return res.status(404).json({ message: 'User not found' });
    const valid = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!valid) return res.status(401).json({ message: 'Current password is incorrect' });
    const newHash = await bcrypt.hash(newPassword, 10);
    await db`update users set password_hash = ${newHash}, updated_at = now() where id = ${req.user.id}`;
    await logActivity(db, req.user.email, 'Changed password', 'Admin password updated successfully');
    return res.json({ success: true, message: 'Password changed successfully' });
  }

  res.status(503).json({ message: 'Database not configured' });
});

async function notifyNewMessage({ name, email, subject, message }) {
  if (!process.env.RESEND_API_KEY || !process.env.NOTIFY_EMAIL) return { skipped: true };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500);
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      signal: controller.signal,
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.NOTIFY_FROM_EMAIL || 'Portfolio <onboarding@resend.dev>',
        to: process.env.NOTIFY_EMAIL,
        subject: `New enquiry: ${subject}`,
        text: `From: ${name} <${email}>\n\n${message}`,
      }),
    });
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown Resend error');
      console.warn('[EMAIL] Notification failed:', response.status, errorText.slice(0, 240));
      return { sent: false, status: response.status };
    }
    return { sent: true };
  } catch (error) {
    console.warn('[EMAIL] Notification failed:', error.message);
    return { sent: false, error: error.message };
  } finally {
    clearTimeout(timeout);
  }
}
app.post('/api/contact', async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const subject = String(req.body.subject || 'Portfolio enquiry').trim();
  const message = String(req.body.message || req.body.body || '').trim();
  if (!name || !email || !message) return res.status(400).json({ message: 'Name, email and message are required' });
  if (!isValidEmail(email)) return res.status(400).json({ message: 'Please enter a valid email address' });


  if (db) {
    const rows = await db`insert into messages (name, email, subject, message, source) values (${name}, ${email}, ${subject}, ${message}, 'prof-mageto-portfolio') returning *`;
    notifyNewMessage({ name, email, subject, message });
    return res.status(201).json({ success: true, message: 'Message received. The office will be in touch.', data: normalizeMessage(rows[0]) });
  }

  const item = { id: 'msg-' + Date.now(), name, email, subject, message, status: 'new', source: 'prof-mageto-portfolio', createdAt: new Date().toISOString() };
  runtime.messages.unshift(item);
  res.status(201).json({ success: true, message: 'Message received. The office will be in touch.', data: item });
});

app.get('/api/messages', verifyAdmin, async (_req, res) => {
  if (db) {
    const rows = await db`select * from messages order by created_at desc limit 200`;
    return res.json({ messages: rows.map(normalizeMessage) });
  }
  res.json({ messages: runtime.messages });
});

const VALID_MESSAGE_STATUSES = ['new', 'read', 'replied', 'resolved', 'archived'];

app.patch('/api/messages/:id/status', verifyAdmin, async (req, res) => {
  const status = String(req.body.status || '').trim().toLowerCase();
  if (!VALID_MESSAGE_STATUSES.includes(status)) return res.status(400).json({ message: 'Invalid status. Must be one of: ' + VALID_MESSAGE_STATUSES.join(', ') });
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


app.get('/api/likes/:pageKey', async (req, res) => {
  const pageKey = String(req.params.pageKey || '').trim().toLowerCase();
  if (!pageKey) return res.status(400).json({ message: 'Page key is required' });
  if (db) {
    const rows = await db`select count from page_likes where page_key = ${pageKey} limit 1`;
    return res.json({ count: rows[0]?.count || 0 });
  }
  res.json({ count: runtime.pageLikes[pageKey] || 0 });
});

app.post('/api/likes/:pageKey', async (req, res) => {
  const pageKey = String(req.params.pageKey || '').trim().toLowerCase();
  if (!pageKey) return res.status(400).json({ message: 'Page key is required' });
  if (db) {
    const rows = await db`
      insert into page_likes (page_key, count) values (${pageKey}, 1)
      on conflict (page_key) do update set count = page_likes.count + 1
      returning count
    `;
    return res.json({ count: rows[0].count });
  }
  runtime.pageLikes[pageKey] = (runtime.pageLikes[pageKey] || 0) + 1;
  res.json({ count: runtime.pageLikes[pageKey] });
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
    { id: 'overview-1', page_key: 'overview', eyebrow: 'Africa University Vice Chancellor', heading: 'Rev. Professor Peter Mageto', subheading: 'The fifth Vice Chancellor of Africa University, a theological ethics scholar and institutional leader advancing pan-African education through justice, equity, collaboration, and student-centered transformation.', panel_caption: 'Leadership anchored in people and values.', background_image_url: null, sort_order: 0 },
    { id: 'leadership-1', page_key: 'leadership', eyebrow: 'Leadership', heading: 'Institutional leadership across higher education and ministry.', subheading: "Prof. Mageto's public leadership story connects ethics, formation, academic quality, student welfare, and pan-African mission.", panel_caption: "Guiding Africa University's mission and people.", background_image_url: null, sort_order: 0 },
    { id: 'scholarship-1', page_key: 'scholarship', eyebrow: 'Scholarship', heading: 'Academic foundation in theology, ethics, and African studies.', subheading: 'His research and publications engage ethics, HIV/AIDS, education, peace, and reconciliation across the continent.', panel_caption: 'Scholarship in service of the institution.', background_image_url: null, sort_order: 0 },
    { id: 'strategy-1', page_key: 'strategy', eyebrow: 'Strategy', heading: "Africa University's Strategic Plan 2023–2027.", subheading: "Student access, staff investment, financial stewardship, partnerships, and internationalized research define the plan's five priorities.", panel_caption: 'Leading the plan from the front.', background_image_url: null, sort_order: 0 },
    { id: 'roadmap-1', page_key: 'roadmap', eyebrow: 'Roadmap', heading: "What's next for this platform.", subheading: "A transparent list of what's approved, what's in progress, and what's planned before public launch.", panel_caption: 'Building toward full launch.', background_image_url: null, sort_order: 0 },
    { id: 'contact-1', page_key: 'contact', eyebrow: 'Contact', heading: 'Reach the Office of the Vice Chancellor.', subheading: 'Official Africa University channels, plus a direct message form for signed-in visitors.', panel_caption: 'Open channels, real follow-up.', background_image_url: null, sort_order: 0 },
    { id: 'sources-1', page_key: 'sources', eyebrow: 'Sources', heading: 'Every claim on this site, traceable.', subheading: "Verified against Africa University's official site, UM News, and public coverage.", panel_caption: 'Built on public record, not guesswork.', background_image_url: null, sort_order: 0 },
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
    { id: 'career-4', role: 'Academic Leader and Ethics Scholar', place: 'Kenya Methodist University, Daystar University, University of Evansville', note: 'Held roles across academic affairs, student welfare, ethics teaching, and departmental leadership.', sort_order: 3 },
  ],
  publications: [
    { id: 'pub-1', title: 'Victim Theology', sort_order: 0 },
    { id: 'pub-2', title: 'Corporate and personal ethics for sustainable development', sort_order: 1 },
    { id: 'pub-3', title: 'Book Review: European Traditions in the Study of Religion in Africa', sort_order: 2 },
  ],
  researchThemes: ['Ethics', 'Theology', 'HIV/AIDS', 'Education', 'Peace', 'Reconciliation'].map((label, sort_order) => ({ id: 'theme-' + sort_order, label, sort_order })),
  strategyGoals: [
    'Enhance student access and success',
    'Invest in and empower staff',
    'Increase financial stewardship and institutional sustainability',
    'Cultivate strategic partnerships and economic competitiveness',
    'Internationalize research, teaching, and learning',
  ].map((label, sort_order) => ({ id: 'goal-' + sort_order, label, sort_order })),
  sources: [
    { id: 'source-1', label: 'Africa University official Vice Chancellor profile', url: 'https://africau.edu/about/vice-chancellor/', sort_order: 0 },
    { id: 'source-2', label: 'UM News profile on Prof. Mageto', url: 'https://www.umnews.org/news/new-vice-chancellor-fulfills-calling-at-africa-university', sort_order: 1 },
    { id: 'source-3', label: 'Africa University 2023/27 Strategic Plan launch', url: 'https://aunews.africau.edu/africa-universitys-vice-chancellor-launches-2023-27-strategic-plan/', sort_order: 2 },
    { id: 'source-4', label: 'Africa University official contact page', url: 'https://africau.edu/about/contact-us/', sort_order: 3 },
  ],
  socialLinks: [
    { id: 'social-1', platform: 'linkedin', url: 'https://www.linkedin.com/in/peter-mageto', sort_order: 0 },
    { id: 'social-2', platform: 'website', url: 'https://africau.edu/about/vice-chancellor/', sort_order: 1 },
  ],
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
  if (profileFallback.activity.length > 50) profileFallback.activity = profileFallback.activity.slice(0, 50);
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
  res.json({
    profile: profileRows[0] || profileFallback.profile,
    heroSlides: slides,
    credentials: credentialsRows,
    careerEntries: careerRows,
    publications: pubRows,
    researchThemes: themeRows,
    strategyGoals: goalRows,
    sources: sourceRows,
    socialLinks: socialRows,
  });
});

app.get('/api/activity', verifyAdmin, async (_req, res) => {
  if (!db) return res.json({ activity: profileFallback.activity });
  const rows = await db`select * from content_updates order by created_at desc limit 25`;
  res.json({ activity: rows });
});

app.put('/api/profile', verifyAdmin, async (req, res) => {
  const body = req.body || {};
  if (!db) {
    profileFallback.profile = {
      ...profileFallback.profile,
      full_name: body.fullName || body.full_name || profileFallback.profile.full_name,
      title: body.title || profileFallback.profile.title,
      email: body.email !== undefined ? body.email : profileFallback.profile.email,
      phone: body.phone !== undefined ? body.phone : profileFallback.profile.phone,
      phone_secondary: body.phoneSecondary !== undefined ? body.phoneSecondary : profileFallback.profile.phone_secondary,
      address: body.address !== undefined ? body.address : profileFallback.profile.address,
      portrait_url: body.portraitUrl !== undefined ? body.portraitUrl : profileFallback.profile.portrait_url,
      logo_url: body.logoUrl !== undefined ? body.logoUrl : profileFallback.profile.logo_url,
      updated_at: new Date().toISOString(),
    };
    await logActivity(null, req.user.email, 'Updated profile', 'Core profile fields changed.');
    return res.json({ profile: profileFallback.profile });
  }
  const rows = await db`
    update profile set
      full_name = coalesce(${body.fullName}, full_name),
      title = coalesce(${body.title}, title),
      email = coalesce(${body.email}, email),
      phone = coalesce(${body.phone}, phone),
      phone_secondary = coalesce(${body.phoneSecondary}, phone_secondary),
      address = coalesce(${body.address}, address),
      portrait_url = coalesce(${body.portraitUrl}, portrait_url),
      logo_url = coalesce(${body.logoUrl}, logo_url),
      updated_at = now()
    where id = 1
    returning *
  `;
  await logActivity(db, req.user.email, 'Updated profile', 'Core profile fields changed.');
  res.json({ profile: rows[0] });
});

app.post('/api/uploads', verifyAdmin, express.raw({ type: '*/*', limit: '8mb' }), async (req, res) => {
  const filename = String(req.query.filename || 'upload-' + Date.now());
  if (!process.env.BLOB_READ_WRITE_TOKEN) return res.status(503).json({ message: 'Blob storage not configured. Add BLOB_READ_WRITE_TOKEN in Vercel settings.' });
  const blob = await put(filename, req.body, { access: 'public', addRandomSuffix: true });
  await logActivity(db, req.user.email, 'Uploaded an image', blob.url);
  res.status(201).json({ url: blob.url });
});

// Hero slide routes
const VALID_PAGE_KEYS = ['overview', 'leadership', 'scholarship', 'strategy', 'roadmap', 'contact', 'sources'];

app.get('/api/hero-slides/:pageKey', async (req, res) => {
  const { pageKey } = req.params;
  if (!VALID_PAGE_KEYS.includes(pageKey)) return res.status(400).json({ message: 'Unknown page key' });
  if (!db) return res.json({ heroSlides: profileFallback.heroSlides.filter((s) => s.page_key === pageKey) });
  const rows = await db`select * from hero_slides where page_key = ${pageKey} order by sort_order asc`;
  res.json({ heroSlides: rows });
});

app.post('/api/hero-slides/:pageKey', verifyAdmin, async (req, res) => {
  const { pageKey } = req.params;
  if (!VALID_PAGE_KEYS.includes(pageKey)) return res.status(400).json({ message: 'Unknown page key' });
  const body = req.body || {};
  const eyebrow = body.eyebrow;
  const heading = body.heading;
  const subheading = body.subheading;
  const bodyText = body.body;
  const panelCaption = body.panelCaption ?? body.panel_caption;
  const backgroundImageUrl = body.backgroundImageUrl ?? body.background_image_url;
  const sortOrder = body.sortOrder ?? body.sort_order;
  const ctaLabel = body.ctaLabel ?? body.cta_label;
  const ctaHref = body.ctaHref ?? body.cta_href;
  const focalPosition = body.focalPosition ?? body.focal_position ?? 'center center';
  const overlayStrength = body.overlayStrength ?? body.overlay_strength ?? 68;
  const cardVisibility = body.cardVisibility ?? body.card_visibility ?? true;

  if (!heading) return res.status(400).json({ message: 'heading is required' });
  const slide = { id: 'slide-' + Date.now(), page_key: pageKey, eyebrow, heading, subheading, body: bodyText, panel_caption: panelCaption, background_image_url: backgroundImageUrl, cta_label: ctaLabel, cta_href: ctaHref, sort_order: sortOrder ?? 0, focal_position: focalPosition, overlay_strength: overlayStrength, card_visibility: cardVisibility };
  if (!db) {
    profileFallback.heroSlides.push(slide);
    await logActivity(null, req.user.email, `Added banner slide (${pageKey})`, heading);
    return res.status(201).json({ heroSlide: slide });
  }
  const rows = await db`
    insert into hero_slides (page_key, eyebrow, heading, subheading, body, panel_caption, background_image_url, cta_label, cta_href, sort_order, focal_position, overlay_strength, card_visibility)
    values (${pageKey}, ${eyebrow}, ${heading}, ${subheading}, ${bodyText}, ${panelCaption}, ${backgroundImageUrl}, ${ctaLabel}, ${ctaHref}, ${sortOrder ?? 0}, ${focalPosition}, ${overlayStrength}, ${cardVisibility})
    returning *
  `;
  await logActivity(db, req.user.email, `Added banner slide (${pageKey})`, heading);
  res.status(201).json({ heroSlide: rows[0] });
});

app.put('/api/hero-slides/:pageKey/:id', verifyAdmin, async (req, res) => {
  const { pageKey, id } = req.params;
  if (!VALID_PAGE_KEYS.includes(pageKey)) return res.status(400).json({ message: 'Unknown page key' });
  const body = req.body || {};
  const eyebrow = body.eyebrow;
  const heading = body.heading;
  const subheading = body.subheading;
  const bodyText = body.body;
  const panelCaption = body.panelCaption ?? body.panel_caption;
  const backgroundImageUrl = body.backgroundImageUrl ?? body.background_image_url;
  const sortOrder = body.sortOrder ?? body.sort_order;
  const ctaLabel = body.ctaLabel ?? body.cta_label;
  const ctaHref = body.ctaHref ?? body.cta_href;
  const focalPosition = body.focalPosition ?? body.focal_position;
  const overlayStrength = body.overlayStrength ?? body.overlay_strength;
  const cardVisibility = body.cardVisibility ?? body.card_visibility;

  if (!db) {
    const slide = profileFallback.heroSlides.find((item) => item.id === id && item.page_key === pageKey);
    if (!slide) return res.status(404).json({ message: 'Slide not found' });
    if (eyebrow !== undefined) slide.eyebrow = eyebrow;
    if (heading !== undefined) slide.heading = heading;
    if (subheading !== undefined) slide.subheading = subheading;
    if (bodyText !== undefined) slide.body = bodyText;
    if (panelCaption !== undefined) slide.panel_caption = panelCaption;
    if (backgroundImageUrl !== undefined) slide.background_image_url = backgroundImageUrl;
    if (ctaLabel !== undefined) slide.cta_label = ctaLabel;
    if (ctaHref !== undefined) slide.cta_href = ctaHref;
    if (sortOrder !== undefined) slide.sort_order = sortOrder;
    if (focalPosition !== undefined) slide.focal_position = focalPosition;
    if (overlayStrength !== undefined) slide.overlay_strength = overlayStrength;
    if (cardVisibility !== undefined) slide.card_visibility = cardVisibility;
    await logActivity(null, req.user.email, `Edited banner slide (${pageKey})`, slide.heading);
    return res.json({ heroSlide: slide });
  }
  const rows = await db`
    update hero_slides set
      eyebrow = coalesce(${eyebrow}, eyebrow),
      heading = coalesce(${heading}, heading),
      subheading = coalesce(${subheading}, subheading),
      body = coalesce(${bodyText}, body),
      panel_caption = coalesce(${panelCaption}, panel_caption),
      background_image_url = coalesce(${backgroundImageUrl}, background_image_url),
      cta_label = coalesce(${ctaLabel}, cta_label),
      cta_href = coalesce(${ctaHref}, cta_href),
      sort_order = coalesce(${sortOrder}, sort_order),
      focal_position = coalesce(${focalPosition}, focal_position),
      overlay_strength = coalesce(${overlayStrength}, overlay_strength),
      card_visibility = coalesce(${cardVisibility}, card_visibility)
    where id = ${id} and page_key = ${pageKey}
    returning *
  `;
  if (!rows[0]) return res.status(404).json({ message: 'Slide not found' });
  await logActivity(db, req.user.email, `Edited banner slide (${pageKey})`, rows[0].heading);
  res.json({ heroSlide: rows[0] });
});
app.delete('/api/hero-slides/:pageKey/:id', verifyAdmin, async (req, res) => {
  const { pageKey, id } = req.params;
  if (!VALID_PAGE_KEYS.includes(pageKey)) return res.status(400).json({ message: 'Unknown page key' });
  if (!db) {
    const before = profileFallback.heroSlides.length;
    profileFallback.heroSlides = profileFallback.heroSlides.filter((s) => !(s.id === id && s.page_key === pageKey));
    if (profileFallback.heroSlides.length === before) return res.status(404).json({ message: 'Slide not found' });
    await logActivity(null, req.user.email, `Deleted banner slide (${pageKey})`, id);
    return res.json({ deleted: true });
  }
  const rows = await db`delete from hero_slides where id = ${id} and page_key = ${pageKey} returning id`;
  if (!rows[0]) return res.status(404).json({ message: 'Slide not found' });
  await logActivity(db, req.user.email, `Deleted banner slide (${pageKey})`, id);
  res.json({ deleted: true });
});

// Generic repeatable collection CRUD
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

// Final API 404 fallback — must be after all other routes
app.use('/api', (_req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

export default app;

if (process.env.RUN_API_SERVER === 'true') {
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`Prof. Mageto API listening on ${port}`));
}




