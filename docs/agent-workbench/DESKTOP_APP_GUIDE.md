# XEXE Desktop App Direction

XEXE is desktop-first. The product target is not a VS Code extension flow.

The desktop app should embed the complete workbench experience so the user can choose the right surface inside one app:

- IDE/file explorer/editor
- chat
- task Kanban
- diff viewer
- embedded terminal
- CLI command palette
- Git client
- agent manager
- MCP registry
- provider settings
- test/review/release panels
- automation run history
- browser/live preview when needed

## Product rule

Do not prioritize VS Code UI work for XEXE. VS Code may remain an upstream Cline compatibility/reference surface, but XEXE's product UX should be a standalone desktop application with all major coding-agent workflows built in.

## Current implementation

- `sdk/packages/platform/src/desktop/DesktopModel.ts` defines panels and layout.
- `sdk/packages/platform/src/desktop/DesktopShell.ts` derives shell state from tasks, Kanban, reviews, and automation runs.
- `sdk/packages/platform/src/ui/DesktopWorkbenchCommands.ts` defines the desktop command palette.
- `sdk/apps/desktop` is the desktop app package foundation.

## Recommended desktop sequence

1. Desktop shell with panels and routing.
2. Workspace picker and embedded terminal.
3. File explorer and editor/IDE surface.
4. Task Kanban backed by `TaskStore`.
5. Diff/test/review panels backed by `GitDiffService`, `TestRunner`, and `ReviewReport`.
6. Agent runner panel connected to `WorkbenchOrchestrator`.
7. MCP and provider settings.
8. Automation runs and background task history.
9. GitHub PR creation from ready tasks.

## CLI inside desktop

The standalone CLI still matters, but it should also be embedded in the desktop app as a terminal/command palette surface. Users should be able to choose between:

- visual panels;
- terminal commands;
- CLI-style one-shot commands;
- agent task cards;
- Git/diff/review workflows.
