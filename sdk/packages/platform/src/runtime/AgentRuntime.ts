import type { AgentRoleId } from "../agents/AgentRole";
import type { WorkbenchTask } from "../tasks/Task";

export type AgentRuntimeEventType = "started" | "thought" | "tool" | "message" | "completed" | "failed";

export type AgentRuntimeEvent = {
	type: AgentRuntimeEventType;
	taskId: string;
	agent: AgentRoleId | string;
	message: string;
	createdAt: string;
	metadata?: Record<string, unknown>;
};

export type AgentRuntimeInput = {
	task: WorkbenchTask;
	agent: AgentRoleId | string;
	prompt: string;
	context?: string;
	worktreePath?: string;
};

export type AgentRuntimeResult = {
	ok: boolean;
	taskId: string;
	events: AgentRuntimeEvent[];
	summary: string;
	error?: string;
};

export interface AgentRuntime {
	run(input: AgentRuntimeInput): Promise<AgentRuntimeResult>;
}

export class PlanningOnlyRuntime implements AgentRuntime {
	async run(input: AgentRuntimeInput): Promise<AgentRuntimeResult> {
		const now = new Date().toISOString();
		return {
			ok: true,
			taskId: input.task.id,
			summary: `Prepared ${input.agent} run for task ${input.task.title}`,
			events: [
				{ type: "started", taskId: input.task.id, agent: input.agent, message: input.prompt, createdAt: now },
				{ type: "completed", taskId: input.task.id, agent: input.agent, message: "Runtime handoff ready", createdAt: now },
			],
		};
	}
}
