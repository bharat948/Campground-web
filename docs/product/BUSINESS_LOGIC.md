# YelpCamp — Business Logic Documentation

> **Last audited:** 2026-05-31

---

## Domain Overview

YelpCamp implements a three-entity domain model with embedded subdocuments:

```
User ──author──▶ Campground ◀──campground── Review
                      │                        │
                      └── reviews[] (refs) ────┘
                                           replies[] (embedded)
                                           likes[] (User refs)
```

---

## Domain Entities

### User

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `username` | String | Optional at schema level | Used as Passport login identifier |
| `email` | String | Required, unique | Registration identifier |
| `password` | String | Hashed by passport-local-mongoose | Never stored plaintext |

**Hidden behavior:** `passport-local-mongoose` adds salt, hash, and authentication methods.

### Campground

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `title` | String | Joi required | |
| `images` | ImageSchema[] | Min 1 on create (controller) | Cloudinary url + filename |
| `geometry` | GeoJSON Point | Required after geocode | Set by Mapbox, not user input |
| `price` | Number | Joi min 0 | Displayed as $/night |
| `description` | String | Joi required | |
| `location` | String | Joi required | Human-readable; geocoded |
| `author` | ObjectId → User | Set on create | Immutable in UI |
| `reviews` | ObjectId[] → Review | Bidirectional ref | Denormalized array |

**ImageSchema virtual:** `thumbnail` transforms Cloudinary URL to 200px width.

**Cascade delete:** Post-hook on `findOneAndDelete` removes Cloudinary assets and associated Review documents.

### Review

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `body` | String | Joi required | |
| `rating` | Number | Joi required | 1–5 stars (UI enforced) |
| `author` | ObjectId → User | Set on create | |
| `campground` | ObjectId → Campground | Set on create | |
| `likes` | ObjectId[] → User | Toggle on POST | No duplicate likes ($addToSet) |
| `replies` | Reply subdoc[] | Joi on body | Max 500 chars, min 1 trimmed |

### Reply (embedded subdocument)

| Field | Type | Constraints |
|-------|------|-------------|
| `body` | String | Required, 1–500 chars |
| `author` | ObjectId → User | Required |
| `createdAt` / `updatedAt` | Date | Auto via timestamps |

---

## Core Business Rules

### Authentication & Authorization

| Rule | Enforcement | Location |
|------|-------------|----------|
| Must be logged in to create campground | `isloggedIn` middleware | `routes/campgrounds.js` |
| Must be logged in to create/edit/delete review | `isloggedIn` | `routes/reviews.js` |
| Only campground author can edit/delete campground | `isAuthor` | `middleware.js` |
| Only review author can delete review | `isReviewAuthor` | `middleware.js` |
| Only reply author can delete reply | `isReplyAuthor` | `middleware.js` |
| Review must belong to campground in URL | `reviewBelongsToCampground` | `middleware.js` |
| Unauthenticated users redirected to `/login` with `returnTo` | Session | `middleware.js` |

**Gap:** Any authenticated user can post a review on any campground (by design). No "one review per user per campground" constraint.

### Campground Creation

1. User must upload **at least one image** (controller check, not Joi)
2. Location string is **forward-geocoded** via Mapbox; invalid locations rejected
3. Author set to `req.user._id`
4. Images uploaded to Cloudinary folder `yelpCamp`

### Campground Update

1. Re-geocode location on every update
2. New images appended (not replaced)
3. Selected images deleted via `deleteImages[]` form field → Cloudinary destroy + `$pull`

### Campground Deletion

1. Mongoose post-hook deletes Cloudinary images and all referenced reviews
2. Route protected by `isAuthor`

### Review Lifecycle

1. Create: adds review to campground's `reviews[]` array AND saves review doc
2. Delete: `$pull` from campground + `findByIdAndDelete` on review
3. Like: toggle — add/remove user ID from `likes[]`
4. Reply: push subdocument; delete via `$pull` on subdoc `_id`

**Orphan risk:** If review delete fails midway, campground.reviews could desync from Review collection.

### Search & Pagination

- Search: case-insensitive regex on `title` OR `location`
- Pagination: 8 items per page via `mongoose-paginate-v2`
- Map data: separate unbounded `Campground.find(query)` for GeoJSON (potential scale issue)

---

## Validation Rules

### Server-side (Joi — `schemas.js`)

| Schema | Fields | Rules |
|--------|--------|-------|
| `campgroundSchema` | title, price, location, description | All required; price ≥ 0 |
| `reviewSchema` | rating, body | Both required |
| `replySchema` | body | Required, trim, min 1, max 500 |

**Not validated by Joi:**
- Image presence (handled in controller)
- Rating range 1–5 (only UI + Joi "required number")
- Username format on registration
- Email format on registration

### Client-side

- Bootstrap 4 `validated-form` class with HTML5 `required` attributes
- `validateForms.js` prevents submit if invalid
- Star rating UI defaults to value `1` (both "no-rate" and first star have value 1 — UX quirk)

### File Upload

- Max 6 files, 2MB each
- Allowed: jpeg, jpg, png, webp (extension + mimetype check)
- Cloudinary `allowedFormat`: jpeg, png, jpg (webp accepted by multer but may fail at Cloudinary)

---

## Hidden Assumptions

1. **Username is the login credential**, not email (Passport local strategy default)
2. **Sessions survive server restart** via MongoDB store
3. **Mapbox token is exposed to client** in EJS templates (public token expected)
4. **No CSRF protection** — forms rely on session cookie only
5. **Method override** (`_method=DELETE/PUT`) used for RESTful verbs over HTML forms
6. **Development fallback session secret** exists if `SESSION_SECRET` unset (non-production only)
7. **Production env validation** requires `SESSION_SECRET`, `MONGO_URL`, Cloudinary, and Mapbox variables
8. **Seed scripts** can wipe all campgrounds (`deleteMany`)

---

## Domain Boundaries

| Boundary | Inside | Outside |
|----------|--------|---------|
| Application | Express routes, EJS views, Mongoose models | MongoDB Atlas, Cloudinary, Mapbox APIs |
| Auth | Passport session in MongoDB | No external IdP |
| File storage | Cloudinary only | No local disk persistence |
| Geocoding | Mapbox SDK server-side | No client-side geocoding |

---

## Unknowns / Needs Validation

- Intended production hosting provider (Procfile suggests Heroku lineage)
- Whether duplicate reviews per user are intentional
- Rating aggregation requirements (average stars not computed anywhere)
