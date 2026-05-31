# Naming Conventions — YelpCamp

---

## Files & Directories

| Type | Convention | Example |
|------|------------|---------|
| Routes | Plural noun | `routes/campgrounds.js` |
| Controllers | Plural noun (matches route) | `controllers/campgrounds.js` |
| Models | Singular noun | `models/campground.js` |
| Views | Lowercase, nested by resource | `views/campgrounds/show.ejs` |
| Tests | `{resource}.test.js` | `tests/campgrounds.test.js` |
| Utils | camelCase | `utils/catchAsync.js` |

---

## Variables & Functions

| Type | Convention | Example |
|------|------------|---------|
| Variables | camelCase | `testCampground`, `geoResponse` |
| Functions | camelCase | `createCampground`, `validateEnv` |
| Constants | camelCase or UPPER_SNAKE | `perPage = 8` |
| Middleware | camelCase, descriptive | `isAuthor`, `validateReview` |
| Mongoose models | PascalCase | `Campground`, `Review`, `User` |
| Schema variables | camelCase + Schema | `CampgroundSchema`, `reviewSchema` |

**Known inconsistency:** `isloggedIn` should be `isLoggedIn` — fix when touching auth middleware.

---

## Routes & URLs

| Pattern | Example |
|---------|---------|
| Collection | `/campgrounds` |
| Resource | `/campgrounds/:id` |
| Nested resource | `/campgrounds/:id/reviews` |
| Auth pages | `/login`, `/register`, `/logout` |
| User profile | `/users/:id` |

Use kebab-case only if multi-word (none currently).

---

## Database Fields

| Field | Convention |
|-------|------------|
| References | Singular noun matching model | `author`, `campground` |
| Arrays | Plural noun | `reviews`, `images`, `likes`, `replies` |
| Booleans | Prefix with `is`/`has` if added | — |
| Timestamps | Mongoose default | `createdAt`, `updatedAt` |

---

## Environment Variables

UPPER_SNAKE_CASE: `MONGO_URL`, `SESSION_SECRET`, `MAPBOX_TOKEN`, `CLOUDINARY_CLOUD_NAME`

---

## EJS Templates

| Element | Convention |
|---------|------------|
| Partials | `partials/navbar.ejs` |
| Layouts | `layouts/boilerplate.ejs` |
| Form fields | Nested bracket notation | `campground[title]`, `review[rating]` |
| CSS classes | Prefix `yc-` for custom styles | `yc-review-card` |

---

## Git

| Element | Convention |
|---------|--------|
| Branch | `feature/`, `fix/`, `docs/` prefix |
| Commits | Imperative mood, concise | `Add review reply validation` |

See [GIT_WORKFLOW.md](./GIT_WORKFLOW.md).
