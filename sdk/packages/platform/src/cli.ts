#!/usr/bin/env bun
import { cwd, exit } from "node:process";
import { DEFAULT_AGENT_ROLES, listAgentRoles } from "./agents/AgentRole";
import { MemoryLoader } from "./memory/MemoryLoader";
import { TaskStore } from "./tasks/TaskStore";
import { WorkspaceIndexer } from "./workspace/WorkspaceIndexer";
import { WorktreeManager } from "./worktrees/WorktreeManager";

export async function runWorkbenchCli(argv = process.argv.slice(2), root = cwd()): Promise<number> {
	const [command, subcommand, ...rest] = argv;
	try {
		switch (command) {
			case undefined:
			case "help":
			case "--help": printHelp(); return 0;
			case "doctor": return doctor(root);
			case "agents": console.log(JSON.stringify(listAgentRoles(), null, "\t")); return 0;
			case "task": return taskCommand(subcommand, rest, root);
			case "workspace": return workspaceCommand(subcommand, rest, root);
			case "memory": return memoryCommand(subcommand, root);
			default: console.error(`Unknown command: ${command}`); printHelp(); return 1;
		}
	} catch (error) {
		console.error(error instanceof Error ? error.message : String(error));
		return 1;
	}
}

async function doctor(root: string): Promise<number> {
	const checks = { root, agents: Object.keys(DEFAULT_AGENT_ROLES).length, memoryRecords: (await new MemoryLoader(root).loadAll()).length };
	console.log(JSON.stringify({ ok: true, checks }, null, "\t"));
	return 0;
}

async function taskCommand(subcommand: string | undefined, args: string[], root: string): Promise<number> {
	const store = new TaskStore({ rootDir: root });
	switch (subcommand) {
		case "create": {
			const title = args.join(" ").trim();
			if (!title) throw new Error("Usage: xexe task create <title>");
			console.log(JSON.stringify(await store.create({ title, workspacePath: root }), null, "\t"));
			return 0;
		}
		case "list": console.log(JSON.stringify(await store.list(), null, "\t")); return 0;
		case "worktree": {
			const [id] = args;
			if (!id) throw new Error("Usage: xexe task worktree <task-id>");
			const task = await store.get(id);
			if (!task) throw new Error(`Task not found: ${id}`);
			const result = await new WorktreeManager().create({ repoPath: root, taskId: task.id, branchName: task.branchName });
			const updated = await store.update(task.id, { worktreePath: result.path, branchName: result.branchName, status: "planning" });
			console.log(JSON.stringify({ task: updated, worktree: result }, null, "\t"));
			return 0;
		}
		default: throw new Error("Usage: xexe task <create|list|worktree>");
	}
}

async function workspaceCommand(subcommand: string | undefined, args: string[], root: string): Promise<number> {
	const indexer = new WorkspaceIndexer({ root });
	switch (subcommand) {
		case "sync": {
			const index = await indexer.sync();
			console.log(JSON.stringify({ files: index.files.length, indexPath: indexer.indexPath }, null, "\t"));
			return 0;
		}
		case "query": {
			const query = args.join(" ").trim();
			if (!query) throw new Error("Usage: xexe workspace query <text>");
			console.log(JSON.stringify(await indexer.query(query), null, "\t"));
			return 0;
		}
		default: throw new Error("Usage: xexe workspace <sync|query>");
	}
}

async function memoryCommand(subcommand: string | undefined, root: string): Promise<number> {
	const loader = new MemoryLoader(root);
	switch (subcommand) {
		case "list": console.log(JSON.stringify(await loader.loadAll(), null, "\t")); return 0;
		case "context": console.log(await loader.buildSystemContext()); return 0;
		default: throw new Error("Usage: xexe memory <list|context>");
	}
}

function printHelp(): void {
	console.log(`XEXE Agent Workbench\n\nCommands:\n  xexe doctor\n  xexe agents\n  xexe task create <title>\n  xexe task list\n  xexe task worktree <task-id>\n  xexe workspace sync\n  xexe workspace query <text>\n  xexe memory list\n  xexe memory context`);
}

if (import.meta.url === `file://${process.argv[1]}`) runWorkbenchCli().then((code) => exit(code));
