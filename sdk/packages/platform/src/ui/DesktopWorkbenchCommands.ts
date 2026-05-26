import type { DesktopPanelId } from "../desktop/DesktopModel";

export type DesktopWorkbenchCommand = {
	command: string;
	title: string;
	category: "XEXE";
	description: string;
	panel: DesktopPanelId;
};

export const DESKTOP_WORKBENCH_COMMANDS: DesktopWorkbenchCommand[] = [
	{ command: "xexe.desktop.openWorkbench", title: "Open XEXE Workbench", category: "XEXE", description: "Open the desktop Agent Workbench shell with IDE, terminal, Git, Kanban, agents, MCP, and run history.", panel: "kanban" },
	{ command: "xexe.desktop.createTask", title: "Create XEXE Task", category: "XEXE", description: "Create a desktop task backed by TaskStore and an optional isolated worktree.", panel: "kanban" },
	{ command: "xexe.desktop.syncWorkspace", title: "Sync Workspace Index", category: "XEXE", description: "Build or refresh the repo-map style workspace index used by the desktop IDE and agents.", panel: "files" },
	{ command: "xexe.desktop.openTerminal", title: "Open Embedded Terminal", category: "XEXE", description: "Open the embedded terminal/CLI panel inside the desktop app.", panel: "terminal" },
	{ command: "xexe.desktop.reviewTask", title: "Review Task Diff", category: "XEXE", description: "Open the desktop review flow with diff, tests, risks, rollback, and PR readiness.", panel: "diff" },
	{ command: "xexe.desktop.openProviders", title: "Open Provider Settings", category: "XEXE", description: "Open provider routing, BYOK, local model, fallback, token, and cost settings.", panel: "providers" },
	{ command: "xexe.desktop.openMcp", title: "Open MCP Registry", category: "XEXE", description: "Open MCP server registry, agent permissions, and tool-call logs.", panel: "mcp" },
	{ command: "xexe.desktop.openRuns", title: "Open Automation Runs", category: "XEXE", description: "Open background runs, scheduled agents, triggers, logs, and automation history.", panel: "runs" },
];

export function toDesktopCommandPalette(commands = DESKTOP_WORKBENCH_COMMANDS): Array<{ command: string; title: string; category: string }> {
	return commands.map(({ command, title, category }) => ({ command, title, category }));
}
