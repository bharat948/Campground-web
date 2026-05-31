# Documentation Guide — YelpCamp

---

## Documentation Structure

```
docs/
├── product/          # What and why
├── architecture/     # How it's built
├── audits/           # Findings and assessments
├── security/         # Security-specific
├── testing/          # Test strategy
├── operations/       # DevOps and production
├── standards/        # Engineering conventions
└── roadmaps/         # Future work

AGENTS.md             # AI agent instructions (root)
CLAUDE.md             # Claude Code pointer
MASTER_REPOSITORY_REPORT.md  # Executive summary
```

---

## When to Update Docs

| Change Type | Update |
|-------------|--------|
| New feature | PRODUCT.md, USER_FLOWS.md, ARCHITECTURE.md |
| New route | ARCHITECTURE.md route map |
| Schema change | DATABASE.md, BUSINESS_LOGIC.md |
| Security fix | SECURITY_AUDIT.md (mark resolved) |
| New env var | README.md, .env.example, AGENTS.md |
| Tech debt fix | TECH_DEBT_ROADMAP.md (mark done) |

---

## Writing Standards

1. **Date stamp** major audit documents
2. **Link related docs** at bottom of each file
3. **Include severity/priority** for findings
4. **State assumptions** explicitly
5. **Use Mermaid** for diagrams where helpful
6. Keep AGENTS.md under 200 lines (imperative, actionable)

---

## README vs Docs

| README.md | docs/ |
|-----------|-------|
| Quick start | Deep dives |
| Install steps | Architecture |
| Env var table | Audits |
| Feature list | Roadmaps |

Do not duplicate audit findings in README — link to docs.

---

## AI Agent Documentation

- `AGENTS.md` — primary agent context (tool-agnostic)
- `.cursor/rules/` — Cursor-specific rules
- `PROJECT_MEMORY.md` — persistent project facts
- `SKILLS.md` — repo-specific skill definitions

Keep these synchronized when architecture changes.

---

## Related

- [CODE_REVIEW_GUIDE.md](./CODE_REVIEW_GUIDE.md)
- [../product/PRODUCT.md](../product/PRODUCT.md)
