# Project Report — Prof Magetto Website
_Generated: 2026-07-18 11:47_

> **Stack:** Vite + React + react-router-dom (frontend) · Express on Vercel serverless functions (backend) · Neon Postgres · deployed entirely on Vercel.

---

## 🚦 Quick Status

| Area | Status |
|------|--------|
| Schema (CMS tables) | 12/12 tables present |
| Backend CRUD routes | 17/17 implemented |
| Vercel routing | ✅ vercel.json found |
| Frontend CMS wiring | PageBanner: ✅ · useProfile: ✅ |
| Frontend secret leaks | ✅ none detected |
| Dark-mode token discipline | 61 hardcoded color(s) outside the token system |

---

## 1️⃣  Security

✅ No secret-shaped literals found under the frontend source tree.

---

## 2️⃣  Vercel Deployment Readiness

✅ `vercel.json` found.

### `api/` serverless entry files detected
- `api/[...path].js`
- `api/auth/login.js`
- `api/auth/me.js`
- `api/auth/register.js`
- `api/index.js`
- `api/messages/[id]/status.js`

### React Router page routes vs `vercel.json` rewrites
| Route | Covered by a vercel.json rewrite? |
|---|---|
| `/` | ✅ |
| `/leadership` | ✅ |
| `/scholarship` | ✅ |
| `/strategy` | ✅ |
| `/roadmap` | ✅ |
| `/contact` | ✅ |
| `/sources` | ✅ |
| `/access` | ✅ |
| `/dashboard` | ✅ |

---

## 3️⃣  Database Schema — CMS Tables

| Table | Present in schema.sql? |
|---|---|
| `profile` | ✅ |
| `hero_slides` | ✅ |
| `credentials` | ✅ |
| `career_entries` | ✅ |
| `publications` | ✅ |
| `research_themes` | ✅ |
| `strategy_goals` | ✅ |
| `sources_list` | ✅ |
| `social_links` | ✅ |
| `users` | ✅ |
| `messages` | ✅ |
| `content_updates` | ✅ |

**Neon serverless driver detected:** ✅ yes
**Vercel Blob detected:** ✅ yes

---

## 4️⃣  Backend CRUD Route Coverage

| Method | Path | What it's for | Found? |
|---|---|---|---|
| `GET` | `/api/profile` | Public profile read (powers every page) | ✅ |
| `PUT` | `/api/profile` | Admin: update singleton profile fields | ✅ |
| `GET` | `/api/hero-slides` | Public: read banner slides for a page | ✅ |
| `POST` | `/api/hero-slides` | Admin: add a banner slide | ✅ |
| `PUT` | `/api/hero-slides` | Admin: edit a banner slide | ✅ |
| `DELETE` | `/api/hero-slides` | Admin: delete a banner slide | ✅ |
| `GET` | `/api/activity` | Admin: visible CRUD activity feed | ✅ |
| `POST` | `/api/uploads` | Admin: image upload (Vercel Blob) | ✅ |
| `POST` | `/api/auth/login` | Auth: login | ✅ |
| `POST` | `/api/auth/register` | Auth: register | ✅ |
| `GET` | `/api/auth/me` | Auth: session check | ✅ |
| `POST` | `/api/contact` | Public: submit a contact message | ✅ |
| `GET` | `/api/messages` | Admin: read inbox | ✅ |
| `PATCH` | `/api/messages` | Admin: update a message's status | ✅ |
| `POST` | `/api/:collection` | Generic CRUD: add credential/career/etc. row | ✅ |
| `PUT` | `/api/:collection` | Generic CRUD: edit a row | ✅ |
| `DELETE` | `/api/:collection` | Generic CRUD: delete a row | ✅ |

---

## 5️⃣  Frontend CMS Wiring

- **`PageBanner` component:** ✅ found
- **`useProfile` hook:** ✅ found
- **`AdminDashboard.jsx`:** found at `frontend/src/components/AdminDashboard.jsx`
  - Collections the dashboard actually calls: `hero-slides`, `profile`
  - Not yet wired into the dashboard: `career-entries`, `credentials`, `publications`, `research-themes`, `social-links`, `sources`, `strategy-goals`

---

## 6️⃣  Dark Mode / Styling Audit

- CSS files scanned: 1
- Dark-mode selector (`[data-theme]` or `.dark`) present: ✅ yes
- Color literals defined inside `:root`/theme token blocks (expected — this is where they belong): 39
- Color literals found **outside** token blocks (hardcoded, bypasses the theme system): 61

Every hardcoded color outside a `:root`/`[data-theme]` block is a spot dark mode can't reach — it'll stay the light-mode color regardless of the toggle. This is the concrete, checkable version of "dark mode isn't just a background color swap."

---

## 7️⃣  Environment Variables

| Variable | Purpose | Declared in a .env file? | Real value in repo? |
|---|---|---|---|
| `DATABASE_URL` | Neon Postgres connection string | ✅ | ⚠️ literal value committed — should be Vercel-only |
| `JWT_SECRET` | Signs/verifies admin session tokens — must have no code fallback | ✅ | ⚠️ literal value committed — should be Vercel-only |
| `ADMIN_EMAIL` | Seeded admin login | ✅ | ⚠️ literal value committed — should be Vercel-only |
| `ADMIN_PASSWORD` | Seeded admin login — must have no code fallback, must be rotated if ever hardcoded | ✅ | ⚠️ literal value committed — should be Vercel-only |
| `CORS_ORIGIN` | Should be the real production domain, not '*' / true | ❌ | — |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob — required for the image upload endpoint | ✅ | — |

Declared-but-empty in `.env.example` is correct (placeholders only). A **real value committed to the repo** is the thing to fix — those belong only in Vercel's Project Settings → Environment Variables.

**Not referenced anywhere yet:** `CORS_ORIGIN`

---

## 8️⃣  Housekeeping

- **TODO/FIXME markers:** 2
  - `analyze_project.py:566` — if re.search(r'\b(TODO|FIXME|HACK|BUG|XXX)\b', line):
  - `analyze_project.py:866` — lines.append(f"- **TODO/FIXME markers:** {len(self.todos)}")

**Byte-identical duplicate files:** 1 group(s) — see `duplicate_file_groups` in statistics.json

---

## 9️⃣  Project Tree

```
Prof Magetto Website/
├── api/
│   ├── auth/
│   │   ├── login.js
│   │   ├── me.js
│   │   └── register.js
│   ├── messages/
│   │   └── [id]/
│   │       └── status.js
│   ├── [...path].js
│   └── index.js
├── backend/
│   ├── scripts/
│   │   ├── alter-table.mjs
│   │   ├── init-db.mjs
│   │   ├── seed-admin.mjs
│   │   ├── seed-profile.mjs
│   │   └── set-launch-photos.mjs
│   ├── src/
│   │   └── app.js
│   ├── .env
│   ├── README.md
│   └── schema.sql
├── frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   ├── og-image.svg
│   │   ├── robots.txt
│   │   └── sitemap.xml
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── ContactForm.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── IconCard.jsx
│   │   │   ├── Layout.jsx
│   │   │   ├── LikeButton.jsx
│   │   │   ├── Logo.jsx
│   │   │   ├── PageBanner.jsx
│   │   │   ├── PortfolioIndex.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── data/
│   │   │   └── profileData.js
│   │   ├── lib/
│   │   │   ├── api.js
│   │   │   └── useProfile.js
│   │   ├── pages/
│   │   │   ├── Access.jsx
│   │   │   ├── Contact.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Leadership.jsx
│   │   │   ├── NotFound.jsx
│   │   │   ├── Roadmap.jsx
│   │   │   ├── Scholarship.jsx
│   │   │   ├── Sources.jsx
│   │   │   └── Strategy.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── README.md
│   └── vite.config.js
├── .env
├── .env.example
├── .gitignore
├── .inspect-mageto-schema.mjs
├── analyze_project.py
├── Mageto-Portfolio-Final-Build-Prompt.md
├── package-lock.json
├── package.json
├── PROJECT_DOCUMENTATION.md
├── README.md
└── vercel.json
```

---

## ✅ Prioritized Checklist

- [ ] Move 61 hardcoded color(s) into CSS variables (§6)

---

_Report generated by analyze_project.py · 2026-07-18 11:47_