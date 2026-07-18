# LLM Context — Prof Magetto Website
_Generated: 2026-07-18 11:47_

> Paste this file into Claude, ChatGPT, or another AI to give instant full project context.

## 1. Project Identity
- **Name**: Prof Magetto Website
- **Stack**: Vite + React + react-router-dom, Express on Vercel serverless functions, Neon Postgres
- **Git branch**: `main`

## 2. Technology Stack Detected
- CORS middleware
- Django
- Express.js
- FastAPI
- Flask
- JWT Auth
- Neon Postgres (serverless driver)
- React
- React Router
- SQL Database (Postgres/Neon)
- Vercel Blob Storage
- Vite
- bcryptjs
- react-icons

## 3. Scale
| Metric | Value |
|--------|-------|
| Files | 60 |
| Size | 0.37 MB |
| Lines of Code | 8,189 |

## 4. Directory Tree
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

## 5. Backend Routes Detected
| Method | Path | File |
|--------|------|------|
| `USE` | `/api` | `backend/src/app.js` |
| `GET` | `/api/health` | `backend/src/app.js` |
| `GET` | `/api/site-settings` | `backend/src/app.js` |
| `GET` | `/api/publications` | `backend/src/app.js` |
| `GET` | `/api/auth/me` | `backend/src/app.js` |
| `POST` | `/api/auth/login` | `backend/src/app.js` |
| `POST` | `/api/auth/register` | `backend/src/app.js` |
| `PUT` | `/api/auth/password` | `backend/src/app.js` |
| `POST` | `/api/contact` | `backend/src/app.js` |
| `GET` | `/api/messages` | `backend/src/app.js` |
| `PATCH` | `/api/messages/:id/status` | `backend/src/app.js` |
| `POST` | `/api/content-updates` | `backend/src/app.js` |
| `GET` | `/api/likes/:pageKey` | `backend/src/app.js` |
| `POST` | `/api/likes/:pageKey` | `backend/src/app.js` |
| `GET` | `/api/content-updates` | `backend/src/app.js` |
| `GET` | `/api/profile` | `backend/src/app.js` |
| `GET` | `/api/activity` | `backend/src/app.js` |
| `PUT` | `/api/profile` | `backend/src/app.js` |
| `POST` | `/api/uploads` | `backend/src/app.js` |
| `GET` | `/api/hero-slides/:pageKey` | `backend/src/app.js` |
| `POST` | `/api/hero-slides/:pageKey` | `backend/src/app.js` |
| `PUT` | `/api/hero-slides/:pageKey/:id` | `backend/src/app.js` |
| `DELETE` | `/api/hero-slides/:pageKey/:id` | `backend/src/app.js` |
| `PUT` | `/api/:collection/:id` | `backend/src/app.js` |
| `POST` | `/api/:collection` | `backend/src/app.js` |
| `DELETE` | `/api/:collection/:id` | `backend/src/app.js` |

## 6. CMS Schema Coverage
- `profile`: present
- `hero_slides`: present
- `credentials`: present
- `career_entries`: present
- `publications`: present
- `research_themes`: present
- `strategy_goals`: present
- `sources_list`: present
- `social_links`: present
- `users`: present
- `messages`: present
- `content_updates`: present

## 7. CMS Route Coverage
- GET /api/profile: present — Public profile read (powers every page)
- PUT /api/profile: present — Admin: update singleton profile fields
- GET /api/hero-slides: present — Public: read banner slides for a page
- POST /api/hero-slides: present — Admin: add a banner slide
- PUT /api/hero-slides: present — Admin: edit a banner slide
- DELETE /api/hero-slides: present — Admin: delete a banner slide
- GET /api/activity: present — Admin: visible CRUD activity feed
- POST /api/uploads: present — Admin: image upload (Vercel Blob)
- POST /api/auth/login: present — Auth: login
- POST /api/auth/register: present — Auth: register
- GET /api/auth/me: present — Auth: session check
- POST /api/contact: present — Public: submit a contact message
- GET /api/messages: present — Admin: read inbox
- PATCH /api/messages: present — Admin: update a message's status
- POST /api/:collection: present — Generic CRUD: add credential/career/etc. row
- PUT /api/:collection: present — Generic CRUD: edit a row
- DELETE /api/:collection: present — Generic CRUD: delete a row

## 8. Frontend CMS Wiring
- PageBanner component: present
- useProfile hook: present
- AdminDashboard.jsx: frontend/src/components/AdminDashboard.jsx

## 9. Security
- Frontend-bundle secret leaks: 0

## 10. Environment Variables Expected
- `DATABASE_URL` (Neon Postgres connection string): declared=True
- `JWT_SECRET` (Signs/verifies admin session tokens — must have no code fallback): declared=True
- `ADMIN_EMAIL` (Seeded admin login): declared=True
- `ADMIN_PASSWORD` (Seeded admin login — must have no code fallback, must be rotated if ever hardcoded): declared=True
- `CORS_ORIGIN` (Should be the real production domain, not '*' / true): declared=False
- `BLOB_READ_WRITE_TOKEN` (Vercel Blob — required for the image upload endpoint): declared=True