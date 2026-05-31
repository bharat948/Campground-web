# YelpCamp — Security Audit

> **Last audited:** 2026-05-31  
> **Framework:** OWASP Top 10 (2021) adapted for Node.js/Express SSR app

---

## Executive Summary

YelpCamp has foundational security controls (session cookies, Joi validation, authorization middleware) but lacks several production-grade protections recommended in its own README.

**Remediation (2026-05-31):** Hardcoded Cloudinary credentials removed (`cloudinary-onboarding.js` deleted). Obsolete seed/bootstrap scripts removed. Production env validation extended. **Rotate Cloudinary keys in the dashboard** if this repository was ever shared or public — secrets remain in git history.

| Severity | Count |
|----------|-------|
| Critical | 0 (SEC-C001 remediated; rotate keys if exposed) |
| High | 5 |
| Medium | 8 |
| Low | 6 |

---

## Critical Findings

### SEC-C001: Hardcoded Cloudinary API Credentials — REMEDIATED

| Field | Value |
|-------|-------|
| **Was** | `cloudinary-onboarding.js` (deleted) |
| **CWE** | CWE-798 (Use of Hard-coded Credentials) |
| **Status** | File removed from repo; runtime uses `process.env` via `cloudinary/index.js` only |
| **Follow-up** | Rotate credentials in Cloudinary dashboard; purge from git history if repo was public |

---

## High Findings

### SEC-H001: No CSRF Protection

| Field | Value |
|-------|-------|
| **Location** | All POST/PUT/DELETE forms |
| **CWE** | CWE-352 |
| **Risk** | Authenticated users can be tricked into creating/deleting campgrounds, reviews via malicious sites |
| **Remediation** | Add `csurf` middleware or double-submit cookie pattern; include CSRF token in all forms |
| **Effort** | Medium |
| **Priority** | P1 |

### SEC-H002: 23 npm Audit Vulnerabilities (2 Critical, 8 High)

| Field | Value |
|-------|-------|
| **Location** | `package-lock.json` dependency tree |
| **Notable** | `form-data` (critical), `express`/`body-parser` (high DoS), `cloudinary` (high injection) |
| **Risk** | DoS, prototype pollution, argument injection |
| **Remediation** | Run `npm audit fix`; evaluate `cloudinary@2.x` migration for breaking changes |
| **Effort** | Medium |
| **Priority** | P1 |

### SEC-H003: Development Session Secret Fallback

| Field | Value |
|-------|-------|
| **Location** | `app.js` session `secret` fallback (dev/test only; production blocked by `validateEnv`) |
| **CWE** | CWE-1188 |
| **Risk** | Session forgery if deployed without SESSION_SECRET |
| **Remediation** | Extend `validateEnv()` to require SESSION_SECRET in all non-test environments |
| **Effort** | Low |
| **Priority** | P1 |

### SEC-H004: No Security Headers (Helmet)

| Field | Value |
|-------|-------|
| **Location** | `app.js` — missing helmet middleware |
| **CWE** | CWE-693 |
| **Risk** | Missing CSP, X-Frame-Options, HSTS; clickjacking, XSS amplification |
| **Remediation** | `npm install helmet`; configure CSP for Mapbox/CDN domains |
| **Effort** | Low-Medium |
| **Priority** | P1 |

### SEC-H005: No Rate Limiting

| Field | Value |
|-------|-------|
| **Location** | Auth routes, upload routes, review creation |
| **CWE** | CWE-307 |
| **Risk** | Brute force login, registration spam, upload abuse, review flooding |
| **Remediation** | `express-rate-limit` on `/login`, `/register`, POST routes |
| **Effort** | Low |
| **Priority** | P1 |

---

## Medium Findings

### SEC-M001: No MongoDB Input Sanitization

| Field | Value |
|-------|-------|
| **Location** | Global middleware stack |
| **CWE** | CWE-943 (NoSQL Injection) |
| **Risk** | `$`-operator injection via form fields if validation bypassed |
| **Remediation** | Add `express-mongo-sanitize` |
| **Effort** | Low |
| **Priority** | P2 |

### SEC-M002: XSS via Map Popup HTML

| Field | Value |
|-------|-------|
| **Location** | `controllers/campgrounds.js:37` |
| **CWE** | CWE-79 |
| **Risk** | Stored XSS if campground title/location contains HTML/JS |
| **Remediation** | HTML-escape user content before embedding in `popupMarkup`; use Mapbox Popup text API |
| **Effort** | Low |
| **Priority** | P2 |

### SEC-M003: Regex Search Injection / ReDoS

| Field | Value |
|-------|-------|
| **Location** | `controllers/campgrounds.js:13-14` |
| **CWE** | CWE-1333 |
| **Risk** | User-controlled regex in `$regex` can cause ReDoS |
| **Remediation** | Escape regex special chars; use text index search instead |
| **Effort** | Low |
| **Priority** | P2 |

### SEC-M004: Incomplete Production Env Validation — REMEDIATED

| Field | Value |
|-------|-------|
| **Location** | `utils/validateEnv.js` |
| **Status** | Production requires `SESSION_SECRET`, `MONGO_URL`, Cloudinary trio, and `MAPBOX_TOKEN` |

### SEC-M005: Logout via GET Request

| Field | Value |
|-------|-------|
| **Location** | `routes/users.js:20` — `GET /logout` |
| **CWE** | CWE-352 adjunct |
| **Risk** | CSRF logout via `<img src="/logout">` |
| **Remediation** | Change to POST with CSRF token |
| **Effort** | Low |
| **Priority** | P2 |

### SEC-M006: No Email Verification

| Field | Value |
|-------|-------|
| **Location** | `controllers/users.js` register flow |
| **Risk** | Fake account creation, impersonation |
| **Remediation** | Add email verification token flow |
| **Effort** | High |
| **Priority** | P3 |

### SEC-M007: Password Policy Not Enforced

| Field | Value |
|-------|-------|
| **Location** | Registration — no server-side password validation |
| **Risk** | Weak passwords accepted |
| **Remediation** | Add Joi password schema (min length, complexity) |
| **Effort** | Low |
| **Priority** | P2 |

### SEC-M008: Session Configuration

| Field | Value |
|-------|-------|
| **Location** | `app.js:48-54` |
| **Issues** | `saveUninitialized: true` creates sessions for anonymous users; no `sameSite` cookie attribute |
| **Risk** | Session fixation, CSRF amplification |
| **Remediation** | Set `saveUninitialized: false`, add `sameSite: 'lax'` (or `'strict'`) |
| **Effort** | Low |
| **Priority** | P2 |

---

## Low Findings

### SEC-L001: Mapbox Token Exposed Client-Side

Expected for public Mapbox tokens. Ensure token is URL-restricted in Mapbox dashboard.

### SEC-L002: No Content Security Policy

Related to SEC-H004. Mapbox and CDN scripts require careful CSP allowlisting.

### SEC-L003: Error Page May Leak Stack Traces

`views/error.ejs` — verify production mode hides internal details.

### SEC-L004: No Account Lockout

Unlimited login attempts possible.

### SEC-L005: User Enumeration via Registration

Duplicate email error messages may reveal registered emails.

### SEC-L006: `.env` Not in `.gitignore` Patterns Beyond Standard

`.gitignore` covers `.env` ✅. Ensure `.env.*` variants also ignored.

---

## Authentication & Authorization Assessment

| Control | Status | Notes |
|---------|--------|-------|
| Password hashing | ✅ | passport-local-mongoose (PBKDF2) |
| Session management | ✅ | MongoDB store, httpOnly cookies |
| Secure cookies in prod | ✅ | `secure: NODE_ENV === 'production'` |
| Authorization on mutations | ✅ | isAuthor, isReviewAuthor, isReplyAuthor |
| IDOR on reviews | ✅ Mitigated | reviewBelongsToCampground |
| Privilege escalation | ✅ N/A | No admin roles |
| Session regeneration on login | ❌ | Not implemented |

---

## Dependency Security Summary

Run: `npm audit` — **23 vulnerabilities** as of audit date.

| Package | Severity | Action |
|---------|----------|--------|
| form-data | Critical | `npm audit fix` |
| cloudinary | High | Upgrade to 2.7.0+ |
| express/body-parser | High | `npm audit fix` |
| lodash | High | Transitive; audit fix |
| ejs | Moderate | Upgrade to 3.1.10+ |

---

## Remediation Roadmap

| Phase | Actions | Timeline |
|-------|---------|----------|
| **Immediate** | Rotate Cloudinary keys (if ever committed); verify `.env` on hosts | Day 1 |
| **Week 1** | Helmet, rate limiting, mongo-sanitize, npm audit fix | Days 1-7 |
| **Week 2** | CSRF tokens, session hardening, env validation | Days 8-14 |
| **Month 1** | Password policy, POST logout, XSS fixes | Days 15-30 |

---

## Related Documentation

- [../roadmaps/SECURITY_ROADMAP.md](../roadmaps/SECURITY_ROADMAP.md)
- [../standards/SECURITY_GUIDE.md](../standards/SECURITY_GUIDE.md)
