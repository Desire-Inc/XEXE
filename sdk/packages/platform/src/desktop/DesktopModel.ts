export type DesktopPanelId = "chat" | "diff" | "files" | "terminal" | "git" | "kanban" | "agents" | "mcp" | "settings" | "runs";

export type DesktopPanel = {
	id: DesktopPanelId;
	title: string;
	enabled: boolean;
};

export const DEFAULT_DESKTOP_PANELS: DesktopPanel[] = [
	{ id: "chat", title: "Chat", enabled: true },
	{ id: "diff", title: "Diff viewer", enabled: true },
	{ id: "files", title: "Files", enabled: true },
	{ id: "terminal", title: "Terminal", enabled: true },
	{ id: "git", title: "Git", enabled: true },
	{ id: "kanban", title: "Kanban", enabled: true },
	{ id: "agents", title: "Agents", enabled: true },
	{ id: "mcp", title: "MCP", enabled: true },
	{ id: "settings", title: "Settings", enabled: true },
	{ id: "runs", title: "Runs / Automation History", enabled: true },
];

export type DesktopLayout = {
	activePanel: DesktopPanelId;
	panels: DesktopPanel[];
};

export function createDefaultDesktopLayout(): DesktopLayout {
	return { activePanel: "kanban", panels: DEFAULT_DESKTOP_PANELS.map((panel) => ({ ...panel })) };
}
