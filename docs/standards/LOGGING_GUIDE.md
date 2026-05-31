# Logging Guide — YelpCamp

> Current state: console.log only. This guide defines target standards.

---

## Principles (Twelve-Factor App)

1. Treat logs as event streams
2. Never log sensitive data
3. Use structured JSON in production
4. Include correlation context (request ID)

---

## What to Log

| Event | Level | Fields |
|-------|-------|--------|
| Server start | info | port, nodeEnv |
| HTTP request | info | method, path, status, duration, requestId |
| DB connection error | error | error message |
| Session store error | error | error message |
| Auth failure | warn | ip, username (not password) |
| Unhandled error | error | stack, path, requestId |
| External API failure | error | service, status, duration |

---

## What NOT to Log

- Passwords or password hashes
- Session secrets or cookie values
- Full API keys
- Personal data beyond username/email (GDPR consideration)
- Credit card or payment info (N/A currently)

---

## Recommended Implementation

```javascript
const pino = require('pino');
const pinoHttp = require('pino-http');

const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    ...(process.env.NODE_ENV !== 'production' && {
        transport: { target: 'pino-pretty' }
    })
});

app.use(pinoHttp({ logger }));
```

---

## Log Levels

| Level | Use |
|-------|-----|
| error | Failures requiring attention |
| warn | Degraded but functional |
| info | Normal operations |
| debug | Development diagnostics only |

---

## Environment Configuration

| Env | Format | Level |
|-----|--------|-------|
| development | Pretty print | debug |
| test | Silent or error only | error |
| production | JSON to stdout | info |

---

## Request ID

Generate per request for tracing:

```javascript
const { randomUUID } = require('crypto');
app.use((req, res, next) => {
    req.id = req.headers['x-request-id'] || randomUUID();
    res.setHeader('X-Request-Id', req.id);
    next();
});
```

---

## Related

- [ERROR_HANDLING.md](./ERROR_HANDLING.md)
- [SECURITY_GUIDE.md](./SECURITY_GUIDE.md)
