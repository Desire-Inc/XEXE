# XEXE Full Scope Status

This branch now contains a broad desktop-first platform foundation for the XEXE vision. It still requires deeper runtime/renderer integration and validation before it can honestly be called a complete finished product.

## Added in this branch

- Platform package: `@xexe/platform`
- Desktop package foundation: `@xexe/desktop`
- Task orchestration foundation
- Worktree management foundation
- Workspace repo-map indexer
- Memory/rules/skills loader
- Agent role registry
- Provider router foundation
- MCP registry foundation
- Tool approval and risk policy foundation
- Runtime event model and planning-only runtime
- Runtime bridge scaffold for Cline handoff
- Provider/MCP bridge scaffold
- Pull request draft service
- Git diff/commit service
- Test runner wrapper
- Review report model
- Release checklist model
- Desktop panel model and shell state
- Desktop command palette model
- Desktop command router tests
- Kanban board model
- Automation templates, registry, run snapshots, and store primitives
- GitHub automation decision helper
- Custom distribution model
- Secret scanner
- Shell `:` prefix parser and zsh shim renderer
- CLI adapter for existing Cline CLI
- Cline CLI command adapter at `sdk/apps/cli/src/commands/workbench.ts`
- Tests for key pure modules
- GitHub Actions workflow for platform and desktop validation

## Product direction

XEXE is desktop-first. VS Code is upstream compatibility/reference context only. The target product is a standalone desktop app with IDE/editor, terminal, CLI command palette, Git, Kanban, agents, MCP, providers, diff/review/tests, release/rollback, browser preview, and automation history embedded in one workbench.

## Still not truly complete

The following are intentionally modeled but not fully wired into runtime/UI yet:

- Desktop renderer/runtime host such as Tauri, Electron, Wails, or equivalent
- Live Cline `runAgent()` execution from `WorkbenchOrchestrator.startTask()`
- Live provider execution via `ProviderRouter`
- Live MCP client lifecycle using `McpRegistry`
- Real background/cloud agent execution daemon
- Real PR creation from task state
- Full local validation and bug hunt across the entire upstream Cline repo

## Next implementation cut

1. Wire the desktop renderer to `@xexe/desktop` shell state and routing.
2. Connect `WorkbenchOrchestrator.startTask()` to Cline's `runAgent` flow.
3. Persist automation registry and runs through the daemon.
4. Bind `ProviderRouter` and `McpRegistry` to live Cline managers.
5. Implement PR creation when a task reaches `ready_to_pr`.
6. Run CI/local validation and fix type/test failures.
