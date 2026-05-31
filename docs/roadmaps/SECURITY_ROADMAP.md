# YelpCamp — Security Roadmap

> **Last updated:** 2026-05-31

---

## Phase 0: Emergency (Day 1)

| Item | Finding | Action | Status |
|------|---------|--------|--------|
| Rotate Cloudinary keys | SEC-C001 | Dashboard rotation | ⬜ TODO |
| Delete cloudinary-onboarding.js | SEC-C001 | Remove from repo | ⬜ TODO |
| Audit git history | SEC-C001 | BFG/filter-repo if public | ⬜ TODO |

---

## Phase 1: Foundation (Week 1)

| Item | Finding | Action | Effort |
|------|---------|--------|--------|
| Helmet | SEC-H004 | Add + configure CSP | Low |
| Rate limiting | SEC-H005 | express-rate-limit | Low |
| npm audit fix | SEC-H002 | Update dependencies | Medium |
| Session secret | SEC-H003 | Require in all envs | Low |
| mongo-sanitize | SEC-M001 | Add middleware | Low |

---

## Phase 2: Application Security (Week 2-3)

| Item | Finding | Action | Effort |
|------|---------|--------|--------|
| CSRF tokens | SEC-H001 | csurf on all forms | Medium |
| POST logout | SEC-M005 | Change from GET | Low |
| XSS in popups | SEC-M002 | HTML escape | Low |
| Regex escape | SEC-M003 | Sanitize search input | Low |
| Session hardening | SEC-M008 | sameSite, saveUninitialized | Low |
| Password policy | SEC-M007 | Joi validation | Low |
| Full env validation | SEC-M004 | Extend validateEnv | Low |

---

## Phase 3: Operational Security (Month 2)

| Item | Action | Effort |
|------|--------|--------|
| Secret scanning in CI | GitHub Advanced Security or git-secrets | Low |
| Dependency update automation | Dependabot/Renovate | Low |
| Security headers audit | Mozilla Observatory scan | Low |
| Penetration test | Manual or automated (OWASP ZAP) | Medium |
| WAF | Cloudflare or AWS WAF at scale | Medium |

---

## Phase 4: Advanced (Month 3+)

| Item | Action | Effort |
|------|--------|--------|
| Email verification | Registration flow | High |
| Account lockout | Failed login tracking | Medium |
| 2FA | TOTP support | High |
| OAuth | Google/GitHub login | High |
| Content Security Policy refinement | Strict CSP with nonces | Medium |

---

## Success Metrics

| Metric | Current | 30-day Target | 90-day Target |
|--------|---------|---------------|---------------|
| Critical findings | 1 | 0 | 0 |
| High findings | 5 | 0 | 0 |
| npm high/critical vulns | 10 | 0 | 0 |
| OWASP ZAP score | Unknown | B+ | A |

---

## Related

- [../security/SECURITY_AUDIT.md](../security/SECURITY_AUDIT.md)
- [../standards/SECURITY_GUIDE.md](../standards/SECURITY_GUIDE.md)
