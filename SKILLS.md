# SKILLS.md — YelpCamp Repository Skills

> Repository-specific skills for AI agents. Complements global Cursor/Codex skills.

---

## Skill: yelpcamp-new-route

**When:** Adding a new HTTP endpoint

**Steps:**
1. Read route map in `docs/architecture/ARCHITECTURE.md`
2. Create controller function in appropriate `controllers/` file
3. Add route with middleware chain in `routes/`
4. Add Joi schema in `schemas.js` if accepting form data
5. Create/update EJS view in `views/`
6. Add integration test in `tests/`
7. Run `npm test`

**Authorization checklist:**
- Does this mutate data? → Add `isloggedIn`
- Does this modify someone else's resource? → Add ownership middleware

---

## Skill: yelpcamp-security-fix

**When:** Addressing security findings

**Steps:**
1. Read `docs/security/SECURITY_AUDIT.md` for finding ID
2. Read `docs/roadmaps/SECURITY_ROADMAP.md` for remediation plan
3. Implement fix with minimal scope
4. Add/update test proving the fix
5. Update SECURITY_AUDIT.md status if resolving a finding
6. Run `npm test` and `npm audit`

---

## Skill: yelpcamp-database-change

**When:** Modifying Mongoose schemas

**Steps:**
1. Read `docs/architecture/DATABASE.md`
2. Update model in `models/`
3. Add indexes if new query patterns
4. Update Joi schema if validation affected
5. Update `docs/product/BUSINESS_LOGIC.md`
6. Consider cascade effects (campground delete hook)
7. Run `npm test`

---

## Skill: yelpcamp-test-gap

**When:** Adding test coverage

**Steps:**
1. Read `docs/testing/TESTING_AUDIT.md` for gaps
2. Use `request.agent(app)` for auth tests
3. Mock Mapbox/Cloudinary — never call real APIs
4. Test both happy path and authorization denial
5. Run `npm test`

---

## Skill: yelpcamp-deploy-prep

**When:** Preparing for production deployment

**Steps:**
1. Read `docs/operations/PRODUCTION_READINESS.md` checklist
2. Verify all env vars in `.env.example`
3. Run `npm test`
4. Run `npm audit`
5. Confirm no secrets in codebase (`grep -r "api_secret\|api_key" --include="*.js"`)
6. Verify `NODE_ENV=production` behavior (secure cookies, validateEnv)

---

## Skill: yelpcamp-docs-update

**When:** Architecture or behavior changes

**Steps:**
1. Read `docs/standards/DOCUMENTATION_GUIDE.md`
2. Update affected docs (product, architecture, or audit)
3. Update AGENTS.md if commands or conventions change
4. Update PROJECT_MEMORY.md if persistent facts change

---

## Skill: yelpcamp-refactor

**When:** Refactoring existing code

**Steps:**
1. Read `docs/audits/CODE_AUDIT.md` for known smells
2. Read `docs/roadmaps/TECH_DEBT_ROADMAP.md` for priority
3. Ensure tests pass BEFORE refactoring
4. Make minimal, focused changes
5. Ensure tests pass AFTER refactoring
6. Do not refactor unrelated code

---

## Integration with MCP

This repository has Linear MCP available. Use for issue tracking if team uses Linear. No other MCP servers configured for this project.

---

## Related

- [AGENTS.md](./AGENTS.md)
- [PROJECT_MEMORY.md](./PROJECT_MEMORY.md)
