import { createDesktopShellState, type DesktopShellState } from "../desktop/DesktopShell";
import { buildKanbanBoard, type KanbanBoard } from "../kanban/KanbanBoard";
import type { ReviewReport } from "../review/ReviewReport";
import type { WorkbenchTask } from "../tasks/Task";

export type WorkbenchViewModel = {
	tasks: WorkbenchTask[];
	kanban: KanbanBoard;
	desktop: DesktopShellState;
	selectedTask?: WorkbenchTask;
	review?: ReviewReport;
	stats: {
		total: number;
		running: number;
		blocked: number;
		done: number;
	};
};

export function createWorkbenchViewModel(tasks: WorkbenchTask[], selectedTaskId?: string, review?: ReviewReport): WorkbenchViewModel {
	return {
		tasks,
		kanban: buildKanbanBoard(tasks),
		desktop: createDesktopShellState({ tasks, activeTaskId: selectedTaskId, review }),
		selectedTask: selectedTaskId ? tasks.find((task) => task.id === selectedTaskId) : undefined,
		review,
		stats: {
			total: tasks.length,
			running: tasks.filter((task) => task.status === "running").length,
			blocked: tasks.filter((task) => task.status === "failed" || task.status === "cancelled").length,
			done: tasks.filter((task) => task.status === "done").length,
		},
	};
}
