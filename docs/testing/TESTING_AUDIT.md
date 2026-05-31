# YelpCamp — Testing Audit

> **Last audited:** 2026-05-31  
> **Test runner:** Jest 30.x + Supertest 7.x  
> **Current status:** 28 tests passing (4 suites)

---

## Test Infrastructure

| Component | Implementation | Status |
|-----------|----------------|--------|
| Test runner | Jest | ✅ |
| HTTP testing | Supertest | ✅ |
| Database | mongodb-memory-server | ✅ |
| Setup/teardown | `tests/setup.js` | ✅ |
| CI integration | None | ❌ |
| Coverage reporting | Not configured | ❌ |
| E2E tests | None | ❌ |

---

## Test Suite Inventory

### `tests/auth.test.js` (5 tests)

| Test | Coverage |
|------|----------|
| GET /register returns 200 | Registration page render |
| POST /register creates user | Happy path registration |
| POST /register duplicate email | Error handling |
| GET /login returns 200 | Login page render |
| POST /login wrong credentials | Failed auth redirect |

**Gaps:** No successful login test, no logout test, no session persistence test

### `tests/campgrounds.test.js` (7 tests)

| Test | Coverage |
|------|----------|
| GET /campgrounds 200 | Index page |
| GET /campgrounds/:id 200 | Show page |
| GET invalid id → 302 | Not found redirect |
| GET /new unauthenticated → login | Auth guard |
| GET /new authenticated → 200 | Auth pass |
| DELETE by author → success | Author delete |
| DELETE by non-author → denied | Authorization |

**Gaps:** No create/update tests, no search/pagination, no image upload, no geocode failure

### `tests/reviews.test.js` (10 tests)

| Test | Coverage |
|------|----------|
| Like requires auth | Auth guard |
| Like adds user | Happy path |
| Like toggle (unlike) | Toggle behavior |
| Like wrong campground | IDOR prevention |
| Reply requires auth | Auth guard |
| Reply creates subdoc | Happy path |
| Delete own reply | Authorization |
| Delete other's reply denied | Authorization |
| Empty reply rejected | Validation |
| Reply wrong campground | IDOR prevention |

**Gaps:** No review create/delete tests, no rating validation

### `tests/envValidation.test.js` (6 tests)

| Test | Coverage |
|------|----------|
| Dev without SESSION_SECRET | Passes |
| Test without SESSION_SECRET | Passes |
| Production with required vars | Passes |
| Production without SESSION_SECRET | Throws |
| Production without MONGO_URL | Throws |
| Whitespace SESSION_SECRET | Throws |

**Coverage:** Complete for current validateEnv scope

---

## Coverage Gap Analysis

| Area | Unit | Integration | E2E | Risk |
|------|------|-------------|-----|------|
| User registration | Partial | Partial | ❌ | Medium |
| User login/logout | Partial | ❌ | ❌ | Medium |
| Campground CRUD | ❌ | Partial | ❌ | **High** |
| Image upload | ❌ | ❌ | ❌ | **High** |
| Geocoding | ❌ | ❌ | ❌ | Medium |
| Search/pagination | ❌ | ❌ | ❌ | Medium |
| Review CRUD | Partial | Partial | ❌ | Medium |
| Authorization (campground edit) | ❌ | Partial | ❌ | Medium |
| Error handler | ❌ | ❌ | ❌ | Low |
| Cascade delete hook | ❌ | ❌ | ❌ | Medium |
| Flash messages | ❌ | ❌ | ❌ | Low |
| File upload limits | ❌ | ❌ | ❌ | Medium |
| XSS in popup markup | ❌ | ❌ | ❌ | Medium |
| Session/cookie config | ❌ | ❌ | ❌ | Low |

---

## Risk Matrix

| Untested Behavior | Likelihood of Bug | Impact | Priority |
|-------------------|-------------------|--------|----------|
| Campground create with Mapbox failure | Medium | Medium | P1 |
| Campground update/delete images | Medium | High | P1 |
| Review create/delete lifecycle | Medium | Medium | P1 |
| Register → login error path (undefined `next`) | Low | High | P1 |
| Multer file rejection | Medium | Low | P2 |
| Joi validation edge cases | Low | Medium | P2 |
| Home page stats | Low | Low | P3 |

---

## Recommended Testing Strategy

### Phase 1 — Critical Integration Tests (Week 1)

```bash
# Add tests for:
- POST /campgrounds (mock Mapbox or skip geocode in test)
- POST /campgrounds/:id/reviews
- DELETE /campgrounds/:id/reviews/:reviewId
- POST /login success with session cookie
- GET /logout clears session
```

### Phase 2 — Coverage & CI (Week 2)

```json
// package.json
"scripts": {
  "test:coverage": "jest --coverage --forceExit",
  "test:ci": "jest --ci --coverage --forceExit"
}
```

Add GitHub Actions workflow:
```yaml
- run: npm ci
- run: npm test
```

### Phase 3 — Unit Tests (Week 3-4)

- `utils/validateEnv.js` — ✅ done
- `middleware.js` — authorization edge cases
- `schemas.js` — Joi boundary values
- `models/campground.js` — cascade delete hook (mock Cloudinary)

### Phase 4 — E2E (Optional, Month 2)

- Playwright or Cypress for critical user journeys
- Requires test Cloudinary/Mapbox mocks or sandbox credentials

---

## Test Quality Observations

**Strengths:**
- Uses `request.agent(app)` for session-aware tests
- Tests authorization denial paths (non-author delete, wrong campground)
- Clean database between tests
- Env validation thoroughly tested

**Weaknesses:**
- No mocking of external services (Mapbox, Cloudinary)
- No coverage thresholds
- No test for the `register` catch block bug
- Campground tests create data directly in DB, bypassing route validation

---

## Mocking Recommendations

| Service | Mock Strategy |
|---------|---------------|
| Mapbox | Jest mock of `@mapbox/mapbox-sdk` geocoding service |
| Cloudinary | Mock `cloudinary/` module; use memory storage in tests |
| MongoDB | ✅ Already using mongodb-memory-server |

---

## Coverage Target

| Milestone | Target | Timeline |
|-----------|--------|----------|
| Current | ~30% (estimated) | Now |
| Phase 1 | 50% line coverage | 2 weeks |
| Phase 2 | 70% line coverage | 1 month |
| Production ready | 80%+ on controllers/routes | 2 months |

---

## Related Documentation

- [../standards/TESTING_GUIDE.md](../standards/TESTING_GUIDE.md)
- [../roadmaps/ENGINEERING_ROADMAP.md](../roadmaps/ENGINEERING_ROADMAP.md)
