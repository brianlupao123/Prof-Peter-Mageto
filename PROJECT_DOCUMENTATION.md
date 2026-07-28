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
      data/profileData.js    # verified fallback content
      lib/api.js             # API helper
      pages/                 # independent route pages
```

## Frontend Design

The frontend uses a professional executive layout with:

- Sticky compact header.
- Sidebar navigation containing all major sections.
- Responsive desktop and mobile behavior.
- Light/dark theme toggle.
- Dashboard-managed hero photography with per-slide focal position, overlay strength, and identity-card visibility controls.
- Lazy-loaded routes for Overview, Leadership, Scholarship, Strategy, Roadmap, Contact, Sources, Access, Dashboard, and Not Found.
- Public source cards that display restrained source-type and verified indicators. Retired sources are hidden from public pages.

## Backend Design

The backend is an Express application exported from `backend/src/app.js` and consumed by Vercel function wrappers in `api/`.

Core behavior:

- JWT authentication with DB-backed admin login as the sole runtime auth path.
- Contact message creation.
- Admin message listing, status updates, and deletion.
- Admin profile, source, hero-slide, and collection management.
- Password change through the dashboard using the stored password hash.
- Real page-like counters backed by the `page_likes` table.
- Neon Postgres persistence when `DATABASE_URL` is present.
- Vercel Blob uploads through the protected upload endpoint.

The old `ADMIN_PASSWORD` runtime fallback was removed during the July 2026 hardening work. `ADMIN_PASSWORD` remains useful only for `backend/scripts/seed-admin.mjs` disaster-recovery reseeding. The old forgot-password placeholder redirects to `/sign-in`, and the old fake Google sign-in button was removed because it did not implement real OAuth.

## Admin Dashboard

The dashboard currently supports:

- Profile fields and official contact details.
- Hero slide CRUD by page key, including `focal_position`, `overlay_strength`, `card_visibility`, CTA fields, and background image upload.
- Source CRUD with `publisher`, `source_type`, `published_date`, `verified`, `retired`, and `sort_order`.
- Inbox lifecycle management across `new`, `read`, `replied`, `resolved`, and `archived`, plus message deletion.
- Dashboard password change using the DB-backed auth path.

The active public engagement component is `frontend/src/components/EngagementSection.jsx`. It reads and writes likes through `/api/likes/:pageKey` and the `page_likes` table. Duplicate-click prevention is currently client-side via `localStorage`, so a determined visitor could still game the count across browsers/devices. This is an accepted low-severity limitation, not a launch blocker. `frontend/src/components/LikeButton.jsx` is unused dead code and can be removed in a future cleanup.

## Source Management

Sources are stored with:

- `label`
- `url`
- `publisher`
- `source_type`
- `published_date`
- `verified`
- `retired`
- `sort_order`

Public source rendering keeps the page simple: visible sources show source type and verified state where applicable, while retired sources remain available in admin but are hidden publicly. The ResearchGate source is currently retired because normal browser access returned "Access denied"; keep it retired until a reliable replacement URL is verified. Wikipedia and Amani Partners remain contextual sources rather than being falsely elevated to verified institutional sources.

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

Required production variables:

- `JWT_SECRET`: strong random secret.
- `ADMIN_EMAIL`: production admin email used by the seed/admin workflows.
- `ADMIN_PASSWORD`: seed-admin input for reseeding the DB-backed account; not a runtime login fallback.
- `DATABASE_URL`: Neon Postgres connection string.
- `RESEND_API_KEY`: Resend key for contact notifications.
- `NOTIFY_EMAIL`: inbox for contact notifications.
- `NOTIFY_FROM_EMAIL`: optional sender override.
- `BLOB_READ_WRITE_TOKEN` or `MAGETO_PORTFOLIO_UPLOADS_READ_WRITE_TOKEN`: Vercel Blob upload token.

Credential rotation for `RESEND_API_KEY`, `DATABASE_URL`, `JWT_SECRET`, and `ADMIN_PASSWORD` was completed in the July 2026 hardening pass. Do not store secret values in documentation, commits, screenshots, or chat transcripts.

Vercel Blob was also configured in Production during the hardening pass. Before that, dashboard uploads returned a missing-token error; uploads were verified after the token was added and after the Blob SDK upgrade.

## Tooling And Dependency Status

Project scripts:

- `npm run lint`: ESLint over `frontend/src`, `backend/src`, and `backend/scripts`.
- `npm run build`: Vite production build into root `dist/`.
- `npm run smoke`: runs the production build, checks the seven public routes, and confirms unauthenticated `/api/messages` returns `401`.

Current lint baseline: 0 errors, 10 warnings. An earlier baseline showed 120 warnings; the reduction followed the ESLint 10 upgrade and changed rule/default behavior, not a focused warning-removal refactor.

Dependency/security status:

- `@vercel/blob` was upgraded to the current major line and upload behavior was verified.
- Vite and ESLint were upgraded to current major lines and regression-checked.
- React Router remains on the 6.x line. `react-router-dom`/`react-router` have two known moderate advisories with no clean non-breaking fix available at review time. A 7.x upgrade was evaluated, but the target 7.x line introduced different higher-severity advisories, so the migration is deferred as an accepted known risk. The app only uses declarative routing APIs (`BrowserRouter`, `Routes`, `Route`, `Navigate`, `Link`, `NavLink`, and basic hooks), with no data-router/loader surface.

## Future Enhancements

1. Add editorial roles, approvals, and audit trails if the dashboard grows beyond a single-admin model.
2. Add spam protection and rate-limited contact submissions.
3. Add server-side rate limiting or fingerprinting for likes if engagement metrics become important.
4. Identify a reliable replacement for the retired ResearchGate source.
5. Add analytics, performance monitoring, and search console verification.
6. Add custom domain and final SEO/social preview assets if not already managed in Vercel.
7. Add Playwright end-to-end tests for sign-in, theme switching, sidebar navigation, contact, uploads, and dashboard CRUD flows.
8. Remove unused dead code such as `LikeButton.jsx` during a future cleanup pass.

## Quality Checks Completed

- P0 security and functionality hardening completed.
- P1 source metadata, slide controls, and baseline tooling completed.
- P2 dependency, source-page, mobile hero, navigation, contact, and dashboard polish completed.
- `npm run lint` passes with 0 errors and the documented warning baseline.
- `npm run build` completes successfully.
- `npm run smoke` passes against the production URL.

## Notes Before Official Launch

Do not publish admin credentials in docs or screenshots. Confirm Vercel Production has the current environment variables before redeploying. If the admin password is ever lost, update `ADMIN_PASSWORD` privately, run `npm run seed:admin` against the intended database, redeploy if needed, and verify login through `/sign-in`.
