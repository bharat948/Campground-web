# YelpCamp — Product Documentation

> **Last audited:** 2026-05-31  
> **Repository:** Campground-web (package name: `yelpcamp`)

---

## Executive Summary

YelpCamp is a full-stack web application for discovering, listing, and reviewing campgrounds. It is modeled after Yelp-style review platforms, adapted for outdoor camping. Users browse campgrounds on an interactive map, view details with photos and pricing, leave star ratings and text reviews, and manage their own listings.

---

## Problem Statement

Campers and outdoor enthusiasts lack a centralized, community-driven platform to discover campgrounds, compare prices, read authentic reviews, and share their own experiences with geolocation context.

---

## Target Users

| Persona | Goals | Key Actions |
|---------|-------|-------------|
| **Guest / Browser** | Find campgrounds near destinations | Search, browse map, read reviews |
| **Registered Camper** | Share experiences, build reputation | Register, post reviews, like/reply |
| **Campground Owner / Poster** | List and manage campgrounds | Create campground, upload photos, edit/delete own listings |
| **Developer / Operator** | Deploy and maintain the platform | Configure env, seed DB, run tests |

---

## Core Value Proposition

1. **Discovery** — Searchable, paginated campground index with Mapbox cluster map
2. **Trust** — Star ratings, text reviews, likes, and threaded replies
3. **Rich media** — Up to 6 Cloudinary-hosted images per campground
4. **Geolocation** — Automatic geocoding via Mapbox; maps on index and detail pages
5. **Ownership** — Authors control their campgrounds and reviews

---

## Feature Inventory

| Feature | Status | Notes |
|---------|--------|-------|
| User registration / login / logout | ✅ Implemented | Passport.js local strategy |
| Session persistence | ✅ Implemented | MongoDB via connect-mongo |
| CRUD campgrounds | ✅ Implemented | Auth + author checks |
| Image upload (Cloudinary) | ✅ Implemented | Max 6 images, 2MB each |
| Geocoding | ✅ Implemented | Mapbox forward geocode on create/update |
| Search & pagination | ✅ Implemented | Regex on title/location, 8 per page |
| Reviews (rating + body) | ✅ Implemented | Nested under campground |
| Review likes (toggle) | ✅ Implemented | |
| Review replies | ✅ Implemented | Subdocuments with timestamps |
| User profiles | ✅ Implemented | Shows user's campgrounds and reviews |
| Home page stats | ✅ Implemented | Counts of campgrounds, reviews, users |
| Password reset | ❌ Not implemented | Listed in README limitations |
| OAuth (Google, etc.) | ❌ Not implemented | |
| Favorites / bookmarks | ❌ Not implemented | |
| Email notifications | ❌ Not implemented | |
| Admin panel | ❌ Not implemented | |
| API (REST/GraphQL) | ❌ Not implemented | Server-rendered only |

---

## Business Model (Assumed)

This is an educational / portfolio project (Colt Steele-style bootcamp curriculum). No monetization, payment processing, or booking flow exists. Price is displayed as informational `$/night` only.

**Assumption:** No real commercial deployment intent is evident from the codebase. Documentation treats it as a production-capable demo app.

---

## External Dependencies

| Service | Purpose | Required |
|---------|---------|----------|
| MongoDB | Primary data store | Yes |
| Cloudinary | Image storage & CDN | Yes (for uploads) |
| Mapbox | Geocoding + map rendering | Yes |
| CDN (jsdelivr, mapbox, google fonts) | Frontend assets | Yes (runtime) |

---

## Deployment Target

- **Procfile** present → Heroku/Railway/Render-style PaaS
- **No CI/CD** configured in repository
- **No Docker** configuration
- **No infrastructure-as-code**

---

## Known Product Gaps

See README "Known Limitations" plus audit findings:

- No content moderation workflow
- No rate limiting on auth or uploads
- No email verification on registration
- Search is basic regex (no full-text index)
- No average rating aggregation on campground cards

---

## Related Documentation

- [BUSINESS_LOGIC.md](./BUSINESS_LOGIC.md) — Domain rules and validation
- [USER_FLOWS.md](./USER_FLOWS.md) — Journey maps and state transitions
- [../architecture/ARCHITECTURE.md](../architecture/ARCHITECTURE.md) — Technical architecture
