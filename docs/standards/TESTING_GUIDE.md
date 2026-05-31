# Testing Guide — YelpCamp

---

## Stack

| Tool | Purpose |
|------|---------|
| Jest | Test runner |
| Supertest | HTTP assertions |
| mongodb-memory-server | Isolated test database |

---

## Running Tests

```bash
npm test              # Full suite
npm run test:watch    # Watch mode
```

Tests set `NODE_ENV=test` implicitly via Jest; app skips MongoDB connect and session store in test mode.

---

## Writing Tests

### Structure

```javascript
const request = require('supertest');
const app = require('../app');

describe('Feature', () => {
    test('description', async () => {
        const res = await request(app).get('/path');
        expect(res.statusCode).toBe(200);
    });
});
```

### Session-Aware Tests

```javascript
const agent = request.agent(app);
await agent.post('/register').type('form').send({ ... });
const res = await agent.get('/campgrounds/new');
```

### Database Setup

- Global setup in `tests/setup.js` connects MongoMemoryServer
- `afterEach` clears all collections
- Create test fixtures directly via Mongoose models in `beforeEach`

---

## What to Test

| Priority | Area |
|----------|------|
| P0 | Authorization (author-only mutations) |
| P0 | Auth guards (redirect to login) |
| P1 | CRUD happy paths |
| P1 | Validation rejection |
| P2 | Edge cases (invalid IDs, wrong campground) |
| P3 | Flash messages |

---

## Mocking External Services

Mock before requiring app:

```javascript
jest.mock('@mapbox/mapbox-sdk/services/geocoding', () => () => ({
    forwardGeocode: () => ({
        send: () => Promise.resolve({
            body: { features: [{ geometry: { type: 'Point', coordinates: [0, 0] } }] }
        })
    })
}));
```

---

## Coverage

Target: 70% line coverage on `controllers/`, `middleware.js`, `routes/`.

Add to package.json when ready:

```json
"jest": {
    "collectCoverageFrom": [
        "controllers/**/*.js",
        "middleware.js",
        "utils/**/*.js"
    ],
    "coverageThreshold": {
        "global": { "lines": 50 }
    }
}
```

---

## CI Integration

Every PR must pass `npm test` before merge. See [../testing/TESTING_AUDIT.md](../testing/TESTING_AUDIT.md).

---

## Do Not

- Test against production MongoDB
- Depend on external APIs in CI (mock Mapbox, Cloudinary)
- Skip cleanup between tests
- Use arbitrary timeouts without reason (global 30s timeout configured)

---

## Related

- [../testing/TESTING_AUDIT.md](../testing/TESTING_AUDIT.md)
