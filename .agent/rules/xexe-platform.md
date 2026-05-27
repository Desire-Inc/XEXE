# XEXE Platform Rules

- Use `cline/cline` as the base product architecture.
- Prefer modular packages under `sdk/packages/*` over invasive core changes.
- XEXE is desktop-first: prioritize a standalone desktop app with IDE, terminal, CLI, Git, Kanban, agents, MCP, settings, review, tests, rollback, and automation history built in.
- Do not make VS Code UI the product target. VS Code can remain upstream Cline compatibility/reference context only.
- Keep agent roles explicit: Architect, Planner, Researcher, Builder, Tester, Debugger, Reviewer, Committer, Release.
- New write-capable flows must support isolated worktrees, diffs, rollback, and review.
- Read-only agents must not write files or run destructive shell commands.
- Use `.agent/` for project rules, skills, agents, commands, and memory.
- Preserve compatibility with upstream Cline until a deliberate fork decision is documented.
- Every implementation must include docs, tests, and a clear rollback path.
