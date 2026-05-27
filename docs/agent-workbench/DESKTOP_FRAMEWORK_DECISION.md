# Desktop framework decision

XEXE is desktop-first. The preferred desktop shell target is **Tauri-style host commands** with a fallback Node host for tests and non-packaged development.

## Decision

Use a Tauri-compatible host boundary first:

- UI calls typed host commands through `TauriDesktopHost`.
- Development and tests use `NodeDesktopHost`.
- Shared desktop orchestration stays in `@xexe/desktop`.
- Platform orchestration stays in `@xexe/platform`.

## Required Tauri commands

- `xexe_pick_workspace`
- `xexe_read_text_file`
- `xexe_write_text_file`
- `xexe_run_terminal_command`
- `xexe_open_external`

## Background process

`DesktopSupervisor` starts `DesktopBackgroundProcess`, which runs the XEXE `BackgroundWorker` loop.

## Full workflow target

The final desktop flow is:

```text
Task card
→ worktree
→ live Cline runtime
→ diff/test/review
→ commit/push
→ GitHubPullRequestClient
→ PR link saved on task
```
