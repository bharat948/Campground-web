# YelpCamp — Engineering Roadmap

> **Last updated:** 2026-05-31

---

## 30-Day Roadmap

### Week 1: Security & Stability

| Day | Task | Owner | Deliverable |
|-----|------|-------|-------------|
| 1 | Rotate Cloudinary credentials, delete onboarding script | Dev | Credentials secured |
| 1-2 | Fix register bug, package.json fixes | Dev | Bug fix PR |
| 2-3 | Add Helmet, rate limiting, mongo-sanitize | Dev | Security PR |
| 3-4 | npm audit fix | Dev | Clean audit |
| 4-5 | Database indexes | Dev | Index migration |

### Week 2: Quality & Operations

| Day | Task | Deliverable |
|-----|------|-------------|
| 6-7 | GitHub Actions CI pipeline | `.github/workflows/ci.yml` |
| 8-9 | Health check endpoint + structured logging | Ops-ready app |
| 10 | Campground create/delete integration tests | Test coverage +15% |
| 11-12 | CSRF protection | Security hardening |

### Week 3: Performance

| Day | Task | Deliverable |
|-----|------|-------------|
| 13-14 | Fix unbounded map query | Performance fix |
| 15-16 | GeoJSON caching | Cache layer |
| 17-18 | Review pagination | UX improvement |
| 19-20 | Load test baseline | Performance report |

### Week 4: Documentation & Polish

| Day | Task | Deliverable |
|-----|------|-------------|
| 21-22 | Update README with deployment guide | Docs |
| 23-24 | Error tracking (Sentry) integration | Monitoring |
| 25-26 | Uptime monitoring setup | Alerting |
| 27-30 | Buffer / review / retrospective | Release v1.1.0 |

---

## 90-Day Roadmap

| Month | Focus | Key Outcomes |
|-------|-------|--------------|
| Month 1 | Security + CI/CD + indexes | Production-ready for 1K users |
| Month 2 | Performance + testing | 70% coverage, cached map |
| Month 3 | API extraction planning | REST API v1 design, OpenAPI spec |

---

## Long-Term (6-12 months)

| Quarter | Initiative |
|---------|------------|
| Q1 | REST API, mobile-ready backend |
| Q2 | Search upgrade (Atlas Search), OAuth |
| Q3 | Frontend modernization (optional SPA) |
| Q4 | Admin panel, content moderation |

---

## Engineering Metrics Targets

| Metric | Now | 30 days | 90 days |
|--------|-----|---------|---------|
| Test count | 28 | 45+ | 70+ |
| Test coverage | ~30% | 50% | 70% |
| npm vulns (high+) | 10 | 0 | 0 |
| CI pipeline | None | GitHub Actions | + deploy |
| P0 security items | 3 | 0 | 0 |
| Deploy frequency | Manual | Weekly | Daily capable |

---

## Related Roadmaps

- [TECH_DEBT_ROADMAP.md](./TECH_DEBT_ROADMAP.md)
- [SECURITY_ROADMAP.md](./SECURITY_ROADMAP.md)
- [ARCHITECTURE_ROADMAP.md](./ARCHITECTURE_ROADMAP.md)
- [SCALING_ROADMAP.md](./SCALING_ROADMAP.md)
