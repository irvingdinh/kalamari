---
name: commit
description: Commit the Git changes
---

## Instructions

1. **Review changes**: Run `git status` and `git diff` to understand all staged and unstaged changes
2. **Stage changes**: Stage all modified and untracked files (excluding files that should be ignored like `.env`, credentials, etc.)
3. **Write commit message**: Create a commit message following Conventional Commits format:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `refactor:` for code refactoring
   - `test:` for adding/updating tests
   - `chore:` for maintenance tasks
   - Use imperative mood (e.g., "Add feature" not "Added feature")
   - Keep the subject line concise (under 72 characters)
   - Add body if needed to explain the "why"
4. **Commit**: Execute the commit with Co-Authored-By trailer

## Commit Message Format

```
<type>: <subject>

<optional body>

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Notes

- Do NOT push to remote unless explicitly asked
- If there are no changes to commit, inform the user instead of creating an empty commit
