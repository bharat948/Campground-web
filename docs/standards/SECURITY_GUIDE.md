# Security Guide — YelpCamp

> Based on [OWASP Top 10](https://owasp.org/www-project-top-ten/) and project audit findings.

---

## Authentication

- Passwords hashed via `passport-local-mongoose` — never store plaintext
- Sessions in MongoDB with `httpOnly` cookies
- Production: `secure: true` cookies when `NODE_ENV=production`
- Set `sameSite: 'lax'` on session cookies (recommended addition)
- Regenerate session on login (recommended addition)

---

## Authorization

Every mutating route must verify ownership:

| Resource | Middleware |
|----------|------------|
| Campground edit/delete | `isAuthor` |
| Review delete | `isReviewAuthor` |
| Reply delete | `isReplyAuthor` |
| Review like/reply | `reviewBelongsToCampground` |

Never trust client-side authorization checks alone.

---

## Input Validation

1. **Joi** for all form body validation (`schemas.js`)
2. **Multer** file type and size restrictions
3. **express-mongo-sanitize** (recommended) for NoSQL injection
4. Escape user input before embedding in HTML (especially map popups)

---

## Required Middleware (Production)

```javascript
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

app.use(helmet());
app.use(mongoSanitize());

app.use('/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }));
app.use('/register', rateLimit({ windowMs: 15 * 60 * 1000, max: 3 }));
```

---

## Secrets Management

| Rule | Detail |
|------|--------|
| Never commit secrets | Use `.env`, verify `.gitignore` |
| Rotate on exposure | Immediately rotate Cloudinary/Mapbox keys |
| Validate at startup | `validateEnv()` in production |
| No fallbacks | Remove dev session secret fallback |

---

## CSRF

Add CSRF tokens to all state-changing forms when implementing `csurf` or equivalent.

---

## File Upload Security

- Validate extension AND mimetype
- Limit file size (2MB) and count (6)
- Store in Cloudinary, not local disk
- Never serve uploaded files with `Content-Disposition: inline` from untrusted sources without sanitization

---

## Dependency Security

```bash
npm audit
npm audit fix
```

Review high/critical findings before every release.

---

## Security Checklist for PRs

- [ ] No secrets in code
- [ ] New routes have auth middleware if needed
- [ ] User input validated server-side
- [ ] No raw HTML from user input without escaping
- [ ] npm audit clean for new dependencies

---

## Related

- [../security/SECURITY_AUDIT.md](../security/SECURITY_AUDIT.md)
- [../roadmaps/SECURITY_ROADMAP.md](../roadmaps/SECURITY_ROADMAP.md)
