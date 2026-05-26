import type { AgentRoleId } from "../agents/AgentRole";
import type { LivePullRequest } from "../integrations/LivePullRequestService";
import type { ReviewReport } from "../review/ReviewReport";
import type { TestRunResult } from "../testing/TestRunner";
import type { WorkbenchTask } from "../tasks/Task";
import type { LiveWorkbenchOrchestrator } from "./LiveWorkbenchOrchestrator";

export type EndToEndTaskWorkflowInput = {
	title: string;
	description?: string;
	plan: string;
	role?: AgentRoleId;
	prompt?: string;
	baseRef?: string;
	baseBranch?: string;
	commitMessage?: string;
};

export type EndToEndTaskWorkflowResult = {
	task: WorkbenchTask;
	review: ReviewReport;
	tests: TestRunResult;
	pullRequest: LivePullRequest;
};

export class EndToEndTaskWorkflow {
	constructor(private readonly orchestrator: LiveWorkbenchOrchestrator) {}

	async run(input: EndToEndTaskWorkflowInput): Promise<EndToEndTaskWorkflowResult> {
		const created = await this.orchestrator.createTask(input.title, input.description ?? "", input.role ?? "planner");
		await this.orchestrator.planTask({ taskId: created.id, plan: input.plan });
		const started = await this.orchestrator.startTask({ taskId: created.id, baseRef: input.baseRef });
		await this.orchestrator.executeTask({ taskId: started.id, role: input.role ?? "builder", prompt: input.prompt ?? input.plan, query: input.title });
		const tests = await this.orchestrator.runTests(started.id);
		const review = await this.orchestrator.reviewTask(started.id, [], tests.results.map((result) => result.command));
		const pr = await this.orchestrator.createLivePullRequestForTask({ taskId: started.id, baseBranch: input.baseBranch, commitMessage: input.commitMessage });
		const task = await this.orchestrator.tasks.get(started.id);
		if (!task) throw new Error(`Task disappeared during workflow: ${started.id}`);
		return { task, review, tests, pullRequest: pr.pullRequest };
	}
}
