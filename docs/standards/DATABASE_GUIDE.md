# Database Guide — YelpCamp

> MongoDB + Mongoose 7.x

---

## Schema Design Rules

1. **Embed** when data is owned, small, and accessed together (replies in reviews)
2. **Reference** when data is shared or unbounded (reviews → campground, author → user)
3. **Denormalize sparingly** — `campground.reviews[]` requires sync on create/delete

---

## Model Conventions

```javascript
const Schema = mongoose.Schema;

const modelSchema = new Schema({
    field: { type: String, required: true },
    ref: { type: Schema.Types.ObjectId, ref: 'ModelName' }
}, { timestamps: true }); // for subdocs only currently
```

---

## Indexes

Always define indexes in schema files, not ad-hoc in shell:

```javascript
CampgroundSchema.index({ author: 1 });
CampgroundSchema.index({ geometry: '2dsphere' });
CampgroundSchema.index({ title: 'text', location: 'text' });
reviewSchema.index({ campground: 1 });
reviewSchema.index({ author: 1 });
```

Run `Model.syncIndexes()` in development after adding indexes.

---

## Queries

| Do | Don't |
|----|-------|
| Use `.select()` to limit fields | Load full documents for lists |
| Use `.populate()` with specific paths | Populate everything |
| Use `.lean()` for read-only JSON | Use lean when you need Mongoose methods |
| Paginate large result sets | `find()` without limit |

---

## Transactions

Use for multi-document operations:

```javascript
const session = await mongoose.startSession();
session.startTransaction();
try {
    await review.save({ session });
    await campground.save({ session });
    await session.commitTransaction();
} catch (err) {
    await session.abortTransaction();
    throw err;
} finally {
    session.endSession();
}
```

Apply to review create/delete to prevent orphaned data.

---

## Migrations

No formal migration tool. For schema changes:

1. Document change in PR
2. Write backward-compatible code first
3. Run one-time script if data transformation needed
4. For production: test on staging with production-like data volume

---

## Seed Data

- `npm run seed` — **destructive** (deletes all campgrounds)
- Never run seeds in production
- Use separate seed user credentials documented in README

---

## Related

- [../architecture/DATABASE.md](../architecture/DATABASE.md)
