# Code Review Guide — YelpCamp

> Based on [Google Code Review Guidelines](https://google.github.io/eng-practices/review/).

---

## Reviewer Responsibilities

1. **Correctness** — Does it work? Are edge cases handled?
2. **Security** — Auth middleware present? Input validated? Secrets excluded?
3. **Tests** — New behavior has tests? Existing tests pass?
4. **Scope** — Is the diff focused? No unrelated refactoring?
5. **Conventions** — Matches existing patterns?

---

## Author Responsibilities

1. Keep PRs small (< 400 lines when possible)
2. Write clear PR description with test plan
3. Self-review before requesting review
4. Run `npm test` locally
5. Update docs if behavior changes

---

## Review Checklist

### Security
- [ ] Mutating routes have `isloggedIn` + ownership middleware
- [ ] No secrets or credentials in diff
- [ ] User input validated with Joi
- [ ] No unescaped user content in HTML/JS

### Functionality
- [ ] Happy path works
- [ ] Error cases handled (flash messages or error page)
- [ ] Redirects follow PRG pattern

### Code Quality
- [ ] Async handlers wrapped in `catchAsync`
- [ ] No unused imports
- [ ] No commented-out code
- [ ] Matches naming conventions

### Tests
- [ ] New routes have integration tests
- [ ] Authorization denial tested
- [ ] `npm test` passes

### Database
- [ ] Schema changes documented
- [ ] Indexes added if new query patterns
- [ ] Cascade effects considered

---

## Feedback Guidelines

- **Nit** — Optional style preference; prefix with "Nit:"
- **Suggestion** — Improvement worth considering
- **Blocking** — Must fix before merge (security, bugs, missing tests)

---

## What Not to Block On

- Formatting differences (unless egregious)
- Naming bikeshedding on unchanged code
- "I would do it differently" without concrete benefit

---

## Related

- [CODING_STANDARD.md](./CODING_STANDARD.md)
- [SECURITY_GUIDE.md](./SECURITY_GUIDE.md)
- [TESTING_GUIDE.md](./TESTING_GUIDE.md)
