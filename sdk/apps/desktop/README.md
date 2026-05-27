# XEXE Desktop

This package is the desktop-first product shell for XEXE Agent Workbench.

It is intentionally separate from VS Code. The app target is a standalone desktop workbench that embeds:

- IDE/editor
- file explorer
- chat
- terminal
- CLI command palette
- Git client
- Kanban
- agents
- MCP registry
- provider settings
- diff viewer
- tests
- review
- release checklist
- automation run history
- browser/live preview

## Current status

This package currently provides the TypeScript shell model and command-routing contract. A renderer/runtime implementation can consume these exports and wire them to Tauri, Electron, Wails, or another desktop shell.

## Validation

```bash
cd sdk
bun -F @xexe/desktop typecheck
bun -F @xexe/desktop test
bun -F @xexe/desktop build
```
