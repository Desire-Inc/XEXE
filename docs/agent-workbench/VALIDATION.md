# XEXE Agent Workbench Validation Plan

This validation plan is the required checklist before the platform branch can be considered merge-ready.

## Local checks

```bash
cd sdk
bun install
bun -F @xexe/platform typecheck
bun -F @xexe/platform test
bun -F @xexe/platform build
```

## Manual CLI smoke test

```bash
cd <repo-root>
bun sdk/packages/platform/src/cli.ts doctor
bun sdk/packages/platform/src/cli.ts agents
bun sdk/packages/platform/src/cli.ts task create "Smoke task"
bun sdk/packages/platform/src/cli.ts task list
bun sdk/packages/platform/src/cli.ts workspace sync
bun sdk/packages/platform/src/cli.ts workspace query workbench
bun sdk/packages/platform/src/cli.ts memory list
```

## Worktree smoke test

```bash
TASK_ID=<id from task list>
bun sdk/packages/platform/src/cli.ts task worktree "$TASK_ID"
git worktree list
```

## Reviewer checklist

- No secrets were added.
- `.agent/` memory is non-sensitive and project-level only.
- Write-capable agents require worktree-backed flows.
- Tool policies classify shell/network/destructive actions separately.
- Worktree rollback path exists.
- Docs match CLI commands.
- Tests cover task store, workspace indexer, CLI, Kanban grouping, and review status derivation.

## Known limitations of this branch

- VS Code UI is not wired yet.
- Existing Cline CLI is not fully routed to the new package yet; adapter file exists for integration.
- Provider router is a selection foundation, not a live provider execution layer.
- MCP registry is a config/lifecycle foundation, not a live MCP client manager.
- Automation registry queues runs in memory only.
