import type { ReviewReport } from "../review/ReviewReport";
import type { WorkbenchTask } from "../tasks/Task";

export type PullRequestDraft = {
	title: string;
	body: string;
	branchName?: string;
	baseBranch: string;
};

export type CreatePullRequestInput = {
	task: WorkbenchTask;
	review?: ReviewReport;
	testsRun?: string[];
	risks?: string[];
	baseBranch?: string;
};

export function createPullRequestDraft(input: CreatePullRequestInput): PullRequestDraft {
	const tests = input.testsRun?.length ? input.testsRun.map((test) => `- ${test}`).join("\n") : "- Not run yet";
	const risks = input.risks?.length ? input.risks.map((risk) => `- ${risk}`).join("\n") : "- No known risks captured yet";
	const reviewStatus = input.review ? input.review.status : "not_reviewed";
	return {
		title: `feat: ${input.task.title}`,
		branchName: input.task.branchName,
		baseBranch: input.baseBranch ?? "main",
		body: `## Summary\n\n${input.task.description || input.task.title}\n\n## Task\n\n- ID: ${input.task.id}\n- Agent: ${input.task.agent}\n- Status: ${input.task.status}\n- Branch: ${input.task.branchName ?? "not created"}\n- Worktree: ${input.task.worktreePath ?? "not created"}\n\n## Tests\n\n${tests}\n\n## Review\n\n- Status: ${reviewStatus}\n${input.review?.summary ? `- Summary: ${input.review.summary}\n` : ""}\n## Risks\n\n${risks}\n\n## Rollback\n\nUse the task worktree rollback flow, then close the PR or revert the merge commit if already merged.\n`,
	};
}
