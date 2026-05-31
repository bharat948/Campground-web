# YelpCamp — Architecture Roadmap

> **Last updated:** 2026-05-31

---

## Current Architecture

Monolithic Express SSR (MVC). Adequate for demo and small deployments.

---

## Phase 1: Hardening (0-30 days)

**Goal:** Production-safe monolith

| Item | Description | Effort |
|------|-------------|--------|
| Health endpoints | `/health`, `/ready` | Low |
| Config module | Centralize constants and env | Low |
| Service helpers | Extract geocoding, image cleanup | Medium |
| Graceful shutdown | `server.close()` on SIGTERM | Low |
| Trust proxy | For secure cookies behind LB | Low |

---

## Phase 2: Performance Layer (30-60 days)

**Goal:** Support 1K-10K users

| Item | Description | Effort |
|------|-------------|--------|
| GeoJSON cache | Redis/in-memory with TTL | Medium |
| Map API endpoint | Separate `/api/map` with bounds filter | Medium |
| Static asset CDN | Offload from Express | Medium |
| Review pagination | Limit show page populate | Medium |
| DB indexes | See DATABASE.md | Low |

---

## Phase 3: API Extraction (60-90 days)

**Goal:** Enable mobile clients and frontend modernization

| Item | Description | Effort |
|------|-------------|--------|
| REST API layer | `/api/v1/campgrounds` etc. | High |
| JSON responses | Alongside existing SSR | Medium |
| JWT auth option | For API consumers | Medium |
| OpenAPI spec | Document API | Medium |

---

## Phase 4: Scale Architecture (90+ days)

**Goal:** 10K+ users

| Item | Description | Effort |
|------|-------------|--------|
| Horizontal scaling | Multiple Node instances | Medium |
| Read replicas | MongoDB read preference | Medium |
| Message queue | Async geocoding, image processing | High |
| Search service | Atlas Search or Elasticsearch | High |
| Frontend SPA | React/Vue consuming API | Very High |

---

## Architecture Decision Records (Future)

When making significant changes, add ADRs to `docs/architecture/adr/`:

```
adr/
├── 001-monolith-vs-microservices.md
├── 002-session-vs-jwt-auth.md
└── ...
```

---

## Related

- [../architecture/ARCHITECTURE.md](../architecture/ARCHITECTURE.md)
- [SCALING_ROADMAP.md](./SCALING_ROADMAP.md)
