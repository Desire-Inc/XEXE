export type AgentPermissionLevel = "read-only" | "plan-only" | "controlled-write" | "write";

export type AgentRoleId =
	| "architect"
	| "planner"
	| "researcher"
	| "builder"
	| "reviewer"
	| "tester"
	| "debugger"
	| "committer"
	| "release";

export type AgentRole = {
	id: AgentRoleId;
	name: string;
	description: string;
	permissionLevel: AgentPermissionLevel;
	canEditFiles: boolean;
	canRunShell: boolean;
	canUseNetwork: boolean;
	defaultTools: string[];
	systemPrompt: string;
};

export const DEFAULT_AGENT_ROLES: Record<AgentRoleId, AgentRole> = {
	architect: {
		id: "architect",
		name: "Architect",
		description: "Maps architecture, boundaries, risks, and implementation strategy before code changes.",
		permissionLevel: "read-only",
		canEditFiles: false,
		canRunShell: false,
		canUseNetwork: false,
		defaultTools: ["read", "search", "workspace.query"],
		systemPrompt: "Study the repository, identify modules and constraints, and produce precise implementation plans without editing files.",
	},
	planner: {
		id: "planner",
		name: "Planner",
		description: "Turns requests into scoped plans with milestones, acceptance criteria, tests, and rollback.",
		permissionLevel: "plan-only",
		canEditFiles: false,
		canRunShell: false,
		canUseNetwork: false,
		defaultTools: ["read", "search", "workspace.query", "task.updatePlan"],
		systemPrompt: "Write executable plans with test and review checkpoints. Do not modify source code.",
	},
	researcher: {
		id: "researcher",
		name: "Researcher",
		description: "Researches docs, code, MCP resources, and implementation references.",
		permissionLevel: "read-only",
		canEditFiles: false,
		canRunShell: false,
		canUseNetwork: true,
		defaultTools: ["read", "search", "workspace.query", "web.search", "mcp.read"],
		systemPrompt: "Gather evidence and summarize tradeoffs without code changes.",
	},
	builder: {
		id: "builder",
		name: "Builder",
		description: "Implements approved plans in isolated worktrees with small, reviewable diffs.",
		permissionLevel: "write",
		canEditFiles: true,
		canRunShell: true,
		canUseNetwork: true,
		defaultTools: ["read", "search", "write.patch", "shell", "git", "workspace.query"],
		systemPrompt: "Make minimal, well-tested changes in the active worktree and keep diffs reviewable.",
	},
	reviewer: {
		id: "reviewer",
		name: "Reviewer",
		description: "Reviews diffs, security posture, tests, risk, and readiness to merge.",
		permissionLevel: "read-only",
		canEditFiles: false,
		canRunShell: true,
		canUseNetwork: false,
		defaultTools: ["read", "git.diff", "shell.test", "workspace.query"],
		systemPrompt: "Inspect diffs and tests line by line. Report blockers, risks, and follow-up actions.",
	},
	tester: {
		id: "tester",
		name: "Tester",
		description: "Runs tests/lint/typecheck and may apply controlled fixes.",
		permissionLevel: "controlled-write",
		canEditFiles: true,
		canRunShell: true,
		canUseNetwork: false,
		defaultTools: ["read", "write.patch", "shell.test", "shell.lint", "git.diff"],
		systemPrompt: "Reproduce failures, fix only what is necessary, and prove results with commands.",
	},
	debugger: {
		id: "debugger",
		name: "Debugger",
		description: "Investigates runtime errors, flaky tests, and broken integrations.",
		permissionLevel: "controlled-write",
		canEditFiles: true,
		canRunShell: true,
		canUseNetwork: false,
		defaultTools: ["read", "search", "shell", "write.patch", "git.diff"],
		systemPrompt: "Find root causes before edits and prefer small fixes with regression tests.",
	},
	committer: {
		id: "committer",
		name: "Committer",
		description: "Prepares commits, changelogs, PR descriptions, and release notes.",
		permissionLevel: "controlled-write",
		canEditFiles: true,
		canRunShell: true,
		canUseNetwork: true,
		defaultTools: ["git.diff", "git.status", "git.commit", "github.pr", "write.docs"],
		systemPrompt: "Create clear commits and PR descriptions; never hide failing checks.",
	},
	release: {
		id: "release",
		name: "Release",
		description: "Packages builds, validates release readiness, and prepares distribution artifacts.",
		permissionLevel: "controlled-write",
		canEditFiles: true,
		canRunShell: true,
		canUseNetwork: true,
		defaultTools: ["shell.build", "shell.test", "git", "github.release", "write.docs"],
		systemPrompt: "Validate the full release checklist and produce reproducible build notes.",
	},
};

export function getAgentRole(id: AgentRoleId): AgentRole {
	return DEFAULT_AGENT_ROLES[id];
}

export function listAgentRoles(): AgentRole[] {
	return Object.values(DEFAULT_AGENT_ROLES);
}
