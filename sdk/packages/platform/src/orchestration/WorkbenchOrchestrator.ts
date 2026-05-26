import { DEFAULT_AGENT_ROLES, type AgentRoleId, getAgentRole } from "../agents/AgentRole";
import { MemoryLoader } from "../memory/MemoryLoader";
import { createDefaultProviderRouter, type ProviderCapability, type ProviderProfile, ProviderRouter } from "../providers/ProviderRouter";
import { TaskStore } from "../tasks/TaskStore";
import type { WorkbenchTask } from "../tasks/Task";
import { WorkspaceIndexer } from "../workspace/WorkspaceIndexer";
import { WorktreeManager } from "../worktrees/WorktreeManager";

export type WorkbenchOrchestratorOptions = {
	root: string;
	providerRouter?: ProviderRouter;
};

export type PlanTaskInput = {
	taskId: string;
	plan: string;
	agent?: AgentRoleId;
};

export type StartTaskInput = {
	taskId: string;
	baseRef?: string;
};

export type WorkbenchDoctorReport = {
	ok: boolean;
	root: string;
	agents: number;
	memoryRecords: number;
	providers: ProviderProfile[];
	checks: Array<{ name: string; ok: boolean; message?: string }>;
};

export class WorkbenchOrchestrator {
	readonly tasks: TaskStore;
	readonly memory: MemoryLoader;
	readonly workspace: WorkspaceIndexer;
	readonly worktrees = new WorktreeManager();
	readonly providers: ProviderRouter;

	constructor(readonly options: WorkbenchOrchestratorOptions) {
		this.tasks = new TaskStore({ rootDir: options.root });
		this.memory = new MemoryLoader(options.root);
		this.workspace = new WorkspaceIndexer({ root: options.root });
		this.providers = options.providerRouter ?? createDefaultProviderRouter();
	}

	async doctor(): Promise<WorkbenchDoctorReport> {
		const memoryRecords = await this.memory.loadAll();
		const providers = this.providers.list();
		return {
			ok: true,
			root: this.options.root,
			agents: Object.keys(DEFAULT_AGENT_ROLES).length,
			memoryRecords: memoryRecords.length,
			providers,
			checks: [
				{ name: "agent roles", ok: Object.keys(DEFAULT_AGENT_ROLES).length >= 9 },
				{ name: "provider router", ok: providers.length > 0 },
				{ name: "memory loader", ok: true, message: `${memoryRecords.length} records` },
			],
		};
	}

	async createTask(title: string, description = "", agent: AgentRoleId = "planner"): Promise<WorkbenchTask> {
		getAgentRole(agent);
		return this.tasks.create({ title, description, agent, workspacePath: this.options.root });
	}

	async planTask(input: PlanTaskInput): Promise<WorkbenchTask> {
		return this.tasks.update(input.taskId, {
			plan: input.plan,
			agent: input.agent ?? "planner",
			status: "awaiting_approval",
		});
	}

	async startTask(input: StartTaskInput): Promise<WorkbenchTask> {
		const task = await this.tasks.get(input.taskId);
		if (!task) throw new Error(`Task not found: ${input.taskId}`);
		const worktree = await this.worktrees.create({ repoPath: this.options.root, taskId: task.id, branchName: task.branchName, baseRef: input.baseRef });
		return this.tasks.update(task.id, {
			worktreePath: worktree.path,
			branchName: worktree.branchName,
			status: "running",
			agent: "builder",
		});
	}

	async prepareContext(taskId: string, query?: string): Promise<{ task: WorkbenchTask; memory: string; files: unknown[] }> {
		const task = await this.tasks.get(taskId);
		if (!task) throw new Error(`Task not found: ${taskId}`);
		const memory = await this.memory.buildSystemContext();
		let files: unknown[] = [];
		if (query?.trim()) {
			try {
				files = await this.workspace.query(query);
			} catch {
				await this.workspace.sync();
				files = await this.workspace.query(query);
			}
		}
		return { task, memory, files };
	}

	selectProvider(requiredCapabilities: ProviderCapability[] = ["chat", "tools"]): ProviderProfile | undefined {
		return this.providers.select({ requiredCapabilities });
	}
}
