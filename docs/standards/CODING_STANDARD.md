# Coding Standards — YelpCamp

> Adapted from [Google Engineering Practices](https://google.github.io/eng-practices/) and project conventions.

---

## General Principles

1. **Match existing code** — This is a small Express/Mongoose codebase. Follow established patterns before introducing new ones.
2. **Minimal diffs** — Change only what the task requires.
3. **No speculative features** — Do not add abstractions for single-use cases.
4. **Async/await** — Use consistently in controllers and middleware; wrap route handlers with `catchAsync`.

---

## JavaScript Style

| Rule | Standard |
|------|----------|
| Module system | CommonJS (`require` / `module.exports`) |
| Semicolons | Present (match existing files) |
| Quotes | Single quotes preferred (existing code mixed) |
| Indentation | 4 spaces (controllers), 2 spaces (some files) — match surrounding file |
| Strict mode | Use in client JS (`'use strict'`) |

---

## File Organization

```
controllers/   → Request handlers only; no route definitions
routes/        → HTTP mapping + middleware chains
models/        → Mongoose schemas, hooks, virtuals
middleware.js  → Cross-cutting auth and validation
schemas.js     → Joi validation schemas
utils/         → Pure helpers, error classes
views/         → EJS templates; no business logic
public/        → Static assets only
tests/         → Mirror route structure
```

---

## Controller Guidelines

- One exported function per route action
- Use `req.flash()` for user-facing messages
- Redirect after POST (PRG pattern)
- Do not access `req.body` before validation middleware
- External API calls (Mapbox, Cloudinary) belong in controllers or a future service layer

---

## Error Handling

- Throw `ExpressError` for expected errors with status codes
- Wrap async route handlers with `catchAsync`
- Do not swallow errors silently
- Global error handler in `app.js` is the last resort

---

## Dependencies

- Add production deps to `dependencies`, dev tools to `devDependencies`
- Run `npm audit` before merging security-sensitive changes
- Pin major versions; allow caret for patches

---

## Do Not

- Commit secrets, `.env` files, or credentials
- Add TypeScript without team agreement (not currently used)
- Introduce ORMs or alternate DB drivers
- Refactor unrelated code in feature PRs
- Use `var`; use `const`/`let`

---

## Related

- [NAMING_CONVENTIONS.md](./NAMING_CONVENTIONS.md)
- [ERROR_HANDLING.md](./ERROR_HANDLING.md)
