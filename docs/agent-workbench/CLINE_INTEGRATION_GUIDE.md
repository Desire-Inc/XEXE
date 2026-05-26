# Cline Integration Guide for XEXE Workbench

This document describes the exact integration points needed to turn the current platform foundation into a first-class Cline feature.

## 1. CLI command routing

Add a `workbench` subcommand to `sdk/apps/cli/src/main.ts` near the existing `kanban` command:

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

This is intentionally separated from the large `main.ts` runtime so the command can be reviewed and inserted safely.

## 2. VS Code commands

Use `VSCODE_WORKBENCH_COMMANDS` from `@xexe/platform` to add package contributions:

- `xexe.workbench.openKanban`
- `xexe.workbench.createTask`
- `xexe.workbench.syncWorkspace`
- `xexe.workbench.reviewTask`

Start with command palette commands before adding a full webview.

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

## 6. UI

Recommended sequence:

1. Command palette actions.
2. Simple TreeDataProvider for tasks.
3. Webview Kanban board.
4. Diff/test/review side panels.
5. Background run history.
