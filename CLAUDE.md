# CLAUDE.md — YelpCamp

> Claude Code configuration. Shared instructions live in AGENTS.md.

---

## Primary Instructions

@AGENTS.md

Read and follow `AGENTS.md` at the repository root for all build commands, architecture, conventions, security rules, and documentation map.

---

## Claude-Specific Notes

### Before Writing Code

1. Read `AGENTS.md` and relevant docs in `docs/`
2. For security changes, read `docs/security/SECURITY_AUDIT.md`
3. For database changes, read `docs/architecture/DATABASE.md`
4. Run `npm test` to verify current state before and after changes

### Project Context

- **Stack:** Node.js 18+, Express 4, Mongoose 7, EJS, Passport, Cloudinary, Mapbox
- **No TypeScript, no React, no GraphQL**
- **28 tests passing** as of last audit (2026-05-31)
- **No CI/CD** configured yet

### Critical Security Alert

`cloudinary-onboarding.js` contains hardcoded Cloudinary API credentials. Do not ignore. Rotate credentials before deleting the file.

### Known Bug

`controllers/users.js` register handler references `next(err)` but `next` is not in function parameters.

---

## Documentation Hierarchy

```
AGENTS.md                    ← Start here (tool-agnostic)
CLAUDE.md                    ← This file (Claude pointer)
PROJECT_MEMORY.md            ← Persistent facts
docs/                        ← Full documentation suite
MASTER_REPOSITORY_REPORT.md  ← Executive summary
```

---

## Skills

See `SKILLS.md` for repository-specific agent skills and workflows.

---

## Do Not

- Introduce TypeScript without explicit request
- Add microservices or over-engineer for this codebase size
- Commit secrets or modify `.env`
- Skip tests for route/controller changes
