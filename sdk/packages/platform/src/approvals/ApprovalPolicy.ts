import type { AgentRole } from "../agents/AgentRole";
import type { WorkbenchToolPolicy } from "../tools/ToolPolicy";

export type ApprovalDecision = {
	allowed: boolean;
	requiresApproval: boolean;
	reason: string;
};

export function decideToolApproval(agent: AgentRole, tool: WorkbenchToolPolicy, hasWorktree: boolean): ApprovalDecision {
	if (tool.requiresWorktree && !hasWorktree) {
		return { allowed: false, requiresApproval: false, reason: "Tool requires an isolated worktree" };
	}
	if (tool.allowedAgents && !tool.allowedAgents.includes(agent.id)) {
		return { allowed: false, requiresApproval: false, reason: `Tool is not allowed for ${agent.name}` };
	}
	if (!agent.canEditFiles && ["safe-write", "dangerous-write", "destructive"].includes(tool.risk)) {
		return { allowed: false, requiresApproval: false, reason: `${agent.name} is read-only` };
	}
	if (!agent.canRunShell && tool.risk === "shell-command") {
		return { allowed: false, requiresApproval: false, reason: `${agent.name} cannot run shell commands` };
	}
	return { allowed: true, requiresApproval: !tool.autoApprove, reason: tool.autoApprove ? "Auto-approved by policy" : "Human approval required" };
}
