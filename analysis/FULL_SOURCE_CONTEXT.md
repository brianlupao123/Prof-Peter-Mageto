# Full Source — Prof Magetto Website
_Generated: 2026-07-18 11:47_

> Complete content of every real source file in this project, in one document — paste this whole file into an AI conversation for full, ground-truth context (page copy included, not just structure).

**Deliberately excluded:** `node_modules`, `dist`/`build`, lockfiles, binary/image assets, and every `.env*` file (even `.env.example`) — so this is always safe to share even if a real secret was ever accidentally committed somewhere else in the repo.

---

## `Mageto-Portfolio-Final-Build-Prompt.md`

```markdown
# Prof. Peter Mageto Leadership Portfolio — Final Build Prompt

**Version:** 3.0 (Full Implementation Complete)
**Status:** ✅ Committed to `main` — Vercel auto-deploying
**Build:** ✓ 61 modules, zero errors
**Local preview:** http://127.0.0.1:5173

---

## Project Context

This is a national-figure leadership portfolio for **Rev. Professor Peter Mageto**, Fifth Vice Chancellor of Africa University (Zimbabwe). The site is a public-facing leadership profile + a private admin CMS, deployed on Vercel with a Neon PostgreSQL backend.

**Stack:**
- Frontend: Vite + React + react-router-dom + react-icons
- Backend: Express (Vercel serverless) + bcryptjs + jsonwebtoken + @neondatabase/serverless
- Storage: Neon PostgreSQL (with runtime-memory fallback when DB is unavailable)
- Deploy: Vercel (frontend + API routes in `/api/`)

---

## Architecture

```
Prof Magetto Website/
├── frontend/
│   ├── src/
│   │   ├── App.jsx                   # Routes, auth state, dark mode
│   │   ├── styles.css                # Complete design system (CSS variables, animations)
│   │   ├── main.jsx                  # ProfileProvider wraps everything
│   │   ├── components/
│   │   │   ├── AdminDashboard.jsx    # 5-tab CMS (Profile|Banners|Collections|Inbox|Activity)
│   │   │   ├── ContactForm.jsx       # Rate-limit aware form
│   │   │   ├── Header.jsx            # Sticky header + theme toggle
│   │   │   ├── Layout.jsx            # Shell + footer with social icon circles
│   │   │   ├── Logo.jsx              # Africa shield SVG with PM monogram
│   │   │   ├── PageBanner.jsx        # Ken Burns + arrow nav + dots + pause on hover
│   │   │   └── Sidebar.jsx           # Nav (Dashboard hidden for non-admins)
│   │   ├── pages/
│   │   │   ├── Home.jsx              # Overview — stats, credibility note, focus grid
│   │   │   ├── Leadership.jsx        # Career timeline + quote band
│   │   │   ├── Scholarship.jsx       # Credentials, research themes, publications
│   │   │   ├── Strategy.jsx          # 5 strategic goals + notice panel
│   │   │   ├── Roadmap.jsx           # Platform roadmap with intro
│   │   │   ├── Contact.jsx           # Office info + contact form
│   │   │   ├── Sources.jsx           # Verified sources with badges
│   │   │   ├── Access.jsx            # Admin sign-in (JWT)
│   │   │   ├── Dashboard.jsx         # Admin CMS wrapper
│   │   │   └── NotFound.jsx          # 404 page
│   │   ├── lib/
│   │   │   ├── api.js                # apiFetch + uploadFile helpers
│   │   │   └── useProfile.js         # ProfileProvider + useProfile + useHeroSlides hooks
│   │   └── data/
│   │       └── profileData.js        # Static fallback data + nav items + highlights
│   ├── public/
│   │   ├── sitemap.xml               # All 7 public pages
│   │   ├── robots.txt                # Blocks /dashboard and /access
│   │   └── favicon.svg               # Site favicon
│   └── index.html                    # OG tags, JSON-LD, Google Fonts
├── backend/
│   ├── src/app.js                    # All API routes (Express serverless)
│   └── scripts/
│       ├── seed-profile.mjs          # Seeds all profile data to Neon DB
│       └── seed-admin.mjs            # Creates admin user in DB
├── schema.sql                        # Complete DB schema (run once on Neon)
├── vercel.json                       # SPA rewrites + sitemap/robots headers
└── package.json                      # Root: dev/build scripts
```

---

## All 7 Pages (Hero Carousel)

Each page key maps to one or more hero slides managed from the admin dashboard:

| Page | Route | Page Key | Slide Description |
|------|-------|----------|-------------------|
| Overview | `/` | `overview` | Prof. Mageto's full title + credentials + CTA buttons |
| Leadership | `/leadership` | `leadership` | Career path, institutional roles, leadership philosophy |
| Scholarship | `/scholarship` | `scholarship` | Academic credentials, research themes, publications |
| Strategy | `/strategy` | `strategy` | Africa University Strategic Plan 2023–2027 |
| Roadmap | `/roadmap` | `roadmap` | Platform development milestones |
| Contact | `/contact` | `contact` | Office contact channels + message form |
| Sources | `/sources` | `sources` | Verified citation list + transparency note |

### How the carousel works:
- 1 slide per page = static header (no rotation)
- 2+ slides = auto-rotates every 7 seconds
- Hover pauses rotation (Ken Burns zoom also pauses)
- Click dots or arrows to manually navigate
- Admin uploads a high-res photo to `background_image_url` to activate full-bleed photo treatment
- Without a photo: premium animated gradient with brand colours

---

## Admin Dashboard — 5 Tabs

### Profile Tab
- Edit: full name, title, email, phone, secondary phone, address
- Upload portrait photo with live preview
- Upload custom logo with live preview
- **Change password**: current password required, 8-char minimum

### Banners Tab
- Per-page slide editor for all 7 pages
- Add, edit, delete slides
- Upload background photo per slide (Vercel Blob)
- Adding a second slide enables auto-rotation for that page
- Edit: eyebrow, heading, subheading, body, panel caption, background image

### Collections Tab
7 editable repeatable lists:
- **Credentials** — academic qualifications
- **Career** — roles, institutions, notes
- **Publications** — titles
- **Research Themes** — keyword pills
- **Strategy Goals** — numbered list
- **Sources** — label + URL
- **Social Links** — platform + URL (renders as icon circles in footer)

All collections support: inline edit, delete with confirmation, add new item.

### Inbox Tab
- All contact form submissions
- Relative timestamps ("2m ago", "3h ago")
- Mark resolved button
- Unread badge count on tab

### Activity Tab
- Full audit trail of all admin changes
- Author email + relative timestamp
- Last 20 events shown

---

## Backend API Routes

```
GET    /api/health                          Health check
GET    /api/site-settings                   Public site settings
GET    /api/profile                         Full profile + all collections (public)
PUT    /api/profile                         Update profile (admin)
POST   /api/contact                         Submit contact message (public, rate-limited)
GET    /api/messages                        Get all messages (admin)
PATCH  /api/messages/:id/status             Update message status (admin)
POST   /api/uploads?filename=              Upload file to Vercel Blob (admin)
GET    /api/hero-slides/:pageKey            Get slides for a page (public)
POST   /api/hero-slides/:pageKey            Add slide (admin)
PUT    /api/hero-slides/:pageKey/:id        Edit slide (admin)
DELETE /api/hero-slides/:pageKey/:id        Delete slide (admin)
POST   /api/credentials                     Add credential (admin)
PUT    /api/credentials/:id                 Edit credential (admin)
DELETE /api/credentials/:id                 Delete credential (admin)
[same pattern for career-entries, publications, research-themes, strategy-goals, sources, social-links]
POST   /api/auth/login                      Sign in (returns JWT)
POST   /api/auth/register                   Register (public)
GET    /api/auth/me                         Verify token (admin)
PUT    /api/auth/password                   Change password (admin)
GET    /api/activity                        Audit trail (admin)
GET    /api/content-updates                 Content update log (public)
POST   /api/content-updates                 Add content update (admin)
```

---

## Database Schema (Neon PostgreSQL)

All tables exist in `schema.sql`. Run the full file once on Neon, then seed:

```bash
# Seed all content
DATABASE_URL="postgres://..." node backend/scripts/seed-profile.mjs

# Create admin user
DATABASE_URL="postgres://..." node backend/scripts/seed-admin.mjs
```

### Fix messages status constraint (if DB already exists):
```sql
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_status_check;
ALTER TABLE messages ADD CONSTRAINT messages_status_check 
  CHECK (status IN ('new', 'read', 'replied', 'resolved', 'archived'));
```

---

## Vercel Environment Variables (Required)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `JWT_SECRET` | Random 32+ char string for JWT signing |
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD` | Admin login password (min 8 chars) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token for image uploads |

---

## Design System

### CSS Variables
```css
--bg, --surface, --surface-strong    /* Backgrounds */
--text, --muted                       /* Typography */
--line                                /* Borders */
--brand, --brand-strong               /* Primary green */
--accent                              /* Gold */
--blue                                /* Secondary blue */
--shadow, --elevated-shadow           /* Shadows */
```

### Animations
- `kenBurns` — 18s slow zoom on banner photos (pauses on hover)
- `fadeInUp` — 0.38s page content fade-in on route change
- `shimmer` — 1.6s skeleton loading shimmer
- `slideInRight` — 0.3s toast notification slide-in

### Breakpoints
- `≤ 900px` — mobile banner (gradient stack, no arrows)
- `≤ 1100px` — sidebar goes off-canvas
- `≤ 1220px` — right-side index panel hidden

---

## What Makes This Premium

1. **National figure visual treatment** — Full-viewport Ken Burns hero with glassmorphic left card
2. **Real CMS** — Not hardcoded; admin edits anything from the dashboard
3. **Photo-ready** — Upload Prof. Mageto's official photos to activate full-bleed hero mode
4. **Honest & traceable** — Every claim links to a verified public source
5. **Print-ready** — `Ctrl+P` produces a clean professional bio print
6. **SEO complete** — OG tags, JSON-LD, sitemap, robots, unique page titles
7. **Dark mode intelligent** — Respects OS preference on first visit, user can override
8. **Accessible** — Skip links, ARIA labels, keyboard navigation on carousel

---

## Next Steps After Deployment

1. **Upload photos** — Sign in to `/dashboard` → Banners tab → upload Prof. Mageto's official photo to each page slide
2. **Add social links** — Dashboard → Collections → Social Links → add LinkedIn, Twitter etc.
3. **Run DB migration** — Fix status constraint (SQL above) + run seed script
4. **Update sitemap URL** — Replace `mageto-portfolio.vercel.app` with the real Vercel URL in `sitemap.xml`
5. **Add email notifications** — Integrate Resend/SendGrid in `app.js` `POST /api/contact` to notify the office on new messages
```

## `PROJECT_DOCUMENTATION.md`

```markdown
# Project Documentation: The Peter Mageto Leadership Portfolio

## Purpose

This project is a professional full-stack leadership website for Rev. Professor Peter Mageto, fifth Vice Chancellor of Africa University. It is designed as an executive public profile plus an operational backend that can grow into an official digital office platform.

## Engineering Goals

- Present Prof. Mageto with a calm, credible, institution-grade interface.
- Keep the header clean and avoid wrapped navigation by moving the full menu into a sidebar.
- Load pages independently using React Router and lazy route chunks.
- Keep a true frontend/backend folder architecture for review and future scaling.
- Provide working admin authentication, contact capture, dashboard review, and content update flows.
- Deploy cleanly on Vercel while preserving serverless API support.

## Folder Structure

```text
Prof Magetto Website/
  api/
    index.js                 # imports backend/src/app.js for Vercel
    [...path].js             # catch-all serverless wrapper
    auth/                    # explicit Vercel function wrappers
    messages/[id]/status.js  # explicit status route wrapper
  backend/
    src/app.js               # Express API and serverless app
    schema.sql               # Neon/Postgres database schema
    scripts/seed-admin.mjs   # admin seed script
  frontend/
    index.html
    public/                  # favicon, robots, sitemap
    src/
      App.jsx                # route shell, theme, auth session
      main.jsx
      styles.css
      components/            # Header, Sidebar, dashboard/contact UI
      data/profileData.js    # verified content and roadmap data
      lib/api.js             # API helper
      pages/                 # independent route pages
```

## Frontend Design

The frontend uses a professional executive layout with:

- Sticky compact header.
- Sidebar navigation containing all major sections.
- Responsive desktop and mobile behavior.
- Light/dark theme toggle.
- No broken remote portrait dependency; the launch version uses a clean executive identity panel until client-approved photography is supplied.
- Lazy-loaded routes for Overview, Leadership, Scholarship, Strategy, Roadmap, Contact, Sources, Access, Dashboard, and Not Found.

## Backend Design

The backend is an Express application exported from `backend/src/app.js` and consumed by Vercel function wrappers in `api/`.

Core behavior:

- JWT authentication.
- Admin credential login.
- Contact message creation.
- Admin message listing and status updates.
- Content update creation and listing.
- Optional Neon Postgres persistence when `DATABASE_URL` is present.
- Runtime memory fallback for preview/demo deployments.

## Deployment

The project is configured for Vercel:

- `npm run build` builds `frontend/` into root `dist/`.
- `vercel.json` rewrites all public routes to `index.html` for React Router.
- API routes remain under `/api/*`.
- Static assets are cached with immutable headers.

Production project:

- GitHub: https://github.com/brianlupao123/Prof-Peter-Mageto
- Vercel URL: https://prof-peter-mageto.vercel.app

## Environment Variables

Recommended production variables:

- `JWT_SECRET`: strong random secret.
- `ADMIN_EMAIL`: production admin email.
- `ADMIN_PASSWORD`: temporary password, rotate before real launch.
- `DATABASE_URL`: Neon Postgres connection string.

## Future Enhancements

1. Replace the launch-safe identity panel with client-approved professional portrait photography.
2. Add official biography, speeches, sermons, publications, awards, and media pages.
3. Promote the dashboard into a full CMS with editorial roles, approvals, and audit trails.
4. Add email notifications through Resend or another transactional email provider.
5. Add spam protection and rate-limited contact submissions.
6. Connect Neon Postgres permanently and remove reliance on runtime preview memory.
7. Add file/media upload support for communications staff.
8. Add analytics, performance monitoring, and search console verification.
9. Add custom domain and final SEO/social preview assets.
10. Add Playwright end-to-end tests for sign-in, theme switching, sidebar navigation, contact, and dashboard flows.

## Quality Checks Completed

- `npm install` completed and updated `package-lock.json`.
- `npm run build` completed successfully.
- Build output confirms separate route chunks for fast page loading.
- Root project structure was cleaned to separate frontend and backend architecture.

## Notes Before Official Launch

The preview credential is intentionally documented for client review. Before public official launch, rotate the password, set production environment variables in Vercel, connect Neon persistence, and replace placeholder biography/media with client-approved content.
```

## `README.md`

```markdown
# The Peter Mageto Leadership Portfolio

Full-stack executive leadership portfolio for Rev. Professor Peter Mageto, fifth Vice Chancellor of Africa University.

## Architecture

```text
Prof Magetto Website/
  api/                    # Vercel serverless entry wrappers
  backend/                # Express API, schema, admin seed script
  frontend/               # React/Vite routed client application
  package.json            # Root scripts for build, preview, API, deploy
  vercel.json             # SPA rewrites, cache headers, Vercel config
  PROJECT_DOCUMENTATION.md
```

## System Features

- React/Vite frontend with independent lazy-loaded routes
- Compact professional header and complete sidebar navigation
- Light and dark mode with local persistence
- JWT sign in/out with admin credential support
- Express serverless backend under `/api/*`
- Contact form connected to the backend
- Admin dashboard for inbox/status management and content updates
- Optional Neon Postgres persistence via `DATABASE_URL`
- Runtime fallback storage for local/demo environments
- Vercel deployment config, sitemap, robots, favicon, SEO metadata

## Admin Preview Credential

- Email: `profmagteo@gmail.com`
- Password: `Test@123`

For production, set secure Vercel environment variables:

- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `DATABASE_URL` optional but recommended for Neon persistence

## Commands

```bash
npm install
npm run dev
npm run build
npm run preview
npm run api:dev
npm run seed:admin
```

## Backend Endpoints

- `GET /api/health`
- `GET /api/site-settings`
- `GET /api/publications`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`
- `POST /api/contact`
- `GET /api/messages` admin
- `PATCH /api/messages/:id/status` admin
- `GET /api/content-updates`
- `POST /api/content-updates` admin

## Documentation

Read [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md) for engineering decisions, deployment notes, roadmap, and future enhancements.
```

## `backend/README.md`

```markdown
# Backend

Express serverless API for authentication, contact messages, content updates, and future CMS operations. Vercel imports this app through the root `api/` wrappers.
```

## `backend/schema.sql`

```sql
create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null default 'Portfolio enquiry',
  message text not null,
  status text not null default 'new' check (status in ('new', 'read', 'replied', 'resolved', 'archived')),
  source text not null default 'prof-mageto-portfolio',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists content_updates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  author_email text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_status_created on messages (status, created_at desc);
create index if not exists idx_content_updates_created on content_updates (created_at desc);

create table if not exists page_likes (
  page_key text primary key,
  count integer not null default 0
);

-- ============================================================
-- Profile CRUD system - additive migration
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
  logo_url text,
  updated_at timestamptz not null default now(),
  constraint profile_single_row check (id = 1)
);
insert into profile (id) values (1) on conflict (id) do nothing;

create table if not exists hero_slides (
  page_key text not null,
  eyebrow text,
  heading text not null,
  subheading text,
  body text,
  panel_caption text,
  background_image_url text,
  sort_order integer not null default 0,
  id uuid primary key default gen_random_uuid()
);
create index if not exists idx_hero_slides_page on hero_slides (page_key, sort_order);

create table if not exists credentials (id uuid primary key default gen_random_uuid(), label text not null, sort_order integer not null default 0);
create table if not exists career_entries (id uuid primary key default gen_random_uuid(), role text not null, place text not null, note text, sort_order integer not null default 0);
create table if not exists publications (id uuid primary key default gen_random_uuid(), title text not null, sort_order integer not null default 0);
create table if not exists research_themes (id uuid primary key default gen_random_uuid(), label text not null, sort_order integer not null default 0);
create table if not exists strategy_goals (id uuid primary key default gen_random_uuid(), label text not null, sort_order integer not null default 0);
create table if not exists sources_list (id uuid primary key default gen_random_uuid(), label text not null, url text not null, sort_order integer not null default 0);
create table if not exists social_links (id uuid primary key default gen_random_uuid(), platform text not null, url text not null, sort_order integer not null default 0);

create index if not exists idx_credentials_sort on credentials (sort_order);
create index if not exists idx_career_sort on career_entries (sort_order);
create index if not exists idx_publications_sort on publications (sort_order);
create index if not exists idx_research_sort on research_themes (sort_order);
create index if not exists idx_strategy_sort on strategy_goals (sort_order);
create index if not exists idx_sources_sort on sources_list (sort_order);
create index if not exists idx_social_links_sort on social_links (sort_order);

-- Fix messages status constraint to allow 'resolved' (run this against existing DB)
alter table messages drop constraint if exists messages_status_check;
alter table messages add constraint messages_status_check check (status in ('new', 'read', 'replied', 'resolved', 'archived'));
```

## `backend/src/app.js`

```javascript
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

function notifyNewMessage({ name, email, subject, message }) {
  if (!process.env.RESEND_API_KEY || !process.env.NOTIFY_EMAIL) return;
  fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.NOTIFY_FROM_EMAIL || 'Portfolio <notifications@yourdomain.com>',
      to: process.env.NOTIFY_EMAIL,
      subject: `New enquiry: ${subject}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    }),
  }).catch(() => {});
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
  const { eyebrow, heading, subheading, body: bodyText, panelCaption, backgroundImageUrl, sortOrder } = req.body || {};
  if (!heading) return res.status(400).json({ message: 'heading is required' });
  const slide = { id: 'slide-' + Date.now(), page_key: pageKey, eyebrow, heading, subheading, body: bodyText, panel_caption: panelCaption, background_image_url: backgroundImageUrl, sort_order: sortOrder ?? 0 };
  if (!db) {
    profileFallback.heroSlides.push(slide);
    await logActivity(null, req.user.email, `Added banner slide (${pageKey})`, heading);
    return res.status(201).json({ heroSlide: slide });
  }
  const rows = await db`
    insert into hero_slides (page_key, eyebrow, heading, subheading, body, panel_caption, background_image_url, sort_order)
    values (${pageKey}, ${eyebrow}, ${heading}, ${subheading}, ${bodyText}, ${panelCaption}, ${backgroundImageUrl}, ${sortOrder ?? 0})
    returning *
  `;
  await logActivity(db, req.user.email, `Added banner slide (${pageKey})`, heading);
  res.status(201).json({ heroSlide: rows[0] });
});

app.put('/api/hero-slides/:pageKey/:id', verifyAdmin, async (req, res) => {
  const { pageKey, id } = req.params;
  if (!VALID_PAGE_KEYS.includes(pageKey)) return res.status(400).json({ message: 'Unknown page key' });
  const { eyebrow, heading, subheading, body: bodyText, panelCaption, backgroundImageUrl, sortOrder } = req.body || {};
  if (!db) {
    const slide = profileFallback.heroSlides.find((s) => s.id === id && s.page_key === pageKey);
    if (!slide) return res.status(404).json({ message: 'Slide not found' });
    if (eyebrow !== undefined) slide.eyebrow = eyebrow;
    if (heading !== undefined) slide.heading = heading;
    if (subheading !== undefined) slide.subheading = subheading;
    if (bodyText !== undefined) slide.body = bodyText;
    if (panelCaption !== undefined) slide.panel_caption = panelCaption;
    if (backgroundImageUrl !== undefined) slide.background_image_url = backgroundImageUrl;
    if (sortOrder !== undefined) slide.sort_order = sortOrder;
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
      sort_order = coalesce(${sortOrder}, sort_order)
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
```

## `api/[...path].js`

```javascript
export { default } from './index.js';
```

## `api/auth/login.js`

```javascript
export { default } from '../index.js';
```

## `api/auth/me.js`

```javascript
export { default } from '../index.js';
```

## `api/auth/register.js`

```javascript
export { default } from '../index.js';
```

## `api/index.js`

```javascript
export { default } from '../backend/src/app.js';
```

## `api/messages/[id]/status.js`

```javascript
export { default } from '../../index.js';
```

## `frontend/README.md`

```markdown
# Frontend

React/Vite application for the Prof. Mageto leadership portfolio. Routes live in `src/pages`, shared UI in `src/components`, and verified profile content in `src/data/profileData.js`.
```

## `frontend/index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#10251d" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="description" content="The Peter Mageto Leadership Portfolio presents the executive profile, scholarship, strategy, and institutional contact pathway for Rev. Professor Peter Mageto, fifth Vice Chancellor of Africa University." />
    <meta name="keywords" content="Peter Mageto, Rev Professor Peter Mageto, Professor Peter Mageto, Africa University, Vice Chancellor, leadership portfolio, theological ethics, pan-African education" />
    <meta name="author" content="Brian Lupao" />
    <meta property="og:title" content="The Peter Mageto Leadership Portfolio" />
    <meta property="og:description" content="Executive leadership, scholarship, strategy, and official Africa University contact information." />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://prof-peter-mageto.vercel.app" />
    <meta property="og:image" content="https://prof-peter-mageto.vercel.app/og-image.svg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="800" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="The Peter Mageto Leadership Portfolio" />
    <meta name="twitter:description" content="Leadership, scholarship, strategy, and official Africa University contact information." />
    <meta name="twitter:image" content="https://prof-peter-mageto.vercel.app/og-image.svg" />
    <title>The Peter Mageto Leadership Portfolio</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Rev. Professor Peter Mageto",
        "jobTitle": "Vice Chancellor of Africa University",
        "affiliation": {
          "@type": "CollegeOrUniversity",
          "name": "Africa University",
          "url": "https://africau.edu"
        },
        "url": "https://africau.edu/about/vice-chancellor/",
        "sameAs": ["https://www.umnews.org/news/new-vice-chancellor-fulfills-calling-at-africa-university"]
      }
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

## `frontend/src/App.jsx`

```react jsx
import { lazy, Suspense, useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import { apiFetch } from './lib/api.js';

const Home = lazy(() => import('./pages/Home.jsx'));
const Leadership = lazy(() => import('./pages/Leadership.jsx'));
const Scholarship = lazy(() => import('./pages/Scholarship.jsx'));
const Strategy = lazy(() => import('./pages/Strategy.jsx'));
const Roadmap = lazy(() => import('./pages/Roadmap.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const Sources = lazy(() => import('./pages/Sources.jsx'));
const Access = lazy(() => import('./pages/Access.jsx'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

function getInitialTheme() {
  const stored = localStorage.getItem('pm-theme');
  if (stored) return stored;
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

export default function App() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [sidebarOpen, setSidebarOpen] = useState(() => window.matchMedia('(min-width: 1101px)').matches);
  const [session, setSession] = useState(() => {
    const token = localStorage.getItem('pm-token');
    const email = localStorage.getItem('pm-email');
    return token ? { token, email } : null;
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('pm-theme', theme);
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const bg = getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim();
      metaThemeColor.setAttribute('content', bg || (theme === 'dark' ? '#0f1f1a' : '#f4f6f2'));
    }
  }, [theme]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => { if (!localStorage.getItem('pm-theme')) setTheme(e.matches ? 'dark' : 'light'); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggleTheme = () => setTheme((cur) => {
    const next = cur === 'dark' ? 'light' : 'dark';
    localStorage.setItem('pm-theme', next);
    return next;
  });

  const signIn = async (email, password) => {
    const normalized = String(email).trim().toLowerCase();
    const payload = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: normalized, password }),
    });
    const next = { token: payload.token, email: payload.user?.email || normalized };
    setSession(next);
    localStorage.setItem('pm-token', next.token);
    localStorage.setItem('pm-email', next.email);
    return next;
  };

  const signOut = () => {
    setSession(null);
    localStorage.removeItem('pm-token');
    localStorage.removeItem('pm-email');
  };

  const signedIn = Boolean(session);

  return (
    <Layout
      theme={theme}
      toggleTheme={toggleTheme}
      signedIn={signedIn}
      onSignOut={signOut}
      userEmail={session?.email}
      sidebarOpen={sidebarOpen}
      openSidebar={() => setSidebarOpen((v) => !v)}
      closeSidebar={() => setSidebarOpen(false)}
    >
      <Suspense fallback={<div className="page-loader">Loading…</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/leadership" element={<Leadership />} />
          <Route path="/scholarship" element={<Scholarship />} />
          <Route path="/strategy" element={<Strategy />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/contact" element={<Contact signedIn={signedIn} token={session?.token} />} />
          <Route path="/sources" element={<Sources />} />

          <Route path="/access" element={<Access signedIn={signedIn} onSignIn={signIn} />} />
          <Route path="/sign-in" element={<Navigate to="/access" replace />} />
          <Route path="/signin" element={<Navigate to="/access" replace />} />
          <Route path="/login" element={<Navigate to="/access" replace />} />
          <Route path="/sign-up" element={<Navigate to="/access" replace />} />
          <Route path="/signup" element={<Navigate to="/access" replace />} />
          <Route path="/register" element={<Navigate to="/access" replace />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected dashboard */}
          <Route
            path="/dashboard"
            element={signedIn ? <Dashboard signedIn={signedIn} token={session?.token} /> : <Navigate to="/access" replace />}
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
```

## `frontend/src/components/AdminDashboard.jsx`

```react jsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaCheck,
  FaLock,
  FaPlus,
  FaRotate,
  FaShieldHalved,
  FaTrash,
  FaUpload,
} from 'react-icons/fa6';
import { apiFetch, uploadFile } from '../lib/api.js';
import { useProfile } from '../lib/useProfile.js';

// ── Toast ─────────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);
  return { toasts, push };
}

function ToastContainer({ toasts }) {
  return (
    <div className="toast-container" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.type}`}>{t.message}</div>
      ))}
    </div>
  );
}

// ── Relative time helper ───────────────────────────────────────────────────
function relativeTime(isoString) {
  if (!isoString) return '';
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// ── File Upload Button ─────────────────────────────────────────────────────
function UploadButton({ token, onUploaded, label = 'Upload image', accept = 'image/*' }) {
  const ref = useRef(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const url = await uploadFile(file, token);
      onUploaded(url);
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
      {preview && <img className="upload-preview" src={preview} alt="Preview" />}
      <button
        type="button"
        className="btn-edit"
        onClick={() => ref.current?.click()}
        disabled={uploading}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
      >
        <FaUpload /> {uploading ? 'Uploading…' : label}
      </button>
      <input ref={ref} type="file" accept={accept} style={{ display: 'none' }} onChange={handleChange} />
    </div>
  );
}

// ── Repeatable Collection Editor ───────────────────────────────────────────
function CollectionEditor({ collection, columns, items, token, onRefresh, toast }) {
  const [drafts, setDrafts] = useState({});
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState({});

  const startEdit = (id, item) => {
    const draft = {};
    columns.forEach(({ key }) => { draft[key] = item[key] || ''; });
    setDrafts((d) => ({ ...d, [id]: draft }));
  };

  const cancelEdit = (id) => {
    setDrafts((d) => { const n = { ...d }; delete n[id]; return n; });
  };

  const saveEdit = async (id) => {
    try {
      await apiFetch(`/api/${collection}/${id}`, { method: 'PUT', token, body: JSON.stringify(drafts[id]) });
      cancelEdit(id);
      await onRefresh();
      toast('Item updated ✓');
    } catch (e) { toast(e.message, 'error'); }
  };

  const deleteItem = async (id, label) => {
    if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) return;
    try {
      await apiFetch(`/api/${collection}/${id}`, { method: 'DELETE', token });
      await onRefresh();
      toast('Item deleted');
    } catch (e) { toast(e.message, 'error'); }
  };

  const addItem = async (e) => {
    e.preventDefault();
    try {
      await apiFetch(`/api/${collection}`, { method: 'POST', token, body: JSON.stringify(newItem) });
      setNewItem({});
      setAdding(false);
      await onRefresh();
      toast('Item added ✓');
    } catch (e) { toast(e.message, 'error'); }
  };

  return (
    <div style={{ display: 'grid', gap: '0.6rem' }}>
      {items.length === 0 && <p style={{ color: 'var(--muted)' }}>No items yet. Add one below.</p>}
      {items.map((item) => {
        const id = item.id;
        const mainLabel = item[columns[0].key] || id;
        const isEditing = Boolean(drafts[id]);
        return (
          <div key={id} className="collection-item">
            <div>
              {isEditing
                ? columns.map(({ key, label, multiline }) => (
                    <label key={key} style={{ display: 'grid', gap: '0.25rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 700 }}>{label}</span>
                      {multiline
                        ? <textarea rows={2} style={{ width: '100%', resize: 'vertical', padding: '0.5rem', border: '1px solid var(--line)', borderRadius: '6px', background: 'var(--bg)', color: 'var(--text)', font: 'inherit' }} value={drafts[id][key] || ''} onChange={(e) => setDrafts((d) => ({ ...d, [id]: { ...d[id], [key]: e.target.value } }))} />
                        : <input style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--line)', borderRadius: '6px', background: 'var(--bg)', color: 'var(--text)' }} value={drafts[id][key] || ''} onChange={(e) => setDrafts((d) => ({ ...d, [id]: { ...d[id], [key]: e.target.value } }))} />
                      }
                    </label>
                  ))
                : columns.map(({ key, label }) => (
                    <div key={key} style={{ fontSize: '0.88rem' }}>
                      {columns.length > 1 && <span style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>{label}: </span>}
                      {item[key]}
                    </div>
                  ))
              }
            </div>
            <div className="collection-item-actions">
              {isEditing
                ? <>
                    <button className="btn-save" type="button" onClick={() => saveEdit(id)}>Save</button>
                    <button className="btn-edit" type="button" onClick={() => cancelEdit(id)}>Cancel</button>
                  </>
                : <>
                    <button className="btn-edit" type="button" onClick={() => startEdit(id, item)}>Edit</button>
                    <button className="btn-delete" type="button" onClick={() => deleteItem(id, mainLabel)}><FaTrash /></button>
                  </>
              }
            </div>
          </div>
        );
      })}

      {adding
        ? (
          <form className="collection-item" style={{ borderColor: 'var(--brand)' }} onSubmit={addItem}>
            <div>
              {columns.map(({ key, label, multiline }) => (
                <label key={key} style={{ display: 'grid', gap: '0.25rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 700 }}>{label} *</span>
                  {multiline
                    ? <textarea rows={2} required style={{ width: '100%', resize: 'vertical', padding: '0.5rem', border: '1px solid var(--line)', borderRadius: '6px', background: 'var(--bg)', color: 'var(--text)', font: 'inherit' }} value={newItem[key] || ''} onChange={(e) => setNewItem((n) => ({ ...n, [key]: e.target.value }))} />
                    : <input required style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--line)', borderRadius: '6px', background: 'var(--bg)', color: 'var(--text)' }} value={newItem[key] || ''} onChange={(e) => setNewItem((n) => ({ ...n, [key]: e.target.value }))} />
                  }
                </label>
              ))}
            </div>
            <div className="collection-item-actions" style={{ flexDirection: 'column' }}>
              <button className="btn-save" type="submit">Add</button>
              <button className="btn-edit" type="button" onClick={() => { setAdding(false); setNewItem({}); }}>Cancel</button>
            </div>
          </form>
        )
        : (
          <button
            className="btn-edit"
            type="button"
            onClick={() => setAdding(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', alignSelf: 'start' }}
          >
            <FaPlus /> Add item
          </button>
        )
      }
    </div>
  );
}

// ── Banner Slide Editor ────────────────────────────────────────────────────
const PAGE_KEYS = ['overview', 'leadership', 'scholarship', 'strategy', 'roadmap', 'contact', 'sources'];

function BannerEditor({ token, profileData, onRefresh, toast }) {
  const [activePage, setActivePage] = useState('overview');
  const [slides, setSlides] = useState([]);
  const [loadingSlides, setLoadingSlides] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [newSlide, setNewSlide] = useState({ heading: '', subheading: '', eyebrow: '', panelCaption: '', backgroundImageUrl: '' });
  const [adding, setAdding] = useState(false);

  const loadSlides = useCallback(async (pageKey) => {
    setLoadingSlides(true);
    try {
      const payload = await apiFetch(`/api/hero-slides/${pageKey}`);
      setSlides(payload.heroSlides || []);
    } catch (e) { toast(e.message, 'error'); }
    finally { setLoadingSlides(false); }
  }, [toast]);

  useEffect(() => { loadSlides(activePage); }, [activePage, loadSlides]);

  const deleteSlide = async (id) => {
    if (!window.confirm('Delete this slide? The page will use the next available slide.')) return;
    try {
      await apiFetch(`/api/hero-slides/${activePage}/${id}`, { method: 'DELETE', token });
      await loadSlides(activePage);
      await onRefresh();
      toast('Slide deleted');
    } catch (e) { toast(e.message, 'error'); }
  };

  const saveSlide = async (e) => {
    e.preventDefault();
    if (!editingSlide) return;
    try {
      await apiFetch(`/api/hero-slides/${activePage}/${editingSlide.id}`, { method: 'PUT', token, body: JSON.stringify(editingSlide) });
      setEditingSlide(null);
      await loadSlides(activePage);
      await onRefresh();
      toast('Slide updated ✓');
    } catch (e) { toast(e.message, 'error'); }
  };

  const addSlide = async (e) => {
    e.preventDefault();
    try {
      await apiFetch(`/api/hero-slides/${activePage}`, { method: 'POST', token, body: JSON.stringify({ ...newSlide, sortOrder: slides.length }) });
      setAdding(false);
      setNewSlide({ heading: '', subheading: '', eyebrow: '', panelCaption: '', backgroundImageUrl: '' });
      await loadSlides(activePage);
      await onRefresh();
      toast('Slide added ✓');
    } catch (e) { toast(e.message, 'error'); }
  };

  return (
    <div>
      {/* Page selector */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {PAGE_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            className={`dashboard-tab ${activePage === key ? 'active' : ''}`}
            style={{ borderBottom: 'none', padding: '0.45rem 0.85rem', border: '1px solid var(--line)', borderRadius: '6px', background: activePage === key ? 'var(--brand-strong)' : 'var(--surface)', color: activePage === key ? '#fff' : 'var(--muted)' }}
            onClick={() => { setActivePage(key); setEditingSlide(null); setAdding(false); }}
          >
            {key}
          </button>
        ))}
      </div>

      {activePage === 'overview' && (
        <div style={{ background: 'var(--brand)', color: 'var(--surface)', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <strong>Tip:</strong> The Overview tab controls the main Home page carousel. Add all your "tour" slides here.
        </div>
      )}

      {loadingSlides && <div className="skeleton skeleton-card" style={{ marginBottom: '0.75rem' }} />}

      {slides.length > 1 && (
        <p style={{ fontSize: '0.84rem', color: 'var(--brand-strong)', marginBottom: '0.75rem' }}>
          ✓ {slides.length} slides — rotation is active for this page.
        </p>
      )}
      {slides.length === 1 && (
        <p style={{ fontSize: '0.84rem', color: 'var(--muted)', marginBottom: '0.75rem' }}>
          Add a second slide to enable auto-rotation on this page.
        </p>
      )}

      {/* Existing slides */}
      <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1rem' }}>
        {slides.map((slide) => (
          <div key={slide.id} className="collection-item">
            {editingSlide?.id === slide.id
              ? (
                <form style={{ display: 'grid', gap: '0.5rem', width: '100%' }} onSubmit={saveSlide}>
                  {[
                    { key: 'eyebrow', label: 'Eyebrow' },
                    { key: 'heading', label: 'Heading *', required: true },
                    { key: 'subheading', label: 'Subheading', multiline: true },
                    { key: 'panel_caption', label: 'Panel caption' },
                    { key: 'background_image_url', label: 'Background image URL' },
                  ].map(({ key, label, required, multiline }) => (
                    <label key={key} style={{ display: 'grid', gap: '0.2rem' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 700 }}>{label}</span>
                      {multiline
                        ? <textarea rows={2} required={required} style={{ width: '100%', resize: 'vertical', padding: '0.5rem', border: '1px solid var(--line)', borderRadius: '6px', background: 'var(--bg)', color: 'var(--text)', font: 'inherit' }} value={editingSlide[key] || ''} onChange={(e) => setEditingSlide((s) => ({ ...s, [key]: e.target.value }))} />
                        : <input required={required} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--line)', borderRadius: '6px', background: 'var(--bg)', color: 'var(--text)' }} value={editingSlide[key] || ''} onChange={(e) => setEditingSlide((s) => ({ ...s, [key]: e.target.value }))} />
                      }
                    </label>
                  ))}
                  <div style={{ marginTop: '0.25rem' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Or upload a photo</span>
                    <UploadButton token={token} label="Upload background photo" onUploaded={(url) => setEditingSlide((s) => ({ ...s, background_image_url: url }))} />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <button className="btn-save" type="submit">Save slide</button>
                    <button className="btn-edit" type="button" onClick={() => setEditingSlide(null)}>Cancel</button>
                  </div>
                </form>
              )
              : (
                <>
                  <div>
                    {slide.background_image_url && <img className="upload-preview" src={slide.background_image_url} alt="slide bg" />}
                    <div style={{ fontWeight: 700, marginTop: slide.background_image_url ? '0.5rem' : 0 }}>{slide.heading}</div>
                    {slide.subheading && <div style={{ fontSize: '0.84rem', color: 'var(--muted)', marginTop: '0.2rem' }}>{slide.subheading.slice(0, 90)}{slide.subheading.length > 90 ? '…' : ''}</div>}
                  </div>
                  <div className="collection-item-actions">
                    <button className="btn-edit" type="button" onClick={() => setEditingSlide({ ...slide })}>Edit</button>
                    <button className="btn-delete" type="button" onClick={() => deleteSlide(slide.id)}><FaTrash /></button>
                  </div>
                </>
              )
            }
          </div>
        ))}
      </div>

      {/* Add slide */}
      {adding
        ? (
          <form className="contact-form compact" style={{ border: '1px solid var(--brand)', borderRadius: '8px' }} onSubmit={addSlide}>
            <strong style={{ fontSize: '0.9rem' }}>New slide for {activePage}</strong>
            {[
              { key: 'eyebrow', label: 'Eyebrow' },
              { key: 'heading', label: 'Heading *', required: true },
              { key: 'subheading', label: 'Subheading', multiline: true },
              { key: 'panelCaption', label: 'Panel caption' },
              { key: 'backgroundImageUrl', label: 'Background image URL' },
            ].map(({ key, label, required, multiline }) => (
              <label key={key} style={{ display: 'grid', gap: '0.2rem' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 700 }}>{label}</span>
                {multiline
                  ? <textarea rows={2} required={required} style={{ width: '100%', resize: 'vertical', padding: '0.5rem', border: '1px solid var(--line)', borderRadius: '6px', background: 'var(--bg)', color: 'var(--text)', font: 'inherit' }} value={newSlide[key] || ''} onChange={(e) => setNewSlide((s) => ({ ...s, [key]: e.target.value }))} />
                  : <input required={required} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--line)', borderRadius: '6px', background: 'var(--bg)', color: 'var(--text)' }} value={newSlide[key] || ''} onChange={(e) => setNewSlide((s) => ({ ...s, [key]: e.target.value }))} />
                }
              </label>
            ))}
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Or upload a photo</span>
              <UploadButton token={token} label="Upload background photo" onUploaded={(url) => setNewSlide((s) => ({ ...s, backgroundImageUrl: url }))} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-save" type="submit"><FaPlus /> Add slide</button>
              <button className="btn-edit" type="button" onClick={() => { setAdding(false); setNewSlide({ heading: '', subheading: '', eyebrow: '', panelCaption: '', backgroundImageUrl: '' }); }}>Cancel</button>
            </div>
          </form>
        )
        : (
          <button
            className="btn-edit"
            type="button"
            onClick={() => setAdding(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
          >
            <FaPlus /> Add slide to {activePage}
          </button>
        )
      }
    </div>
  );
}

// ── Main AdminDashboard ────────────────────────────────────────────────────
const TABS = ['Profile', 'Banners', 'Collections', 'Inbox', 'Activity'];

const COLLECTIONS = [
  { key: 'credentials', label: 'Credentials', columns: [{ key: 'label', label: 'Credential' }] },
  { key: 'career-entries', label: 'Career', columns: [{ key: 'role', label: 'Role' }, { key: 'place', label: 'Institution' }, { key: 'note', label: 'Note', multiline: true }] },
  { key: 'publications', label: 'Publications', columns: [{ key: 'title', label: 'Title' }] },
  { key: 'research-themes', label: 'Research Themes', columns: [{ key: 'label', label: 'Theme' }] },
  { key: 'strategy-goals', label: 'Strategy Goals', columns: [{ key: 'label', label: 'Goal' }] },
  { key: 'sources', label: 'Sources', columns: [{ key: 'label', label: 'Label' }, { key: 'url', label: 'URL' }] },
  { key: 'social-links', label: 'Social Links', columns: [{ key: 'platform', label: 'Platform' }, { key: 'url', label: 'URL' }] },
];

export default function AdminDashboard({ signedIn, token }) {
  const { data, reload } = useProfile();
  const { toasts, push: toast } = useToast();

  const [activeTab, setActiveTab] = useState('Profile');
  const [activeCollection, setActiveCollection] = useState('credentials');
  const [messages, setMessages] = useState([]);
  const [activity, setActivity] = useState([]);
  const [status, setStatus] = useState('Ready');

  // Profile form state
  const [profileDraft, setProfileDraft] = useState({
    fullName: '', title: '', email: '', phone: '', phoneSecondary: '', address: '', logoUrl: '', portraitUrl: '',
  });

  // Password change state
  const [pwDraft, setPwDraft] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwStatus, setPwStatus] = useState('');

  const unreadCount = useMemo(() => messages.filter((m) => m.status !== 'resolved').length, [messages]);

  useEffect(() => {
    const profile = data?.profile;
    if (!profile) return;
    setProfileDraft({
      fullName: profile.full_name || '',
      title: profile.title || '',
      email: profile.email || '',
      phone: profile.phone || '',
      phoneSecondary: profile.phone_secondary || '',
      address: profile.address || '',
      logoUrl: profile.logo_url || '',
      portraitUrl: profile.portrait_url || '',
    });
  }, [data]);

  const loadDashboard = useCallback(async () => {
    if (!signedIn) return;
    setStatus('Loading…');
    try {
      const [msgPayload, actPayload] = await Promise.all([
        apiFetch('/api/messages', { token }),
        apiFetch('/api/activity', { token }),
      ]);
      setMessages(msgPayload.messages || []);
      setActivity(actPayload.activity || []);
      setStatus('Synced');
    } catch (e) { setStatus(e.message); }
  }, [signedIn, token]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/api/profile', { method: 'PUT', token, body: JSON.stringify(profileDraft) });
      await reload();
      await loadDashboard();
      toast('Profile saved ✓');
    } catch (e) { toast(e.message, 'error'); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwDraft.newPassword !== pwDraft.confirm) { setPwStatus('New passwords do not match.'); return; }
    if (pwDraft.newPassword.length < 8) { setPwStatus('New password must be at least 8 characters.'); return; }
    try {
      const payload = await apiFetch('/api/auth/password', { method: 'PUT', token, body: JSON.stringify({ currentPassword: pwDraft.currentPassword, newPassword: pwDraft.newPassword }) });
      setPwStatus(payload.message || 'Password changed.');
      setPwDraft({ currentPassword: '', newPassword: '', confirm: '' });
      toast('Password changed ✓');
    } catch (e) { setPwStatus(e.message); toast(e.message, 'error'); }
  };

  const markResolved = async (id) => {
    try {
      await apiFetch(`/api/messages/${id}/status`, { method: 'PATCH', token, body: JSON.stringify({ status: 'resolved' }) });
      await loadDashboard();
      toast('Message resolved ✓');
    } catch (e) { toast(e.message, 'error'); }
  };

  if (!signedIn) {
    return (
      <div className="notice-panel">
        <FaShieldHalved />
        <h2>Admin dashboard locked</h2>
        <p>Use the access portal to sign in before managing content.</p>
        <Link className="button-link" to="/access">Sign in</Link>
      </div>
    );
  }

  const currentCollection = COLLECTIONS.find((c) => c.key === activeCollection);
  const collectionData = {
    credentials: data?.credentials ?? [],
    'career-entries': data?.careerEntries ?? [],
    publications: data?.publications ?? [],
    'research-themes': data?.researchThemes ?? [],
    'strategy-goals': data?.strategyGoals ?? [],
    sources: data?.sources ?? [],
    'social-links': data?.socialLinks ?? [],
  };

  return (
    <>
      <ToastContainer toasts={toasts} />

      {/* Tab bar */}
      <div className="dashboard-tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`dashboard-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            {tab === 'Inbox' && unreadCount > 0 && (
              <span style={{ marginLeft: '0.35rem', background: 'var(--accent)', color: '#fff', fontSize: '0.72rem', borderRadius: '999px', padding: '0.05rem 0.4rem' }}>
                {unreadCount}
              </span>
            )}
          </button>
        ))}
        <button
          type="button"
          className="dashboard-tab"
          style={{ marginLeft: 'auto', color: 'var(--muted)' }}
          onClick={async () => { await reload(); await loadDashboard(); toast('Dashboard refreshed'); }}
          aria-label="Refresh dashboard"
        >
          <FaRotate /> Refresh
        </button>
      </div>

      {/* ── PROFILE TAB ── */}
      {activeTab === 'Profile' && (
        <div className="dashboard-grid dashboard-grid-wide">
          {/* Core profile form */}
          <section className="dashboard-panel">
            <div className="panel-heading"><div><span className="eyebrow">Core Info</span><h2>Edit public profile</h2></div></div>
            <form className="contact-form compact" onSubmit={saveProfile}>
              {[
                { key: 'fullName', label: 'Full name' },
                { key: 'title', label: 'Title' },
                { key: 'email', label: 'Email' },
                { key: 'phone', label: 'Phone' },
                { key: 'phoneSecondary', label: 'Secondary phone' },
                { key: 'address', label: 'Address' },
              ].map(({ key, label }) => (
                <label key={key}>
                  {label}
                  <input
                    value={profileDraft[key]}
                    onChange={(e) => setProfileDraft((d) => ({ ...d, [key]: e.target.value }))}
                  />
                </label>
              ))}
              <div>
                <label style={{ marginBottom: '0.35rem', display: 'block', color: 'var(--muted)', fontWeight: 800 }}>Portrait photo</label>
                {profileDraft.portraitUrl && <img className="upload-preview" src={profileDraft.portraitUrl} alt="Portrait preview" style={{ marginBottom: '0.5rem' }} />}
                <UploadButton
                  token={token}
                  label="Upload portrait"
                  onUploaded={(url) => setProfileDraft((d) => ({ ...d, portraitUrl: url }))}
                />
                <input value={profileDraft.portraitUrl} onChange={(e) => setProfileDraft((d) => ({ ...d, portraitUrl: e.target.value }))} placeholder="Or paste image URL" style={{ width: '100%', marginTop: '0.4rem', padding: '0.5rem', border: '1px solid var(--line)', borderRadius: '6px', background: 'var(--bg)', color: 'var(--text)' }} />
              </div>
              <div>
                <label style={{ marginBottom: '0.35rem', display: 'block', color: 'var(--muted)', fontWeight: 800 }}>Custom logo</label>
                {profileDraft.logoUrl && <img className="upload-preview" src={profileDraft.logoUrl} alt="Logo preview" style={{ marginBottom: '0.5rem' }} />}
                <UploadButton
                  token={token}
                  label="Upload logo"
                  onUploaded={(url) => setProfileDraft((d) => ({ ...d, logoUrl: url }))}
                />
                <input value={profileDraft.logoUrl} onChange={(e) => setProfileDraft((d) => ({ ...d, logoUrl: e.target.value }))} placeholder="Or paste logo URL" style={{ width: '100%', marginTop: '0.4rem', padding: '0.5rem', border: '1px solid var(--line)', borderRadius: '6px', background: 'var(--bg)', color: 'var(--text)' }} />
              </div>
              <button className="button-link" type="submit">Save profile</button>
            </form>
          </section>

          {/* Change password */}
          <section className="dashboard-panel">
            <div className="panel-heading"><div><span className="eyebrow">Security</span><h2>Change password</h2></div><FaLock /></div>
            <form className="contact-form compact" onSubmit={changePassword}>
              <label>Current password<input type="password" value={pwDraft.currentPassword} onChange={(e) => setPwDraft((d) => ({ ...d, currentPassword: e.target.value }))} required /></label>
              <label>New password (min 8 chars)<input type="password" value={pwDraft.newPassword} onChange={(e) => setPwDraft((d) => ({ ...d, newPassword: e.target.value }))} required /></label>
              <label>Confirm new password<input type="password" value={pwDraft.confirm} onChange={(e) => setPwDraft((d) => ({ ...d, confirm: e.target.value }))} required /></label>
              <button className="button-link" type="submit">Change password</button>
              {pwStatus && <p className="form-status" style={{ margin: 0 }}>{pwStatus}</p>}
            </form>
            <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--surface-strong)', borderRadius: '8px', fontSize: '0.84rem', color: 'var(--muted)' }}>
              <strong>Status:</strong> {status}
            </div>
          </section>
        </div>
      )}

      {/* ── BANNERS TAB ── */}
      {activeTab === 'Banners' && (
        <section className="dashboard-panel">
          <div className="panel-heading"><div><span className="eyebrow">Hero Slides</span><h2>Manage banner slides</h2></div></div>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Each page has its own hero banner. Upload a high-resolution photograph of Prof. Mageto to each slide.
            Adding a second slide to any page enables automatic rotation.
          </p>
          <BannerEditor token={token} profileData={data} onRefresh={async () => { await reload(); await loadDashboard(); }} toast={toast} />
        </section>
      )}

      {/* ── COLLECTIONS TAB ── */}
      {activeTab === 'Collections' && (
        <section className="dashboard-panel">
          <div className="panel-heading"><div><span className="eyebrow">Content Lists</span><h2>Edit content collections</h2></div></div>

          {/* Collection selector */}
          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            {COLLECTIONS.map((c) => (
              <button
                key={c.key}
                type="button"
                className={`dashboard-tab ${activeCollection === c.key ? 'active' : ''}`}
                style={{ borderBottom: 'none', padding: '0.4rem 0.8rem', border: '1px solid var(--line)', borderRadius: '6px', background: activeCollection === c.key ? 'var(--brand-strong)' : 'var(--surface)', color: activeCollection === c.key ? '#fff' : 'var(--muted)' }}
                onClick={() => setActiveCollection(c.key)}
              >
                {c.label}
              </button>
            ))}
          </div>

          {currentCollection && (
            <CollectionEditor
              key={activeCollection}
              collection={activeCollection}
              columns={currentCollection.columns}
              items={collectionData[activeCollection] || []}
              token={token}
              onRefresh={async () => { await reload(); await loadDashboard(); }}
              toast={toast}
            />
          )}
        </section>
      )}

      {/* ── INBOX TAB ── */}
      {activeTab === 'Inbox' && (
        <section className="dashboard-panel">
          <div className="panel-heading">
            <div><span className="eyebrow">Messages</span><h2>{unreadCount} unread message{unreadCount !== 1 ? 's' : ''}</h2></div>
          </div>
          <div className="message-list">
            {messages.length === 0
              ? <p style={{ color: 'var(--muted)' }}>No contact messages yet.</p>
              : messages.map((msg) => (
                <article key={msg.id} className="message-item" style={{ opacity: msg.status === 'resolved' ? 0.6 : 1 }}>
                  <div>
                    <strong>{msg.name}</strong>
                    <span>{msg.email}</span>
                  </div>
                  {msg.subject && <p style={{ fontWeight: 700, margin: '0.25rem 0', fontSize: '0.9rem' }}>{msg.subject}</p>}
                  <p>{msg.message}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span className="activity-time">{relativeTime(msg.createdAt)} — status: {msg.status}</span>
                    {msg.status !== 'resolved' && (
                      <button type="button" onClick={() => markResolved(msg.id)}>
                        <FaCheck /> Mark resolved
                      </button>
                    )}
                  </div>
                </article>
              ))
            }
          </div>
        </section>
      )}

      {/* ── ACTIVITY TAB ── */}
      {activeTab === 'Activity' && (
        <section className="dashboard-panel">
          <div className="panel-heading"><div><span className="eyebrow">Audit Trail</span><h2>Recent changes</h2></div></div>
          <div className="update-list">
            {activity.length === 0
              ? <p style={{ color: 'var(--muted)' }}>No activity recorded yet.</p>
              : activity.slice(0, 20).map((item) => (
                <article key={item.id || item.created_at}>
                  <strong>{item.title}</strong>
                  <p>{item.body}</p>
                  <span className="activity-time">
                    {item.author_email || item.authorEmail} &mdash; {relativeTime(item.created_at || item.createdAt)}
                  </span>
                </article>
              ))
            }
          </div>
        </section>
      )}
    </>
  );
}
```

## `frontend/src/components/ContactForm.jsx`

```react jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPaperPlane } from 'react-icons/fa6';
import { apiFetch } from '../lib/api.js';

const initialForm = { name: '', email: '', organization: '', message: '' };

export default function ContactForm({ signedIn, token }) {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: 'idle', text: '' });

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submitForm = async (event) => {
    event.preventDefault();
    setStatus({ type: 'loading', text: 'Sending message…' });

    try {
      if (token === 'local-preview-token') {
        const messages = JSON.parse(localStorage.getItem('pm-local-messages') || '[]');
        localStorage.setItem('pm-local-messages', JSON.stringify([{ ...form, id: Date.now(), status: 'new', created_at: new Date().toISOString() }, ...messages]));
      } else {
        await apiFetch('/api/contact', { method: 'POST', body: JSON.stringify(form) });
      }
      setForm(initialForm);
      setStatus({ type: 'success', text: '✓ Message received. The office will be in touch.' });
    } catch (error) {
      // Friendly rate-limit message
      if (error.message.includes('429') || error.message.toLowerCase().includes('too many')) {
        setStatus({ type: 'error', text: "You've sent several messages in a short time. Please wait a moment before trying again." });
      } else {
        setStatus({ type: 'error', text: error.message });
      }
    }
  };

  if (!signedIn) {
    return (
      <div className="notice-panel">
        <h2>Secure contact access</h2>
        <p>Sign in to submit a message directly to the Office of the Vice Chancellor's inbox.</p>
        <Link className="button-link" to="/access">Open access portal</Link>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={submitForm}>
      <label>Full name <input name="name" value={form.name} onChange={updateField} required /></label>
      <label>Email address <input name="email" type="email" value={form.email} onChange={updateField} required /></label>
      <label>Organization <input name="organization" value={form.organization} onChange={updateField} placeholder="Optional" /></label>
      <label>Message <textarea name="message" value={form.message} onChange={updateField} rows="6" required /></label>
      <button className="button-link" type="submit" disabled={status.type === 'loading'}>
        Send message <FaPaperPlane />
      </button>
      {status.text && <p className={`form-status ${status.type}`}>{status.text}</p>}
    </form>
  );
}
```

## `frontend/src/components/Header.jsx`

```react jsx
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaMoon, FaSun, FaMagnifyingGlass, FaUser, FaRightFromBracket, FaGaugeHigh } from 'react-icons/fa6';
import Logo from './Logo.jsx';
import { useProfile } from '../lib/useProfile.js';

export default function Header({ theme, toggleTheme, signedIn, onSignOut, openSidebar, userEmail }) {
  const { data } = useProfile();
  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    // Simple navigation-based search
    const q = searchQuery.toLowerCase();
    if (q.includes('leader')) navigate('/leadership');
    else if (q.includes('scholar') || q.includes('research')) navigate('/scholarship');
    else if (q.includes('strat')) navigate('/strategy');
    else if (q.includes('road') || q.includes('plan')) navigate('/roadmap');
    else if (q.includes('contact') || q.includes('reach')) navigate('/contact');
    else if (q.includes('source')) navigate('/sources');
    else navigate('/');
    setSearchQuery('');
  };

  const initials = userEmail ? userEmail.slice(0, 2).toUpperCase() : 'U';

  return (
    <header className="app-header">
      {/* LEFT: Hamburger + Logo */}
      <div className="header-left">
        <button className="icon-button" type="button" onClick={openSidebar} aria-label="Toggle navigation">
          <FaBars />
        </button>
        <Link className="brand logo-brand" to="/">
          <Logo logoUrl={data?.profile?.logo_url} />
        </Link>
      </div>

      {/* CENTER: Search bar (hidden on mobile) */}
      <form className="header-search" onSubmit={handleSearch} role="search" aria-label="Site search">
        <FaMagnifyingGlass style={{ flexShrink: 0, opacity: 0.45 }} />
        <input
          type="search"
          placeholder="Search pages — Leadership, Scholarship, Strategy…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search the site"
        />
      </form>

      {/* RIGHT: Dark/Light → Profile/Sign-in */}
      <div className="header-actions">
        <button
          className="icon-button"
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <FaSun /> : <FaMoon />}
        </button>

        {signedIn ? (
          <div className="profile-dropdown-wrap" ref={profileRef}>
            <button
              className="profile-avatar-btn"
              type="button"
              onClick={() => setProfileOpen((v) => !v)}
              aria-label="Open profile menu"
              aria-expanded={profileOpen}
            >
              <span className="profile-avatar-circle">{initials}</span>
            </button>
            {profileOpen && (
              <div className="profile-dropdown">
                <div className="profile-dropdown-info">
                  <span className="profile-avatar-circle profile-avatar-circle--lg">{initials}</span>
                  <div>
                    <strong>{userEmail}</strong>
                    <small>Signed in</small>
                  </div>
                </div>
                <Link className="profile-dropdown-item" to="/dashboard" onClick={() => setProfileOpen(false)}>
                  <FaGaugeHigh /> Dashboard
                </Link>
                <button
                  className="profile-dropdown-item profile-dropdown-item--danger"
                  type="button"
                  onClick={() => { onSignOut(); setProfileOpen(false); }}
                >
                  <FaRightFromBracket /> Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link className="nav-cta" to="/access">Sign in →</Link>
        )}
      </div>
    </header>
  );
}
```

## `frontend/src/components/IconCard.jsx`

```react jsx
export default function IconCard({ icon: Icon, title, children }) {
  return <article className="icon-card"><span className="icon-wrap"><Icon /></span><h3>{title}</h3><p>{children}</p></article>;
}
```

## `frontend/src/components/Layout.jsx`

```react jsx
import {
  FaFacebook,
  FaGlobe,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
  FaYoutube,
} from 'react-icons/fa6';
import Header from './Header.jsx';
import Logo from './Logo.jsx';
import Sidebar from './Sidebar.jsx';
import { SITE_NAME } from '../data/profileData.js';
import { useProfile } from '../lib/useProfile.js';

const SOCIAL_ICON = {
  linkedin: FaLinkedinIn,
  twitter: FaXTwitter,
  x: FaXTwitter,
  facebook: FaFacebook,
  youtube: FaYoutube,
  instagram: FaInstagram,
  website: FaGlobe,
};

export default function Layout({ children, theme, toggleTheme, signedIn, onSignOut, userEmail, sidebarOpen, openSidebar, closeSidebar }) {
  const { data } = useProfile();
  const socialLinks = data?.socialLinks ?? [];

  return (
    <div className={`app-shell calm-shell ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header theme={theme} toggleTheme={toggleTheme} signedIn={signedIn} onSignOut={onSignOut} openSidebar={openSidebar} userEmail={userEmail} />
      <Sidebar open={sidebarOpen} onClose={closeSidebar} signedIn={signedIn} />
      <main id="main" className="page-main">{children}</main>


      <footer className="site-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <Logo size={32} logoUrl={data?.profile?.logo_url} />
            <span>Africa University | Old Mutare, Zimbabwe</span>
          </div>
          {socialLinks.length > 0 && (
            <nav className="footer-social" aria-label="Social media links">
              {socialLinks.map((link) => {
                const Icon = SOCIAL_ICON[link.platform?.toLowerCase()] || FaGlobe;
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.platform}
                    title={link.platform}
                  >
                    <Icon />
                  </a>
                );
              })}
            </nav>
          )}
        </div>

        <div className="footer-bottom">
          <span className="footer-copyright">
            &copy; {new Date().getFullYear()} Rev. Prof. Peter Mageto &mdash; {SITE_NAME}
          </span>
          <a className="back-to-top" href="#root" aria-label="Back to top">
            ↑ Back to top
          </a>
        </div>
      </footer>
    </div>
  );
}
```

## `frontend/src/components/LikeButton.jsx`

```react jsx
import { useEffect, useState } from 'react';
import { FaHeart } from 'react-icons/fa6';
import { apiFetch } from '../lib/api.js';

export default function LikeButton({ pageKey }) {
  const storageKey = `liked-${pageKey}`;
  const [count, setCount] = useState(0);
  const [liked, setLiked] = useState(() => localStorage.getItem(storageKey) === 'true');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    apiFetch(`/api/likes/${pageKey}`)
      .then((payload) => { if (active) setCount(Number(payload.count || 0)); })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [pageKey]);

  const likePage = async () => {
    if (liked) return;
    setLiked(true);
    localStorage.setItem(storageKey, 'true');
    try {
      const payload = await apiFetch(`/api/likes/${pageKey}`, { method: 'POST' });
      setCount(Number(payload.count || 0));
    } catch (_error) {
      setLiked(false);
      localStorage.removeItem(storageKey);
    }
  };

  return (
    <section className="page-like-bar" aria-label="Page appreciation">
      <button type="button" onClick={likePage} disabled={liked || loading} aria-pressed={liked}>
        <FaHeart />
        <span>{liked ? 'Appreciated' : 'Appreciate this page'}</span>
      </button>
      <span>{loading ? 'Loading count...' : `${count} ${count === 1 ? 'appreciation' : 'appreciations'}`}</span>
    </section>
  );
}
```

## `frontend/src/components/Logo.jsx`

```react jsx
export default function Logo({ size = 40, showWordmark = true, logoUrl, compact = false }) {
  if (compact) showWordmark = false;
  if (logoUrl) {
    return (
      <span className="site-logo">
        <img src={logoUrl} alt="Peter Mageto Portfolio logo" style={{ height: size, width: 'auto' }} />
        {showWordmark && <strong>The Mageto Portfolio</strong>}
      </span>
    );
  }

  // Custom SVG: academic shield + African continent silhouette + "PM" monogram
  return (
    <span className="site-logo">
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        role="img"
        aria-label="Peter Mageto Portfolio — Africa University"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shield body */}
        <path
          d="M24 2 L43 8.5 V21 C43 34.5 35 43 24 46.5 C13 43 5 34.5 5 21 V8.5 Z"
          fill="var(--brand-strong)"
          stroke="var(--accent)"
          strokeWidth="1.2"
        />
        {/* Africa continent silhouette (simplified) */}
        <path
          d="M19 11 C17 11 16 13 16 15 L16 18 C16 20 17 22 19 23 L20 26 C20 28 21 30 22 31 C22.5 32 23 34 22.5 35 C22 36 22.5 37 23.5 37 C25 37 25.5 36 25 35 C24.5 34 25 32 26 31 C27 30 28 28 28 26 L29 23 C31 22 32 20 32 18 L32 15 C32 13 31 11 29 11 Z"
          fill="rgba(255,255,255,0.22)"
        />
        {/* PM Monogram */}
        <text
          x="24"
          y="28"
          textAnchor="middle"
          fontFamily="Inter, Georgia, sans-serif"
          fontWeight="900"
          fontSize="15"
          fill="#fff"
          letterSpacing="-0.5"
        >
          PM
        </text>
        {/* Decorative arc — academic cap brim */}
        <path
          d="M15 36 Q24 41 33 36"
          stroke="var(--accent)"
          strokeWidth="1.4"
          strokeLinecap="round"
          fill="none"
        />
        {/* Top star accent */}
        <circle cx="24" cy="6" r="1.5" fill="var(--accent)" />
      </svg>
      {showWordmark && <strong>The Mageto Portfolio</strong>}
    </span>
  );
}
```

## `frontend/src/components/PageBanner.jsx`

```react jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaChevronLeft, FaChevronRight } from 'react-icons/fa6';

/**
 * PageBanner — sliding hero carousel.
 *
 * Props:
 *   pageKey   — string, used for CSS scoping and aria-label
 *   slides    — array of slide objects from useHeroSlides()
 *   profile   — profile object from useProfile() for the identity card
 *   level     — heading level ('h1' on home, 'h2' elsewhere)
 *   ctas      — optional JSX rendered on every slide (page-level CTAs)
 *
 * Per-slide CTAs: if a slide has `cta_label` + `cta_href` those are
 * rendered as a button on that slide only (used on the Home carousel so
 * each slide can link to its own page).
 */
export default function PageBanner({ pageKey, slides, profile, level = 'h2', ctas }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Reset to first slide whenever the page changes
  useEffect(() => { setIndex(0); }, [pageKey]);

  // Auto-advance only when there are multiple slides
  useEffect(() => {
    if (!slides || slides.length < 2 || paused) return undefined;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), 7000);
    return () => clearInterval(timer);
  }, [slides, paused]);

  if (!slides || slides.length === 0) {
    return <div className="skeleton-banner" aria-hidden="true" />;
  }

  const Heading = level;
  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
  const next = () => setIndex((i) => (i + 1) % slides.length);

  return (
    <section
      className={`page-banner page-banner--${pageKey}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label={`${pageKey} hero banner`}
    >
      {/* ── Sliding track ── */}
      <div
        className="page-banner-track"
        style={{ transform: `translateX(-${index * (100 / slides.length)}%)`, width: `${slides.length * 100}%` }}
      >
        {slides.map((slide, slideIdx) => {
          const hasImage = Boolean(slide.background_image_url);
          // Per-slide CTA takes priority; fall back to page-level ctas
          const slideActions = slide.cta_label && slide.cta_href
            ? (
              <div className="hero-actions">
                <Link to={slide.cta_href} className="cta-primary">
                  {slide.cta_label} <FaArrowRight />
                </Link>
              </div>
            )
            : ctas
              ? <div className="hero-actions">{ctas}</div>
              : null;

          return (
            <div
              key={slide.id}
              className={`page-banner-slide ${hasImage ? 'has-image' : 'no-image'}`}
              style={{ width: `${100 / slides.length}%`, flexShrink: 0 }}
            >
              {hasImage && (
                <img
                  className="page-banner-bg"
                  src={slide.background_image_url}
                  alt=""
                  aria-hidden="true"
                  loading={slideIdx === 0 ? 'eager' : 'lazy'}
                  fetchpriority={slideIdx === 0 ? 'high' : 'low'}
                />
              )}
              <div className="page-banner-overlay" />

              {/* Copy panel */}
              <div className="page-banner-copy">
                {slide.eyebrow && <span className="eyebrow">{slide.eyebrow}</span>}
                <Heading>{slide.heading}</Heading>
                {slide.subheading && <p className="lead">{slide.subheading}</p>}
                {slide.body && <p>{slide.body}</p>}
                {slideActions}
              </div>

              {/* Identity card */}
              <aside className="page-banner-card">
                {profile?.portrait_url
                  ? <img className="avatar-photo" src={profile.portrait_url} alt={profile.full_name || 'Portrait'} />
                  : <span className="avatar">{(profile?.full_name || 'PM').split(' ').map((w) => w[0]).slice(0, 2).join('')}</span>
                }
                <strong>{profile?.full_name || 'Rev. Prof. Peter Mageto'}</strong>
                <span>{profile?.title || 'Fifth Vice Chancellor | Africa University'}</span>
                {slide.panel_caption && <p>{slide.panel_caption}</p>}
              </aside>
            </div>
          );
        })}
      </div>

      {/* ── Prev / Next arrows (only when multiple slides) ── */}
      {slides.length > 1 && (
        <>
          <button type="button" className="banner-arrow banner-arrow--prev" aria-label="Previous slide" onClick={prev}>
            <FaChevronLeft />
          </button>
          <button type="button" className="banner-arrow banner-arrow--next" aria-label="Next slide" onClick={next}>
            <FaChevronRight />
          </button>
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
        </>
      )}
    </section>
  );
}
```

## `frontend/src/components/PortfolioIndex.jsx`

```react jsx
import { NavLink, useLocation } from 'react-router-dom';
import { FaBookOpen, FaChartLine, FaEnvelope, FaLandmark, FaNewspaper, FaShieldHalved } from 'react-icons/fa6';
import { navItems } from '../data/profileData.js';

const indexIcons = {
  '/leadership': FaLandmark,
  '/scholarship': FaBookOpen,
  '/strategy': FaChartLine,
  '/contact': FaEnvelope,
  '/sources': FaNewspaper,
  '/dashboard': FaShieldHalved,
};

export default function PortfolioIndex() {
  const location = useLocation();
  const items = navItems.filter((item) => item.to !== '/' && item.to !== '/roadmap');
  const current = Math.max(items.findIndex((item) => item.to === location.pathname) + 1, 1);

  return (
    <aside className="portfolio-index" aria-label="Portfolio index">
      <div className="index-head">
        <strong>Portfolio Index</strong>
        <span>{current} / {items.length}</span>
      </div>
      <nav>
        {items.map((item) => {
          const Icon = indexIcons[item.to] || FaNewspaper;
          return (
            <NavLink key={item.to} to={item.to}>
              <span className="index-thumb"><Icon /></span>
              <span><strong>{item.label}</strong><small>{item.summary}</small></span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
```

## `frontend/src/components/Sidebar.jsx`

```react jsx
import { NavLink } from 'react-router-dom';
import {
  FaBookOpen, FaChartLine, FaEnvelope, FaHouse, FaLandmark,
  FaMap, FaNewspaper, FaShieldHalved, FaXmark, FaRightToBracket,
} from 'react-icons/fa6';
import Logo from './Logo.jsx';
import { useProfile } from '../lib/useProfile.js';
import { navItems } from '../data/profileData.js';

const navIcons = {
  '/': FaHouse,
  '/leadership': FaLandmark,
  '/scholarship': FaBookOpen,
  '/strategy': FaChartLine,
  '/roadmap': FaMap,
  '/contact': FaEnvelope,
  '/sources': FaNewspaper,
  '/dashboard': FaShieldHalved,
};

const publicNavItems = navItems.filter((item) => item.to !== '/dashboard');

export default function Sidebar({ open, onClose, signedIn }) {
  const { data } = useProfile();

  return (
    <>
      <aside className={`sidebar ${open ? 'open' : ''}`} aria-label="Site navigation">
        {/* Clean header — just logo + close button */}
        <div className="sidebar-head">
          <Logo logoUrl={data?.profile?.logo_url} compact />
          <button className="icon-button close-sidebar" type="button" onClick={onClose} aria-label="Close navigation">
            <FaXmark />
          </button>
        </div>

        <nav className="sidebar-nav">
          {publicNavItems.map((item) => {
            const Icon = navIcons[item.to] || FaNewspaper;
            return (
              <NavLink key={item.to} to={item.to} onClick={onClose}>
                <Icon /><span>{item.label}</span>
              </NavLink>
            );
          })}

          {/* Dashboard — only when signed in */}
          {signedIn && (
            <NavLink to="/dashboard" onClick={onClose}>
              <FaShieldHalved /><span>Dashboard</span>
            </NavLink>
          )}

          {/* Sign in / Account */}
          <NavLink to={signedIn ? '/dashboard' : '/access'} onClick={onClose} className="sidebar-signin-link">
            <FaRightToBracket />
            <span>{signedIn ? 'My Account' : 'Sign in'}</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <strong>Office of the Vice Chancellor</strong>
          <span>Africa University | Old Mutare, Zimbabwe</span>
        </div>
      </aside>
      {open && (
        <button
          className="sidebar-backdrop"
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
        />
      )}
    </>
  );
}
```

## `frontend/src/data/profileData.js`

```javascript
// ── Verified official image sources ─────────────────────────────────────────
// Image fallbacks are limited to Africa University-owned profile photos.

// Portrait & headshots
const IMG_PORTRAIT_FACULTY = 'https://africau.edu/wp-content/uploads/2023/12/profmageto-1.png';
const IMG_PORTRAIT_VC      = 'https://africau.edu/wp-content/themes/africau/images/profmageto.png';



export const SITE_NAME = 'The Peter Mageto Leadership Portfolio';
export const navItems = [
  { to: '/', label: 'Overview', summary: 'Executive profile landing page' },
  { to: '/leadership', label: 'Leadership', summary: 'Institutional service and governance' },
  { to: '/scholarship', label: 'Scholarship', summary: 'Ethics, theology, research themes' },
  { to: '/strategy', label: 'Strategy', summary: '2023-2027 strategic priorities' },
  { to: '/roadmap', label: 'Roadmap', summary: 'Future website improvements' },
  { to: '/contact', label: 'Contact', summary: 'Secure enquiries and workflow' },
  { to: '/sources', label: 'Sources', summary: 'Verified public references' },
  { to: '/dashboard', label: 'Dashboard', summary: 'Admin inbox and content tools' },
];

export const highlights = [
  { value: '5th', label: 'Vice Chancellor of Africa University' },
  { value: '25+', label: 'Years in ministry and higher education' },
  { value: '2023-2027', label: 'Strategic plan leadership period' },
  { value: 'Pan-African', label: 'Institutional identity and mission' },
];

export const credentials = [
  'Ph.D. in Theological Ethics, Garrett-Evangelical Theological Seminary, USA',
  'Master of Theological Studies, Garrett-Evangelical Theological Seminary, USA',
  "Bachelor of Divinity, St Paul's United Theological College, Kenya",
  'Postgraduate certificate in African Studies, Northwestern University',
];

export const career = [
  { role: 'Vice Chancellor', place: 'Africa University, Zimbabwe', note: 'Leads the pan-African United Methodist-related institution as its fifth Vice Chancellor.' },
  { role: 'Deputy Vice Chancellor and Interim Vice Chancellor', place: 'Africa University', note: 'Served in senior academic leadership before his installation as Vice Chancellor.' },
  { role: 'Vice Chancellor and Professor of Ethics', place: 'University of Kigali, Rwanda', note: 'Advanced institutional leadership, academic quality, and ethical scholarship.' },
  { role: 'Academic Leader and Ethics Scholar', place: 'Kenya Methodist University, Daystar University, University of Evansville', note: 'Held roles across academic affairs, student welfare, ethics teaching, and departmental leadership.' },
];

export const strategyGoals = [
  'Enhance student access and success',
  'Invest in and empower staff',
  'Increase financial stewardship and institutional sustainability',
  'Cultivate strategic partnerships and economic competitiveness',
  'Internationalize research, teaching, and learning',
];

export const leadershipFocus = [
  { title: 'Student access and success', text: 'Positioning the university to support student opportunity, retention, learning quality, and graduate impact.' },
  { title: 'Values-led governance', text: 'Connecting institutional decisions to ethics, accountability, community, and Africa University values.' },
  { title: 'Research internationalization', text: 'Strengthening teaching, research, and partnerships that connect Africa University to the continent and the world.' },
  { title: 'Sustainable growth', text: 'Prioritizing stewardship, partnerships, and financial sustainability for long-term institutional resilience.' },
];

export const stakeholderPaths = [
  'Prospective students and families seeking an institutional leadership profile',
  'Partners and donors evaluating strategic direction and credibility',
  'Media teams looking for verified biography, role, and contact information',
  'Academic collaborators reviewing scholarship, ethics, and leadership background',
];

export const researchThemes = ['Ethics', 'Theology', 'HIV/AIDS', 'Education', 'Peace', 'Reconciliation'];
export const publications = [
  'Victim Theology',
  'Corporate and personal ethics for sustainable development',
  'Book Review: European Traditions in the Study of Religion in Africa',
];

export const roadmap = [
  'Client-approved portrait, biography, speeches, awards, and media assets',
  'Dedicated pages for biography, publications, speeches, media, and gallery',
  'Secure Neon-backed admin CMS for communications staff to update approved content',
  'Official contact form with spam protection, inbox workflow, and email delivery',
  'Custom domain, analytics, sitemap, performance review, and launch checklist',
];

export const sources = [
  { label: 'Africa University official Vice Chancellor profile', url: 'https://africau.edu/about/vice-chancellor/' },
  { label: 'UM News profile on Prof. Mageto', url: 'https://www.umnews.org/en/news/new-vice-chancellor-fulfills-calling-at-africa-university' },
  { label: 'Africa University 2023/27 Strategic Plan launch', url: 'https://aunews.africau.edu/africa-universitys-vice-chancellor-launches-2023-27-strategic-plan/' },
  { label: 'Africa University official contact page', url: 'https://africau.edu/about/contact-us/' },
];

/* ── Fallback hero slides ──────────────────────────────────────────────────
 *
 * DESIGN:
 *   Overview (Home) — 7 rotating slides, one per site section.
 *     Each slide has a distinct verified photo and a CTA linking to that page.
 *     Visitors get a full visual tour of the portfolio from the home page.
 *
 *   Individual pages — 1 static slide each (no rotation, no arrows).
 *     On a content page you are already reading that topic; a single strong
 *     hero is the correct treatment.
 *
 * IMAGE SOURCES (all verified public official URLs):
 *   africau.edu faculty/VC pages, UM News media library, AU News events archive.
 */
export const fallbackHeroSlides = [

  // ════════════════════════════════════════════════════════════════════
  // OVERVIEW (HOME) — 7 slides rotating, each linking to its page
  // ════════════════════════════════════════════════════════════════════

  {
    id: 'fb-overview-1',
    page_key: 'overview',
    sort_order: 0,
    eyebrow: 'Africa University Vice Chancellor',
    heading: 'Rev. Professor Peter Mageto',
    subheading: 'The fifth Vice Chancellor of Africa University — a theological ethics scholar advancing pan-African education through justice, equity, and student-centered transformation.',
    body: null,
    panel_caption: 'Leading Africa University into a new era of excellence, access, and continental impact.',
    background_image_url: null,
    cta_label: 'Executive Profile',
    cta_href: '/leadership',
  },
  {
    id: 'fb-overview-2',
    page_key: 'overview',
    sort_order: 1,
    eyebrow: 'Institutional Service',
    heading: 'Leadership & Governance',
    subheading: 'A career spanning Africa and the United States — from Kenya Methodist University to the Vice Chancellorship of Africa University — grounded in ethical scholarship.',
    body: null,
    panel_caption: 'A lifelong commitment to values-led institutional leadership.',
    background_image_url: IMG_PORTRAIT_FACULTY,
    cta_label: 'View Leadership Profile',
    cta_href: '/leadership',
  },
  {
    id: 'fb-overview-3',
    page_key: 'overview',
    sort_order: 2,
    eyebrow: 'Academic Profile',
    heading: 'Scholarship & Research',
    subheading: 'Ph.D. in Theological Ethics from Garrett-Evangelical — advancing discourse on justice, reconciliation, HIV/AIDS, and sustainable development across the continent.',
    body: null,
    panel_caption: 'Author of "Victim Theology" and contributor to African ethical scholarship.',
    background_image_url: IMG_PORTRAIT_VC,
    cta_label: 'Explore Scholarship',
    cta_href: '/scholarship',
  },
  {
    id: 'fb-overview-4',
    page_key: 'overview',
    sort_order: 3,
    eyebrow: '2023–2027 Strategic Plan',
    heading: 'Strategy & Vision',
    subheading: 'Five strategic goals positioning Africa University for sustainable growth, internationalized research, empowered staff, and enhanced student success.',
    body: null,
    panel_caption: 'A roadmap for pan-African academic excellence and institutional resilience.',
    background_image_url: null,
    cta_label: 'Explore Strategy',
    cta_href: '/strategy',
  },
  {
    id: 'fb-overview-5',
    page_key: 'overview',
    sort_order: 4,
    eyebrow: 'Platform Development',
    heading: 'Portfolio Roadmap',
    subheading: 'Milestones toward a fully operational leadership portfolio — from content approval to CMS deployment and official public launch.',
    body: null,
    panel_caption: 'Building a digital presence worthy of Africa University.',
    background_image_url: null,
    cta_label: 'View Roadmap',
    cta_href: '/roadmap',
  },
  {
    id: 'fb-overview-6',
    page_key: 'overview',
    sort_order: 5,
    eyebrow: 'Get in Touch',
    heading: 'Contact the Office',
    subheading: "Reach the Vice Chancellor's office through official channels. Enquiries are routed securely and responded to by the communications team.",
    body: null,
    panel_caption: 'Africa University, Old Mutare, Manicaland, Zimbabwe.',
    background_image_url: null,
    cta_label: 'Contact the Office',
    cta_href: '/contact',
  },
  {
    id: 'fb-overview-7',
    page_key: 'overview',
    sort_order: 6,
    eyebrow: 'Transparency & Trust',
    heading: 'Verified Sources',
    subheading: 'Every claim on this portfolio is traced to an official public source — Africa University publications, UM News, and institutional records.',
    body: null,
    panel_caption: 'No claim without a verified citation.',
    background_image_url: null,
    cta_label: 'View Sources',
    cta_href: '/sources',
  },

  // ════════════════════════════════════════════════════════════════════
  // INDIVIDUAL PAGES — 1 static slide each, distinct photo per page
  // ════════════════════════════════════════════════════════════════════

  {
    id: 'fb-leadership',
    page_key: 'leadership',
    sort_order: 0,
    eyebrow: 'Institutional Service',
    heading: 'Leadership & Governance',
    subheading: 'A career spanning multiple institutions across Africa and the United States, grounded in ethical scholarship and transformational governance.',
    body: null,
    panel_caption: 'From Kenya Methodist University to Africa University — a lifelong commitment to values-led leadership.',
    background_image_url: IMG_PORTRAIT_FACULTY,
    cta_label: null,
    cta_href: null,
  },

  {
    id: 'fb-scholarship',
    page_key: 'scholarship',
    sort_order: 0,
    eyebrow: 'Academic Profile',
    heading: 'Scholarship & Research',
    subheading: 'Theological ethics scholar with a Ph.D. from Garrett-Evangelical, advancing discourse on justice, reconciliation, HIV/AIDS, and sustainable development.',
    body: null,
    panel_caption: 'Author of "Victim Theology" and contributor to African ethical scholarship.',
    background_image_url: null,
    cta_label: null,
    cta_href: null,
  },

  {
    id: 'fb-strategy',
    page_key: 'strategy',
    sort_order: 0,
    eyebrow: '2023–2027 Strategic Plan',
    heading: 'Strategy & Vision',
    subheading: 'Five strategic goals positioning Africa University for sustainable growth, internationalized research, empowered staff, and enhanced student success.',
    body: null,
    panel_caption: 'A roadmap for pan-African academic excellence and institutional resilience.',
    background_image_url: null,
    cta_label: null,
    cta_href: null,
  },

  {
    id: 'fb-roadmap',
    page_key: 'roadmap',
    sort_order: 0,
    eyebrow: 'Platform Development',
    heading: 'Portfolio Roadmap',
    subheading: 'Milestones toward a fully operational leadership portfolio — from content approval to CMS deployment and official launch.',
    body: null,
    panel_caption: 'Building a digital presence worthy of Africa University.',
    background_image_url: null,
    cta_label: null,
    cta_href: null,
  },

  {
    id: 'fb-contact',
    page_key: 'contact',
    sort_order: 0,
    eyebrow: 'Get in Touch',
    heading: 'Contact the Office',
    subheading: "Reach the Vice Chancellor's office through official channels. Enquiries are routed securely and responded to by the communications team.",
    body: null,
    panel_caption: 'Africa University, Old Mutare, Manicaland, Zimbabwe.',
    background_image_url: null,
    cta_label: null,
    cta_href: null,
  },

  {
    id: 'fb-sources',
    page_key: 'sources',
    sort_order: 0,
    eyebrow: 'Transparency & Trust',
    heading: 'Verified Sources',
    subheading: 'Every claim on this portfolio is traced to an official public source. No unverified material is presented.',
    body: null,
    panel_caption: 'Built on Africa University publications, UM News, and institutional records.',
    background_image_url: IMG_PORTRAIT_VC,
    cta_label: null,
    cta_href: null,
  },
];
```

## `frontend/src/lib/api.js`

```javascript
export const apiFetch = async (path, options = {}) => {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const payload = await response.json().catch(() => ({}));
  if (response.status === 401) {
    localStorage.removeItem('pm-token');
    localStorage.removeItem('pm-email');
    if (!location.pathname.includes('/access')) location.assign('/access');
  }
  if (!response.ok) {
    throw new Error(payload.error || payload.message || `Request failed with status ${response.status}`);
  }
  return payload;
};

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

## `frontend/src/lib/useProfile.js`

```javascript
import { createContext, createElement, useCallback, useContext, useEffect, useState } from 'react';
import { apiFetch } from './api.js';
import { fallbackHeroSlides } from '../data/profileData.js';

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
    } catch (_error) {
      setStatus('error');
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  return createElement(ProfileContext.Provider, { value: { data, status, reload } }, children);
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside <ProfileProvider>');
  return ctx;
}

export function useHeroSlides(pageKey) {
  const { data } = useProfile();
  const apiSlides = data?.heroSlides?.filter((slide) => slide.page_key === pageKey).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)) || [];
  // If the API returned slides for this page, use them; otherwise fall back to hardcoded data
  if (apiSlides.length > 0) return apiSlides;
  return fallbackHeroSlides.filter((slide) => slide.page_key === pageKey);
}
```

## `frontend/src/main.jsx`

```react jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles.css';
import { ProfileProvider } from './lib/useProfile.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ProfileProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ProfileProvider>
  </React.StrictMode>,
);
```

## `frontend/src/pages/Access.jsx`

```react jsx
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

export default function Access({ signedIn, onSignIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    document.title = 'Sign In | Peter Mageto Portfolio Admin';
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setStatus('Checking credentials...');
    try {
      await onSignIn(email, password);
      setStatus('Signed in');
    } catch (error) {
      setStatus(error.message);
    }
  };

  if (signedIn) return <Navigate to="/dashboard" replace />;

  return (
    <section className="page-section access-page access-clean">
      <div className="access-copy">
        <span className="eyebrow">Secure Access</span>
        <h1>Admin access</h1>
        <p className="lead">Sign in to review messages, content updates, and client-preview backend workflows.</p>
      </div>
      <form className="contact-form access-form" onSubmit={submit}>
        <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
        <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
        <button className="button-link" type="submit">Sign in</button>
        {status && <p className="form-status">{status}</p>}
      </form>
    </section>
  );
}
```

## `frontend/src/pages/Contact.jsx`

```react jsx
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBuilding, FaEnvelope, FaGlobe, FaPhone } from 'react-icons/fa6';
import ContactForm from '../components/ContactForm.jsx';
import PageBanner from '../components/PageBanner.jsx';
import LikeButton from '../components/LikeButton.jsx';
import { useHeroSlides, useProfile } from '../lib/useProfile.js';

export default function Contact({ signedIn, token }) {
  const slides = useHeroSlides('contact');
  const { data } = useProfile();
  const profile = data?.profile;

  useEffect(() => {
    document.title = 'Contact | Office of the Vice Chancellor — Africa University';
  }, []);

  return (
    <>
      <PageBanner
        pageKey="contact"
        slides={slides}
        profile={data?.profile}
        ctas={
          <>
            <a href="#contact-form">Send a message</a>
            <Link to="/sources">Check sources</Link>
          </>
        }
      />
      <LikeButton pageKey="contact" />
      <section id="contact-form" className="page-section two-column">
        {/* Office info panel */}
        <div>
          <span className="eyebrow">Contact Workflow</span>
          <h2>Structured communication for official enquiries.</h2>
          <p className="lead">
            The contact form connects directly to an admin-reviewed inbox. Messages are logged, tracked,
            and followed up via official Africa University channels.
          </p>

          <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <FaBuilding style={{ color: 'var(--accent)', marginTop: '0.15rem', flexShrink: 0 }} />
              <div>
                <strong style={{ display: 'block' }}>Office of the Vice Chancellor</strong>
                <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                  {profile?.address || 'Africa University | Old Mutare, Mutare, Zimbabwe'}
                </span>
              </div>
            </div>
            {profile?.email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FaEnvelope style={{ color: 'var(--accent)', flexShrink: 0 }} />
                <a href={`mailto:${profile.email}`} style={{ color: 'var(--brand-strong)', fontWeight: 700 }}>{profile.email}</a>
              </div>
            )}
            {profile?.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FaPhone style={{ color: 'var(--accent)', flexShrink: 0 }} />
                <a href={`tel:${profile.phone}`} style={{ color: 'var(--brand-strong)', fontWeight: 700 }}>{profile.phone}</a>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <FaGlobe style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <a href="https://africau.edu/about/contact-us/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand-strong)', fontWeight: 700 }}>
                Official Africa University contact page ↗
              </a>
            </div>
          </div>
        </div>

        <ContactForm signedIn={signedIn} token={token} />
      </section>
    </>
  );
}
```

## `frontend/src/pages/Dashboard.jsx`

```react jsx
import { useEffect } from 'react';
import AdminDashboard from '../components/AdminDashboard.jsx';

export default function Dashboard({ signedIn, token }) {
  useEffect(() => {
    document.title = 'Admin Dashboard | Peter Mageto Portfolio CMS';
  }, []);

  return (
    <section className="page-section">
      <span className="eyebrow">Backend System</span>
      <h1>Admin dashboard and content operations.</h1>
      <p className="lead">
        A real operational layer for profile edits, banner slides, collections, messages, authentication,
        and full content management.
      </p>
      <AdminDashboard signedIn={signedIn} token={token} />
    </section>
  );
}
```

## `frontend/src/pages/ForgotPassword.jsx`

```react jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../lib/api.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    document.title = 'Forgot Password | Prof. Peter Mageto Portfolio';
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!email) { setStatus('Please enter your email address.'); return; }
    setLoading(true);
    setStatus('');
    try {
      // For now, this is a UI-only flow. In production, wire to /api/auth/forgot-password
      await new Promise((r) => setTimeout(r, 1200));
      setSent(true);
    } catch (err) {
      setStatus(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell auth-shell--centered">
      <div className="auth-form-wrap auth-form-wrap--solo">
        <div className="auth-brand-mark auth-brand-mark--center">
          <span className="auth-logo-circle">PM</span>
        </div>
        <h1 className="auth-title">Forgot password?</h1>
        <p className="auth-subtitle">Enter your email and we'll send you a reset link.</p>

        {sent ? (
          <div className="auth-success-card">
            <span className="auth-success-icon">✓</span>
            <strong>Check your inbox!</strong>
            <p>If an account exists for <em>{email}</em>, a reset link has been sent.</p>
            <Link to="/access" className="auth-submit" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
              Back to Sign In →
            </Link>
          </div>
        ) : (
          <form className="auth-form" onSubmit={submit} noValidate>
            <div className="auth-field">
              <label htmlFor="forgot-email">Email address</label>
              <p className="auth-field-helper">We'll send a password reset link to this address.</p>
              <input
                id="forgot-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            {status && <p className="auth-status auth-status--error">{status}</p>}

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? 'Sending…' : 'Send reset link →'}
            </button>

            <p className="auth-switch">
              Remember it? <Link to="/access">Back to sign in</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
```

## `frontend/src/pages/Home.jsx`

```react jsx
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaHandshake, FaScaleBalanced, FaUserTie } from 'react-icons/fa6';
import IconCard from '../components/IconCard.jsx';
import PageBanner from '../components/PageBanner.jsx';
import LikeButton from '../components/LikeButton.jsx';
import { highlights, leadershipFocus, SITE_NAME, stakeholderPaths } from '../data/profileData.js';
import { useHeroSlides, useProfile } from '../lib/useProfile.js';

export default function Home() {
  const slides = useHeroSlides('overview');
  const { data } = useProfile();

  useEffect(() => {
    document.title = 'Overview | Rev. Prof. Peter Mageto  Africa University Vice Chancellor';
  }, []);

  return (
    <>
      <PageBanner
        pageKey="overview"
        slides={slides}
        profile={data?.profile}
        level="h1"
      />
      <LikeButton pageKey="overview" />

      {/* Stats band */}
      <section className="stat-band">
        {highlights.map((item) => (
          <div key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        ))}
      </section>

      {/* Core values cards */}
      <section className="card-grid page-section">
        <IconCard icon={FaUserTie} title="Institutional Leadership">
          Guides Africa University as a student-centered, values-grounded, pan-African institution advancing justice and equity.
        </IconCard>
        <IconCard icon={FaScaleBalanced} title="Ethics and Justice">
          Connects scholarship and governance to ethics, justice, equity, counsel, and service across the continent.
        </IconCard>
        <IconCard icon={FaHandshake} title="Partnerships">
          Frames collaboration and global networks as instruments for societal transformation and shared growth.
        </IconCard>
      </section>

      {/* Credibility note */}
      <section className="page-section" style={{ paddingTop: 0 }}>
        <p className="credibility-note">
          All claims on this site are drawn from Africa University's official website, UM News, and public announcements.
          Every page links to its primary source. <Link to="/sources" style={{ color: 'var(--brand-strong)', fontWeight: 700 }}>View all sources ?</Link>
        </p>
      </section>

      {/* Stakeholder paths */}
      <section className="stakeholder-section page-section">
        <div>
          <span className="eyebrow">Audience Design</span>
          <h2>Built for credible information, fast.</h2>
          <p className="lead">This portfolio serves funders, partners, academic peers, students, and media  each with a direct path to what matters most to them.</p>
        </div>
        <div className="stakeholder-list">
          {stakeholderPaths.map((path) => (
            <article key={path}>
              <FaArrowRight />
              <span>{path}</span>
            </article>
          ))}
        </div>
      </section>

      {/* Leadership focus grid */}
      <section className="focus-grid page-section">
        {leadershipFocus.map((item, index) => (
          <article key={item.title}>
            <strong>{String(index + 1).padStart(2, '0')}</strong>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </section>
    </>
  );
}
```

## `frontend/src/pages/Leadership.jsx`

```react jsx
import { useEffect } from 'react';
import { FaQuoteLeft } from 'react-icons/fa6';
import PageBanner from '../components/PageBanner.jsx';
import LikeButton from '../components/LikeButton.jsx';
import { leadershipFocus } from '../data/profileData.js';
import { useHeroSlides, useProfile } from '../lib/useProfile.js';

export default function Leadership() {
  const slides = useHeroSlides('leadership');
  const { data } = useProfile();
  const career = data?.careerEntries ?? [];

  useEffect(() => {
    document.title = 'Leadership | Rev. Prof. Peter Mageto — Africa University';
  }, []);

  return (
    <>
      <PageBanner pageKey="leadership" slides={slides} profile={data?.profile} />
      <LikeButton pageKey="leadership" />

      {/* Leadership philosophy grid */}
      <section className="focus-grid page-section">
        {leadershipFocus.map((item, index) => (
          <article key={item.title}>
            <strong>{String(index + 1).padStart(2, '0')}</strong>
            <h2 style={{ fontSize: 'inherit' }}>{item.title}</h2>
            <p>{item.text}</p>
          </article>
        ))}
      </section>

      {/* Career timeline */}
      <section className="timeline-section page-section">
        <div style={{ marginBottom: '1.5rem' }}>
          <span className="eyebrow">Career Path</span>
          <h2>Leadership timeline.</h2>
          <p className="lead">From pastoral ministry and academia to institutional leadership, Prof. Mageto's journey spans Kenya, Rwanda, the United States, and Zimbabwe.</p>
        </div>
        <div className="timeline">
          {career.length === 0 && (
            <>
              {[{
                role: 'Vice Chancellor', place: 'Africa University, Zimbabwe',
                note: 'Leads the pan-African United Methodist-related institution as its fifth Vice Chancellor.',
              }, {
                role: 'Deputy Vice Chancellor & Interim Vice Chancellor', place: 'Africa University',
                note: 'Served in senior academic leadership before installation as Vice Chancellor.',
              }, {
                role: 'Vice Chancellor and Professor of Ethics', place: 'University of Kigali, Rwanda',
                note: 'Advanced institutional leadership, academic quality, and ethical scholarship.',
              }, {
                role: 'Academic Leader & Ethics Scholar', place: 'Kenya Methodist University, Daystar University, University of Evansville',
                note: 'Held roles across academic affairs, student welfare, and ethics teaching.',
              }].map((item) => (
                <article key={item.role}>
                  <span />
                  <div>
                    <strong>{item.role}</strong>
                    <em>{item.place}</em>
                    <p>{item.note}</p>
                  </div>
                </article>
              ))}
            </>
          )}
          {career.map((item) => (
            <article key={item.id || item.role + item.place}>
              <span />
              <div>
                <strong>{item.role}</strong>
                <em>{item.place}</em>
                {item.note && <p>{item.note}</p>}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Quote band */}
      <section className="quote-band" style={{ padding: 'clamp(2rem, 5vw, 4rem) max(1rem, calc((100% - 1180px) / 2))' }}>
        <FaQuoteLeft style={{ color: 'var(--accent)', fontSize: '1.5rem', marginBottom: '0.5rem' }} />
        <blockquote>
          My vision and plan is to see that Africa University keeps its identity as pan-African and trains people for the continent of Africa.
        </blockquote>
        <span style={{ color: 'var(--muted)', fontStyle: 'italic' }}>— Prof. Peter Mageto, UM News</span>
      </section>
    </>
  );
}
```

## `frontend/src/pages/NotFound.jsx`

```react jsx
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="page-section notice-panel">
      <h1>Page not found</h1>
      <p>The requested route is not part of the leadership portfolio.</p>
      <Link className="button-link" to="/">Return home</Link>
    </section>
  );
}
```

## `frontend/src/pages/Roadmap.jsx`

```react jsx
import { useEffect } from 'react';
import PageBanner from '../components/PageBanner.jsx';
import LikeButton from '../components/LikeButton.jsx';
import { roadmap } from '../data/profileData.js';
import { useHeroSlides, useProfile } from '../lib/useProfile.js';

export default function Roadmap() {
  const slides = useHeroSlides('roadmap');
  const { data } = useProfile();

  useEffect(() => {
    document.title = 'Platform Roadmap | Rev. Prof. Peter Mageto Portfolio';
  }, []);

  return (
    <>
      <PageBanner pageKey="roadmap" slides={slides} profile={data?.profile} />
      <LikeButton pageKey="roadmap" />
      <section className="page-section">
        <span className="eyebrow">Platform Roadmap</span>
        <h2>What's built, what's in progress, what's planned.</h2>
        <p className="lead">
          A transparent list of where this portfolio platform stands before public launch.
          Each milestone is tracked in the admin dashboard.
        </p>
        <div className="roadmap-list" style={{ marginTop: '1.5rem' }}>
          {roadmap.map((item, index) => (
            <article key={item}>
              <strong>{String(index + 1).padStart(2, '0')}</strong>
              <span>{item}</span>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
```

## `frontend/src/pages/Scholarship.jsx`

```react jsx
import { useEffect } from 'react';
import { FaBookOpen, FaBuildingColumns, FaGraduationCap } from 'react-icons/fa6';
import PageBanner from '../components/PageBanner.jsx';
import LikeButton from '../components/LikeButton.jsx';
import { useHeroSlides, useProfile } from '../lib/useProfile.js';
import { credentials as staticCredentials, publications as staticPublications, researchThemes as staticResearchThemes } from '../data/profileData.js';

export default function Scholarship() {
  const slides = useHeroSlides('scholarship');
  const { data } = useProfile();
  const credentials = data?.credentials?.length ? data.credentials : staticCredentials.map((c, i) => ({ id: `sc-${i}`, label: c }));
  const publications = data?.publications?.length ? data.publications : staticPublications.map((p, i) => ({ id: `sp-${i}`, title: p }));
  const researchThemes = data?.researchThemes?.length ? data.researchThemes : staticResearchThemes.map((t, i) => ({ id: `st-${i}`, label: t }));

  useEffect(() => {
    document.title = 'Scholarship | Rev. Prof. Peter Mageto — Africa University';
  }, []);

  return (
    <>
      <PageBanner pageKey="scholarship" slides={slides} profile={data?.profile} />
      <LikeButton pageKey="scholarship" />

      {/* Credentials grid */}
      <section className="page-section">
        <span className="eyebrow">Academic Credentials</span>
        <h2>Educational foundation.</h2>
        <p className="lead">
          Grounded in theological ethics, African studies, and institutional leadership — credentials earned across
          Kenya, the United States, and Africa.
        </p>
        <div className="credential-grid" style={{ marginTop: '1.5rem' }}>
          {credentials.map((item) => (
            <article key={item.id || item.label}>
              <FaGraduationCap />
              <p>{item.label}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Research themes + Publications */}
      <section className="two-column page-section">
        <article>
          <FaBookOpen />
          <h2>Research Themes</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>
            Prof. Mageto's scholarship spans ethics, theology, and Africa's development challenges.
          </p>
          <div className="pill-row">
            {researchThemes.map((theme) => (
              <span key={theme.id || theme.label}>{theme.label}</span>
            ))}
          </div>
        </article>

        <article>
          <FaBuildingColumns />
          <h2>Selected Publications</h2>
          <ul style={{ paddingLeft: '1.25rem', display: 'grid', gap: '0.6rem' }}>
            {publications.map((item) => (
              <li key={item.id || item.title} style={{ lineHeight: '1.5' }}>{item.title}</li>
            ))}
          </ul>
          <p style={{ color: 'var(--muted)', fontSize: '0.84rem', marginTop: '1rem' }}>
            Publications listed are from publicly verified academic records and institutional biography.
          </p>
        </article>
      </section>
    </>
  );
}
```

## `frontend/src/pages/Sources.jsx`

```react jsx
import { useEffect } from 'react';
import { FaArrowUpRightFromSquare, FaCircleCheck } from 'react-icons/fa6';
import PageBanner from '../components/PageBanner.jsx';
import LikeButton from '../components/LikeButton.jsx';
import { useHeroSlides, useProfile } from '../lib/useProfile.js';
import { sources as staticSources } from '../data/profileData.js';

export default function Sources() {
  const slides = useHeroSlides('sources');
  const { data } = useProfile();
  const sources = data?.sources?.length ? data.sources : staticSources.map((s, i) => ({ id: `src-${i}`, ...s }));

  useEffect(() => {
    document.title = 'Sources | Rev. Prof. Peter Mageto — Africa University';
  }, []);

  return (
    <>
      <PageBanner pageKey="sources" slides={slides} profile={data?.profile} />
      <LikeButton pageKey="sources" />

      <section className="page-section">
        <span className="eyebrow">Verification</span>
        <h2>Sources and launch evidence.</h2>
        <p className="lead">
          A public leadership profile should be built from official, reviewable references. Every claim on this site
          is traceable to the primary source below.
        </p>

        <div className="source-list" style={{ marginTop: '1.5rem' }}>
          {sources.map((source) => (
            <a
              key={source.id || source.url}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="source-list-item"
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <FaCircleCheck style={{ color: 'var(--brand-strong)', flexShrink: 0, marginTop: '0.15rem' }} />
                <div>
                  <strong style={{ display: 'block', marginBottom: '0.15rem' }}>{source.label}</strong>
                  <span className="badge-verified">✓ Verified public record</span>
                </div>
              </div>
              <FaArrowUpRightFromSquare style={{ color: 'var(--muted)', flexShrink: 0 }} />
            </a>
          ))}
        </div>

        <div className="notice-panel" style={{ marginTop: '2rem' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--muted)' }}>
            <strong style={{ color: 'var(--text)' }}>Note on accuracy:</strong> All factual claims are drawn exclusively
            from Africa University's official website, UM News, and public institutional announcements.
            No inference, speculation, or secondary sources are used.
          </p>
        </div>
      </section>
    </>
  );
}
```

## `frontend/src/pages/Strategy.jsx`

```react jsx
import { useEffect } from 'react';
import PageBanner from '../components/PageBanner.jsx';
import LikeButton from '../components/LikeButton.jsx';
import { useHeroSlides, useProfile } from '../lib/useProfile.js';
import { strategyGoals as staticStrategyGoals } from '../data/profileData.js';

export default function Strategy() {
  const slides = useHeroSlides('strategy');
  const { data } = useProfile();
  const strategyGoals = data?.strategyGoals?.length ? data.strategyGoals : staticStrategyGoals.map((g, i) => ({ id: `sg-${i}`, label: g }));

  useEffect(() => {
    document.title = 'Strategy 2023–2027 | Rev. Prof. Peter Mageto — Africa University';
  }, []);

  return (
    <>
      <PageBanner pageKey="strategy" slides={slides} profile={data?.profile} />
      <LikeButton pageKey="strategy" />

      <section className="strategy page-section">
        <div className="strategy-copy">
          <span className="eyebrow">Strategic Plan 2023–2027</span>
          <h2>Student-centered leadership transformation in Africa.</h2>
          <p className="lead">
            Africa University's strategic direction under Prof. Mageto focuses on five interlocking priorities:
            student access and success, empowered staff, financial stewardship, strategic partnerships,
            and internationalized research, teaching, and learning.
          </p>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginTop: '0.75rem' }}>
            Launched February 2023 — <a href="https://aunews.africau.edu/africa-universitys-vice-chancellor-launches-2023-27-strategic-plan/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand-strong)', fontWeight: 700 }}>View official announcement ↗</a>
          </p>
        </div>

        <div className="strategy-list">
          {strategyGoals.map((goal, index) => (
            <article key={goal.id || goal.label}>
              <strong>{String(index + 1).padStart(2, '0')}</strong>
              <span>{goal.label}</span>
            </article>
          ))}
        </div>
      </section>

      {/* Summary note */}
      <section className="page-section" style={{ paddingTop: 0 }}>
        <div className="notice-panel">
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>
            <strong style={{ color: 'var(--text)' }}>Implementation note:</strong> The five strategic priorities were
            identified collaboratively with Africa University's Board, Senate, and key stakeholders and formally
            launched by Prof. Mageto in February 2023.
          </p>
        </div>
      </section>
    </>
  );
}
```

## `frontend/src/styles.css`

```css
:root {
  color-scheme: light;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: #f8f5ed;
  color: #18221d;
  --bg: #f8f5ed;
  --surface: #fffdf8;
  --surface-strong: #eef3ee;
  --text: #18221d;
  --muted: #5c665f;
  --line: rgba(24, 34, 29, 0.13);
  --brand: #105c43;
  --brand-strong: #0a3f31;
  --accent: #b38a31;
  --blue: #294a70;
  --shadow: 0 24px 70px rgba(25, 31, 28, 0.1);
}

:root[data-theme="dark"] {
  color-scheme: dark;
  background: #101815;
  color: #edf3ee;
  --bg: #101815;
  --surface: #16231e;
  --surface-strong: #1d3029;
  --text: #edf3ee;
  --muted: #b8c4bd;
  --line: rgba(237, 243, 238, 0.14);
  --brand: #75d3ad;
  --brand-strong: #a9e5cb;
  --accent: #d4b461;
  --blue: #91b5dd;
  --shadow: 0 24px 70px rgba(0, 0, 0, 0.28);
  --elevated-shadow: 0 1px 0 rgba(255,255,255,0.04) inset, 0 12px 48px rgba(0,0,0,0.5);
}

* { box-sizing: border-box; }
body { margin: 0; min-width: 320px; background: var(--bg); color: var(--text); }
a { color: inherit; text-decoration: none; }
button, input, textarea { font: inherit; }
button { cursor: pointer; }

.skip-link { position: fixed; left: 1rem; top: -5rem; z-index: 20; background: var(--brand); color: #fff; padding: 0.7rem 1rem; border-radius: 8px; }
.skip-link:focus { top: 1rem; }
.app-shell { min-height: 100vh; display: flex; flex-direction: column; }
.app-header {
  position: sticky; top: 0; z-index: 10; display: grid; grid-template-columns: minmax(260px, 1fr) auto auto;
  align-items: center; gap: 1rem; padding: 0.9rem clamp(1rem, 3vw, 3rem); background: color-mix(in srgb, var(--surface) 92%, transparent);
  border-bottom: 1px solid var(--line); backdrop-filter: blur(18px);
}
.header-left, .header-actions, .brand, .desktop-nav, .hero-actions, .panel-heading { display: flex; align-items: center; }
.header-left, .header-actions { gap: 0.75rem; }
.brand { gap: 0.8rem; min-width: 0; }
.brand span { display: grid; place-items: center; flex: 0 0 42px; width: 42px; height: 42px; border-radius: 50%; background: var(--brand-strong); color: #fff; font-weight: 900; }
.brand strong { font-size: clamp(0.9rem, 1.5vw, 1.05rem); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.desktop-nav { gap: 0.2rem; justify-content: center; }
.desktop-nav a { color: var(--muted); padding: 0.65rem 0.75rem; border-radius: 8px; font-size: 0.95rem; }
.desktop-nav a.active, .desktop-nav a:hover { background: var(--surface-strong); color: var(--brand-strong); }
.icon-button { display: grid; place-items: center; width: 44px; height: 44px; border: 1px solid var(--line); border-radius: 50%; background: var(--surface); color: var(--text); }
.nav-cta, .button-link {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.55rem; min-height: 44px; border: 0; border-radius: 8px;
  padding: 0.75rem 1.05rem; background: var(--brand-strong); color: #fff; font-weight: 800;
}
.sidebar { position: fixed; inset: 0 auto 0 0; z-index: 30; width: min(390px, 88vw); transform: translateX(-105%); transition: transform 180ms ease; background: var(--surface); border-right: 1px solid var(--line); padding: 1rem; box-shadow: var(--shadow); display: flex; flex-direction: column; gap: 1.2rem; }
.sidebar.open { transform: translateX(0); }
.sidebar-head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.sidebar-nav { display: grid; gap: 0.35rem; }
.sidebar-nav a { padding: 0.95rem 1rem; border-radius: 8px; color: var(--muted); border: 1px solid transparent; }
.sidebar-nav a.active, .sidebar-nav a:hover { background: var(--surface-strong); border-color: var(--line); color: var(--brand-strong); }
.sidebar-footer { margin-top: auto; display: grid; gap: 0.35rem; color: var(--muted); border-top: 1px solid var(--line); padding-top: 1rem; }
.sidebar-backdrop { position: fixed; inset: 0; z-index: 25; border: 0; background: rgba(10, 20, 15, 0.45); }
.page-main { flex: 1; }
.page-section, .page-band, .page-hero { width: min(1180px, calc(100% - 2rem)); margin: 0 auto; padding: clamp(3.5rem, 7vw, 6rem) 0; }
.hero { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.75fr); gap: clamp(2rem, 6vw, 5rem); align-items: center; min-height: calc(100vh - 82px); }
.eyebrow { color: var(--brand); font-weight: 900; text-transform: uppercase; font-size: 0.78rem; }
h1, h2, h3, p { margin-top: 0; }
h1 { font-family: Georgia, "Times New Roman", serif; font-size: clamp(3rem, 7vw, 6.8rem); line-height: 0.94; margin-bottom: 1.25rem; }
h2 { font-size: clamp(1.75rem, 3vw, 2.7rem); line-height: 1.05; margin-bottom: 1rem; }
h3 { font-size: 1.12rem; margin-bottom: 0.65rem; }
.lead, .page-hero p, .hero-copy p { color: var(--muted); font-size: clamp(1.05rem, 2vw, 1.35rem); line-height: 1.7; max-width: 760px; }
.hero-actions { flex-wrap: wrap; gap: 0.75rem; margin: 1.6rem 0; }
.hero-actions a { min-height: 46px; border-radius: 8px; padding: 0.8rem 1rem; border: 1px solid var(--line); background: var(--surface); font-weight: 800; }
.hero-actions a:first-child { background: var(--brand-strong); color: #fff; border-color: var(--brand-strong); display: inline-flex; align-items: center; gap: 0.5rem; }

.page-like-bar {
  width: min(960px, calc(100% - 3rem));
  margin: 1rem auto 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  color: var(--muted);
  font-size: 0.9rem;
}
.page-like-bar button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 40px;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 0.55rem 0.8rem;
  background: var(--surface);
  color: var(--brand-strong);
  font-weight: 800;
}
.page-like-bar button[aria-pressed="true"] {
  background: color-mix(in srgb, var(--accent) 18%, var(--surface));
  color: var(--text);
}
.page-like-bar button:disabled { cursor: default; opacity: 0.82; }
.credibility-note { color: var(--muted); border-left: 4px solid var(--accent); padding-left: 1rem; line-height: 1.6; max-width: 680px; }
.portrait-panel { min-height: 520px; border-radius: 8px; background: linear-gradient(145deg, var(--surface-strong), color-mix(in srgb, var(--brand) 16%, var(--surface))); border: 1px solid var(--line); box-shadow: var(--shadow); display: grid; align-content: end; padding: 1.2rem; overflow: hidden; position: relative; }
.portrait-panel::before { content: "PM"; position: absolute; inset: 12% 8% auto auto; font: 900 clamp(6rem, 16vw, 11rem)/1 Georgia, serif; color: color-mix(in srgb, var(--brand) 18%, transparent); }
.portrait-placeholder, .portrait-panel figcaption { position: relative; background: color-mix(in srgb, var(--surface) 88%, transparent); border: 1px solid var(--line); border-radius: 8px; padding: 1.2rem; }
.portrait-placeholder { display: grid; justify-items: start; gap: 0.35rem; margin-bottom: 0.8rem; }
.portrait-placeholder span { display: grid; place-items: center; width: 72px; height: 72px; border-radius: 50%; background: var(--brand-strong); color: #fff; font-weight: 900; font-size: 1.55rem; }
.portrait-placeholder strong, .portrait-panel figcaption strong { display: block; font-size: 1.25rem; margin-bottom: 0.25rem; }
.portrait-placeholder small, .portrait-panel figcaption span { color: var(--muted); }
.stat-band { display: grid; grid-template-columns: repeat(4, 1fr); border-block: 1px solid var(--line); background: var(--surface); }
.stat-band div { padding: 1.4rem clamp(1rem, 3vw, 2rem); border-right: 1px solid var(--line); display: grid; gap: 0.3rem; }
.stat-band strong { color: var(--brand-strong); font-size: 1.8rem; }
.stat-band span, .message-item span, footer span { color: var(--muted); }
.card-grid, .focus-grid, .credential-grid, .dashboard-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.icon-card, .focus-grid article, .credential-grid article, .dashboard-panel, .notice-panel, .two-column > article, .source-list a, .roadmap-list article, .strategy-list article, .message-item, .update-list article {
  background: var(--surface); border: 1px solid var(--line); border-radius: 8px; padding: 1.2rem;
}
.icon-card svg, .credential-grid svg, .two-column svg, .notice-panel svg { color: var(--accent); font-size: 1.45rem; margin-bottom: 0.8rem; }
.icon-card p, .focus-grid p, .update-list p { color: var(--muted); line-height: 1.65; }
.stakeholder-section, .two-column, .strategy, .access-page { display: grid; grid-template-columns: minmax(0, 0.9fr) minmax(320px, 1.1fr); gap: 2rem; align-items: start; }
.stakeholder-list, .strategy-list, .roadmap-list, .source-list, .message-list, .update-list { display: grid; gap: 0.8rem; }
.stakeholder-list article { display: flex; gap: 0.75rem; align-items: center; padding: 1rem 0; border-bottom: 1px solid var(--line); }
.page-hero { padding-bottom: 1.5rem; }
.timeline { display: grid; gap: 1rem; }
.timeline article { display: grid; grid-template-columns: 16px 1fr; gap: 1rem; }
.timeline article > span { width: 14px; height: 14px; border-radius: 50%; background: var(--accent); margin-top: 0.35rem; }
.timeline em { display: block; color: var(--blue); font-style: normal; margin: 0.25rem 0; }
.quote-band { background: var(--surface-strong); width: 100%; padding-inline: max(1rem, calc((100% - 1180px) / 2)); }
.quote-band blockquote { margin: 1rem 0; font: 400 clamp(1.8rem, 4vw, 3.5rem)/1.15 Georgia, serif; }
.pill-row { display: flex; flex-wrap: wrap; gap: 0.6rem; }
.pill-row span { border: 1px solid var(--line); border-radius: 999px; padding: 0.55rem 0.75rem; color: var(--brand-strong); background: var(--surface-strong); }
.strategy-list article, .roadmap-list article { display: grid; grid-template-columns: 54px 1fr; align-items: center; gap: 1rem; }
.strategy-list strong, .roadmap-list strong, .focus-grid strong { color: var(--accent); font-size: 1.5rem; }
.contact-form { display: grid; gap: 0.9rem; background: var(--surface); border: 1px solid var(--line); border-radius: 8px; padding: 1rem; }
.contact-form label { display: grid; gap: 0.45rem; color: var(--muted); font-weight: 800; }
.contact-form input, .contact-form textarea { width: 100%; border: 1px solid var(--line); border-radius: 8px; padding: 0.9rem 1rem; background: var(--bg); color: var(--text); resize: vertical; }
.form-status { color: var(--muted); margin: 0; }
.form-status.success { color: var(--brand-strong); }
.form-status.error { color: #b54040; }
.source-list a { display: flex; justify-content: space-between; align-items: center; gap: 1rem; color: var(--brand-strong); font-weight: 800; }
.dashboard-grid { grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr); align-items: start; margin-top: 1.5rem; }
.panel-heading { justify-content: space-between; gap: 1rem; }
.dashboard-status { color: var(--muted); }
.message-item { display: grid; gap: 0.75rem; }
.message-item div { display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
.message-item button { justify-self: start; display: inline-flex; gap: 0.45rem; align-items: center; border: 1px solid var(--line); background: var(--surface-strong); color: var(--text); border-radius: 8px; padding: 0.65rem 0.8rem; }
.page-loader { width: min(1180px, calc(100% - 2rem)); margin: 4rem auto; color: var(--muted); }
footer { display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap; padding: 1.4rem clamp(1rem, 3vw, 3rem); border-top: 1px solid var(--line); background: var(--surface); }

@media (max-width: 960px) {
  .app-header { grid-template-columns: 1fr auto; }
  .desktop-nav { display: none; }
  .hero, .stakeholder-section, .two-column, .strategy, .access-page, .dashboard-grid { grid-template-columns: 1fr; }
  .hero { min-height: auto; }
  .portrait-panel { min-height: 360px; }
  .stat-band, .card-grid, .focus-grid, .credential-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 620px) {
  .app-header { padding-inline: 0.75rem; gap: 0.5rem; }
  .brand strong { max-width: 46vw; }
  .header-actions .nav-cta { display: none; }
  h1 { font-size: clamp(2.8rem, 16vw, 4rem); }
  .stat-band, .card-grid, .focus-grid, .credential-grid { grid-template-columns: 1fr; }
  .stat-band div { border-right: 0; border-bottom: 1px solid var(--line); }
}



/* Application-shell refinement inspired by Brian's calmer portfolio UI */
.app-shell {
  background: linear-gradient(90deg, color-mix(in srgb, var(--surface) 72%, var(--bg)), var(--bg));
}

.app-header {
  grid-template-columns: minmax(260px, 340px) minmax(280px, 520px) auto;
  min-height: 74px;
  padding: 0.75rem 1.25rem;
}

.desktop-nav { display: none; }
.header-search {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 42px;
  width: min(520px, 100%);
  border: 1px solid var(--line);
  border-radius: 8px;
  background: color-mix(in srgb, var(--surface) 84%, #e8f1fa);
  color: var(--muted);
  padding: 0 0.9rem;
}
.header-search input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--text);
}
.header-search input::placeholder { color: var(--muted); }

.workspace-frame {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 348px;
  min-height: calc(100vh - 74px);
  margin-left: 280px;
}
.page-main {
  min-width: 0;
  border-right: 1px solid var(--line);
  background: color-mix(in srgb, var(--bg) 88%, var(--surface));
}
.page-section, .page-band, .page-hero {
  width: min(960px, calc(100% - 3rem));
}
.hero {
  min-height: calc(100vh - 74px);
  grid-template-columns: minmax(0, 1fr) minmax(260px, 0.72fr);
}
.hero-copy h1 { font-size: clamp(3.6rem, 7vw, 6.7rem); }

.sidebar {
  top: 74px;
  width: 280px;
  height: calc(100vh - 74px);
  border-right: 1px solid var(--line);
  box-shadow: none;
  background: color-mix(in srgb, var(--surface) 91%, transparent);
}
.sidebar-nav a {
  display: flex;
  align-items: center;
  gap: 0.95rem;
  min-height: 46px;
  font-weight: 800;
}
.sidebar-nav a svg {
  width: 18px;
  color: color-mix(in srgb, var(--muted) 80%, var(--brand));
}
.sidebar-nav a.active {
  background: color-mix(in srgb, var(--brand) 10%, var(--surface-strong));
  color: var(--brand-strong);
  border-color: color-mix(in srgb, var(--brand) 22%, var(--line));
}
.sidebar-nav a.active svg { color: var(--brand-strong); }
.close-sidebar { display: none; }
.sidebar-backdrop { display: none; }

.portfolio-index {
  position: sticky;
  top: 74px;
  height: calc(100vh - 74px);
  overflow: auto;
  background: color-mix(in srgb, var(--surface-strong) 78%, var(--bg));
  border-left: 1px solid var(--line);
}
.index-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 66px;
  padding: 1rem 1.1rem;
  border-bottom: 1px solid var(--line);
}
.index-head strong { font-size: 1.05rem; }
.index-head span { color: var(--muted); font-weight: 800; font-size: 0.86rem; }
.portfolio-index nav { display: grid; gap: 0; }
.portfolio-index a {
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 0.85rem;
  align-items: center;
  padding: 0.8rem 1rem;
  border-bottom: 1px solid var(--line);
  color: var(--muted);
}
.portfolio-index a.active {
  background: color-mix(in srgb, var(--brand) 13%, var(--surface));
  color: var(--brand-strong);
  border-left: 3px solid var(--brand);
}
.index-thumb {
  width: 64px;
  height: 52px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  background: color-mix(in srgb, var(--surface) 72%, var(--brand) 10%);
  border: 1px solid var(--line);
  color: var(--brand-strong);
}
.portfolio-index strong { display: block; color: var(--text); margin-bottom: 0.25rem; }
.portfolio-index small { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.35; }
footer { margin-left: 280px; }

@media (min-width: 1101px) {
  .sidebar { transform: none; z-index: 8; }
}

@media (max-width: 1220px) {
  .workspace-frame { grid-template-columns: minmax(0, 1fr); }
  .portfolio-index { display: none; }
}

@media (max-width: 1100px) {
  .app-header { grid-template-columns: 1fr auto; }
  .header-search { display: none; }
  .workspace-frame { margin-left: 0; }
  .sidebar {
    top: 0;
    height: 100vh;
    width: min(360px, 88vw);
    box-shadow: var(--shadow);
    transform: translateX(-105%);
    z-index: 30;
  }
  .sidebar.open { transform: translateX(0); }
  .close-sidebar, .sidebar-backdrop { display: grid; }
  footer { margin-left: 0; }
}

@media (max-width: 760px) {
  .page-section, .page-band, .page-hero { width: min(100% - 1.25rem, 960px); }
  .hero-copy h1 { font-size: clamp(2.9rem, 15vw, 4.4rem); }
}


/* Calm layout correction: remove crowded index feel and reduce visual weight */
.calm-shell .workspace-frame,
.workspace-frame { display: contents; margin-left: 0; }
.calm-shell .portfolio-index,
.portfolio-index { display: none; }

.calm-shell .page-main {
  margin-left: 264px;
  min-height: calc(100vh - 74px);
  border-right: 0;
  background: var(--bg);
}
.calm-shell footer { margin-left: 264px; }

.calm-shell .sidebar {
  width: 264px;
  background: color-mix(in srgb, var(--surface) 96%, var(--bg));
}
.calm-shell .sidebar-head {
  padding-bottom: 0.85rem;
  border-bottom: 1px solid var(--line);
}
.calm-shell .sidebar-brand strong { max-width: 172px; }
.calm-shell .sidebar-nav { gap: 0.2rem; }
.calm-shell .sidebar-nav a {
  min-height: 42px;
  padding: 0.72rem 0.85rem;
  font-size: 0.98rem;
}

.calm-shell .app-header {
  grid-template-columns: minmax(250px, 330px) minmax(260px, 520px) auto;
  background: color-mix(in srgb, var(--surface) 96%, transparent);
}
.calm-shell .header-search {
  background: color-mix(in srgb, var(--surface) 94%, var(--surface-strong));
}

.calm-shell .page-section,
.calm-shell .page-band,
.calm-shell .page-hero {
  width: min(1040px, calc(100% - 3rem));
  padding: clamp(2.5rem, 5vw, 4.5rem) 0;
}
.calm-shell h1 {
  font-size: clamp(2.6rem, 5vw, 5.2rem);
  line-height: 1;
}
.calm-shell .hero-copy h1 { font-size: clamp(3rem, 6vw, 5.6rem); }
.calm-shell .lead,
.calm-shell .page-hero p,
.calm-shell .hero-copy p { font-size: clamp(1rem, 1.4vw, 1.2rem); line-height: 1.65; }

.access-clean {
  min-height: calc(100vh - 150px);
  align-items: center;
  grid-template-columns: minmax(0, 0.85fr) minmax(320px, 420px);
}
.access-clean h1 { max-width: 620px; }
.access-clean .access-form {
  box-shadow: none;
  padding: 1.2rem;
}

:root[data-theme="dark"] .calm-shell {
  --bg: #101815;
  --surface: #14221d;
  --surface-strong: #1a2b24;
  --line: rgba(237, 243, 238, 0.12);
}

@media (max-width: 1100px) {
  .calm-shell .page-main,
  .calm-shell footer { margin-left: 0; }
  .calm-shell .sidebar { width: min(360px, 88vw); }
}

@media (max-width: 760px) {
  .calm-shell .page-section,
  .calm-shell .page-band,
  .calm-shell .page-hero { width: min(100% - 1.25rem, 1040px); }
  .access-clean { grid-template-columns: 1fr; align-items: start; }
}


/* Sidebar toggle behavior: the menu button controls the side navigation */
@media (min-width: 1101px) {
  .calm-shell.sidebar-open .sidebar {
    transform: translateX(0);
  }
  .calm-shell.sidebar-closed .sidebar {
    transform: translateX(-105%);
  }
  .calm-shell.sidebar-open .page-main,
  .calm-shell.sidebar-open footer {
    margin-left: 264px;
  }
  .calm-shell.sidebar-closed .page-main,
  .calm-shell.sidebar-closed footer {
    margin-left: 0;
  }
}

@media (max-width: 1100px) {
  .calm-shell.sidebar-open .sidebar {
    transform: translateX(0);
  }
  .calm-shell.sidebar-closed .sidebar {
    transform: translateX(-105%);
  }
}


/* ============================================================
   Logo & Banner System
   ============================================================ */
.site-logo { display: flex; align-items: center; gap: 0.65rem; min-width: 0; }
.site-logo img { display: block; max-width: 170px; object-fit: contain; }
.site-logo strong { font-size: 1.02rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.logo-brand { min-width: 0; }
.logo-brand .brand span { display: none; }

/* Ken Burns zoom animation */
@keyframes kenBurns {
  from { transform: scale(1) translateY(0); }
  to   { transform: scale(1.07) translateY(-1%); }
}
/* Page fade-in */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
/* Skeleton shimmer */
@keyframes shimmer {
  from { background-position: -300% 0; }
  to   { background-position: 300% 0; }
}
/* Toast slide in */
@keyframes slideInRight {
  from { transform: translateX(120%); opacity: 0; }
  to   { transform: translateX(0); opacity: 1; }
}

/* Apply fade to page content */
.page-main > * { animation: fadeInUp 0.38s ease both; }

.page-banner {
  width: 100%;
  margin: 0;
  padding: 0;
  min-height: min(600px, calc(100svh - 74px));
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid var(--line);
}

.page-banner-track {
  display: flex;
  height: 100%;
  min-height: min(600px, calc(100svh - 74px));
  transition: transform 0.85s cubic-bezier(0.65, 0, 0.35, 1);
}

.page-banner-slide {
  position: relative;
  flex-shrink: 0;
  display: grid;
  grid-template-columns: 1fr minmax(240px, 340px);
  align-items: center;
  background: linear-gradient(135deg,
    color-mix(in srgb, var(--brand-strong) 26%, var(--surface)),
    color-mix(in srgb, var(--blue) 18%, var(--bg)));
}

.page-banner-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
  animation: kenBurns 18s ease-in-out infinite alternate;
  transform-origin: center center;
}
.page-banner:hover .page-banner-bg { animation-play-state: paused; }

.page-banner-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(90deg, rgba(8,18,12,0.88) 0%, rgba(8,18,12,0.58) 50%, rgba(8,18,12,0.22) 100%);
}
.page-banner-slide.no-image .page-banner-overlay {
  background: linear-gradient(90deg,
    color-mix(in srgb, var(--surface) 82%, transparent),
    color-mix(in srgb, var(--surface-strong) 65%, transparent));
}
:root[data-theme="dark"] .page-banner-overlay {
  background: linear-gradient(90deg, rgba(4,10,8,0.94) 0%, rgba(4,10,8,0.7) 50%, rgba(4,10,8,0.28) 100%);
}
:root[data-theme="dark"] .page-banner-card {
  background: rgba(16,30,24,0.92);
  border: 1px solid var(--line);
}

.page-banner-card {
  position: relative;
  z-index: 2;
  margin: 1.25rem;
  padding: 1.1rem;
  border-radius: 10px;
  background: color-mix(in srgb, var(--surface) 92%, transparent);
  border: 1px solid var(--line);
  display: grid;
  gap: 0.35rem;
  backdrop-filter: blur(8px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
}
.page-banner-card .avatar {
  width: 54px; height: 54px; border-radius: 50%;
  display: grid; place-items: center;
  background: var(--brand-strong); color: #fff;
  font-weight: 900; font-size: 1.1rem;
  border: 2px solid var(--accent);
}
.page-banner-card .avatar-photo {
  width: 54px; height: 54px; border-radius: 50%;
  object-fit: cover; border: 2px solid var(--accent);
}
.page-banner-card strong { font-size: 0.97rem; }
.page-banner-card span { font-size: 0.82rem; color: var(--muted); }
.page-banner-card p { color: var(--muted); margin: 0.35rem 0 0; font-size: 0.85rem; font-style: italic; line-height: 1.45; }

.page-banner-copy {
  position: relative;
  z-index: 2;
  padding: clamp(1.5rem, 4vw, 3.5rem);
  display: grid;
  gap: 0.8rem;
  color: var(--text);
}
.page-banner-slide.has-image .page-banner-copy { color: #fff; }
.page-banner-slide.has-image .page-banner-copy .lead { color: rgba(255,255,255,0.88); }
.page-banner-slide.has-image .page-banner-copy .eyebrow { color: var(--accent); }
.page-banner-copy h1,
.page-banner-copy h2 {
  margin: 0;
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(2.4rem, 4.5vw, 5.2rem);
  line-height: 1.02;
  text-shadow: 0 2px 16px rgba(0,0,0,0.32);
}
.page-banner-slide.has-image .page-banner-copy h1,
.page-banner-slide.has-image .page-banner-copy h2 { text-shadow: 0 2px 24px rgba(0,0,0,0.55); }
.page-banner-copy .lead { max-width: 680px; }

/* Arrow navigation */
.banner-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 4;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.45);
  background: rgba(0,0,0,0.28);
  color: #fff;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
  font-size: 1rem;
  backdrop-filter: blur(4px);
}
.banner-arrow:hover { background: rgba(0,0,0,0.58); transform: translateY(-50%) scale(1.08); }
.banner-arrow--prev { left: 1rem; }
.banner-arrow--next { right: 1rem; }

.page-banner-dots {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 1.25rem;
  z-index: 4;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.page-banner-dots button {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 0;
  padding: 0;
  cursor: pointer;
  background: rgba(255,255,255,0.4);
  transition: background 0.2s, transform 0.2s;
}
.page-banner-dots button.active {
  background: #fff;
  transform: scale(1.4);
}

/* ============================================================
   Footer System
   ============================================================ */
footer.site-footer {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 1.4rem clamp(1rem, 3vw, 3rem);
  border-top: 1px solid var(--line);
  background: var(--surface);
}
.footer-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.footer-brand { display: flex; align-items: center; gap: 0.85rem; flex-wrap: wrap; }
.footer-brand > span { color: var(--muted); font-size: 0.88rem; }
.footer-social { display: flex; align-items: center; gap: 0.45rem; flex-wrap: wrap; }
.footer-social a {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid var(--line);
  display: grid;
  place-items: center;
  color: var(--brand-strong);
  background: var(--surface-strong);
  font-size: 1rem;
  transition: background 0.18s ease, color 0.18s ease, transform 0.18s ease;
}
.footer-social a:hover {
  background: var(--brand);
  color: #fff;
  transform: translateY(-3px);
  border-color: var(--brand);
}
.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding-top: 0.7rem;
  border-top: 1px solid var(--line);
}
.footer-copyright { color: var(--muted); font-size: 0.82rem; }
.back-to-top {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--muted);
  font-size: 0.82rem;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  border: 1px solid var(--line);
  background: var(--surface-strong);
  transition: color 0.15s, background 0.15s;
}
.back-to-top:hover { color: var(--brand-strong); background: var(--surface); }

/* ============================================================
   Toast Notification System
   ============================================================ */
.toast-container {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 200;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  pointer-events: none;
}
.toast {
  padding: 0.85rem 1.25rem;
  border-radius: 8px;
  color: #fff;
  font-weight: 700;
  font-size: 0.9rem;
  box-shadow: 0 8px 30px rgba(0,0,0,0.22);
  animation: slideInRight 0.3s ease;
  pointer-events: auto;
  max-width: 320px;
  line-height: 1.4;
}
.toast--success { background: var(--brand-strong); }
.toast--error { background: #b54040; }
.toast--info { background: var(--blue); }

/* ============================================================
   Skeleton Loading States
   ============================================================ */
.skeleton {
  background: linear-gradient(90deg, var(--surface) 25%, var(--surface-strong) 50%, var(--surface) 75%);
  background-size: 300% 100%;
  animation: shimmer 1.6s infinite;
  border-radius: 6px;
  color: transparent;
  user-select: none;
}
.skeleton-card { height: 120px; border-radius: 8px; }
.skeleton-banner { height: min(400px, 55vh); width: 100%; }

/* ============================================================
   Admin Dashboard Tabs & Collections
   ============================================================ */
.dashboard-tabs {
  display: flex;
  gap: 0.25rem;
  border-bottom: 1px solid var(--line);
  margin-bottom: 1.5rem;
  overflow-x: auto;
  padding-bottom: 0;
}
.dashboard-tab {
  padding: 0.7rem 1.1rem;
  border: 0;
  background: transparent;
  color: var(--muted);
  font-weight: 700;
  font-size: 0.92rem;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.15s, border-color 0.15s;
}
.dashboard-tab.active {
  color: var(--brand-strong);
  border-bottom-color: var(--brand-strong);
}
.dashboard-tab:hover { color: var(--text); }
.collection-item {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: start;
  gap: 0.75rem;
  padding: 0.8rem;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface);
}
.collection-item-actions { display: flex; gap: 0.4rem; flex-shrink: 0; }
.btn-edit, .btn-delete, .btn-save {
  padding: 0.4rem 0.7rem;
  border-radius: 6px;
  border: 1px solid var(--line);
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-edit { background: var(--surface-strong); color: var(--text); }
.btn-delete { background: #fee; color: #b54040; border-color: #f5c6c6; }
.btn-delete:hover { background: #b54040; color: #fff; border-color: #b54040; }
.btn-save { background: var(--brand-strong); color: #fff; border-color: var(--brand-strong); }
.upload-preview { width: 80px; height: 60px; object-fit: cover; border-radius: 6px; border: 1px solid var(--line); }
.upload-zone {
  border: 2px dashed var(--line);
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  color: var(--muted);
  font-size: 0.88rem;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.upload-zone:hover { border-color: var(--brand); background: color-mix(in srgb, var(--brand) 5%, var(--surface)); }
.badge-verified {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--brand) 12%, var(--surface-strong));
  color: var(--brand-strong);
  font-size: 0.75rem;
  font-weight: 800;
}
.compact { padding: 0.75rem; }

/* ============================================================
   Dashboard Grid
   ============================================================ */
.dashboard-grid-wide { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.update-list button { border: 1px solid var(--line); border-radius: 8px; background: var(--surface-strong); color: var(--text); padding: 0.55rem 0.75rem; }
.activity-time { color: var(--muted); font-size: 0.8rem; }

/* ============================================================
   Print Styles
   ============================================================ */
@media print {
  .app-header,
  .sidebar,
  .sidebar-backdrop,
  .page-banner-dots,
  .banner-arrow,
  .hero-actions,
  .toast-container,
  .footer-social,
  .back-to-top { display: none !important; }
  .calm-shell .page-main,
  .calm-shell footer { margin-left: 0 !important; }
  .page-banner { min-height: auto; page-break-inside: avoid; }
  .page-banner-bg,
  .page-banner-overlay { display: none; }
  .page-banner-copy { color: #000 !important; }
  .page-banner-copy h1,
  .page-banner-copy h2 { color: #000 !important; text-shadow: none !important; }
  body { background: #fff !important; color: #000 !important; }
  a { color: #000; }
}

/* ============================================================
   Mobile Hero Fix
   ============================================================ */
@media (max-width: 900px) {
  .dashboard-grid-wide { grid-template-columns: 1fr; }
  .dashboard-tabs { gap: 0; }
}

/* ============================================================
   Header Profile Dropdown
   ============================================================ */
.profile-dropdown-wrap {
  position: relative;
}
.profile-avatar-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
}
.profile-avatar-circle {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--brand-strong);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 900;
  font-size: 0.88rem;
  border: 2px solid var(--accent);
  flex-shrink: 0;
}
.profile-avatar-circle--lg {
  width: 46px;
  height: 46px;
  font-size: 1rem;
}
.profile-dropdown {
  position: absolute;
  top: calc(100% + 0.6rem);
  right: 0;
  min-width: 220px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
  box-shadow: 0 12px 48px rgba(0,0,0,0.18);
  overflow: hidden;
  z-index: 50;
  animation: fadeInUp 0.18s ease;
}
.profile-dropdown-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
  border-bottom: 1px solid var(--line);
  background: var(--surface-strong);
}
.profile-dropdown-info strong { font-size: 0.88rem; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; }
.profile-dropdown-info small { color: var(--muted); font-size: 0.75rem; }
.profile-dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.75rem 1rem;
  color: var(--text);
  font-size: 0.92rem;
  font-weight: 700;
  background: none;
  border: none;
  width: 100%;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;
}
.profile-dropdown-item:hover { background: var(--surface-strong); }
.profile-dropdown-item--danger { color: #b54040; }
.profile-dropdown-item--danger:hover { background: #fff0f0; }
:root[data-theme="dark"] .profile-dropdown-item--danger:hover { background: rgba(181,64,64,0.15); }

/* ============================================================
   Auth Pages — Split Panel Design
   ============================================================ */
.auth-shell {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: calc(100vh - 74px);
}
.auth-shell--centered {
  grid-template-columns: 1fr;
  place-items: center;
  padding: 3rem 1rem;
}
.auth-panel {
  display: flex;
  flex-direction: column;
}
.auth-panel--left {
  background: linear-gradient(145deg, var(--brand-strong), color-mix(in srgb, var(--brand-strong) 60%, var(--blue)));
  color: #fff;
  padding: clamp(2rem, 5vw, 4rem);
  gap: 2rem;
  position: relative;
  overflow: hidden;
}
.auth-panel--right {
  background: var(--surface);
  padding: clamp(2rem, 5vw, 4rem);
  display: flex;
  align-items: center;
  justify-content: center;
}
.auth-form-wrap {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.auth-form-wrap--solo {
  max-width: 380px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: clamp(1.5rem, 4vw, 2.5rem);
  box-shadow: var(--shadow);
}
.auth-brand-mark {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  z-index: 1;
}
.auth-brand-mark--center { justify-content: center; margin-bottom: 0.5rem; }
.auth-brand-mark strong { display: block; font-size: 1.1rem; }
.auth-brand-mark small { color: rgba(255,255,255,0.72); font-size: 0.82rem; }
.auth-logo-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255,255,255,0.18);
  border: 2px solid rgba(255,255,255,0.45);
  display: grid;
  place-items: center;
  font-weight: 900;
  font-size: 1.05rem;
  color: #fff;
  flex-shrink: 0;
}
.auth-panel-quote {
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.auth-panel-quote blockquote {
  margin: 0;
  font: 400 clamp(1.4rem, 2.5vw, 2rem)/1.2 Georgia, serif;
  color: rgba(255,255,255,0.95);
}
.auth-panel-quote p { color: rgba(255,255,255,0.72); line-height: 1.6; margin: 0; font-size: 0.95rem; }
.auth-panel-decor {
  position: absolute;
  bottom: -2rem;
  right: -2rem;
  font: 900 10rem/1 Georgia, serif;
  color: rgba(255,255,255,0.06);
  pointer-events: none;
  user-select: none;
}
.auth-title {
  font-family: Georgia, serif;
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  margin: 0;
  line-height: 1.1;
}
.auth-subtitle { color: var(--muted); margin: 0; font-size: 0.95rem; }
.auth-google-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  min-height: 46px;
  border: 1.5px solid var(--line);
  border-radius: 10px;
  background: var(--bg);
  color: var(--text);
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.18s, border-color 0.18s, box-shadow 0.18s;
}
.auth-google-btn:hover {
  background: var(--surface-strong);
  border-color: var(--brand);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand) 18%, transparent);
}
.auth-divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--muted);
  font-size: 0.82rem;
}
.auth-divider::before,
.auth-divider::after { content: ''; flex: 1; height: 1px; background: var(--line); }
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.auth-field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.auth-field label {
  font-weight: 800;
  font-size: 0.9rem;
  color: var(--text);
}
.auth-field-helper {
  color: var(--muted);
  font-size: 0.78rem;
  margin: 0;
  line-height: 1.4;
}
.auth-field input {
  width: 100%;
  min-height: 46px;
  border: 1.5px solid var(--line);
  border-radius: 10px;
  padding: 0.75rem 1rem;
  background: var(--bg);
  color: var(--text);
  font: inherit;
  transition: border-color 0.18s, box-shadow 0.18s;
  outline: none;
}
.auth-field input:focus {
  border-color: var(--brand);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand) 18%, transparent);
}
.auth-input-wrap {
  position: relative;
  display: flex;
}
.auth-input-wrap input { padding-right: 3rem; }
.auth-toggle-pw {
  position: absolute;
  right: 0.6rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--muted);
  cursor: pointer;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  transition: color 0.15s, background 0.15s;
}
.auth-toggle-pw:hover { color: var(--brand); background: var(--surface-strong); }
.auth-field-row { display: flex; justify-content: flex-end; margin-top: 0.25rem; }
.auth-forgot { color: var(--brand-strong); font-size: 0.82rem; font-weight: 700; }
.auth-forgot:hover { text-decoration: underline; }
.auth-status {
  font-size: 0.88rem;
  padding: 0.7rem 0.9rem;
  border-radius: 8px;
  margin: 0;
  line-height: 1.4;
}
.auth-status--error { background: #fee; color: #b54040; border: 1px solid #f5c6c6; }
.auth-status--info { background: color-mix(in srgb, var(--blue) 12%, var(--surface)); color: var(--blue); border: 1px solid color-mix(in srgb, var(--blue) 30%, var(--line)); }
:root[data-theme="dark"] .auth-status--error { background: rgba(181,64,64,0.15); border-color: rgba(181,64,64,0.3); }
.auth-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 48px;
  border-radius: 10px;
  border: none;
  background: var(--brand-strong);
  color: #fff;
  font-weight: 800;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.18s, transform 0.15s, box-shadow 0.18s;
}
.auth-submit:hover:not(:disabled) {
  background: var(--brand);
  transform: translateY(-1px);
  box-shadow: 0 6px 24px rgba(0,0,0,0.2);
}
.auth-submit:disabled { opacity: 0.6; cursor: not-allowed; }
.auth-switch { color: var(--muted); font-size: 0.88rem; text-align: center; margin: 0; }
.auth-switch a { color: var(--brand-strong); font-weight: 700; }
.auth-switch a:hover { text-decoration: underline; }
.auth-success-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: color-mix(in srgb, var(--brand) 8%, var(--surface));
  border: 1px solid color-mix(in srgb, var(--brand) 25%, var(--line));
  border-radius: 12px;
  padding: 1.5rem;
}
.auth-success-icon {
  width: 48px; height: 48px;
  border-radius: 50%;
  background: var(--brand-strong);
  color: #fff;
  font-size: 1.4rem;
  display: grid;
  place-items: center;
  margin-bottom: 0.25rem;
}
.auth-success-card strong { font-size: 1.1rem; }
.auth-success-card p { color: var(--muted); font-size: 0.92rem; margin: 0; line-height: 1.5; }

@media (max-width: 800px) {
  .auth-shell { grid-template-columns: 1fr; }
  .auth-panel--left { display: none; }
  .auth-panel--right { padding: 2rem 1.25rem; }
}

/* ============================================================
   Engagement Section
   ============================================================ */
.engagement-section {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 1.1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}
.engagement-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.engage-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 0.9rem;
  border-radius: 999px;
  border: 1.5px solid var(--line);
  background: var(--bg);
  color: var(--muted);
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.18s, color 0.18s, border-color 0.18s, transform 0.15s;
}
.engage-btn:hover { background: var(--surface-strong); color: var(--text); border-color: var(--brand); transform: translateY(-1px); }
.engage-btn.active { background: color-mix(in srgb, var(--brand) 14%, var(--surface)); color: var(--brand-strong); border-color: var(--brand); }
.engage-btn--like.active svg { color: #e85555; }
.engage-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 5px;
  border-radius: 999px;
  background: var(--surface-strong);
  font-size: 0.75rem;
  font-weight: 900;
}
.engagement-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding-top: 0.5rem;
  border-top: 1px solid var(--line);
}
.project-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.85rem;
  border-radius: 8px;
  border: 1.5px solid var(--line);
  background: var(--surface-strong);
  color: var(--text);
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s, transform 0.15s;
}
.project-action-btn:hover { background: var(--brand-strong); color: #fff; border-color: var(--brand-strong); transform: translateY(-1px); }
.project-action-btn.done { background: color-mix(in srgb, var(--brand) 12%, var(--surface)); color: var(--brand-strong); border-color: var(--brand); }
.engagement-comments {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--line);
}
.comment-form {
  display: flex;
  gap: 0.5rem;
}
.comment-form input {
  flex: 1;
  min-height: 40px;
  border: 1.5px solid var(--line);
  border-radius: 999px;
  padding: 0.5rem 1rem;
  background: var(--bg);
  color: var(--text);
  font: inherit;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.18s;
}
.comment-form input:focus { border-color: var(--brand); }
.comment-form button {
  padding: 0.5rem 1.1rem;
  border-radius: 999px;
  border: none;
  background: var(--brand-strong);
  color: #fff;
  font-weight: 800;
  font-size: 0.88rem;
  cursor: pointer;
}
.engagement-empty { color: var(--muted); font-size: 0.88rem; margin: 0; text-align: center; padding: 0.75rem 0; }
.comment-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.6rem; }
.comment-item {
  display: flex;
  gap: 0.65rem;
  align-items: flex-start;
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 0.65rem 0.85rem;
}
.comment-avatar {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: var(--brand-strong);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 900;
  font-size: 0.78rem;
  flex-shrink: 0;
}
.comment-text { font-size: 0.9rem; margin: 0 0 0.2rem; }
.comment-time { color: var(--muted); font-size: 0.75rem; }
```

## `frontend/vite.config.js`

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
});
```
