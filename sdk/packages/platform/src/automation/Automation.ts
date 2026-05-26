export type AutomationTriggerType = "github_issue_mention" | "github_pr_comment" | "ci_failed" | "linear_issue" | "slack_mention" | "cron" | "webhook" | "file_change";
export type AutomationSpec = { id: string; name: string; trigger: AutomationTriggerType; enabled: boolean; agent: string; prompt: string; conditions?: Record<string, unknown> };
export type AutomationRunStatus = "queued" | "running" | "succeeded" | "failed" | "cancelled";
export type AutomationRun = { id: string; specId: string; status: AutomationRunStatus; startedAt: string; finishedAt?: string; logs: string[] };

export function createAutomationRun(specId: string, now = new Date()): AutomationRun {
	return { id: `${specId}-${now.toISOString().replace(/[-:.TZ]/g, "")}`, specId, status: "queued", startedAt: now.toISOString(), logs: [] };
}
