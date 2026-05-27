# XEXE Bug Hunt Checklist

Because this environment can edit GitHub files but cannot run the repo locally, this checklist defines the bug-hunt process that must be executed locally/CI.

## Static pass

- Verify package exports compile.
- Verify `@xexe/platform/cli` export resolves from `@cline/cli`.
- Verify no TypeScript path aliases are missing.
- Verify Bun workspace resolution includes `sdk/packages/platform`.
- Verify generated `dist` output contains `cli.js` and `index.js`.

## Runtime smoke pass

```bash
cd sdk
bun install
bun -F @xexe/platform typecheck
bun -F @xexe/platform test
bun -F @xexe/platform build
bun packages/platform/src/cli.ts doctor
bun packages/platform/src/cli.ts agents
bun packages/platform/src/cli.ts task create "Bug hunt smoke"
bun packages/platform/src/cli.ts task list
bun packages/platform/src/cli.ts workspace sync
bun packages/platform/src/cli.ts memory context
```

## Git/worktree pass

- Run inside a clean Git repo.
- Create a task.
- Create a worktree.
- Confirm branch naming is deterministic and sanitized.
- Confirm rollback resets only the worktree branch.
- Confirm remove only removes the task worktree.

## Security pass

- Run secret scanner against newly added files.
- Confirm no `.env`, token, private key, or user-local path was committed.
- Confirm shell commands in docs do not delete user files.
- Confirm destructive tools require explicit approval.

## Integration pass

- Add `workbench` command to `main.ts` following `CLINE_INTEGRATION_GUIDE.md`.
- Run `bun -F @cline/cli typecheck`.
- Run `cline workbench doctor` after local build.
- Run existing CLI test suite.

## Acceptance

A branch is merge-ready only when CI is green and this file's checklist is fully completed in the PR description.
