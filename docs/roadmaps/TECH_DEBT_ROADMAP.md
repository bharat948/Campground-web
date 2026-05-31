# YelpCamp — Technical Debt Roadmap

> **Last updated:** 2026-05-31

---

## Prioritization Matrix

| ID | Item | Impact | Risk | Effort | Priority |
|----|------|--------|------|--------|----------|
| TD-001 | Remove hardcoded Cloudinary credentials | Critical | Critical | Low | **P0** |
| TD-002 | Fix register `next` undefined bug | High | High | Low | **P0** |
| TD-003 | Add database indexes | High | High | Low | **P1** |
| TD-004 | npm audit fix (23 vulns) | High | High | Medium | **P1** |
| TD-005 | Remove unused imports/dead code | Low | Low | Low | **P2** |
| TD-006 | Extract geocode helper | Medium | Low | Low | **P2** |
| TD-007 | Fix unbounded map query | High | Medium | Medium | **P1** |
| TD-008 | Consolidate seed scripts | Low | Low | Medium | **P3** |
| TD-009 | Rename isloggedIn → isLoggedIn | Low | Low | Low | **P3** |
| TD-010 | Move nodemon to devDependencies | Low | Low | Trivial | **P3** |
| TD-011 | Fix package.json main field | Low | Low | Trivial | **P3** |
| TD-012 | Extract review partials from show.ejs | Medium | Low | Medium | **P3** |
| TD-013 | Introduce service layer | Medium | Low | High | **P4** |
| TD-014 | Move Cloudinary cleanup out of model hook | Medium | Medium | Medium | **P3** |
| TD-015 | Add review pagination | Medium | Medium | Medium | **P2** |
| TD-016 | Delete cloudinary-onboarding.js | High | Critical | Trivial | **P0** |
| TD-017 | Organize ui-eval screenshots | Low | Low | Low | **P4** |

---

## Sprint Plan

### Sprint 0 (Immediate — 1-2 days)

- [ ] TD-001, TD-016: Delete credential file, rotate keys
- [ ] TD-002: Fix register error handler
- [ ] TD-010, TD-011: Package.json fixes

### Sprint 1 (Week 1)

- [ ] TD-003: Database indexes
- [ ] TD-004: npm audit fix
- [ ] TD-005: Dead code cleanup

### Sprint 2 (Week 2-3)

- [ ] TD-006, TD-007: Geocode helper + map query fix
- [ ] TD-015: Review pagination

### Backlog

- TD-008 through TD-017

---

## Debt Metrics

| Metric | Current | Target (90 days) |
|--------|---------|------------------|
| npm vulnerabilities | 23 | 0 high/critical |
| Dead code files | 2+ | 0 |
| Test coverage (est.) | ~30% | 70% |
| Undocumented env vars | 0 | 0 |
| Open P0 items | 3 | 0 |

---

## Related

- [../audits/CODE_AUDIT.md](../audits/CODE_AUDIT.md)
- [ENGINEERING_ROADMAP.md](./ENGINEERING_ROADMAP.md)
