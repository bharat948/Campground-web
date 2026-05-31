# Error Handling Guide — YelpCamp

---

## Error Classes

### ExpressError (`utils/ExpressError.js`)

Use for expected application errors with HTTP status codes:

```javascript
throw new ExpressError('Invalid campground data', 400);
```

| Status | Use Case |
|--------|----------|
| 400 | Validation failure |
| 404 | Resource not found (via catch-all) |
| 500 | Unexpected server error |

---

## Async Error Propagation

Always wrap async route handlers:

```javascript
router.get('/', catchAsync(controller.index));
```

`catchAsync` forwards rejected promises to Express error middleware.

---

## Middleware Validation Errors

Joi validation throws `ExpressError` with 400:

```javascript
if (error) {
    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(msg, 400);
}
```

---

## Authorization Errors

Use flash + redirect (not HTTP 403) for SSR UX:

```javascript
req.flash('error', 'You do not have permission to do that');
return res.redirect(`/campgrounds/${id}`);
```

---

## File Upload Errors

Handled in global error handler (`app.js`):

| Multer Code | User Message |
|-------------|--------------|
| LIMIT_FILE_SIZE | "Each image must be under 2MB" |
| LIMIT_FILE_COUNT | "You can upload a maximum of 6 images" |

---

## Global Error Handler

Located at end of `app.js` middleware stack:

1. Check Multer-specific codes → flash + redirect
2. Extract statusCode and message from error
3. Render `views/error.ejs`

**Production rule:** Do not expose stack traces or internal paths to users.

---

## Logging Errors

When adding structured logging:

```javascript
// Log full error server-side
logger.error({ err, reqId: req.id, path: req.path }, err.message);
// Send safe message to client
res.status(statusCode).render('error', { err: { message: safeMessage, statusCode } });
```

Never log passwords, session tokens, or API secrets.

---

## Client-Side Validation

Bootstrap validated forms (`validateForms.js`) provide first-line defense. Server-side Joi validation is authoritative.

---

## Related

- [LOGGING_GUIDE.md](./LOGGING_GUIDE.md)
- [SECURITY_GUIDE.md](./SECURITY_GUIDE.md)
