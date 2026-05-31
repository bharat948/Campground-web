# Performance Guide — YelpCamp

---

## Database

- Add indexes before scaling (see [DATABASE.md](../architecture/DATABASE.md))
- Paginate all list endpoints
- Never load unbounded collections for map data
- Use `.select()` and `.lean()` for read-heavy queries
- Consider MongoDB aggregation for complex queries

---

## Caching

| Data | Strategy |
|------|----------|
| GeoJSON map data | In-memory/Redis, 5-min TTL |
| Home page stats | Cache counts, 5-min TTL |
| Static assets | CDN with long cache headers |

---

## External APIs

- Set timeouts on Mapbox geocoding calls
- Handle geocode failures gracefully (already implemented)
- Do not geocode on every page view — only on create/update

---

## Images

Use Cloudinary transformations for delivery:

```javascript
url.replace('/upload', '/upload/f_auto,q_auto,w_800')
```

Thumbnail virtual already exists for 200px previews.

---

## Node.js

- Use `cluster` module or multiple PaaS dynos for horizontal scaling
- Set `trust proxy` when behind load balancer
- Monitor event loop lag under load

---

## Frontend

- Minimize blocking scripts in `<head>`
- Mapbox GL JS loaded globally — only needed on map pages (optimization opportunity)
- Bootstrap 4 from CDN — acceptable for current scale

---

## Load Testing

Run before major releases:

```bash
# Example with autocannon
npx autocannon -c 10 -d 30 http://localhost:3000/campgrounds
```

---

## Anti-Patterns

| Avoid | Why |
|-------|-----|
| `find()` without limit | Memory exhaustion |
| Regex search on large collections | Full collection scan |
| Synchronous file I/O | Blocks event loop |
| N+1 queries without populate | Multiple DB round trips |

---

## Related

- [../audits/PERFORMANCE_AUDIT.md](../audits/PERFORMANCE_AUDIT.md)
- [../roadmaps/SCALING_ROADMAP.md](../roadmaps/SCALING_ROADMAP.md)
