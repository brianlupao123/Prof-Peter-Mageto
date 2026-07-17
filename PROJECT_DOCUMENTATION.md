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
