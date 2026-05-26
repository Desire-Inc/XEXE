export type VscodeWorkbenchCommand = {
	command: string;
	title: string;
	category: "XEXE";
	description: string;
};

export const VSCODE_WORKBENCH_COMMANDS: VscodeWorkbenchCommand[] = [
	{
		command: "xexe.workbench.openKanban",
		title: "Open XEXE Kanban",
		category: "XEXE",
		description: "Open the Agent Workbench Kanban board for task/worktree orchestration.",
	},
	{
		command: "xexe.workbench.createTask",
		title: "Create XEXE Task",
		category: "XEXE",
		description: "Create a task backed by the XEXE TaskStore.",
	},
	{
		command: "xexe.workbench.syncWorkspace",
		title: "Sync XEXE Workspace Index",
		category: "XEXE",
		description: "Build the repo-map style workspace index.",
	},
	{
		command: "xexe.workbench.reviewTask",
		title: "Review XEXE Task",
		category: "XEXE",
		description: "Review the selected task diff and test status.",
	},
];

export function toVsCodePackageJsonCommands(commands = VSCODE_WORKBENCH_COMMANDS): Array<{ command: string; title: string; category: string }> {
	return commands.map(({ command, title, category }) => ({ command, title, category }));
}
