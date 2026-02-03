---
name: keep-documents-updated
description: Maintain project documentation after code changes. Use after completing any coding task that adds, modifies, or removes modules, entities, API endpoints, configuration options, or project structure. Triggers on implementation completion.
---

# Documentation Update

After completing a coding task, spawn a subagent to update relevant documentation.

## Target Files

| File | Content |
|------|---------|
| `api/CLAUDE.md` | Project structure, modules, entities, API endpoints, configuration, patterns |
| `CLAUDE.md` | Points to api/CLAUDE.md |

## When to Update

Update documentation when changes affect:
- Project structure (`src/` directory layout)
- Modules (new feature modules or significant changes)
- Entities (new tables, fields, relationships)
- API endpoints (new routes, changed parameters)
- Configuration (new environment variables)
- Patterns (new conventions or architectural decisions)

## Update Process

1. Read current `api/CLAUDE.md`
2. Identify sections affected by recent changes
3. Update only the affected sections
4. Keep format consistent with existing content
