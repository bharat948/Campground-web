# YelpCamp — Performance Audit

> **Last audited:** 2026-05-31

---

## Summary

YelpCamp is a small-scale SSR application with no obvious performance optimizations. Current architecture is adequate for **< 1,000 users** but has bottlenecks that will emerge at scale.

| Area | Rating | Notes |
|------|--------|-------|
| Database queries | ⚠️ Needs work | Unbounded find, missing indexes |
| Rendering | ✅ Acceptable | EJS SSR, no heavy computation |
| File uploads | ✅ Good | Direct to Cloudinary |
| Caching | ❌ None | No HTTP cache, no app cache |
| Network | ⚠️ Moderate | Multiple CDN dependencies |
| Memory | ✅ Acceptable | No obvious leaks |

---

## Findings

### PERF-001: Unbounded Map Query on Index

| Field | Value |
|-------|-------|
| **Location** | `controllers/campgrounds.js:26` |
| **Severity** | High |
| **Explanation** | `Campground.find(query).select(...)` loads ALL matching campgrounds for map GeoJSON, regardless of pagination (8 per page) |
| **Impact** | At 10K campgrounds, loads entire collection into memory on every index request |
| **Recommendation** | Separate map API with viewport bounds filter; or cache GeoJSON with TTL |
| **Effort** | Medium |
| **Priority** | P1 |

### PERF-002: Duplicate Query on Index Page

| Field | Value |
|-------|-------|
| **Location** | `controllers/campgrounds.js:24-26` |
| **Severity** | Medium |
| **Explanation** | `paginate()` and `find()` execute two separate DB queries with same filter |
| **Impact** | 2× database load per page view |
| **Recommendation** | Share query object; consider aggregation pipeline |
| **Effort** | Low |
| **Priority** | P2 |

### PERF-003: Missing Database Indexes

| Field | Value |
|-------|-------|
| **Location** | `models/campground.js`, `models/review.js` |
| **Severity** | High |
| **Explanation** | No indexes on `author`, `campground`, search fields, or `geometry` |
| **Impact** | Full collection scans on profile pages and search |
| **Recommendation** | See [DATABASE.md](../architecture/DATABASE.md) index recommendations |
| **Effort** | Low |
| **Priority** | P1 |

### PERF-004: Regex Search Without Index

| Field | Value |
|-------|-------|
| **Location** | `controllers/campgrounds.js:13-14` |
| **Severity** | Medium |
| **Explanation** | Case-insensitive regex on title/location cannot use standard indexes |
| **Impact** | O(n) scan per search |
| **Recommendation** | MongoDB text index or Atlas Search |
| **Effort** | Medium |
| **Priority** | P2 |

### PERF-005: N+1 on Show Page (Mitigated)

| Field | Value |
|-------|-------|
| **Location** | `controllers/campgrounds.js:82-88` |
| **Severity** | Low |
| **Explanation** | Uses populate for reviews, authors, reply authors — acceptable for moderate review counts |
| **Impact** | Grows linearly with review count; no pagination on reviews |
| **Recommendation** | Paginate reviews; limit initial load |
| **Effort** | Medium |
| **Priority** | P3 |

### PERF-006: Synchronous External API Calls

| Field | Value |
|-------|-------|
| **Location** | `controllers/campgrounds.js` — Mapbox geocoding |
| **Severity** | Medium |
| **Explanation** | Geocode blocks request on create/update |
| **Impact** | Latency tied to Mapbox API response (~200-500ms) |
| **Recommendation** | Acceptable for now; add timeout and retry |
| **Effort** | Low |
| **Priority** | P3 |

### PERF-007: No HTTP Caching Headers

| Field | Value |
|-------|-------|
| **Location** | `app.js` — static middleware, dynamic routes |
| **Severity** | Medium |
| **Explanation** | No Cache-Control on static assets or public pages |
| **Impact** | Unnecessary re-downloads of CSS/JS |
| **Recommendation** | `express.static` with maxAge; CDN for static assets |
| **Effort** | Low |
| **Priority** | P2 |

### PERF-008: Static Assets Served by Express

| Field | Value |
|-------|-------|
| **Location** | `app.js:43` |
| **Severity** | Low |
| **Explanation** | Node process serves CSS/JS instead of CDN/reverse proxy |
| **Impact** | CPU overhead at scale |
| **Recommendation** | Nginx/CloudFront in production |
| **Effort** | Medium |
| **Priority** | P3 |

### PERF-009: Home Page Triple Count Query

| Field | Value |
|-------|-------|
| **Location** | `app.js:85-88` |
| **Severity** | Low |
| **Explanation** | Three `countDocuments()` calls on every home page load |
| **Impact** | Minor at small scale; use cached counters at scale |
| **Recommendation** | Cache stats with 5-minute TTL |
| **Effort** | Low |
| **Priority** | P4 |

### PERF-010: No Image Optimization Pipeline

| Field | Value |
|-------|-------|
| **Location** | `cloudinary/index.js` |
| **Severity** | Low |
| **Explanation** | Uses thumbnail virtual but full-size images in carousel |
| **Impact** | Large image payloads on show page |
| **Recommendation** | Cloudinary transformations (f_auto, q_auto) on display URLs |
| **Effort** | Low |
| **Priority** | P3 |

### PERF-011: Session Store Touch Optimization

| Field | Value |
|-------|-------|
| **Location** | `app.js:59` — `touchAfter: 24 * 3600` |
| **Severity** | Positive |
| **Explanation** | Reduces session write frequency — good practice |
| **Impact** | Reduced MongoDB writes |
| **Recommendation** | Keep as-is |
| **Effort** | N/A |

---

## Caching Opportunities

| Data | Strategy | TTL | Priority |
|------|----------|-----|----------|
| Campground GeoJSON | Redis/in-memory cache | 5 min | High |
| Home page stats | Redis/in-memory | 5 min | Low |
| Campground show (public) | HTTP ETag | 1 min | Medium |
| Static assets | CDN + immutable | 1 year | Medium |

---

## Memory Considerations

- Jest tests use mongodb-memory-server (acceptable)
- No streaming for file uploads (Multer buffers to Cloudinary — acceptable for 2MB limit)
- No unbounded arrays in schemas except reviews[] and likes[]

---

## Network Efficiency

| Resource | Source | Optimization |
|----------|--------|--------------|
| Bootstrap 4.3.1 | jsdelivr CDN | Consider self-hosting with SRI |
| Mapbox GL JS 2.15.0 | Mapbox CDN | Required |
| Google Fonts | External | Use font-display: swap ✅ |
| Cloudinary images | CDN | Add f_auto, q_auto transforms |

---

## Load Test Recommendations

Before production launch, run:

1. **Index page** — 100 concurrent users with 1K+ campgrounds
2. **Search** — regex query under load
3. **Create campground** — concurrent uploads with Mapbox geocoding
4. **Show page** — campground with 100+ reviews

Tools: k6, Artillery, or Apache Bench

---

## Related Documentation

- [../architecture/DATABASE.md](../architecture/DATABASE.md)
- [../operations/PRODUCTION_READINESS.md](../operations/PRODUCTION_READINESS.md)
- [../roadmaps/SCALING_ROADMAP.md](../roadmaps/SCALING_ROADMAP.md)
