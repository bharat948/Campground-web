# YelpCamp

A full-stack campground review platform. Users can discover campgrounds, add their own with photos and location, leave star ratings and reviews, and explore an interactive map.

## Live Demo

[Add your deployed URL here]

## Screenshots

Add 2–3 screenshots here (e.g. home page, campground index with map, campground show page with reviews). Place images in the repo and link them:

```markdown
![Home](screenshots/home.png)
![Campgrounds](screenshots/campgrounds.png)
![Campground detail](screenshots/show.png)
```

## Features

- **User authentication** — Register, login, logout with session persistence
- **Campgrounds** — Create, read, update, and delete campgrounds (with authorization)
- **Image upload** — Via Cloudinary; up to 6 images per campground (2MB each, JPG/PNG/WEBP)
- **Maps** — Mapbox GL JS: cluster map on index, single-campground map on show page
- **Reviews** — Star ratings and text reviews
- **Search & pagination** — Search by title/location; 8 campgrounds per page
- **Authorization** — Only authors can edit or delete their campgrounds/reviews
- **Sessions** — Stored in MongoDB (connect-mongo) so they survive restarts
- **Security** — Secure cookies in production; input validation (Joi)
- **Testing** — Jest + Supertest with in-memory MongoDB

## Tech Stack

| Layer        | Technologies |
|-------------|--------------|
| Backend     | Node.js, Express |
| Database    | MongoDB, Mongoose |
| Auth        | Passport.js, passport-local-mongoose |
| File upload | Multer, Cloudinary |
| Maps        | Mapbox GL JS |
| Templating  | EJS, ejs-mate |
| Validation  | Joi |
| Session     | express-session, connect-mongo |
| Security    | Helmet, express-mongo-sanitize (recommended for production) |
| Testing     | Jest, Supertest, mongodb-memory-server |

## Getting Started

### Prerequisites

- **Node.js** 18+
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **Cloudinary** account (for image uploads)
- **Mapbox** access token (for maps)

### Installation

1. Clone the repo and install dependencies:

   ```bash
   git clone <repo-url>
   cd Campground-web
   npm install
   ```

2. Copy environment variables and fill in values:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your MongoDB URI, Cloudinary credentials, Mapbox token, and a strong `SESSION_SECRET`.

3. (Optional) Seed the database:

   ```bash
   npm run seed
   ```

4. Run the app:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

### Production

Set `NODE_ENV=production` and ensure all env vars are set. The app uses `PORT` from the environment (default 3000) and secure cookies when `NODE_ENV === 'production'`.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default 3000). Set by Railway/Render/Heroku. |
| `NODE_ENV` | `development`, `test`, or `production`. |
| `MONGO_URL` | MongoDB connection string. |
| `SESSION_SECRET` | Secret for signing session cookies. Use a long random string in production. |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name. |
| `CLOUDINARY_KEY` | Cloudinary API key. |
| `CLOUDINARY_SECRET` | Cloudinary API secret. |
| `MAPBOX_TOKEN` | Mapbox public access token for maps. |

## Running Tests

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```

Tests use an in-memory MongoDB (no real database required).

## Project Structure

| Folder / File | Purpose |
|---------------|---------|
| `controllers/` | Route handlers (campgrounds, reviews, users). |
| `models/` | Mongoose schemas (Campground, Review, User). |
| `routes/` | Express routers (campgrounds, reviews, users). |
| `views/` | EJS templates (layouts, partials, campgrounds, users). |
| `public/` | Static assets (CSS, JS, images). |
| `utils/` | Helpers (catchAsync, ExpressError). |
| `middleware.js` | Auth (isLoggedIn, isAuthor, isReviewAuthor), validation. |
| `schemas.js` | Joi validation schemas. |
| `cloudinary/` | Cloudinary config and storage for Multer. |

## Known Limitations / Future Improvements

- No password reset via email
- No campground bookmarking / favorites
- No Google (or other) OAuth login
- Helmet and express-mongo-sanitize can be added for stronger security headers and NoSQL injection mitigation

## License

ISC
