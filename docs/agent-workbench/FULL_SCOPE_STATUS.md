# XEXE Agent Workbench — Full Scope Status

## Current head

`51d27941ef6aad890defb803e278a170d41bd5bc`

## Done in this PR

- Desktop-first direction is codified.
- `@xexe/platform` exists.
- `@xexe/desktop` exists.
- Workbench CLI exists.
- Desktop shell/controller/runtime abstractions exist.
- Task/worktree/workspace/memory foundations exist.
- Automation daemon/runner/background worker foundations exist.
- PR draft and live GitHub PR client foundations exist.
- Runtime bridge and Cline runtime bridge foundations exist.
- Provider/MCP bridge extension points exist.
- Workspace intelligence now includes import graph, file ranking, and related-test suggestions.
- Bug-hunt policy invariant report exists.

## Still not fully done

The project is still not a finished shipped desktop app. The remaining items require either local execution/log access or direct product-runtime binding:

1. Fix exact CI failures from GitHub Actions logs or local `bun` runs.
2. Pass a real CLI `Config` into `createClineCliRuntimeBridge()` from the normal CLI bootstrap path.
3. Bind provider router entries to Cline provider settings at runtime.
4. Bind MCP registry entries to the live Cline MCP manager at runtime.
5. Replace the memory desktop host with Tauri/Electron/Wails implementation.
6. Run the background worker as a supervised desktop/daemon process.
7. Use `GitHubPullRequestClient` after commit/push to create live PRs from tasks.

## Validation

```bash
cd sdk
bun install
bun -F @xexe/platform typecheck
bun -F @xexe/platform test
bun -F @xexe/platform build
bun -F @xexe/desktop typecheck
bun -F @xexe/desktop test
bun -F @xexe/desktop build
```
