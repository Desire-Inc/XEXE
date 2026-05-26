# XEXE Platform Rules

- Use `cline/cline` as the base product architecture.
- Prefer modular packages under `sdk/packages/*` over invasive core changes.
- Keep agent roles explicit: Architect, Planner, Researcher, Builder, Reviewer, Tester, Debugger, Committer, Release.
- New write-capable flows must support isolated worktrees, diffs, rollback, and review.
- Read-only agents must not write files or run destructive shell commands.
- Use `.agent/` for project rules, skills, agents, commands, and memory.
- Preserve compatibility with upstream Cline until a deliberate fork decision is documented.
- Every implementation must include docs, tests, and a clear rollback path.
