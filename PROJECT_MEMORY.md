# PROJECT_MEMORY.md — YelpCamp

> Persistent facts for AI agents across sessions. Update when project state changes.

---

## Identity

| Field | Value |
|-------|-------|
| Project name | YelpCamp |
| Package name | yelpcamp |
| Repository | Campground-web |
| Type | Full-stack SSR web app (bootcamp-style) |
| License | ISC |
| Last audit | 2026-05-31 |

---

## Tech Stack (Confirmed)

- Node.js >= 18, Express 4.18, Mongoose 7.2
- EJS + ejs-mate for templating
- Passport.js local auth + express-session + connect-mongo
- Cloudinary for images, Mapbox for geocoding/maps
- Jest + Supertest + mongodb-memory-server for tests
- Bootstrap 4.3.1 (CDN), custom CSS with `yc-` prefix

---

## Current State

| Metric | Value |
|--------|-------|
| Tests | 28 passing, 4 suites |
| npm vulnerabilities | 23 (2 critical, 8 high) |
| CI/CD | Not configured |
| Production deployment | Procfile only (PaaS-ready) |
| Documentation | Full suite in `docs/` (2026-05-31) |

---

## Critical Known Issues

1. **P0:** Hardcoded Cloudinary credentials in `cloudinary-onboarding.js` — rotate and delete
2. **P0:** `controllers/users.js` register — undefined `next` in catch block
3. **P1:** No CSRF protection on forms
4. **P1:** No Helmet, rate limiting, or mongo-sanitize
5. **P1:** Unbounded map query loads all campgrounds on index page
6. **P1:** Missing database indexes on author, campground, search fields

---

## Architecture Facts

- Entry point: `app.js` (not index.js despite package.json)
- Three route modules: users, campgrounds, reviews (nested)
- Authorization middleware in `middleware.js` (note: `isloggedIn` naming)
- Validation in `schemas.js` via Joi
- Campground delete cascades to Cloudinary images and Review docs
- Reviews support likes (toggle) and embedded replies
- Session cookie: 7 days, httpOnly, secure in production

---

## Environment

Required vars: `MONGO_URL`, `SESSION_SECRET` (prod), `CLOUDINARY_*`, `MAPBOX_TOKEN`

Production validation: only SESSION_SECRET + MONGO_URL checked by validateEnv.js

---

## Conventions

- CommonJS modules (require/module.exports)
- catchAsync wrapper for all async routes
- Flash messages for user feedback
- POST-Redirect-GET pattern
- method-override for DELETE/PUT from HTML forms
- 8 campgrounds per page, 6 images max, 2MB each

---

## Do Not Assume

- TypeScript is NOT used
- No REST API exists (SSR only)
- No admin roles or OAuth
- No email service configured
- Seeds are destructive (deleteMany on campgrounds)
- README mentions Helmet/sanitize as "recommended" but NOT installed

---

## Documentation Index

All docs generated 2026-05-31. Start with `MASTER_REPOSITORY_REPORT.md` for overview.

---

## Session History Notes

- Git status at audit: modified `app.js`, `middleware.js`; new `models/review.js`, `utils/validateEnv.js`, `tests/envValidation.test.js`
- Review likes and replies feature recently added with tests
