# XEXE Agent Workbench

XEXE Agent Workbench is the platform layer added on top of Cline to unify the requested ideas from Cline, Claw Code, 1Code, Aider, Forge, Goose, OpenCode, Windsurf practices, and IDK2-style CLI ergonomics.

## What this first implementation adds

- `@xexe/platform` package under `sdk/packages/platform`
- Task model and JSON task store
- Git worktree manager
- Workspace indexer with repo-map style metadata
- Memory loader for `.agent/` rules, skills, agents, commands, and memory
- Agent role registry
- Provider router foundation
- MCP server registry foundation
- Tool risk policy catalog
- Automation model foundation
- Standalone CLI: `xexe` / `agent-workbench`

## CLI

```bash
cd sdk/packages/platform
bun run build
bun ./src/cli.ts doctor
bun ./src/cli.ts agents
bun ./src/cli.ts task create "Implement auth flow"
bun ./src/cli.ts task list
bun ./src/cli.ts workspace sync
bun ./src/cli.ts workspace query auth
bun ./src/cli.ts memory context
```

## Package scripts

```bash
cd sdk
bun -F @xexe/platform typecheck
bun -F @xexe/platform test
bun -F @xexe/platform build
```

## Implemented modules

| Module | Status | Purpose |
|---|---:|---|
| Agent roles | Added | Defines Architect, Planner, Researcher, Builder, Reviewer, Tester, Debugger, Committer, Release |
| Task store | Added | Persists tasks in `.agent/tasks.json` |
| Worktree manager | Added | Creates/removes task worktrees and exposes status/diff/rollback helpers |
| Workspace indexer | Added | Builds a repo-map style `.agent/workspace-index.json` |
| Memory loader | Added | Loads `.agent` rules, agents, skills, commands, and memory |
| Provider router | Added | Foundation for multi-provider routing |
| MCP registry | Added | Foundation for MCP server lifecycle and agent permissions |
| Tool policies | Added | Risk-aware tool catalog |
| Automations | Added | Trigger/run model foundation |

## Next integration points

1. Wire `@xexe/platform` into `@cline/cli` as a first-class `workbench` subcommand.
2. Add VS Code task panel backed by `TaskStore`.
3. Feed `.agent/` memory into Cline's existing user instruction config service.
4. Connect worktree task creation to the existing Cline run-agent flow.
5. Add GitHub PR creation using the existing GitHub integration once task diffs pass review.
