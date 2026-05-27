import { DEFAULT_AGENT_ROLES, type AgentRoleId, getAgentRole } from "../agents/AgentRole";
import { AutomationRegistry } from "../automation/AutomationRegistry";
import { AutomationStore } from "../automation/AutomationStore";
import { GitDiffService, type GitDiffSummary } from "../git/GitDiffService";
import { PlanningProviderMcpBridge, type ProviderMcpBridge } from "../integrations/ProviderMcpBridge";
import { createPullRequestDraft, type PullRequestDraft } from "../integrations/PullRequestService";
import { PlanningRuntimeBridge, type WorkbenchRuntimeBridge, type WorkbenchRuntimeResult } from "../integrations/WorkbenchRuntimeBridge";
import { MemoryLoader } from "../memory/MemoryLoader";
import { createDefaultProviderRouter, type ProviderCapability, type ProviderProfile, ProviderRouter } from "../providers/ProviderRouter";
import { createReviewReport, deriveReviewStatus, type ReviewFinding, type ReviewReport } from "../review/ReviewReport";
import { TaskStore } from "../tasks/TaskStore";
import type { WorkbenchTask } from "../tasks/Task";
import { TestRunner, type TestRunResult } from "../testing/TestRunner";
import { WorkspaceIndexer, type WorkspaceFileRecord } from "../workspace/WorkspaceIndexer";
import { WorktreeManager } from "../worktrees/WorktreeManager";

export type WorkbenchOrchestratorOptions = {
	root: string;
	providerRouter?: ProviderRouter;
	runtimeBridge?: WorkbenchRuntimeBridge;
	providerMcpBridge?: ProviderMcpBridge;
	automationStore?: AutomationStore;
	testRunner?: TestRunner;
	gitDiff?: GitDiffService;
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

export type ExecuteTaskInput = {
	taskId: string;
	role?: AgentRoleId;
	prompt?: string;
	query?: string;
};

export type WorkbenchTaskExecution = {
	task: WorkbenchTask;
	result: WorkbenchRuntimeResult;
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
	readonly runtimeBridge: WorkbenchRuntimeBridge;
	readonly providerMcpBridge: ProviderMcpBridge;
	readonly automationStore: AutomationStore;
	readonly automationRegistry = new AutomationRegistry();
	readonly testRunner: TestRunner;
	readonly gitDiff: GitDiffService;

	constructor(readonly options: WorkbenchOrchestratorOptions) {
		this.tasks = new TaskStore({ rootDir: options.root });
		this.memory = new MemoryLoader(options.root);
		this.workspace = new WorkspaceIndexer({ root: options.root });
		this.providers = options.providerRouter ?? createDefaultProviderRouter();
		this.runtimeBridge = options.runtimeBridge ?? new PlanningRuntimeBridge();
		this.providerMcpBridge = options.providerMcpBridge ?? new PlanningProviderMcpBridge();
		this.automationStore = options.automationStore ?? new AutomationStore(options.root);
		this.testRunner = options.testRunner ?? new TestRunner();
		this.gitDiff = options.gitDiff ?? new GitDiffService();
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
				{ name: "runtime bridge", ok: !!this.runtimeBridge },
				{ name: "provider/MCP bridge", ok: !!this.providerMcpBridge },
				{ name: "automation store", ok: !!this.automationStore.filePath, message: this.automationStore.filePath },
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
		const task = await this.requireTask(input.taskId);
		const worktree = await this.worktrees.create({ repoPath: this.options.root, taskId: task.id, branchName: task.branchName, baseRef: input.baseRef });
		return this.tasks.update(task.id, {
			worktreePath: worktree.path,
			branchName: worktree.branchName,
			status: "running",
			agent: "builder",
		});
	}

	async executeTask(input: ExecuteTaskInput): Promise<WorkbenchTaskExecution> {
		const context = await this.prepareContext(input.taskId, input.query);
		const role = input.role ?? normalizeAgentRole(context.task.agent) ?? "builder";
		getAgentRole(role);
		const prompt = input.prompt ?? context.task.plan ?? context.task.description ?? context.task.title;
		const runningTask = await this.tasks.update(context.task.id, { agent: role, status: "running" });
		const result = await this.runtimeBridge.runTask({
			role,
			prompt,
			context: {
				task: runningTask,
				memory: context.memory,
				files: context.files,
				worktreePath: runningTask.worktreePath,
			},
		});
		const status = result.ok ? "testing" : "failed";
		const updated = await this.tasks.update(runningTask.id, {
			status,
			diff: result.diff,
			testStatus: result.testStatus,
			metadata: { ...runningTask.metadata, runtimeLogs: result.logs, runtimeSummary: result.summary },
		});
		return { task: updated, result };
	}

	async prepareContext(taskId: string, query?: string): Promise<{ task: WorkbenchTask; memory: string; files: WorkspaceFileRecord[] }> {
		const task = await this.requireTask(taskId);
		const memory = await this.memory.buildSystemContext();
		let files: WorkspaceFileRecord[] = [];
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

	async summarizeDiff(taskId: string, baseRef = "HEAD"): Promise<GitDiffSummary> {
		const task = await this.requireTask(taskId);
		if (!task.worktreePath) throw new Error(`Task has no worktree: ${taskId}`);
		const summary = await this.gitDiff.summarize(task.worktreePath, baseRef);
		await this.tasks.update(task.id, { diff: summary.diff, metadata: { ...task.metadata, filesChanged: summary.filesChanged } });
		return summary;
	}

	async runTests(taskId: string): Promise<TestRunResult> {
		const task = await this.requireTask(taskId);
		if (!task.worktreePath) throw new Error(`Task has no worktree: ${taskId}`);
		await this.tasks.update(task.id, { status: "testing" });
		const result = await this.testRunner.run(task.worktreePath);
		await this.tasks.update(task.id, { status: result.ok ? "reviewing" : "failed", testStatus: result.ok ? "passed" : "failed", metadata: { ...task.metadata, testResults: result.results } });
		return result;
	}

	async reviewTask(taskId: string, findings: ReviewFinding[] = [], testsRun: string[] = []): Promise<ReviewReport> {
		const task = await this.requireTask(taskId);
		const status = deriveReviewStatus(findings);
		const report = createReviewReport({
			taskId: task.id,
			status,
			summary: status === "approved" ? "Task review approved." : "Task review needs attention.",
			findings,
			testsRun,
			risks: findings.filter((finding) => finding.severity !== "info").map((finding) => finding.title),
			rollbackPlan: task.worktreePath ? `Rollback with git reset --hard HEAD in ${task.worktreePath}` : "No worktree created yet.",
		});
		await this.tasks.update(task.id, { status: status === "approved" ? "ready_to_pr" : "reviewing", metadata: { ...task.metadata, review: report } });
		return report;
	}

	async createPullRequestDraftForTask(taskId: string, baseBranch = "main"): Promise<PullRequestDraft> {
		const task = await this.requireTask(taskId);
		const review = isReviewReport(task.metadata.review) ? task.metadata.review : undefined;
		return createPullRequestDraft({ task, review, baseBranch, testsRun: review?.testsRun, risks: review?.risks });
	}

	async loadAutomations(): Promise<AutomationRegistry> {
		const snapshot = await this.automationStore.read();
		return new AutomationRegistry(snapshot);
	}

	async saveAutomations(registry: AutomationRegistry): Promise<void> {
		await this.automationStore.write(registry.snapshot());
	}

	selectProvider(requiredCapabilities: ProviderCapability[] = ["chat", "tools"]): ProviderProfile | undefined {
		return this.providers.select({ requiredCapabilities });
	}

	private async requireTask(taskId: string): Promise<WorkbenchTask> {
		const task = await this.tasks.get(taskId);
		if (!task) throw new Error(`Task not found: ${taskId}`);
		return task;
	}
}

function normalizeAgentRole(value: string): AgentRoleId | undefined {
	return Object.keys(DEFAULT_AGENT_ROLES).includes(value) ? (value as AgentRoleId) : undefined;
}

function isReviewReport(value: unknown): value is ReviewReport {
	return typeof value === "object" && value !== null && "taskId" in value && "status" in value && "findings" in value;
}
