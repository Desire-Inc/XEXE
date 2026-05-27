import type { AutomationRun } from "../automation/Automation";
import { buildKanbanBoard, type KanbanBoard } from "../kanban/KanbanBoard";
import type { ReviewReport } from "../review/ReviewReport";
import type { WorkbenchTask } from "../tasks/Task";
import { createDefaultDesktopLayout, type DesktopLayout, type DesktopPanelId } from "./DesktopModel";

export type DesktopWorkspaceState = {
	rootPath?: string;
	workspaceName?: string;
	activeTaskId?: string;
	activeBranch?: string;
	activeWorktreePath?: string;
};

export type DesktopShellState = {
	layout: DesktopLayout;
	workspace: DesktopWorkspaceState;
	tasks: WorkbenchTask[];
	kanban: KanbanBoard;
	activePanel: DesktopPanelId;
	activeTask?: WorkbenchTask;
	review?: ReviewReport;
	runs: AutomationRun[];
	statusBar: {
		branch?: string;
		worktree?: string;
		runningAgents: number;
		pendingReviews: number;
		failedRuns: number;
	};
};

export type CreateDesktopShellStateInput = {
	workspace?: DesktopWorkspaceState;
	tasks?: WorkbenchTask[];
	activePanel?: DesktopPanelId;
	activeTaskId?: string;
	review?: ReviewReport;
	runs?: AutomationRun[];
	layout?: DesktopLayout;
};

export function createDesktopShellState(input: CreateDesktopShellStateInput = {}): DesktopShellState {
	const layout = input.layout ?? createDefaultDesktopLayout();
	const tasks = input.tasks ?? [];
	const activeTaskId = input.activeTaskId ?? input.workspace?.activeTaskId;
	const activeTask = activeTaskId ? tasks.find((task) => task.id === activeTaskId) : undefined;
	const runs = input.runs ?? [];
	return {
		layout,
		workspace: input.workspace ?? {},
		tasks,
		kanban: buildKanbanBoard(tasks),
		activePanel: input.activePanel ?? layout.activePanel,
		activeTask,
		review: input.review,
		runs,
		statusBar: {
			branch: activeTask?.branchName ?? input.workspace?.activeBranch,
			worktree: activeTask?.worktreePath ?? input.workspace?.activeWorktreePath,
			runningAgents: tasks.filter((task) => task.status === "running" || task.status === "testing" || task.status === "reviewing").length,
			pendingReviews: tasks.filter((task) => task.status === "ready_to_commit" || task.status === "ready_to_pr" || task.status === "reviewing").length,
			failedRuns: runs.filter((run) => run.status === "failed").length,
		},
	};
}
