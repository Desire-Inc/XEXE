#!/usr/bin/env bun
import { cwd, exit } from "node:process";
import { AutomationDaemon } from "./automation/AutomationDaemon";
import { AutomationStore } from "./automation/AutomationStore";
import { DEFAULT_AGENT_ROLES, listAgentRoles, type AgentRoleId } from "./agents/AgentRole";
import { MemoryLoader } from "./memory/MemoryLoader";
import { WorkbenchOrchestrator, type WorkbenchOrchestratorOptions } from "./orchestration/WorkbenchOrchestrator";
import { TaskStore } from "./tasks/TaskStore";
import { WorkspaceIndexer } from "./workspace/WorkspaceIndexer";
import { WorktreeManager } from "./worktrees/WorktreeManager";

export type WorkbenchCliOptions = Partial<Omit<WorkbenchOrchestratorOptions, "root">>;

export async function runWorkbenchCli(argv = process.argv.slice(2), root = cwd(), options: WorkbenchCliOptions = {}): Promise<number> {
	const [command, subcommand, ...rest] = argv;
	try {
		switch (command) {
			case undefined:
			case "help":
			case "--help": printHelp(); return 0;
			case "doctor": return doctor(root, options);
			case "agents": console.log(JSON.stringify(listAgentRoles(), null, "\t")); return 0;
			case "task": return taskCommand(subcommand, rest, root, options);
			case "workspace": return workspaceCommand(subcommand, rest, root);
			case "memory": return memoryCommand(subcommand, root);
			case "automation": return automationCommand(subcommand, rest, root);
			default: console.error(`Unknown command: ${command}`); printHelp(); return 1;
		}
	} catch (error) {
		console.error(error instanceof Error ? error.message : String(error));
		return 1;
	}
}

function createOrchestrator(root: string, options: WorkbenchCliOptions): WorkbenchOrchestrator {
	return new WorkbenchOrchestrator({ root, ...options });
}

async function doctor(root: string, options: WorkbenchCliOptions): Promise<number> {
	const orchestrator = createOrchestrator(root, options);
	console.log(JSON.stringify(await orchestrator.doctor(), null, "\t"));
	return 0;
}

async function taskCommand(subcommand: string | undefined, args: string[], root: string, options: WorkbenchCliOptions): Promise<number> {
	const store = new TaskStore({ rootDir: root });
	const orchestrator = createOrchestrator(root, options);
	switch (subcommand) {
		case "create": {
			const title = args.join(" ").trim();
			if (!title) throw new Error("Usage: xexe task create <title>");
			console.log(JSON.stringify(await store.create({ title, workspacePath: root }), null, "\t"));
			return 0;
		}
		case "list": console.log(JSON.stringify(await store.list(), null, "\t")); return 0;
		case "plan": {
			const [id, ...planParts] = args;
			if (!id || planParts.length === 0) throw new Error("Usage: xexe task plan <task-id> <plan>");
			console.log(JSON.stringify(await orchestrator.planTask({ taskId: id, plan: planParts.join(" ") }), null, "\t"));
			return 0;
		}
		case "start": {
			const [id, baseRef] = args;
			if (!id) throw new Error("Usage: xexe task start <task-id> [base-ref]");
			console.log(JSON.stringify(await orchestrator.startTask({ taskId: id, baseRef }), null, "\t"));
			return 0;
		}
		case "execute": {
			const [id, role, ...promptParts] = args;
			if (!id) throw new Error("Usage: xexe task execute <task-id> [agent-role] [prompt]");
			console.log(JSON.stringify(await orchestrator.executeTask({ taskId: id, role: parseAgentRole(role), prompt: promptParts.join(" ") || undefined }), null, "\t"));
			return 0;
		}
		case "diff": {
			const [id, baseRef] = args;
			if (!id) throw new Error("Usage: xexe task diff <task-id> [base-ref]");
			console.log(JSON.stringify(await orchestrator.summarizeDiff(id, baseRef), null, "\t"));
			return 0;
		}
		case "test": {
			const [id] = args;
			if (!id) throw new Error("Usage: xexe task test <task-id>");
			console.log(JSON.stringify(await orchestrator.runTests(id), null, "\t"));
			return 0;
		}
		case "review": {
			const [id] = args;
			if (!id) throw new Error("Usage: xexe task review <task-id>");
			console.log(JSON.stringify(await orchestrator.reviewTask(id), null, "\t"));
			return 0;
		}
		case "pr": {
			const [id, baseBranch] = args;
			if (!id) throw new Error("Usage: xexe task pr <task-id> [base-branch]");
			console.log(JSON.stringify(await orchestrator.createPullRequestDraftForTask(id, baseBranch), null, "\t"));
			return 0;
		}
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
		default: throw new Error("Usage: xexe task <create|list|plan|start|execute|diff|test|review|pr|worktree>");
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

async function automationCommand(subcommand: string | undefined, args: string[], root: string): Promise<number> {
	const daemon = new AutomationDaemon(new AutomationStore(root));
	switch (subcommand) {
		case "bootstrap": console.log(JSON.stringify((await daemon.bootstrapDefaults()).snapshot(), null, "\t")); return 0;
		case "trigger": {
			const [trigger] = args;
			if (!trigger) throw new Error("Usage: xexe automation trigger <trigger>");
			console.log(JSON.stringify(await daemon.trigger({ trigger: trigger as never }), null, "\t"));
			return 0;
		}
		default: throw new Error("Usage: xexe automation <bootstrap|trigger>");
	}
}

function parseAgentRole(value: string | undefined): AgentRoleId | undefined {
	return value && Object.keys(DEFAULT_AGENT_ROLES).includes(value) ? (value as AgentRoleId) : undefined;
}

function printHelp(): void {
	console.log(`XEXE Agent Workbench\n\nCommands:\n  xexe doctor\n  xexe agents\n  xexe task create <title>\n  xexe task list\n  xexe task plan <task-id> <plan>\n  xexe task start <task-id> [base-ref]\n  xexe task execute <task-id> [agent-role] [prompt]\n  xexe task diff <task-id> [base-ref]\n  xexe task test <task-id>\n  xexe task review <task-id>\n  xexe task pr <task-id> [base-branch]\n  xexe task worktree <task-id>\n  xexe workspace sync\n  xexe workspace query <text>\n  xexe memory list\n  xexe memory context\n  xexe automation bootstrap\n  xexe automation trigger <trigger>`);
}

if (import.meta.url === `file://${process.argv[1]}`) runWorkbenchCli().then((code) => exit(code));
