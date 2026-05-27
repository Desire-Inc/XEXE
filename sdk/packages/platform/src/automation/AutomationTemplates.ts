import type { AutomationSpec } from "./Automation";

export const DEFAULT_AUTOMATION_TEMPLATES: AutomationSpec[] = [
	{
		id: "github-ci-fixer",
		name: "GitHub CI Fixer",
		trigger: "ci_failed",
		enabled: true,
		agent: "tester",
		prompt: "Investigate failing CI, reproduce locally when possible, apply minimal fixes in a worktree, run tests, and prepare a PR summary.",
	},
	{
		id: "github-pr-reviewer",
		name: "GitHub PR Reviewer",
		trigger: "github_pr_comment",
		enabled: true,
		agent: "reviewer",
		prompt: "Review the PR diff for correctness, safety, test coverage, and regressions. Do not edit files.",
	},
	{
		id: "issue-planner",
		name: "Issue Planner",
		trigger: "github_issue_mention",
		enabled: true,
		agent: "planner",
		prompt: "Turn the issue into an implementation plan with milestones, files to inspect, tests, rollback, and risks.",
	},
	{
		id: "weekly-health-report",
		name: "Weekly Codebase Health Report",
		trigger: "cron",
		enabled: false,
		agent: "researcher",
		prompt: "Summarize codebase health, flaky tests, dependency risks, large files, TODOs, and recommended maintenance tasks.",
		conditions: { cron: "0 9 * * MON" },
	},
];
