# API Design Guide — YelpCamp

> This app is **server-rendered HTML**, not a REST API. This guide documents the HTTP interface for developers and future API extraction.

---

## Design Principles

1. **Resource-oriented URLs** — `/campgrounds/:id/reviews/:reviewId`
2. **HTTP verbs via method-override** — `_method=PUT|DELETE` in forms
3. **Redirect after mutation** — 302 to resource or index
4. **Flash messages for feedback** — `success` / `error` via connect-flash

---

## Response Patterns

| Action | Status | Response |
|--------|--------|----------|
| GET page | 200 | Rendered HTML |
| POST create | 302 | Redirect to resource |
| PUT update | 302 | Redirect to resource |
| DELETE | 302 | Redirect to index |
| Validation error | 400 | Error page (EJS) |
| Not found | 404 | Error page |
| Auth required | 302 | Redirect to `/login` |
| Auth denied | 302 | Redirect with flash error |

---

## Request Body Format

HTML forms with `application/x-www-form-urlencoded` or `multipart/form-data` (file uploads).

### Campground

```
campground[title]=...
campground[location]=...
campground[price]=...
campground[description]=...
image=<files>                    # multipart only
deleteImages[]=<cloudinary_id>   # on update
```

### Review

```
review[rating]=1-5
review[body]=...
```

### Reply

```
reply[body]=...
```

### User

```
username=...
email=...
password=...
```

---

## Future REST API Guidelines

If extracting an API layer:

| Rule | Standard |
|------|----------|
| Format | JSON (`Content-Type: application/json`) |
| Versioning | `/api/v1/...` prefix |
| Errors | `{ "error": { "code": "...", "message": "..." } }` |
| Pagination | `{ "data": [], "meta": { "page", "totalPages", "total" } }` |
| Auth | JWT or session token header |
| Status codes | Use proper HTTP semantics (201, 204, 401, 403, 404, 422) |

---

## Idempotency

| Endpoint | Idempotent |
|----------|------------|
| GET | Yes |
| DELETE | Yes |
| PUT | Yes |
| POST (create) | No |
| POST (like toggle) | No |

---

## Rate Limiting (Recommended)

| Endpoint | Limit |
|----------|-------|
| POST /login | 5/min per IP |
| POST /register | 3/min per IP |
| POST /campgrounds | 10/hour per user |
| POST .../reviews | 20/hour per user |

---

## Related

- [ERROR_HANDLING.md](./ERROR_HANDLING.md)
- [SECURITY_GUIDE.md](./SECURITY_GUIDE.md)
