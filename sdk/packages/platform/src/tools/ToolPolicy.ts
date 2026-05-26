export type ToolRisk = "read-only" | "safe-write" | "dangerous-write" | "shell-command" | "network" | "credential-access" | "destructive";
export type WorkbenchToolPolicy = { name: string; risk: ToolRisk; autoApprove: boolean; requiresWorktree: boolean; allowedAgents?: string[]; description?: string };

export const DEFAULT_TOOL_POLICIES: WorkbenchToolPolicy[] = [
	{ name: "read", risk: "read-only", autoApprove: true, requiresWorktree: false },
	{ name: "search", risk: "read-only", autoApprove: true, requiresWorktree: false },
	{ name: "workspace.query", risk: "read-only", autoApprove: true, requiresWorktree: false },
	{ name: "write.patch", risk: "safe-write", autoApprove: false, requiresWorktree: true },
	{ name: "git.diff", risk: "read-only", autoApprove: true, requiresWorktree: true },
	{ name: "git.commit", risk: "safe-write", autoApprove: false, requiresWorktree: true, allowedAgents: ["committer"] },
	{ name: "shell", risk: "shell-command", autoApprove: false, requiresWorktree: true },
	{ name: "shell.test", risk: "shell-command", autoApprove: true, requiresWorktree: true },
	{ name: "mcp.read", risk: "network", autoApprove: false, requiresWorktree: false },
	{ name: "github.pr", risk: "network", autoApprove: false, requiresWorktree: true, allowedAgents: ["committer", "release"] },
];

export function isToolAllowedForAgent(policy: WorkbenchToolPolicy, agentId: string): boolean {
	return !policy.allowedAgents || policy.allowedAgents.includes(agentId);
}
