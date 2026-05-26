# XEXE Agent Workbench

XEXE Agent Workbench is the desktop-first platform layer added on top of Cline to unify the requested ideas from Cline, Claw Code, 1Code, Aider, Forge, Goose, OpenCode, Windsurf practices, and IDK2-style CLI ergonomics.

## Product direction

XEXE is a standalone desktop workbench. The app should embed IDE/editor, file explorer, chat, task Kanban, diff viewer, terminal, CLI command palette, Git client, agent manager, MCP registry, provider settings, test/review/release panels, automation run history, and browser/live preview.

VS Code is not the target product surface. It may remain upstream Cline compatibility/reference context only.

## What this implementation adds

- `@xexe/platform` package under `sdk/packages/platform`
- `@xexe/desktop` package under `sdk/apps/desktop`
- Task model and JSON task store
- Git worktree manager
- Workspace indexer with repo-map style metadata
- Memory loader for `.agent/` rules, skills, agents, commands, and memory
- Agent role registry
- Provider router foundation
- MCP server registry foundation
- Tool risk policy catalog
- Automation model, registry, templates, and store foundation
- Runtime, provider/MCP, and PR scaffolds
- Desktop panel model, shell state, and command palette
- Standalone CLI: `xexe` / `agent-workbench`
- Cline CLI adapter: `cline workbench ...`
- GitHub Actions workflow for platform and desktop validation

## CLI

Standalone platform CLI:

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

Cline CLI adapter after local build:

```bash
cd sdk
cline workbench doctor
cline workbench agents
cline workbench task create "Implement auth flow"
cline workbench task list
```

## Package scripts

```bash
cd sdk
bun -F @xexe/platform typecheck
bun -F @xexe/platform test
bun -F @xexe/platform build
bun -F @xexe/desktop typecheck
bun -F @xexe/desktop test
bun -F @xexe/desktop build
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
| Automations | Added | Trigger/run model, registry, templates, and store primitives |
| Desktop shell | Added | Desktop-first panels, shell state, and command palette |
| Desktop app | Added | `@xexe/desktop` package shell and command routing contract |
| PR service | Added | Drafts PR titles/bodies from task, tests, risks, and review status |

## Next integration points

1. Wire desktop renderer/runtime to the desktop shell model.
2. Feed `.agent/` memory into Cline's existing user instruction config service.
3. Connect worktree task creation to the existing Cline run-agent flow.
4. Bind providers/MCP to live Cline managers.
5. Add GitHub PR creation once task diffs pass review.
