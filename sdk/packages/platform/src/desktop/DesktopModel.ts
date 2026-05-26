export type DesktopPanelId =
	| "workspace"
	| "chat"
	| "editor"
	| "diff"
	| "files"
	| "terminal"
	| "cli"
	| "git"
	| "kanban"
	| "agents"
	| "mcp"
	| "providers"
	| "settings"
	| "tests"
	| "review"
	| "release"
	| "runs"
	| "browser";

export type DesktopPanelKind = "primary" | "secondary" | "utility" | "settings";

export type DesktopPanel = {
	id: DesktopPanelId;
	title: string;
	kind: DesktopPanelKind;
	enabled: boolean;
	description: string;
};

export const DEFAULT_DESKTOP_PANELS: DesktopPanel[] = [
	{ id: "workspace", title: "Workspace", kind: "primary", enabled: true, description: "Workspace picker, repo state, and task context." },
	{ id: "chat", title: "Chat", kind: "primary", enabled: true, description: "Agent conversation surface." },
	{ id: "editor", title: "Editor", kind: "primary", enabled: true, description: "Embedded IDE/editor surface." },
	{ id: "files", title: "Files", kind: "primary", enabled: true, description: "File explorer and workspace index results." },
	{ id: "terminal", title: "Terminal", kind: "primary", enabled: true, description: "Embedded shell terminal." },
	{ id: "cli", title: "CLI", kind: "primary", enabled: true, description: "Command palette and one-shot CLI surface inside the desktop app." },
	{ id: "kanban", title: "Kanban", kind: "primary", enabled: true, description: "Task board backed by TaskStore and worktrees." },
	{ id: "diff", title: "Diff viewer", kind: "secondary", enabled: true, description: "Task diff and file-level change review." },
	{ id: "git", title: "Git", kind: "secondary", enabled: true, description: "Branch, commit, rollback, push, and PR workflows." },
	{ id: "tests", title: "Tests", kind: "secondary", enabled: true, description: "Typecheck, lint, unit, integration, and smoke runs." },
	{ id: "review", title: "Review", kind: "secondary", enabled: true, description: "Review report, findings, risks, and approval state." },
	{ id: "agents", title: "Agents", kind: "utility", enabled: true, description: "Agent roles, permissions, logs, and runtime status." },
	{ id: "mcp", title: "MCP", kind: "utility", enabled: true, description: "MCP registry, permissions, and tool-call logs." },
	{ id: "providers", title: "Providers", kind: "settings", enabled: true, description: "Model providers, BYOK, local models, routing, cost, and fallback." },
	{ id: "settings", title: "Settings", kind: "settings", enabled: true, description: "Workbench configuration and project preferences." },
	{ id: "release", title: "Release", kind: "utility", enabled: true, description: "Release checklist, changelog, packaging, and rollback plan." },
	{ id: "runs", title: "Runs / Automation History", kind: "utility", enabled: true, description: "Background agents, automation runs, and scheduled tasks." },
	{ id: "browser", title: "Browser Preview", kind: "utility", enabled: true, description: "Live browser preview for web tasks." },
];

export type DesktopLayout = {
	activePanel: DesktopPanelId;
	leftSidebar: DesktopPanelId[];
	mainPanels: DesktopPanelId[];
	rightSidebar: DesktopPanelId[];
	bottomPanels: DesktopPanelId[];
	panels: DesktopPanel[];
};

export function createDefaultDesktopLayout(): DesktopLayout {
	return {
		activePanel: "kanban",
		leftSidebar: ["workspace", "files", "kanban", "agents"],
		mainPanels: ["chat", "editor", "diff", "review", "browser"],
		rightSidebar: ["git", "mcp", "providers", "settings"],
		bottomPanels: ["terminal", "cli", "tests", "runs", "release"],
		panels: DEFAULT_DESKTOP_PANELS.map((panel) => ({ ...panel })),
	};
}

export function getDesktopPanel(layout: DesktopLayout, id: DesktopPanelId): DesktopPanel | undefined {
	return layout.panels.find((panel) => panel.id === id);
}
