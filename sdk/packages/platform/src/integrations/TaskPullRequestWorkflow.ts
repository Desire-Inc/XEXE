import type { GitDiffService } from "../git/GitDiffService";
import type { TaskStore } from "../tasks/TaskStore";
import type { LivePullRequest, PullRequestClient } from "./LivePullRequestService";
import { createPullRequestDraft } from "./PullRequestService";
import { runCommand, type CommandResult } from "../worktrees/WorktreeManager";

export type TaskPullRequestWorkflowOptions = {
	tasks: TaskStore;
	git: GitDiffService;
	pullRequests: PullRequestClient;
};

export type CreateTaskPullRequestInput = {
	taskId: string;
	baseBranch?: string;
	commitMessage?: string;
	pushRemote?: string;
};

export type TaskPullRequestWorkflowResult = {
	commit?: CommandResult;
	push: CommandResult;
	pullRequest: LivePullRequest;
};

export class TaskPullRequestWorkflow {
	constructor(private readonly options: TaskPullRequestWorkflowOptions) {}

	async create(input: CreateTaskPullRequestInput): Promise<TaskPullRequestWorkflowResult> {
		const task = await this.options.tasks.get(input.taskId);
		if (!task) throw new Error(`Task not found: ${input.taskId}`);
		if (!task.worktreePath) throw new Error(`Task has no worktree: ${task.id}`);
		if (!task.branchName) throw new Error(`Task has no branch: ${task.id}`);
		let commit: CommandResult | undefined;
		const status = await runCommand("git", ["status", "--short"], task.worktreePath);
		if (status.stdout.trim()) {
			commit = await this.options.git.commit(task.worktreePath, input.commitMessage ?? `feat: ${task.title}`);
			if (commit.exitCode !== 0) throw new Error(commit.stderr || commit.stdout || "git commit failed");
		}
		const push = await runCommand("git", ["push", "-u", input.pushRemote ?? "origin", task.branchName], task.worktreePath);
		if (push.exitCode !== 0) throw new Error(push.stderr || push.stdout || "git push failed");
		const pullRequest = await this.options.pullRequests.create(createPullRequestDraft({ task, baseBranch: input.baseBranch ?? "main" }));
		await this.options.tasks.update(task.id, {
			status: "done",
			metadata: {
				...task.metadata,
				pullRequest,
				lastPush: { stdout: push.stdout, stderr: push.stderr, exitCode: push.exitCode },
			},
		});
		return { commit, push, pullRequest };
	}
}
