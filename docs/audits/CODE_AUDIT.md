# YelpCamp — Code Audit

> **Last audited:** 2026-05-31  
> **Scope:** Full repository (69 files)

---

## Summary

| Category | Critical | High | Medium | Low |
|----------|----------|------|--------|-----|
| Dead Code | 0 | 1 | 3 | 4 |
| Duplicate Logic | 0 | 1 | 2 | 1 |
| Hardcoded Data | 1 | 1 | 2 | 3 |
| Code Smells | 0 | 2 | 5 | 4 |

---

## Dead Code

### DC-001: Hardcoded Cloudinary credentials script

| Field | Value |
|-------|-------|
| **Location** | `cloudinary-onboarding.js` |
| **Severity** | High |
| **Explanation** | Standalone onboarding script with hardcoded API credentials. Not referenced anywhere in the application. Committed to repo. |
| **Recommendation** | Delete file or move credentials to env; rotate exposed keys immediately |
| **Effort** | Low (1 hour including key rotation) |

### DC-002: Unused seed script

| Field | Value |
|-------|-------|
| **Location** | `seeds/global_bootstrapping.js` |
| **Severity** | Medium |
| **Explanation** | Alternative seed script not wired to npm scripts or documentation |
| **Recommendation** | Document in README or delete if superseded by `seeds/index.js` |
| **Effort** | Low |

### DC-003: Unused imports in routes

| Field | Value |
|-------|-------|
| **Location** | `routes/campgrounds.js` — `Campground`, `campgroundSchema`; `routes/reviews.js` — `ExpressError`, `Campground`, `Review`, `reviewSchema`; `routes/users.js` — `ExpressError`, `User`; `app.js` — `campgroundSchema`, `reviewSchema` |
| **Severity** | Low |
| **Explanation** | Imported but never used; validation happens in middleware |
| **Recommendation** | Remove unused imports |
| **Effort** | Low (15 min) |

### DC-004: Unused model import

| Field | Value |
|-------|-------|
| **Location** | `models/campground.js` line 4 — `User` import |
| **Severity** | Low |
| **Explanation** | User model imported but not referenced in file |
| **Recommendation** | Remove import |
| **Effort** | Trivial |

### DC-005: Commented-out authorization checks

| Field | Value |
|-------|-------|
| **Location** | `controllers/campgrounds.js` lines 51-54, 102-106 |
| **Severity** | Medium |
| **Explanation** | Dead commented code for auth checks now handled by middleware |
| **Recommendation** | Delete comments |
| **Effort** | Trivial |

### DC-006: Commented logout route

| Field | Value |
|-------|-------|
| **Location** | `routes/users.js` lines 15-19 |
| **Severity** | Low |
| **Explanation** | Old logout implementation replaced by controller method |
| **Recommendation** | Delete |
| **Effort** | Trivial |

### DC-007: UI evaluation screenshots

| Field | Value |
|-------|-------|
| **Location** | `ui-eval-*.png`, `ui-verify-campgrounds.png` (7 files) |
| **Severity** | Low |
| **Explanation** | Screenshot artifacts in repo root, not referenced in docs |
| **Recommendation** | Move to `docs/assets/` or `.gitignore` |
| **Effort** | Low |

---

## Duplicate Logic

### DL-001: Dual campground queries on index

| Field | Value |
|-------|-------|
| **Location** | `controllers/campgrounds.js` — `paginate()` + `find()` |
| **Severity** | High |
| **Explanation** | Same query executed twice — once paginated, once for full map GeoJSON |
| **Recommendation** | Extract shared query builder; consider separate map endpoint with caching |
| **Effort** | Medium (2-4 hours) |

### DL-002: Geocoding duplicated in create/update

| Field | Value |
|-------|-------|
| **Location** | `controllers/campgrounds.js` — `createCampground`, `updateCampground` |
| **Severity** | Medium |
| **Explanation** | Identical Mapbox forwardGeocode logic repeated |
| **Recommendation** | Extract `geocodeLocation(location)` helper |
| **Effort** | Low (1 hour) |

### DL-003: Authorization redirect pattern

| Field | Value |
|-------|-------|
| **Location** | `middleware.js` — `isAuthor`, `isReviewAuthor`, `isReplyAuthor`, `reviewBelongsToCampground` |
| **Severity** | Low |
| **Explanation** | Similar flash + redirect patterns repeated |
| **Recommendation** | Optional `denyWithFlash(message, redirectUrl)` helper |
| **Effort** | Low |

### DL-004: Seed user creation pattern

| Field | Value |
|-------|-------|
| **Location** | `seeds/index.js`, `seeds/global_bootstrapping.js` |
| **Severity** | Medium |
| **Explanation** | Two independent seed scripts with overlapping user registration logic |
| **Recommendation** | Consolidate into single seed module |
| **Effort** | Medium |

---

## Hardcoded Data

### HD-001: Cloudinary credentials (CRITICAL)

| Field | Value |
|-------|-------|
| **Location** | `cloudinary-onboarding.js:3-7` |
| **Severity** | Critical |
| **Explanation** | `cloud_name`, `api_key`, `api_secret` hardcoded in source |
| **Recommendation** | Delete file, rotate credentials, audit git history |
| **Effort** | Medium |

### HD-002: Development session secret fallback

| Field | Value |
|-------|-------|
| **Location** | `app.js:46` — `'dev-secret-set-SESSION_SECRET-in-env'` |
| **Severity** | High |
| **Explanation** | Predictable secret if NODE_ENV misconfigured |
| **Recommendation** | Fail startup in any non-test env without SESSION_SECRET |
| **Effort** | Low |

### HD-003: Magic numbers

| Field | Value |
|-------|-------|
| **Location** | Multiple — `perPage = 8`, `fileSize: 2 * 1024 * 1024`, `upload.array('image', 6)`, session `7 days`, `clusterMaxZoom: 14` |
| **Severity** | Medium |
| **Explanation** | Configuration scattered across files |
| **Recommendation** | Centralize in `config/constants.js` |
| **Effort** | Low |

### HD-004: Hardcoded Cloudinary URLs in seeds

| Field | Value |
|-------|-------|
| **Location** | `seeds/global_bootstrapping.js:86`, `seeds/index.js` Unsplash URLs |
| **Severity** | Low |
| **Explanation** | External image URLs in seed data |
| **Recommendation** | Acceptable for seeds; document dependency |
| **Effort** | N/A |

### HD-005: Default MongoDB URL in global_bootstrapping

| Field | Value |
|-------|-------|
| **Location** | `seeds/global_bootstrapping.js:9` — `mongodb://127.0.0.1:27017/yelp-camp` |
| **Severity** | Medium |
| **Explanation** | Fallback local URL could target wrong DB |
| **Recommendation** | Require MONGO_URL explicitly |
| **Effort** | Low |

### HD-006: Seed passwords

| Field | Value |
|-------|-------|
| **Location** | `seeds/index.js:36`, `seeds/global_bootstrapping.js:23-25` |
| **Severity** | Low |
| **Explanation** | Known passwords in seed scripts (`seedpassword123`, `password123`) |
| **Recommendation** | Document as dev-only; never run seeds in production |
| **Effort** | N/A |

---

## Code Smells

### CS-001: Undefined `next` in register catch block

| Field | Value |
|-------|-------|
| **Location** | `controllers/users.js:13` — `return next(err)` but `next` not in function params |
| **Severity** | High |
| **Explanation** | Will throw ReferenceError if registration login fails after user creation |
| **Recommendation** | Add `next` parameter or handle error inline |
| **Effort** | Low |

### CS-002: Inconsistent middleware naming

| Field | Value |
|-------|-------|
| **Location** | `middleware.js` — `isloggedIn` (lowercase 'l') vs `isAuthor`, `isReviewAuthor` |
| **Severity** | Low |
| **Explanation** | Breaks naming convention |
| **Recommendation** | Rename to `isLoggedIn` (breaking change across routes) |
| **Effort** | Low |

### CS-003: Side effects in model hook

| Field | Value |
|-------|-------|
| **Location** | `models/campground.js` post delete hook |
| **Severity** | Medium |
| **Explanation** | Cloudinary API calls in Mongoose hook couples persistence to external service |
| **Recommendation** | Move to service layer or event handler |
| **Effort** | Medium |

### CS-004: No service layer

| Field | Value |
|-------|-------|
| **Location** | All controllers |
| **Severity** | Medium |
| **Explanation** | Controllers directly orchestrate DB, Cloudinary, Mapbox |
| **Recommendation** | Introduce service modules for testability |
| **Effort** | High |

### CS-005: Error handler mutates error object

| Field | Value |
|-------|-------|
| **Location** | `app.js:101-116` |
| **Severity** | Medium |
| **Explanation** | Inconsistent error object handling; potential null reference on line 115 |
| **Recommendation** | Standardize error response format |
| **Effort** | Low |

### CS-006: XSS in map popup HTML

| Field | Value |
|-------|-------|
| **Location** | `controllers/campgrounds.js:37` — `popupMarkup` with unescaped title/location |
| **Severity** | Medium |
| **Explanation** | User-controlled title/location injected into HTML for Mapbox popup |
| **Recommendation** | Escape HTML entities before embedding |
| **Effort** | Low |

### CS-007: Large show.ejs template

| Field | Value |
|-------|-------|
| **Location** | `views/campgrounds/show.ejs` (~208 lines) |
| **Severity** | Low |
| **Explanation** | Reviews, replies, likes, map all in one template |
| **Recommendation** | Extract partials for review card, reply form |
| **Effort** | Medium |

### CS-008: package.json main points to non-existent file

| Field | Value |
|-------|-------|
| **Location** | `package.json:5` — `"main": "index.js"` |
| **Severity** | Low |
| **Explanation** | Entry point is `app.js`, not `index.js` |
| **Recommendation** | Fix to `"main": "app.js"` |
| **Effort** | Trivial |

### CS-009: nodemon in production dependencies

| Field | Value |
|-------|-------|
| **Location** | `package.json` dependencies |
| **Severity** | Medium |
| **Explanation** | Dev tool listed as production dependency |
| **Recommendation** | Move to devDependencies |
| **Effort** | Trivial |

### CS-010: No input sanitization for MongoDB

| Field | Value |
|-------|-------|
| **Location** | Global — no express-mongo-sanitize |
| **Severity** | Medium |
| **Explanation** | User input in req.body could contain `$`-prefixed operators |
| **Recommendation** | Add express-mongo-sanitize middleware |
| **Effort** | Low |

---

## Positive Findings

- Consistent `catchAsync` wrapper usage in routes
- Authorization middleware well-factored for reviews/replies
- Cascade delete for campground images and reviews
- Joi validation for core entities
- File upload restrictions (size, count, type)
- Test suite covers auth, campgrounds, reviews, env validation (28 tests passing)
- Production env validation for critical secrets

---

## Related Documentation

- [../security/SECURITY_AUDIT.md](../security/SECURITY_AUDIT.md)
- [../roadmaps/TECH_DEBT_ROADMAP.md](../roadmaps/TECH_DEBT_ROADMAP.md)
