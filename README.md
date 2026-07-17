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
