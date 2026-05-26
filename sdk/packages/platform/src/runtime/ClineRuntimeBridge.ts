import type { ReviewReport } from "../review/ReviewReport";
import type { WorkbenchRuntimeBridge, WorkbenchRuntimeRequest, WorkbenchRuntimeResult } from "../integrations/WorkbenchRuntimeBridge";

export type ClineAgentRunInput = {
	prompt: string;
	cwd: string;
	systemContext: string;
	metadata: Record<string, unknown>;
};

export type ClineAgentRunOutput = {
	ok: boolean;
	summary: string;
	diff?: string;
	testStatus?: string;
	review?: ReviewReport;
	logs?: string[];
};

export interface ClineAgentRunner {
	run(input: ClineAgentRunInput): Promise<ClineAgentRunOutput>;
}

export class ClineRuntimeBridge implements WorkbenchRuntimeBridge {
	constructor(private readonly runner: ClineAgentRunner) {}

	async runTask(request: WorkbenchRuntimeRequest): Promise<WorkbenchRuntimeResult> {
		const output = await this.runner.run({
			prompt: request.prompt,
			cwd: request.context.worktreePath ?? request.context.task.workspacePath ?? process.cwd(),
			systemContext: buildSystemContext(request),
			metadata: {
				taskId: request.context.task.id,
				taskTitle: request.context.task.title,
				role: request.role,
				files: request.context.files,
			},
		});
		return {
			ok: output.ok,
			summary: output.summary,
			diff: output.diff,
			testStatus: output.testStatus,
			review: output.review,
			logs: output.logs ?? [],
		};
	}
}

function buildSystemContext(request: WorkbenchRuntimeRequest): string {
	return [
		`# XEXE Workbench Task`,
		`Task: ${request.context.task.title}`,
		`Role: ${request.role}`,
		`Status: ${request.context.task.status}`,
		request.context.task.plan ? `Plan:\n${request.context.task.plan}` : undefined,
		request.context.memory ? `Memory:\n${request.context.memory}` : undefined,
		request.context.files.length ? `Relevant files:\n${JSON.stringify(request.context.files, null, "\t")}` : undefined,
	]
		.filter((section): section is string => Boolean(section))
		.join("\n\n");
}
