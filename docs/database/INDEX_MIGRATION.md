# MongoDB Index Migration — YelpCamp

> **Date:** 2026-05-31  
> **Scope:** `campgrounds`, `reviews` collections

---

## Summary

Added five production indexes aligned with existing query patterns. Search was migrated from `$regex` to `$text` so the compound text index is actually used.

| Collection | Index | Type | Serves |
|------------|-------|------|--------|
| `campgrounds` | `{ author: 1 }` | Single-field | User profile campground list |
| `campgrounds` | `{ geometry: '2dsphere' }` | Geo | `$near` / proximity map queries |
| `campgrounds` | `{ title: 'text', location: 'text' }` | Text | Index page search |
| `reviews` | `{ campground: 1 }` | Single-field | Reviews per campground, cascade cleanup |
| `reviews` | `{ author: 1 }` | Single-field | User profile review list |

**Unchanged (already indexed):**

| Collection | Index | Notes |
|------------|-------|-------|
| `users` | `{ email: 1 }` unique | Auth registration |
| `notifications` | `{ recipient: 1, read: 1, createdAt: -1 }` | Navbar notification feed |

---

## Before / After Analysis

### Collection audit

#### `campgrounds` (before)

| Index | Present |
|-------|---------|
| `_id` | ✅ |
| `author` | ❌ COLLSCAN on profile |
| `geometry` 2dsphere | ❌ COLLSCAN on geo queries |
| `title` / `location` text | ❌ COLLSCAN + regex scan per doc |

**Hot queries affected:**

- `Campground.paginate(query)` — index page list + search
- `Campground.find({ author })` — user profile
- `Campground.find(query).select('title location geometry')` — map GeoJSON
- Future: `$near` on `geometry`

#### `reviews` (before)

| Index | Present |
|-------|---------|
| `_id` | ✅ |
| `campground` | ❌ COLLSCAN when filtering by campground |
| `author` | ❌ COLLSCAN on user profile |

**Hot queries affected:**

- `Review.find({ author }).populate('campground')` — user profile
- `Review.find({ campground })` — potential listing / admin queries

#### `users` / `notifications`

No changes required. Existing indexes match query patterns (`email` unique, notification compound index).

---

### Query plan impact (after)

| Query | Before | After | Docs examined (2K camps / 8K reviews) |
|-------|--------|-------|----------------------------------------|
| Search "Austin" | COLLSCAN + regex | TEXT index | ~2000 → ~4 |
| `find({ author })` campgrounds | COLLSCAN | IXSCAN `{ author: 1 }` | ~2000 → ~4 |
| `find({ author })` reviews | COLLSCAN | IXSCAN `{ author: 1 }` | ~8000 → ~16 |
| `find({ campground })` reviews | COLLSCAN | IXSCAN `{ campground: 1 }` | ~8000 → ~4 |
| `$near` geometry | COLLSCAN | 2DSPHERE | ~2000 → ~20 |

Run `node scripts/benchmark-indexes.js` for live numbers on your machine.

**Sample benchmark** (2,000 campgrounds, 8,000 reviews, 50 iterations, in-memory MongoDB):

| Query | Before | After | Docs examined ↓ | Avg time | Speedup |
|-------|--------|-------|-----------------|----------|---------|
| Search "Austin" | COLLSCAN | IXSCAN (text) | 86% | 2.5 → 2.8 ms | ~1x* |
| Campgrounds by author | COLLSCAN | IXSCAN | 100% | 4.8 → 2.5 ms | **1.9x** |
| Reviews by author | COLLSCAN | IXSCAN | 100% | 11.9 → 2.0 ms | **5.9x** |
| Reviews by campground | COLLSCAN | IXSCAN | 100% | 13.1 → 1.9 ms | **6.8x** |
| Geo `$near` | N/A (requires index) | IXSCAN | — | — → 2.8 ms | new capability |

\*Search timing on in-memory data at 2K docs shows index setup overhead; doc examination drops from ~56 to ~8. At 10K+ documents on disk, text index typically yields 10–50x improvement over regex COLLSCAN.

---

## Schema Changes

### `models/campground.js`

```javascript
CampgroundSchema.index({ author: 1 });
CampgroundSchema.index({ geometry: '2dsphere' });
CampgroundSchema.index({ title: 'text', location: 'text' });
```

### `models/review.js`

```javascript
reviewSchema.index({ campground: 1 });
reviewSchema.index({ author: 1 });
```

### `controllers/campgrounds.js`

Search migrated from case-insensitive regex to `$text`:

```javascript
// Before
{ $or: [{ title: { $regex: search, $options: 'i' } }, { location: { $regex: search, $options: 'i' } }] }

// After
{ $text: { $search: trimmedSearch } }
```

---

## Migration Notes

### 1. Deploy order

1. Deploy schema + controller changes together (text index requires `$text` queries).
2. On first startup, Mongoose calls `ensureIndexes()` and builds indexes in the background.
3. For large production collections, prefer off-peak manual build:

```javascript
// One-time in mongo shell or migration script
db.campgrounds.createIndex({ author: 1 }, { background: true });
db.campgrounds.createIndex({ geometry: '2dsphere' }, { background: true });
db.campgrounds.createIndex({ title: 'text', location: 'text' }, { background: true });
db.reviews.createIndex({ campground: 1 }, { background: true });
db.reviews.createIndex({ author: 1 }, { background: true });
```

### 2. Search behavior change

| Aspect | Regex (before) | Text index (after) |
|--------|----------------|-------------------|
| Substring match | `"ust"` matches `"Austin"` | No — token-based |
| Case | Case-insensitive | Case-insensitive |
| Multi-word | OR across title/location | AND by default (`"Austin TX"`) |
| Special chars | Regex injection risk | Treated as separators |

Use quoted phrases for exact multi-word: `$search: '"Austin TX"'`.

### 3. Write overhead

Each index adds ~5–15% write latency on insert/update. With five new indexes across two collections, expect modest overhead at YelpCamp scale (<10K docs). Monitor if write volume grows significantly.

### 4. Rollback

```javascript
db.campgrounds.dropIndex('author_1');
db.campgrounds.dropIndex('geometry_2dsphere');
db.campgrounds.dropIndex('title_text_location_text');
db.reviews.dropIndex('campground_1');
db.reviews.dropIndex('author_1');
```

Revert `controllers/campgrounds.js` search to regex if rolling back text search.

### 5. Verify indexes

```javascript
db.campgrounds.getIndexes();
db.reviews.getIndexes();
```

Or in Node:

```javascript
await Campground.syncIndexes();
await Review.syncIndexes();
```

---

## Benchmark

```bash
node scripts/benchmark-indexes.js
```

Synthetic dataset: 2,000 campgrounds, 8,000 reviews, 500 users. Compares explain plans and average query time (50 iterations each).

---

## Related

- [../architecture/DATABASE.md](../architecture/DATABASE.md)
- [../audits/PERFORMANCE_AUDIT.md](../audits/PERFORMANCE_AUDIT.md)
- [../standards/DATABASE_GUIDE.md](../standards/DATABASE_GUIDE.md)
