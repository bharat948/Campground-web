# Git Workflow — YelpCamp

---

## Branch Strategy

See [BRANCHING_STRATEGY.md](./BRANCHING_STRATEGY.md).

---

## Daily Workflow

```bash
git checkout main
git pull origin main
git checkout -b feature/my-feature
# ... work ...
npm test
git add -p                    # Stage intentionally
git commit -m "Add review pagination"
git push -u origin feature/my-feature
# Open PR
```

---

## Commit Messages

Format: `<verb> <what>` in imperative mood

```
Add database indexes for campground author
Fix register error handler missing next param
Update security audit with CSRF findings
Remove hardcoded Cloudinary credentials
```

Avoid: "fixed stuff", "WIP", "updates"

---

## What Not to Commit

- `.env` files
- `node_modules/`
- IDE settings (unless team agreed)
- Secrets, API keys, credentials
- Large binary files (use docs/assets/ for screenshots)

---

## Pre-Commit Checks

```bash
npm test
npm audit --audit-level=high  # Review findings
git diff --staged             # Self-review
```

---

## Merge Requirements

1. All tests pass (CI when configured)
2. At least one review approval
3. No unresolved blocking comments
4. Branch up to date with main

---

## Related

- [BRANCHING_STRATEGY.md](./BRANCHING_STRATEGY.md)
- [RELEASE_PROCESS.md](./RELEASE_PROCESS.md)
