import { GitDiffService } from "../git/GitDiffService";
import type { PullRequestClient } from "../integrations/LivePullRequestService";
import { TaskPullRequestWorkflow, type CreateTaskPullRequestInput, type TaskPullRequestWorkflowResult } from "../integrations/TaskPullRequestWorkflow";
import { WorkbenchOrchestrator, type WorkbenchOrchestratorOptions } from "./WorkbenchOrchestrator";

export type LiveWorkbenchOrchestratorOptions = WorkbenchOrchestratorOptions & {
	pullRequests: PullRequestClient;
};

export class LiveWorkbenchOrchestrator extends WorkbenchOrchestrator {
	private readonly taskPullRequests: TaskPullRequestWorkflow;

	constructor(readonly liveOptions: LiveWorkbenchOrchestratorOptions) {
		super(liveOptions);
		this.taskPullRequests = new TaskPullRequestWorkflow({
			tasks: this.tasks,
			git: liveOptions.gitDiff ?? new GitDiffService(),
			pullRequests: liveOptions.pullRequests,
		});
	}

	createLivePullRequestForTask(input: CreateTaskPullRequestInput): Promise<TaskPullRequestWorkflowResult> {
		return this.taskPullRequests.create(input);
	}
}
