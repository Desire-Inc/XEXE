export type GitHubAutomationEvent = {
	type: "issue_comment" | "pull_request_comment" | "check_run_failed";
	repository: string;
	url: string;
	body?: string;
	branch?: string;
};

export type GitHubAutomationDecision = {
	shouldRun: boolean;
	reason: string;
	prompt?: string;
};

export function decideGitHubAutomation(event: GitHubAutomationEvent, mention = "@xexe"): GitHubAutomationDecision {
	if (event.type === "check_run_failed") {
		return { shouldRun: true, reason: "CI failure detected", prompt: `Investigate and fix failing CI for ${event.repository} on ${event.branch ?? "current branch"}.` };
	}
	if (event.body?.includes(mention)) {
		return { shouldRun: true, reason: `${mention} mention detected`, prompt: event.body.replace(mention, "").trim() };
	}
	return { shouldRun: false, reason: "No matching trigger" };
}
