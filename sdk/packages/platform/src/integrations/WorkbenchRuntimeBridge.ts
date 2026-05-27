import type { AgentRoleId } from "../agents/AgentRole";
import type { ReviewReport } from "../review/ReviewReport";
import type { WorkbenchTask } from "../tasks/Task";

export type WorkbenchRuntimeContext = {
	task: WorkbenchTask;
	memory: string;
	files: unknown[];
	worktreePath?: string;
};

export type WorkbenchRuntimeRequest = {
	role: AgentRoleId;
	prompt: string;
	context: WorkbenchRuntimeContext;
};

export type WorkbenchRuntimeResult = {
	ok: boolean;
	summary: string;
	diff?: string;
	testStatus?: string;
	review?: ReviewReport;
	logs: string[];
};

export interface WorkbenchRuntimeBridge {
	runTask(request: WorkbenchRuntimeRequest): Promise<WorkbenchRuntimeResult>;
}

export class PlanningRuntimeBridge implements WorkbenchRuntimeBridge {
	async runTask(request: WorkbenchRuntimeRequest): Promise<WorkbenchRuntimeResult> {
		return {
			ok: true,
			summary: `Prepared ${request.role} run for ${request.context.task.title}`,
			logs: ["Runtime bridge scaffold executed", `Prompt: ${request.prompt}`],
		};
	}
}
