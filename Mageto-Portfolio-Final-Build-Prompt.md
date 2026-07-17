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
