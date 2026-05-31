# AGENTS.md — YelpCamp

> Tool-agnostic instructions for AI coding agents.  
> Stewarded format: [agents.md](https://agents.md/) (Agentic AI Foundation / Linux Foundation)

---

## Project Summary

**YelpCamp** is a Node.js/Express campground review platform with server-rendered EJS views, MongoDB (Mongoose), Passport.js authentication, Cloudinary image uploads, and Mapbox maps/geocoding.

---

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start with nodemon (port 3000)
npm start            # Production start
npm test             # Jest + Supertest (28 tests, uses in-memory MongoDB)
npm run test:watch   # Watch mode
npm run seed         # DESTRUCTIVE: deletes all campgrounds, seeds 50
```

Node.js >= 18 required.

---

## Environment Variables

Copy `.env.example` to `.env`. Required for full functionality:

| Variable | Required |
|----------|----------|
| MONGO_URL | Yes (except test) |
| SESSION_SECRET | Yes in production |
| CLOUDINARY_CLOUD_NAME, CLOUDINARY_KEY, CLOUDINARY_SECRET | For uploads |
| MAPBOX_TOKEN | For geocoding and maps |

Production startup validates `SESSION_SECRET` and `MONGO_URL` via `utils/validateEnv.js`.

---

## Architecture

```
app.js              → Entry point, middleware stack, route mounting
routes/             → HTTP routing (campgrounds, reviews, users)
controllers/        → Business logic handlers
models/             → Mongoose schemas (Campground, Review, User)
middleware.js       → Auth (isloggedIn, isAuthor) + Joi validation
schemas.js          → Joi validation schemas
views/              → EJS templates
cloudinary/         → Cloudinary + Multer storage config
tests/              → Jest integration tests
```

**Pattern:** Routes → Middleware → Controller → Model → View (SSR)

Read `docs/architecture/ARCHITECTURE.md` for diagrams and route map.

---

## Key Conventions

- Wrap async route handlers with `catchAsync` from `utils/catchAsync.js`
- Throw `ExpressError(message, statusCode)` for validation errors
- Authorization: always use middleware (`isAuthor`, `isReviewAuthor`), never trust client
- POST → redirect (PRG pattern) with `req.flash()` messages
- Forms use `_method=DELETE|PUT` via method-override
- CommonJS modules throughout (no TypeScript)

---

## Testing Rules

- Run `npm test` before completing any task
- Tests use mongodb-memory-server; no real DB needed
- Use `request.agent(app)` for session-aware tests
- Mock external services (Mapbox, Cloudinary) — do not call real APIs in tests
- Add tests for new routes, especially authorization denial paths

---

## Security Rules — NEVER Violate

1. **Never commit secrets** — no API keys, credentials, or `.env` files
2. **Never remove auth middleware** from mutating routes
3. **Never expose stack traces** in production error responses
4. **Never run seed scripts** against production databases
5. **Validate all user input** server-side with Joi
6. **Rotate Cloudinary keys** if credentials were ever committed — onboarding script removed; see `docs/security/SECURITY_AUDIT.md`

---

## Files to Avoid Modifying Without Reason

- `seeds/cities.js` — large static data file
- `package-lock.json` — only via npm install/audit
- `ui-eval-*.png` — screenshot artifacts

---

## Documentation Map

| Need | Read |
|------|------|
| Product features | `docs/product/PRODUCT.md` |
| Business rules | `docs/product/BUSINESS_LOGIC.md` |
| User journeys | `docs/product/USER_FLOWS.md` |
| Architecture | `docs/architecture/ARCHITECTURE.md` |
| Database schema | `docs/architecture/DATABASE.md` |
| Code audit findings | `docs/audits/CODE_AUDIT.md` |
| Security audit | `docs/security/SECURITY_AUDIT.md` |
| Coding standards | `docs/standards/CODING_STANDARD.md` |
| Roadmaps | `docs/roadmaps/` |
| Executive summary | `MASTER_REPOSITORY_REPORT.md` |

---

## Common Tasks

### Add a new route
1. Controller function in `controllers/`
2. Route in `routes/` with appropriate middleware
3. EJS view in `views/`
4. Joi schema in `schemas.js` if form data
5. Test in `tests/`

### Add authorization to existing route
Use middleware from `middleware.js`. Follow existing patterns for flash + redirect on denial.

### Add environment variable
1. Add to `.env.example`
2. Add to `validateEnv.js` if required in production
3. Document in README and this file

---

## PR Guidelines

- Keep diffs focused; no drive-by refactoring
- Run `npm test` before submitting
- Update docs if behavior or architecture changes
- Follow commit message format: imperative mood (`Add`, `Fix`, `Update`)

See `docs/standards/CODE_REVIEW_GUIDE.md`.

---

## Agent Behavior

- Read relevant docs before making architectural changes
- Match existing code style in the file you're editing
- Prefer minimal, surgical changes
- State assumptions when requirements are ambiguous
- Do not add features beyond what was requested
- Challenge security implications of any auth-related change
