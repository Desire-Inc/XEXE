# Cline Integration Guide for XEXE Workbench

This document describes the integration points needed to turn the current platform foundation into a first-class Cline feature.

## 1. CLI command routing

The Cline CLI now includes a `workbench` subcommand through `sdk/apps/cli/src/commands/workbench.ts` and the `@xexe/platform/cli` adapter.

Expected usage after local build:

```bash
cline workbench doctor
cline workbench agents
cline workbench task create "Implement auth flow"
cline workbench task list
cline workbench workspace sync
cline workbench workspace query auth
cline workbench memory context
```

If a downstream branch does not yet include the `main.ts` route, add this near the existing `kanban` command:

```ts
program
  .command("workbench")
  .description("Run XEXE Agent Workbench commands")
  .allowUnknownOption()
  .allowExcessArguments()
  .passThroughOptions()
  .action(async (_opts: unknown, cmd: Command) => {
    const { runWorkbenchCommand } = await import("./commands/workbench");
    ctx.exitCode = await runWorkbenchCommand({
      args: cmd.args,
      cwd: process.cwd(),
      io,
    });
  });
```

## 2. Desktop-first UI

XEXE's product surface is the standalone desktop app, not a VS Code extension.

Recommended sequence:

1. Desktop shell with panels and command routing.
2. Workspace picker and embedded terminal.
3. File explorer and editor/IDE surface.
4. Task Kanban backed by `TaskStore`.
5. Diff/test/review panels backed by `GitDiffService`, `TestRunner`, and `ReviewReport`.
6. Agent runner panel connected to `WorkbenchOrchestrator`.
7. MCP registry and provider settings.
8. Automation runs and background task history.
9. GitHub PR creation from ready tasks.

## 3. Cline runtime handoff

Wire `WorkbenchOrchestrator.startTask()` to the existing Cline agent run flow:

1. Create task.
2. Create task worktree.
3. Build context with `.agent` memory + workspace query.
4. Call existing `runAgent()` with a generated prompt.
5. Persist result, diff, test output, and review report.

## 4. Provider execution

The current `ProviderRouter` selects providers by capability/cost/privacy. Next step is mapping selected `ProviderProfile` to existing Cline provider settings.

## 5. MCP execution

The current `McpRegistry` models MCP server configs and validation. Next step is binding it to Cline's existing MCP server manager.

## 6. PR automation

`PullRequestService` can draft PR titles/bodies from task metadata, tests, risks, and review reports. The next runtime step is to connect that draft to the live GitHub integration when a task reaches `ready_to_pr`.
