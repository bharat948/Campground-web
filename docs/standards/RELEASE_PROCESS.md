# Release Process — YelpCamp

---

## Versioning

Semantic Versioning (SemVer): `MAJOR.MINOR.PATCH`

Current: `1.0.0` in package.json

| Change | Bump |
|--------|------|
| Breaking API/behavior | MAJOR |
| New feature | MINOR |
| Bug fix, security patch | PATCH |

---

## Release Checklist

### Pre-Release

- [ ] All tests pass (`npm test`)
- [ ] npm audit reviewed and high/critical addressed
- [ ] Environment variables documented in `.env.example`
- [ ] CHANGELOG updated (when established)
- [ ] Security audit findings addressed or accepted
- [ ] Database indexes synced (if changed)

### Deploy

1. Merge PR to `main`
2. Tag release: `git tag v1.1.0`
3. Push tag: `git push origin v1.1.0`
4. PaaS auto-deploys from `main` (when configured)
5. Verify health check and smoke test:
   - Home page loads
   - Login works
   - Campground index loads
   - Create campground (staging)

### Post-Release

- [ ] Monitor error logs for 30 minutes
- [ ] Verify session persistence across deploy
- [ ] Update MASTER_REPOSITORY_REPORT.md if major changes

---

## Rollback

### PaaS (Heroku/Railway/Render)

```bash
# Revert to previous deployment via dashboard
# Or:
git revert <commit-hash>
git push origin main
```

### Database

- Schema changes should be backward compatible
- Destructive migrations require backup before deploy

---

## Environment Promotion

```
Local (dev) → Staging (optional) → Production
```

| Environment | NODE_ENV | Database |
|-------------|----------|----------|
| Local | development | Local or Atlas dev cluster |
| Staging | production | Atlas staging cluster |
| Production | production | Atlas production cluster |

Never run `npm run seed` in staging or production.

---

## Related

- [../operations/OPERATIONS_AUDIT.md](../operations/OPERATIONS_AUDIT.md)
- [../operations/PRODUCTION_READINESS.md](../operations/PRODUCTION_READINESS.md)
