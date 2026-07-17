# The Peter Mageto Leadership Portfolio

Full-stack executive leadership portfolio for Rev. Professor Peter Mageto, fifth Vice Chancellor of Africa University.

## System Features

- React/Vite public executive portfolio
- Complete header navigation with mobile menu
- Light and dark mode
- JWT sign in/out with admin credential support
- Express serverless API under `/api/*`
- Contact form connected to the backend
- Admin dashboard for inbox/status management and content updates
- Optional Neon Postgres persistence via `DATABASE_URL`
- Runtime fallback storage for local/demo environments
- `schema.sql` and `npm run seed:admin` implementation script
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
npm run build
npm run preview
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

Read [`PROJECT_DOCUMENTATION.md`](./PROJECT_DOCUMENTATION.md) for architecture, roadmap, quality checks, and future enhancements.
