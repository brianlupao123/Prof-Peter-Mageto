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
- JWT sign in/out with DB-backed admin authentication
- Express serverless backend under `/api/*`
- Contact form connected to backend storage and email notification
- Admin dashboard for profile edits, hero slides, source metadata, inbox lifecycle, password change, and content updates
- Neon Postgres persistence via `DATABASE_URL`
- Real page engagement counter stored in the `page_likes` table
- Vercel Blob upload support for dashboard-managed images
- Vercel deployment config, sitemap, robots, favicon, SEO metadata

## Admin Authentication

Production authentication is database-backed. Runtime login checks the `users.password_hash` value and no longer falls back to a plaintext `ADMIN_PASSWORD`.

`ADMIN_PASSWORD` is still used by `backend/scripts/seed-admin.mjs` when an administrator needs to seed or recover the DB-backed admin account. It is not a runtime login path.

The old non-functional forgot-password placeholder now redirects to `/sign-in`. Dashboard password change is the supported password-management flow. The old placeholder "Continue with Google" button was removed because OAuth was not implemented.

Required production environment variables:

- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `DATABASE_URL`
- `RESEND_API_KEY`
- `NOTIFY_EMAIL`
- `NOTIFY_FROM_EMAIL` optional
- `BLOB_READ_WRITE_TOKEN` or Vercel's generated `MAGETO_PORTFOLIO_UPLOADS_READ_WRITE_TOKEN`

Credential rotation for `RESEND_API_KEY`, `DATABASE_URL`, `JWT_SECRET`, and `ADMIN_PASSWORD` was completed during the July 2026 hardening pass. Do not document secret values in the repository.

## Commands

```bash
npm install
npm run dev
npm run lint
npm run build
npm run smoke
npm run preview
npm run api:dev
npm run seed:admin
npm run seed:profile
```

`npm run lint` currently has a baseline of 0 errors and 10 warnings. `npm run smoke` builds the site, checks the seven public routes, and confirms protected message access returns `401` without authentication.

## Backend Endpoints

- `GET /api/health`
- `GET /api/profile`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/auth/password` admin
- `POST /api/contact`
- `GET /api/messages` admin
- `PATCH /api/messages/:id/status` admin
- `DELETE /api/messages/:id` admin
- `GET /api/likes/:pageKey`
- `POST /api/likes/:pageKey`
- `GET /api/hero-slides/:pageKey`
- `POST /api/hero-slides/:pageKey` admin
- `PUT /api/hero-slides/:pageKey/:id` admin
- `DELETE /api/hero-slides/:pageKey/:id` admin
- `GET/POST/PUT/DELETE /api/sources` admin for write operations
- `POST /api/upload` admin

## Documentation

Read [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md) for engineering decisions, deployment notes, accepted risks, and future enhancements.
