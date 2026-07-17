# Peter Mageto Portfolio — Final Build Prompt
## Banner System + Full Profile CRUD + Site Polish (Complete, IDE-Ready)

**Paste this whole document to your IDE coding agent (Claude Code, Cursor,
etc.) as the task brief.** It is grounded in the real code in
`brianlupao123/Prof-Peter-Mageto` (confirmed by unzipping and reading the
actual files — not guessed). It replaces every earlier draft. When
finished, Prof. Mageto's only ongoing job on this site is: **sign in, then
Create, Read, Update, and Delete his own content.** Everything else —
layout, security, auth, branding, dark mode, image handling — is built and
should not require another developer conversation.

---

## 0. READ FIRST — a real security issue, unrelated to the banner work

Confirmed in the current repo:

- `frontend/src/data/profileData.js` exports `ADMIN_PASSWORD = 'Test@123'`
  as a plain string.
- `frontend/src/App.jsx` imports it and uses it as a client-side login
  fallback inside `signIn()`.
- `frontend/src/pages/Access.jsx` currently has the ability to be
  pre-filled with these exported constants.

Because `frontend/` is a Vite app, everything in `profileData.js` ships
inside the public JS bundle — readable by anyone who opens dev tools on
the live site. **This is a genuine credential leak on a client's public
site, not a style nitpick. Fix it first, before anything else in this
document.**

Fix (Step 1 below): remove the password from frontend code entirely, let
`Access.jsx` start with blank fields, and rely solely on `ADMIN_EMAIL` /
`ADMIN_PASSWORD` environment variables that `backend/src/app.js` already
reads server-side. **Rotate the password** once this ships — treat
`Test@123` as permanently compromised.

---

## 1. What's actually in the repo right now (confirmed against the real files)

- **Stack:** Vite + React 18 + react-router-dom, Express backend, deployed
  on Vercel. `api/index.js` re-exports the whole Express app from
  `backend/src/app.js`, and `api/[...path].js` re-exports `api/index.js` —
  **every** `/api/*` route, including ones you haven't written yet,
  already reaches `backend/src/app.js` with zero new wrapper files. You do
  not need to add files under `api/` for anything below.
- **Data layer today:** Postgres via `@neondatabase/serverless`, used only
  for `users`, `messages`, `content_updates` (`backend/schema.sql`).
  Everything else — bio, credentials, career timeline, publications,
  strategy goals, sources, roadmap, nav labels, and now social links and
  logo/theme settings — is either hardcoded in
  `frontend/src/data/profileData.js` or literal JSX inside each page. All
  of it is migrating to the database in this document, so Prof. Mageto can
  edit it without a redeploy.
- **Banners today:** no shared `PageBanner` component exists.
  `Home.jsx` has its own `.hero` + `<PortraitPanel />`; the other six
  pages open with a plain `<section className="page-hero">`, no portrait
  card. "Same structure on all 7 pages" is a feature to build.
- **Heading levels today:** `Home.jsx` correctly uses `<h1>`, but
  `Leadership.jsx`, `Scholarship.jsx`, `Roadmap.jsx`, `Sources.jsx`,
  `Access.jsx`, and `Dashboard.jsx` also use `<h1>`. Only Overview should.
- **Layout today:** `.page-section, .page-band, .page-hero { width:
  min(1180px, calc(100% - 2rem)); margin: 0 auto; }` — a centered,
  max-width container. Banners need a full-bleed override.
- **Auth today:** `POST /api/auth/login` already supports a real Postgres
  `users` row *and* a hardcoded env-var admin fallback with bcrypt.
  `verifyAdmin` middleware already exists — reuse it for every new route.
- **Footer today (`Layout.jsx`):** plain text — site name and an address
  line. **No social links, no logo graphic, nothing editable.** This is
  addressed in Section 12.
- **Dark mode today (`styles.css`):** real CSS variables already exist
  (`--bg`, `--surface`, `--surface-strong`, `--text`, `--muted`, `--line`,
  `--brand`, etc.) and `:root[data-theme="dark"]` already redefines them —
  so the *mechanism* is sound. The problem the client is flagging is that
  several components don't consume the tokens consistently (flat imagery,
  low-contrast overlays, cards that don't gain depth in dark mode). Section
  13 fixes this properly rather than just swapping one background colour.
- **`profileData.js` also holds `SITE_NAME` and `navItems`** — site
  chrome, not "profile content," stays hardcoded.

---

## 2. Build order

Each step depends on the one before it working. Do not skip ahead.

1. **Security fix** (§3) — independent, do it first.
2. **Schema migration** (§4) — additive only, adds `social_links` and
   `logo_url`/theme columns alongside the original profile tables.
3. **Seed script** (§5) — moves current hardcoded content, social links,
   and roadmap into the DB so nothing goes blank on cutover.
4. **Backend routes** (§6) — one generic CRUD handler + profile /
   hero-slide / social-link / upload / activity-log endpoints.
5. **Frontend data layer** (§7) — `useProfile()` hook + `lib/api.js`.
6. **Auth hardening** (§8) — session expiry handling, activity logging,
   removal of the last hardcoded-credential path.
7. **`PageBanner` component + CSS**, multi-image rotation support (§9).
8. **Rewire all 7 pages** to consume `useProfile()` + `<PageBanner />`
   (§10).
9. **Logo component** (§11).
10. **Footer redesign with live, editable social links** (§12).
11. **Real dark mode** (§13).
12. **Admin dashboard: visible CRUD + inline "edit on the page" mode**
    (§14).
13. **Image sourcing policy — read before touching any real photo** (§15).
14. **Env vars + deploy checklist** (§16).

---

## 3. Step 1 — Remove the exposed admin password from the frontend bundle

**`frontend/src/data/profileData.js`** — delete these two lines entirely:
```js
export const ADMIN_EMAIL = 'profmagteo@gmail.com';
export const ADMIN_PASSWORD = 'Test@123';
```

**`frontend/src/App.jsx`** — remove the import and the local-fallback
branch in `signIn`, so it relies only on the real API:
```js
// remove: import { ADMIN_EMAIL, ADMIN_PASSWORD } from './data/profileData.js';

const signIn = async (email, password) => {
  const normalizedEmail = String(email).trim().toLowerCase();
  const payload = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: normalizedEmail, password }),
  });
  const nextSession = { token: payload.token, email: payload.user?.email || normalizedEmail };
  setSession(nextSession);
  localStorage.setItem('pm-token', nextSession.token);
  localStorage.setItem('pm-email', nextSession.email);
  return nextSession;
};
```

**`frontend/src/pages/Access.jsx`** — start blank, don't import the
removed constants:
```js
// remove: import { ADMIN_EMAIL, ADMIN_PASSWORD } from '../data/profileData.js';
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
```

After this ships: rotate `ADMIN_PASSWORD` in Vercel's environment
variables to a new value and re-run `npm run seed:admin` against
production `DATABASE_URL` if a real `users` row is in use.

---

## 4. Step 2 — Schema migration (additive, safe to run on the live DB)

Append to `backend/schema.sql` (do not remove existing tables):

```sql
-- ============================================================
-- Profile CRUD system — additive migration, does not touch
-- users / messages / content_updates
-- ============================================================

create table if not exists profile (
  id integer primary key default 1,
  full_name text not null default 'Rev. Professor Peter Mageto',
  title text not null default 'Fifth Vice Chancellor of Africa University',
  email text,
  phone text,
  phone_secondary text,
  address text,
  portrait_url text,
  logo_url text,             -- optional custom logo image; falls back to the built-in SVG monogram
  updated_at timestamptz not null default now(),
  constraint profile_single_row check (id = 1)
);
insert into profile (id) values (1) on conflict (id) do nothing;

create table if not exists hero_slides (
  page_key text not null,     -- 'overview' | 'leadership' | 'scholarship' |
                               -- 'strategy' | 'roadmap' | 'contact' | 'sources'
  eyebrow text,
  heading text not null,
  subheading text,
  body text,
  panel_caption text,
  background_image_url text,
  sort_order integer not null default 0,
  id uuid primary key default gen_random_uuid()
);
-- a page can have MORE THAN ONE slide (rotation); sort_order decides the sequence
create index if not exists idx_hero_slides_page on hero_slides (page_key, sort_order);

create table if not exists credentials (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  sort_order integer not null default 0
);

create table if not exists career_entries (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  place text not null,
  note text,
  sort_order integer not null default 0
);

create table if not exists publications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  sort_order integer not null default 0
);

create table if not exists research_themes (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  sort_order integer not null default 0
);

create table if not exists strategy_goals (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  sort_order integer not null default 0
);

create table if not exists sources_list (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  url text not null,
  sort_order integer not null default 0
);

-- NEW: live, editable footer social links
create table if not exists social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null,     -- 'linkedin' | 'twitter' | 'facebook' | 'youtube' | 'instagram' | 'website' | custom
  url text not null,
  sort_order integer not null default 0
);

create index if not exists idx_credentials_sort on credentials (sort_order);
create index if not exists idx_career_sort on career_entries (sort_order);
create index if not exists idx_publications_sort on publications (sort_order);
create index if not exists idx_research_sort on research_themes (sort_order);
create index if not exists idx_strategy_sort on strategy_goals (sort_order);
create index if not exists idx_sources_sort on sources_list (sort_order);
create index if not exists idx_social_links_sort on social_links (sort_order);
```

**Change from the earlier draft:** `hero_slides` is no longer keyed
`page_key primary key` — it now allows multiple rows per `page_key` so a
banner can rotate through several real photos once Prof. Mageto uploads
them (see §9 and §15). `page_key + sort_order` is the ordering key
instead. Update every reference to "the hero slide" to "the hero slides
for that page" accordingly (already done in §5–§10 below).

> Table naming note kept from the prior draft: it's `sources_list`, not
> `sources` — avoids colliding with the frontend `sources` variable name
> already used in `Sources.jsx`.

Run it against `DATABASE_URL` with whatever the project already uses
(psql, Neon SQL editor, or the inline script below if there's no
preferred method yet):

```bash
node -e "
import('@neondatabase/serverless').then(async ({ neon }) => {
  const fs = await import('fs');
  const sql = neon(process.env.DATABASE_URL);
  const full = fs.readFileSync('backend/schema.sql', 'utf8');
  for (const stmt of full.split(';').map(s => s.trim()).filter(Boolean)) {
    await sql.query(stmt);
  }
  console.log('schema applied');
});
"
```

---

## 5. Step 3 — Seed script: migrate existing content into the DB

New file **`backend/scripts/seed-profile.mjs`**:

```js
import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is required to seed profile content.');
  process.exit(1);
}
const sql = neon(databaseUrl);

// --- singleton profile ---
await sql`
  update profile set
    full_name = 'Rev. Professor Peter Mageto',
    title = 'Fifth Vice Chancellor of Africa University',
    email = ${process.env.PROFILE_EMAIL || null},
    phone = ${process.env.PROFILE_PHONE || null},
    updated_at = now()
  where id = 1
`;

// --- hero slides (one starter slide per page; more can be added via the admin dashboard) ---
const slides = [
  { pageKey: 'overview', eyebrow: 'Africa University Vice Chancellor', heading: 'Rev. Professor Peter Mageto', subheading: 'The fifth Vice Chancellor of Africa University, a theological ethics scholar and institutional leader advancing pan-African education through justice, equity, collaboration, and student-centered transformation.', body: null, panelCaption: 'Leadership anchored in people and values.' },
  { pageKey: 'leadership', eyebrow: 'Leadership', heading: "Institutional leadership across higher education and ministry.", subheading: "Prof. Mageto's public leadership story connects ethics, formation, academic quality, student welfare, and pan-African mission.", body: null, panelCaption: "Guiding Africa University's mission and people." },
  { pageKey: 'scholarship', eyebrow: 'Scholarship', heading: 'Academic foundation in theology, ethics, and African studies.', subheading: 'His research and publications engage ethics, HIV/AIDS, education, peace, and reconciliation across the continent.', body: null, panelCaption: 'Scholarship in service of the institution.' },
  { pageKey: 'strategy', eyebrow: 'Strategy', heading: "Africa University's Strategic Plan 2023-2027.", subheading: "Student access, staff investment, financial stewardship, partnerships, and internationalized research define the plan's five priorities.", body: null, panelCaption: 'Leading the plan from the front.' },
  { pageKey: 'roadmap', eyebrow: 'Roadmap', heading: "What's next for this platform.", subheading: "A transparent list of what's approved, what's in progress, and what's planned before public launch.", body: null, panelCaption: 'Building toward full launch.' },
  { pageKey: 'contact', eyebrow: 'Contact', heading: 'Reach the Office of the Vice Chancellor.', subheading: 'Official Africa University channels, plus a direct message form for signed-in visitors.', body: null, panelCaption: 'Open channels, real follow-up.' },
  { pageKey: 'sources', eyebrow: 'Sources', heading: 'Every claim on this site, traceable.', subheading: "Verified against Africa University's official site, UM News, and independent academic and press coverage.", body: null, panelCaption: 'Built on public record, not guesswork.' },
];
for (const [index, s] of slides.entries()) {
  await sql`
    insert into hero_slides (page_key, eyebrow, heading, subheading, body, panel_caption, sort_order)
    values (${s.pageKey}, ${s.eyebrow}, ${s.heading}, ${s.subheading}, ${s.body}, ${s.panelCaption}, ${index})
  `;
}

// --- credentials ---
const credentials = [
  'Ph.D. in Theological Ethics, Garrett-Evangelical Theological Seminary, USA',
  'Master of Theological Studies, Garrett-Evangelical Theological Seminary, USA',
  "Bachelor of Divinity, St Paul's United Theological College, Kenya",
  'Postgraduate certificate in African Studies, Northwestern University',
];
for (const [i, label] of credentials.entries()) {
  await sql`insert into credentials (label, sort_order) values (${label}, ${i})`;
}

// --- career entries ---
const career = [
  { role: 'Vice Chancellor', place: 'Africa University, Zimbabwe', note: 'Leads the pan-African United Methodist-related institution as its fifth Vice Chancellor.' },
  { role: 'Deputy Vice Chancellor and Interim Vice Chancellor', place: 'Africa University', note: 'Served in senior academic leadership before his installation as Vice Chancellor.' },
  { role: 'Vice Chancellor and Professor of Ethics', place: 'University of Kigali, Rwanda', note: 'Advanced institutional leadership, academic quality, and ethical scholarship.' },
  { role: 'Academic Leader and Ethics Scholar', place: 'Kenya Methodist University, Daystar University, University of Evansville', note: 'Held roles across academic affairs, student welfare, ethics teaching, and departmental leadership.' },
];
for (const [i, c] of career.entries()) {
  await sql`insert into career_entries (role, place, note, sort_order) values (${c.role}, ${c.place}, ${c.note}, ${i})`;
}

// --- publications ---
const publications = [
  'Victim Theology',
  'Corporate and personal ethics for sustainable development',
  'Book Review: European Traditions in the Study of Religion in Africa',
];
for (const [i, title] of publications.entries()) {
  await sql`insert into publications (title, sort_order) values (${title}, ${i})`;
}

// --- research themes ---
const researchThemes = ['Ethics', 'Theology', 'HIV/AIDS', 'Education', 'Peace', 'Reconciliation'];
for (const [i, label] of researchThemes.entries()) {
  await sql`insert into research_themes (label, sort_order) values (${label}, ${i})`;
}

// --- strategy goals ---
const strategyGoals = [
  'Enhance student access and success',
  'Invest in and empower staff',
  'Increase financial stewardship and institutional sustainability',
  'Cultivate strategic partnerships and economic competitiveness',
  'Internationalize research, teaching, and learning',
];
for (const [i, label] of strategyGoals.entries()) {
  await sql`insert into strategy_goals (label, sort_order) values (${label}, ${i})`;
}

// --- sources ---
const sources = [
  { label: 'Africa University official Vice Chancellor profile', url: 'https://africau.edu/about/vice-chancellor/' },
  { label: 'UM News profile on Prof. Mageto', url: 'https://www.umnews.org/news/new-vice-chancellor-fulfills-calling-at-africa-university' },
  { label: 'Africa University 2023/27 Strategic Plan launch', url: 'https://aunews.africau.edu/africa-universitys-vice-chancellor-launches-2023-27-strategic-plan/' },
  { label: 'Africa University official contact page', url: 'https://africau.edu/about/contact-us/' },
];
for (const [i, s] of sources.entries()) {
  await sql`insert into sources_list (label, url, sort_order) values (${s.label}, ${s.url}, ${i})`;
}

// --- social links (placeholder URLs — Prof. Mageto edits these to his real handles from the dashboard) ---
const socialLinks = [
  { platform: 'linkedin', url: 'https://www.linkedin.com/' },
  { platform: 'website', url: 'https://africau.edu/about/vice-chancellor/' },
];
for (const [i, s] of socialLinks.entries()) {
  await sql`insert into social_links (platform, url, sort_order) values (${s.platform}, ${s.url}, ${i})`;
}

console.log('Profile content seeded.');
```

Add to **`package.json` scripts**:
```json
"seed:profile": "node backend/scripts/seed-profile.mjs"
```

Run once against `DATABASE_URL`, then confirm row counts before cutting
the frontend over — don't wire the pages to the API until this has
actually run, or `/api/profile` will return empty arrays and blank the
site.

---

## 6. Step 4 — Backend routes (add to `backend/src/app.js`)

Reuses the existing `db`, `verifyAdmin`, and `runtime` already defined at
the top of the file — don't redeclare them.

```js
// ============================================================
// Profile CRUD routes — append before `export default app;`
// ============================================================

const REPEATABLE_TABLES = {
  credentials: { columns: ['label'], hasSort: true },
  'career-entries': { table: 'career_entries', columns: ['role', 'place', 'note'], hasSort: true },
  publications: { columns: ['title'], hasSort: true },
  'research-themes': { table: 'research_themes', columns: ['label'], hasSort: true },
  'strategy-goals': { table: 'strategy_goals', columns: ['label'], hasSort: true },
  sources: { table: 'sources_list', columns: ['label', 'url'], hasSort: true },
  'social-links': { table: 'social_links', columns: ['platform', 'url'], hasSort: true },
};

function resolveTable(collection) {
  const cfg = REPEATABLE_TABLES[collection];
  if (!cfg) return null;
  return { ...cfg, table: cfg.table || collection };
}

// Small, visible audit trail — reuses the existing content_updates table
// instead of adding a new one. Every admin write logs one row here so the
// dashboard can show "what changed and when" (see §14).
async function logActivity(db, authorEmail, title, body) {
  if (!db) return;
  try {
    await db`insert into content_updates (title, body, author_email) values (${title}, ${body}, ${authorEmail})`;
  } catch (_error) {
    // logging failure must never block the actual write
  }
}

// GET /api/profile — public, single call, powers every page
app.get('/api/profile', async (_req, res) => {
  if (!db) return res.status(503).json({ message: 'Database not configured' });
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
    profile: profileRows[0] || null,
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

// GET /api/activity — admin-only, recent changes feed for the dashboard
app.get('/api/activity', verifyAdmin, async (_req, res) => {
  if (!db) return res.status(503).json({ message: 'Database not configured' });
  const rows = await db`select * from content_updates order by created_at desc limit 25`;
  res.json({ activity: rows });
});

// PUT /api/profile — admin-only, updates singleton fields
app.put('/api/profile', verifyAdmin, async (req, res) => {
  if (!db) return res.status(503).json({ message: 'Database not configured' });
  const { fullName, title, email, phone, phoneSecondary, address, portraitUrl, logoUrl } = req.body || {};
  const rows = await db`
    update profile set
      full_name = coalesce(${fullName}, full_name),
      title = coalesce(${title}, title),
      email = coalesce(${email}, email),
      phone = coalesce(${phone}, phone),
      phone_secondary = coalesce(${phoneSecondary}, phone_secondary),
      address = coalesce(${address}, address),
      portrait_url = coalesce(${portraitUrl}, portrait_url),
      logo_url = coalesce(${logoUrl}, logo_url),
      updated_at = now()
    where id = 1
    returning *
  `;
  await logActivity(db, req.user.email, 'Updated profile', 'Core profile fields changed.');
  res.json({ profile: rows[0] });
});

// GET /api/hero-slides/:pageKey — all slides for one page (rotation-ready)
const VALID_PAGE_KEYS = ['overview', 'leadership', 'scholarship', 'strategy', 'roadmap', 'contact', 'sources'];
app.get('/api/hero-slides/:pageKey', async (req, res) => {
  if (!db) return res.status(503).json({ message: 'Database not configured' });
  if (!VALID_PAGE_KEYS.includes(req.params.pageKey)) return res.status(400).json({ message: 'Unknown page key' });
  const rows = await db`select * from hero_slides where page_key = ${req.params.pageKey} order by sort_order asc`;
  res.json({ heroSlides: rows });
});

// POST /api/hero-slides/:pageKey — admin-only, add one banner slide to a page
app.post('/api/hero-slides/:pageKey', verifyAdmin, async (req, res) => {
  if (!db) return res.status(503).json({ message: 'Database not configured' });
  const { pageKey } = req.params;
  if (!VALID_PAGE_KEYS.includes(pageKey)) return res.status(400).json({ message: 'Unknown page key' });
  const { eyebrow, heading, subheading, body, panelCaption, backgroundImageUrl, sortOrder } = req.body || {};
  if (!heading) return res.status(400).json({ message: 'heading is required' });
  const rows = await db`
    insert into hero_slides (page_key, eyebrow, heading, subheading, body, panel_caption, background_image_url, sort_order)
    values (${pageKey}, ${eyebrow}, ${heading}, ${subheading}, ${body}, ${panelCaption}, ${backgroundImageUrl}, ${sortOrder ?? 0})
    returning *
  `;
  await logActivity(db, req.user.email, `Added banner slide (${pageKey})`, heading);
  res.status(201).json({ heroSlide: rows[0] });
});

// PUT /api/hero-slides/:pageKey/:id — admin-only, edit one existing slide
app.put('/api/hero-slides/:pageKey/:id', verifyAdmin, async (req, res) => {
  if (!db) return res.status(503).json({ message: 'Database not configured' });
  const { eyebrow, heading, subheading, body, panelCaption, backgroundImageUrl, sortOrder } = req.body || {};
  const rows = await db`
    update hero_slides set
      eyebrow = coalesce(${eyebrow}, eyebrow),
      heading = coalesce(${heading}, heading),
      subheading = coalesce(${subheading}, subheading),
      body = coalesce(${body}, body),
      panel_caption = coalesce(${panelCaption}, panel_caption),
      background_image_url = coalesce(${backgroundImageUrl}, background_image_url),
      sort_order = coalesce(${sortOrder}, sort_order)
    where id = ${req.params.id} and page_key = ${req.params.pageKey}
    returning *
  `;
  if (!rows[0]) return res.status(404).json({ message: 'Not found' });
  await logActivity(db, req.user.email, `Edited banner slide (${req.params.pageKey})`, rows[0].heading);
  res.json({ heroSlide: rows[0] });
});

// DELETE /api/hero-slides/:pageKey/:id — admin-only
app.delete('/api/hero-slides/:pageKey/:id', verifyAdmin, async (req, res) => {
  if (!db) return res.status(503).json({ message: 'Database not configured' });
  const rows = await db`delete from hero_slides where id = ${req.params.id} and page_key = ${req.params.pageKey} returning id`;
  if (!rows[0]) return res.status(404).json({ message: 'Not found' });
  await logActivity(db, req.user.email, `Deleted banner slide (${req.params.pageKey})`, req.params.id);
  res.json({ deleted: true });
});

// Generic CRUD for the seven repeatable collections — one handler, not seven
app.post('/api/:collection', verifyAdmin, async (req, res) => {
  const cfg = resolveTable(req.params.collection);
  if (!cfg) return res.status(404).json({ message: 'Unknown collection' });
  if (!db) return res.status(503).json({ message: 'Database not configured' });
  const values = cfg.columns.map((col) => req.body[toCamel(col)]);
  if (values.some((v) => v === undefined || v === null || v === '')) {
    return res.status(400).json({ message: `${cfg.columns.join(', ')} are required` });
  }
  const cols = cfg.columns.join(', ');
  const placeholders = cfg.columns.map((_, i) => `$${i + 1}`).join(', ');
  const rows = await db.query(
    `insert into ${cfg.table} (${cols}) values (${placeholders}) returning *`,
    values,
  );
  await logActivity(db, req.user.email, `Added ${req.params.collection} item`, values[0]);
  res.status(201).json({ item: rows[0] });
});

app.put('/api/:collection/:id', verifyAdmin, async (req, res) => {
  const cfg = resolveTable(req.params.collection);
  if (!cfg) return res.status(404).json({ message: 'Unknown collection' });
  if (!db) return res.status(503).json({ message: 'Database not configured' });
  const setClauses = cfg.columns.map((col, i) => `${col} = $${i + 1}`);
  const values = cfg.columns.map((col) => req.body[toCamel(col)]);
  values.push(req.params.id);
  const rows = await db.query(
    `update ${cfg.table} set ${setClauses.join(', ')} where id = $${values.length} returning *`,
    values,
  );
  if (!rows[0]) return res.status(404).json({ message: 'Not found' });
  await logActivity(db, req.user.email, `Edited ${req.params.collection} item`, values[0]);
  res.json({ item: rows[0] });
});

app.delete('/api/:collection/:id', verifyAdmin, async (req, res) => {
  const cfg = resolveTable(req.params.collection);
  if (!cfg) return res.status(404).json({ message: 'Unknown collection' });
  if (!db) return res.status(503).json({ message: 'Database not configured' });
  const rows = await db.query(`delete from ${cfg.table} where id = $1 returning id`, [req.params.id]);
  if (!rows[0]) return res.status(404).json({ message: 'Not found' });
  await logActivity(db, req.user.email, `Deleted ${req.params.collection} item`, req.params.id);
  res.json({ deleted: true });
});

function toCamel(snake) {
  return snake.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}
```

> **Route ordering matters:** Express matches in declaration order. The
> generic `/api/:collection` routes must be added **after** the specific
> `/api/profile`, `/api/hero-slides/...`, `/api/activity`, `/api/messages`
> routes already in the file, or the generic handler will shadow them.
> Appending near the bottom before `export default app;` is already
> correct — don't reorder the file.

### Image uploads (Vercel Blob)

```bash
npm install @vercel/blob
```

Add near the top of `app.js`:
```js
import { put } from '@vercel/blob';
```

Add the route:
```js
app.post('/api/uploads', verifyAdmin, express.raw({ type: '*/*', limit: '8mb' }), async (req, res) => {
  const filename = String(req.query.filename || `upload-${Date.now()}`);
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({ message: 'Blob storage not configured' });
  }
  const blob = await put(filename, req.body, { access: 'public', addRandomSuffix: true });
  await logActivity(db, req.user.email, 'Uploaded an image', blob.url);
  res.status(201).json({ url: blob.url });
});
```

This expects raw binary with a `?filename=` query param — a plain
`fetch` and `<input type="file">` in the admin dashboard is enough, no
multipart parsing library needed.

---

## 7. Step 5 — Frontend data layer

**`frontend/src/lib/api.js`** — add an upload helper alongside the
existing `apiFetch`:
```js
export const uploadFile = async (file, token) => {
  const response = await fetch(`/api/uploads?filename=${encodeURIComponent(file.name)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || 'Upload failed');
  return payload.url;
};
```

New file **`frontend/src/lib/useProfile.js`**:
```js
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiFetch } from './api.js';

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');

  const reload = useCallback(async () => {
    setStatus('loading');
    try {
      const payload = await apiFetch('/api/profile');
      setData(payload);
      setStatus('ready');
    } catch (error) {
      setStatus('error');
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  return (
    <ProfileContext.Provider value={{ data, status, reload }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside <ProfileProvider>');
  return ctx;
}

// returns ALL slides for a page, in order — supports rotation (§9)
export function useHeroSlides(pageKey) {
  const { data } = useProfile();
  return data?.heroSlides?.filter((slide) => slide.page_key === pageKey) || [];
}
```

Wrap the app once in **`frontend/src/main.jsx`**:
```jsx
import { ProfileProvider } from './lib/useProfile.js';
// ...
<ProfileProvider>
  <BrowserRouter>
    <App />
  </BrowserRouter>
</ProfileProvider>
```

This fetches `/api/profile` once on load and caches it in context —
every page and the footer read the same in-memory copy, and `reload()` is
called after any admin save so changes appear immediately (§14).

---

## 8. Step 6 — Auth hardening (real innovation, not just cosmetic)

The client asked for "authentication with high innovation power." The
existing `verifyAdmin` + JWT + bcrypt mechanism in `backend/src/app.js` is
already sound — the improvements below make it *feel* and *behave* like a
serious admin system, without inventing unnecessary complexity (no SMS
2FA vendor, no third-party auth provider — those are separate
paid-service decisions the client hasn't asked for):

1. **Kill the last hardcoded-credential path.** §3 already removes the
   frontend fallback; confirm `backend/src/app.js`'s `ADMIN_PASSWORD`
   default (`'Test@123'`) is only ever used when the env var is unset in
   local dev — production must always set `ADMIN_PASSWORD` explicitly, or
   the login route should refuse to start with a clear error.
2. **Session expiry the user can feel.** `jwt.sign(..., { expiresIn: '1d'
   })` already exists. Add a frontend interceptor in `apiFetch` (or a
   wrapper in `useProfile`) that catches any `401` response, clears
   `pm-token`/`pm-email` from `localStorage`, and redirects to `/access`
   with a "Your session expired — sign in again" message, instead of
   silently failing CRUD calls.
3. **Visible activity log.** Every admin write already logs to
   `content_updates` via `logActivity()` in §6. Surface `GET
   /api/activity` as a live feed in the dashboard (§14) — this is the
   "innovation" the client will actually notice day-to-day: proof that
   changes are tracked, by whom, and when.
4. **Rate limiting already exists** (`limitRequests` in `app.js`, 80
   requests/minute) — no change needed, just confirm it still wraps
   `/api` after adding the new routes (it does, since it's applied via
   `app.use('/api', limitRequests)` before route registration).
5. **Do not build a fake "AI-powered" or biometric login for a
   single-admin portfolio site** — that would be complexity theatre for a
   one-user system and a new attack surface for no real benefit. Solid
   JWT + bcrypt + rate limiting + an activity log is the right amount of
   auth for this project's actual risk profile.

---

## 9. Step 7 — `PageBanner` component + full-bleed CSS (with rotation)

New file **`frontend/src/components/PageBanner.jsx`**:
```jsx
import { useEffect, useState } from 'react';

export default function PageBanner({ pageKey, slides, level = 'h2', ctas }) {
  const [index, setIndex] = useState(0);
  const activeSlide = slides?.[index] || slides?.[0] || null;

  useEffect(() => {
    setIndex(0);
  }, [pageKey]);

  useEffect(() => {
    if (!slides || slides.length < 2) return undefined;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [slides]);

  if (!activeSlide) return null;
  const Heading = level;

  return (
    <section className={`page-banner page-banner--${pageKey}`}>
      <img
        className="page-banner-bg"
        src={activeSlide.background_image_url || '/portrait-banner.jpg'}
        alt=""
        aria-hidden="true"
      />
      <div className="page-banner-overlay" />
      <aside className="page-banner-card">
        <span className="avatar">PM</span>
        <strong>Rev. Prof. Peter Mageto</strong>
        <span>Fifth Vice Chancellor | Africa University</span>
        {activeSlide.panel_caption && <p>{activeSlide.panel_caption}</p>}
      </aside>
      <div className="page-banner-copy">
        {activeSlide.eyebrow && <span className="eyebrow">{activeSlide.eyebrow}</span>}
        <Heading>{activeSlide.heading}</Heading>
        {activeSlide.subheading && <p className="lead">{activeSlide.subheading}</p>}
        {activeSlide.body && <p>{activeSlide.body}</p>}
        {ctas && <div className="hero-actions">{ctas}</div>}
      </div>
      {slides && slides.length > 1 && (
        <div className="page-banner-dots" role="tablist" aria-label="Banner slides">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Show slide ${i + 1}`}
              className={i === index ? 'active' : ''}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
```

Slides rotate automatically every 7 seconds **only if more than one slide
exists for that page** — with a single seeded slide (the default), it
behaves exactly like a static banner. Once Prof. Mageto uploads more
photos for a page through the dashboard (§14), rotation switches on
automatically with zero code changes.

**`frontend/src/styles.css`** additions — overrides the existing
`.page-section, .page-band, .page-hero { width: min(1180px, ...); margin:
0 auto; }` rule *specifically for banners*:

```css
.page-banner {
  width: 100%;
  margin: 0;
  padding: 0;
  min-height: 560px;
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: minmax(280px, 360px) 1fr;
  align-items: center;
}

.page-banner-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
  transition: opacity 0.6s ease;
}

.page-banner-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(90deg, rgba(10,20,15,0.82) 0%, rgba(10,20,15,0.55) 45%, rgba(10,20,15,0.25) 100%);
}

.page-banner-card {
  position: relative;
  z-index: 2;
  margin: 0 clamp(1rem, 3vw, 2.5rem);
  padding: 1.4rem;
  border-radius: 10px;
  background: rgba(255,253,248,0.92);
  display: grid;
  gap: 0.4rem;
  box-shadow: var(--shadow);
}
:root[data-theme="dark"] .page-banner-card {
  background: rgba(20,34,29,0.9);
  color: var(--text);
  border: 1px solid var(--line);
}
.page-banner-card .avatar {
  width: 56px; height: 56px; border-radius: 50%;
  display: grid; place-items: center;
  background: var(--brand-strong); color: #fff; font-weight: 800;
}

.page-banner-copy {
  position: relative;
  z-index: 2;
  padding: clamp(1.5rem, 4vw, 3rem);
  color: #fff;
  display: grid;
  gap: 0.75rem;
}
.page-banner-copy .lead { color: rgba(255,255,255,0.85); }

.page-banner-dots {
  position: absolute; bottom: 1.25rem; right: clamp(1rem, 3vw, 2.5rem);
  z-index: 2; display: flex; gap: 0.5rem;
}
.page-banner-dots button {
  width: 9px; height: 9px; border-radius: 50%; border: none;
  background: rgba(255,255,255,0.4); padding: 0; cursor: pointer;
}
.page-banner-dots button.active { background: #fff; }

@media (max-width: 960px) {
  .page-banner { grid-template-columns: 1fr; min-height: auto; padding-bottom: 2rem; }
  .page-banner-card { margin-top: 1.5rem; }
}
```

---

## 10. Step 8 — Rewire the 7 pages

Overview gets `level="h1"`, the other six get the default `level="h2"` —
this is the actual fix for the mixed-`<h1>` issue found in §1.

```jsx
// Home.jsx (Overview) — level="h1", keeps its two CTAs
import PageBanner from '../components/PageBanner.jsx';
import { useHeroSlides } from '../lib/useProfile.js';

export default function Home() {
  const slides = useHeroSlides('overview');
  return (
    <>
      <PageBanner
        pageKey="overview"
        slides={slides}
        level="h1"
        ctas={<><a href="/leadership">Explore leadership</a><a href="/sources">View verified sources</a></>}
      />
      {/* existing .stat-band, .card-grid, .stakeholder-section, .focus-grid sections stay as-is */}
    </>
  );
}
```

```jsx
// Leadership.jsx / Scholarship.jsx / Strategy.jsx / Roadmap.jsx / Sources.jsx — level="h2", no ctas
import PageBanner from '../components/PageBanner.jsx';
import { useHeroSlides } from '../lib/useProfile.js';

export default function Leadership() {
  const slides = useHeroSlides('leadership');
  return (
    <>
      <PageBanner pageKey="leadership" slides={slides} />
      {/* existing .focus-grid / .timeline-section / .quote-band stay as-is */}
    </>
  );
}
```

```jsx
// Contact.jsx — level="h2", two CTAs
const slides = useHeroSlides('contact');
<PageBanner
  pageKey="contact"
  slides={slides}
  ctas={<><a href="#contact-form">Send a message</a><a href="tel:+263">Call the office</a></>}
/>
```

For the repeatable content sections below each banner, swap the
hardcoded imports from `profileData.js` for the matching arrays out of
`useProfile().data` — e.g. in `Scholarship.jsx`:
```js
const { data } = useProfile();
const credentials = data?.credentials ?? [];
const publications = data?.publications ?? [];
const researchThemes = data?.researchThemes ?? [];
```
and map `.label` / `.title` instead of plain strings, since DB rows are
objects now, not raw strings.

`profileData.js` keeps `SITE_NAME` and `navItems` — those stay hardcoded,
per §1.

---

## 11. Step 9 — A real logo, not a text placeholder

The current footer/header just print `SITE_NAME` as plain text. Build one
small, reusable, professionally drawn mark instead of a stock icon:

New file **`frontend/src/components/Logo.jsx`**:
```jsx
export default function Logo({ size = 40, showWordmark = true, logoUrl }) {
  if (logoUrl) {
    // Prof. Mageto has uploaded a real custom logo/crest via the dashboard — use it
    return (
      <span className="site-logo">
        <img src={logoUrl} alt="Peter Mageto Portfolio logo" style={{ height: size, width: 'auto' }} />
        {showWordmark && <strong>The Mageto Portfolio</strong>}
      </span>
    );
  }
  // Fallback: a hand-drawn SVG monogram in the site's own brand colours —
  // a shield motif (academic/institutional) enclosing "PM", not a generic circle-with-letters.
  return (
    <span className="site-logo">
      <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label="Peter Mageto Portfolio logo">
        <path
          d="M24 2 L44 9 V22 C44 34 36 43 24 46 C12 43 4 34 4 22 V9 Z"
          fill="var(--brand-strong)"
          stroke="var(--accent)"
          strokeWidth="1.5"
        />
        <text
          x="24" y="29"
          textAnchor="middle"
          fontFamily="Inter, sans-serif"
          fontWeight="800"
          fontSize="18"
          fill="#fff"
        >PM</text>
        <path d="M14 34 Q24 40 34 34" stroke="var(--accent)" strokeWidth="1.5" fill="none" />
      </svg>
      {showWordmark && <strong>The Mageto Portfolio</strong>}
    </span>
  );
}
```

Add matching CSS:
```css
.site-logo { display: flex; align-items: center; gap: 0.6rem; }
.site-logo strong { font-size: 1.05rem; letter-spacing: -0.01em; }
```

Use `<Logo logoUrl={data?.profile?.logo_url} />` in **`Header.jsx`**
(replacing whatever currently renders `SITE_NAME` alone) and a smaller
`<Logo size={28} showWordmark={false} />` next to the footer text in
**`Layout.jsx`**. Because `logoUrl` comes from `profile.logo_url`
(already added to the schema in §4 and editable via the Profile tab in
§14), Prof. Mageto can replace the shield monogram with a real
institutional crest the moment he has one approved — no code change
needed.

---

## 12. Step 10 — Footer redesign with live, editable social links

Replace the current plain-text footer in **`frontend/src/components/Layout.jsx`**:

```jsx
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';
import Logo from './Logo.jsx';
import { SITE_NAME } from '../data/profileData.js';
import { useProfile } from '../lib/useProfile.js';

const SOCIAL_ICON = {
  linkedin: 'in',
  twitter: '𝕏',
  facebook: 'f',
  youtube: '▶',
  instagram: '◎',
  website: '🌐',
};

export default function Layout({ children, theme, toggleTheme, signedIn, onSignOut, sidebarOpen, openSidebar, closeSidebar }) {
  const { data } = useProfile();
  const socialLinks = data?.socialLinks ?? [];

  return (
    <div className={`app-shell calm-shell ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header theme={theme} toggleTheme={toggleTheme} signedIn={signedIn} onSignOut={onSignOut} openSidebar={openSidebar} />
      <Sidebar open={sidebarOpen} onClose={closeSidebar} signedIn={signedIn} />
      <main id="main" className="page-main">{children}</main>
      <footer className="site-footer">
        <div className="footer-brand">
          <Logo size={32} logoUrl={data?.profile?.logo_url} />
          <span>Africa University | Old Mutare, Zimbabwe | Full-stack leadership platform.</span>
        </div>
        {socialLinks.length > 0 && (
          <nav className="footer-social" aria-label="Social media links">
            {socialLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.platform}
                title={link.platform}
              >
                {SOCIAL_ICON[link.platform] || link.platform.slice(0, 2).toUpperCase()}
              </a>
            ))}
          </nav>
        )}
        <span className="footer-copyright">© {new Date().getFullYear()} {SITE_NAME}</span>
      </footer>
    </div>
  );
}
```

CSS:
```css
.site-footer {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
  gap: 1rem; padding: 1.5rem clamp(1rem, 3vw, 3rem);
  border-top: 1px solid var(--line); background: var(--surface);
  color: var(--muted); font-size: 0.9rem;
}
.footer-brand { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
.footer-social { display: flex; gap: 0.6rem; }
.footer-social a {
  width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center;
  background: var(--surface-strong); color: var(--text); font-weight: 700; font-size: 0.85rem;
  transition: background 0.15s ease, transform 0.15s ease;
}
.footer-social a:hover { background: var(--brand); color: #fff; transform: translateY(-2px); }
.footer-copyright { color: var(--muted); font-size: 0.8rem; }
```

Social links are 100% database-backed via the `social-links` generic CRUD
route from §6 — Prof. Mageto adds, edits, reorders, or removes platforms
from the dashboard (§14) exactly like every other repeatable list, no
redeploy required. This is what makes the links "live" per the request:
they render from `useProfile().data.socialLinks`, not from a hardcoded
array in `profileData.js`.

---

## 13. Step 11 — Real dark mode, not just an inverted background

The client's note — "dark mode doesn't mean the background colour is just
dark" — is correct: a good dark theme needs layered surfaces, adjusted
imagery, and deliberate contrast, not a single colour swap. The token
system in `styles.css` (`--bg`, `--surface`, `--surface-strong`, `--text`,
`--muted`, `--line`, `--shadow`) already exists and is already correctly
redefined under `:root[data-theme="dark"]` — the fix is making sure every
component actually *uses* those tokens instead of a hardcoded colour, and
adding the depth cues dark UIs need:

1. **Audit for hardcoded colours.** Search `styles.css` and every
   component's inline styles for literal hex/rgb values outside the
   `:root` blocks (e.g. `background: rgba(255,253,248,0.92)` used
   directly in a component). Each one is a spot dark mode can't reach.
   The `.page-banner-card` override in §9 is a worked example of doing
   this correctly — it has its own `:root[data-theme="dark"]` rule.

2. **Give dark surfaces actual depth**, not just a darker flat colour.
   Add elevation via subtle borders and shadows rather than relying on
   background colour alone to separate cards from the page:
```css
:root[data-theme="dark"] {
  --elevated-shadow: 0 1px 0 rgba(255,255,255,0.04) inset, 0 24px 70px rgba(0,0,0,0.45);
}
:root[data-theme="dark"] .card,
:root[data-theme="dark"] .page-banner-card,
:root[data-theme="dark"] .access-form {
  box-shadow: var(--elevated-shadow);
  border: 1px solid var(--line);
}
```

3. **Photography needs a different treatment in dark mode.** A bright
   institutional photo dropped onto a dark banner looks like a hole
   punched in the page. Darken the overlay gradient specifically for dark
   mode instead of using the same one in both themes:
```css
:root[data-theme="dark"] .page-banner-overlay {
  background: linear-gradient(90deg, rgba(6,12,10,0.92) 0%, rgba(6,12,10,0.68) 45%, rgba(6,12,10,0.3) 100%);
}
```

4. **Respect system preference on first visit.** `App.jsx` currently
   defaults to `'light'` if nothing is in `localStorage`. Prefer the
   visitor's OS setting instead:
```js
const [theme, setTheme] = useState(() => {
  const saved = localStorage.getItem('pm-theme');
  if (saved) return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
});
```

5. **Verify contrast, not just vibes.** After the above, check
   `--muted` text on `--surface` and `--text` on `--brand` buttons in
   dark mode against WCAG AA (4.5:1 for body text) — the current dark
   palette (`--text: #edf3ee` on `--bg: #101815`) already passes; the
   items above close the remaining "looks unfinished" gaps rather than
   fixing a contrast failure.

---

## 14. Step 12 — Admin dashboard: visible, real CRUD (not just a form)

"CRUD operations must be visible" and "pages must be editable" mean two
things need to exist together: a **management dashboard** for structured
editing, and **inline edit affordances on the live pages themselves** for
speed. Build both — they share the same API from §6.

### 14a. Dashboard "Profile" tab (structured editor)

Add a new tab to `AdminDashboard.jsx` alongside the existing
Inbox/Content-Operations panels, following the existing dashboard's plain
form + `apiFetch` style:

- **Core profile form** bound to `data.profile` (`full_name`, `title`,
  `email`, `phone`, `phone_secondary`, `address`) → `PUT /api/profile` on
  submit, with a visible "Saved ✓" toast on success and an inline error
  banner on failure (never a silent failure).
- **Logo uploader**: file input → `uploadFile()` → `PUT /api/profile`
  with the returned `logoUrl`. Live preview of the new logo before save.
- **Banner editor**: for each of the 7 `VALID_PAGE_KEYS`, list its
  current slides (from `GET /api/hero-slides/:pageKey`) with add / edit /
  delete / reorder, each field mapped to `POST` / `PUT` /
  `DELETE /api/hero-slides/:pageKey[/:id]`. Adding a second slide to a
  page is what turns that banner into an automatic rotation (§9) — say so
  in the UI ("Add a second photo to enable rotation on this page").
- **Seven repeatable-list editors** (credentials, career-entries,
  publications, research-themes, strategy-goals, sources, social-links) —
  one shared `<RepeatableList collection="..." columns={[...]}
  items={[...]} />` component with add / inline-edit / delete / drag-to-
  reorder, calling the generic `POST/PUT/DELETE /api/:collection/:id`
  routes. Build one component and pass `collection` + `columns` as props
  rather than seven copies.
- **Activity feed panel**: render `GET /api/activity` as a simple
  reverse-chronological list ("Edited social-links item — 2 minutes ago
  — profmagteo@gmail.com"). This is the visible proof that CRUD
  operations are happening, satisfying "CRUD operation must be visible"
  directly.

After any save, call `reload()` from `useProfile()` so public pages
reflect the change immediately without a full refresh.

### 14b. Inline "edit on the page" mode (the visible, interactive part)

When `signedIn` is true, render small pencil-icon edit affordances
directly on the public pages next to editable sections — this is what
makes editing feel real and immediate rather than buried in a separate
admin screen:

```jsx
// components/EditableSection.jsx — thin wrapper, used only when signedIn
export default function EditableSection({ signedIn, onEdit, children, label }) {
  return (
    <div className="editable-section">
      {children}
      {signedIn && (
        <button type="button" className="edit-pencil" onClick={onEdit} aria-label={`Edit ${label}`}>
          ✎ Edit {label}
        </button>
      )}
    </div>
  );
}
```

Wrap the credentials list, career timeline, publications, and strategy
goals sections on their respective pages with `<EditableSection>`;
`onEdit` opens a small modal (a lightweight `<dialog>` or existing modal
pattern already in the codebase, if any) pre-filled with that item's
current values, saving through the same generic CRUD route used by the
dashboard. The dashboard "Profile" tab remains the primary place for bulk
editing and reordering; inline editing is the fast path for a single
correction — both write to the same tables, so they can never drift out
of sync.

```css
.editable-section { position: relative; }
.edit-pencil {
  position: absolute; top: 0; right: 0; font-size: 0.8rem;
  background: var(--surface-strong); border: 1px solid var(--line);
  border-radius: 6px; padding: 0.3rem 0.6rem; opacity: 0;
  transition: opacity 0.15s ease;
}
.editable-section:hover .edit-pencil,
.editable-section:focus-within .edit-pencil { opacity: 1; }
```

---

## 15. Step 13 — Image sourcing: read this before touching any real photo

The list of "official web locations" to pull photos from (Africa
University's site, UM News, ResearchGate, Wikipedia, etc.) should **not**
be scraped or hotlinked directly into this project. Two separate reasons,
both real:

1. **Rights.** Institutional photography, press photography, and academic
   headshots are typically copyrighted by the university, the
   photographer, or the publication — even when they're publicly viewable,
   "publicly viewable" is not "licensed for reuse on a third-party site."
   Downloading and re-hosting them here without written permission from
   the rights holder creates exactly the kind of exposure this project is
   trying to reduce, not add.
2. **It defeats the point of the CMS you're building.** §14 exists so
   Prof. Mageto (or his office) can upload his own approved photography
   directly — that's the correct path for getting real portraits onto
   this site, and it's already fully wired: `uploadFile()` → `POST
   /api/uploads` → Vercel Blob → `background_image_url` on a hero slide
   or `portrait_url` / `logo_url` on the profile.

**What to actually do:**
- Ship the site with the existing placeholder (`/portrait-banner.jpg`,
  already referenced as the fallback in `PageBanner.jsx`) until real,
  rights-cleared photography is provided.
- If the client wants any of the ten linked sources used, that requires
  him (or Africa University's communications office, since several are
  the university's own institutional photos) to grant explicit permission
  or provide the original files directly — that's a client/rights
  conversation, not a scraping task.
- Once approved photos exist, Prof. Mageto uploads them himself through
  the dashboard's banner editor and profile photo uploader (§14a) — no
  developer involvement needed for that step ever again, which is the
  actual goal here.
- The multi-slide rotation support in §9 was built specifically so that
  once he has 2–3 approved photos, the banners auto-rotate with zero
  further code changes.

---

## 16. Env vars + deploy checklist

Set in Vercel project settings (Production + Preview):
- `DATABASE_URL` — already required, unchanged.
- `JWT_SECRET` — already required, unchanged.
- `ADMIN_EMAIL` — already required, unchanged.
- `ADMIN_PASSWORD` — **rotate this now**, see §3.
- `BLOB_READ_WRITE_TOKEN` — new, from the Vercel Blob store attached to
  this project (Storage tab → Create → Blob).

Order of operations for first deploy:
1. Ship the security fix (§3) on its own if you want it live sooner than
   the rest.
2. Apply the schema migration (§4) against production `DATABASE_URL`.
3. Run `npm run seed:profile` once against production.
4. Confirm `GET /api/profile` returns real data (not `null`/empty arrays)
   before deploying frontend changes that depend on it — otherwise every
   banner renders blank on first cutover.
5. Deploy backend + frontend changes together (§6–§14).
6. Spot-check: all 7 banners render, dark mode toggle looks intentional
   (not just inverted), footer shows real social icons, logo renders in
   header/footer, admin login works with the rotated password, every
   repeatable list can add/edit/delete and the change appears on the
   public page after `reload()`, the activity feed shows the change you
   just made, and image upload returns a working URL — all in Preview
   before promoting to Production.

---

## 17. What's still explicitly out of scope here

- Actual client-approved portrait photography — a placeholder until Prof.
  Mageto uploads real, rights-cleared images himself (§15). This
  document does not source or embed any external photo.
- Email delivery for the contact form (still only writes to `messages`;
  no outbound email wired up).
- Analytics, custom domain, sitemap review — already on the `roadmap`
  array, untouched by this work.
- Third-party auth providers or SMS/app-based 2FA — deliberately not
  added (§8.5); revisit only if the client explicitly wants to manage
  more than one admin account.
