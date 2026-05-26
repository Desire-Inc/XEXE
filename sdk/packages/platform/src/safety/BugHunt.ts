import { DEFAULT_AGENT_ROLES } from "../agents/AgentRole";
import { DEFAULT_TOOL_POLICIES } from "../tools/ToolPolicy";

export type BugHuntFinding = {
	severity: "info" | "warning" | "blocker";
	title: string;
	description: string;
};

export type BugHuntReport = {
	ok: boolean;
	findings: BugHuntFinding[];
	checkedAt: string;
};

export function createBugHuntReport(): BugHuntReport {
	const findings: BugHuntFinding[] = [];
	for (const role of Object.values(DEFAULT_AGENT_ROLES)) {
		if (!role.canEditFiles && role.defaultTools.some((tool) => tool.startsWith("write") || tool === "git.commit")) {
			findings.push({ severity: "blocker", title: `${role.name} can write`, description: "Read-only role includes write-capable tools." });
		}
	}
	for (const policy of DEFAULT_TOOL_POLICIES) {
		if ((policy.risk === "dangerous-write" || policy.risk === "destructive" || policy.risk === "credential-access") && policy.autoApprove) {
			findings.push({ severity: "blocker", title: `${policy.name} auto-approves risky action`, description: "Dangerous tools must require human approval." });
		}
		if ((policy.risk === "safe-write" || policy.risk === "dangerous-write" || policy.risk === "destructive") && !policy.requiresWorktree) {
			findings.push({ severity: "warning", title: `${policy.name} does not require worktree`, description: "Write-capable tools should be worktree-bound." });
		}
	}
	return { ok: findings.every((finding) => finding.severity !== "blocker"), findings, checkedAt: new Date().toISOString() };
}
