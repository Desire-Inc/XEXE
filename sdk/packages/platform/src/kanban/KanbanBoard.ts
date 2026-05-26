import type { TaskStatus, WorkbenchTask } from "../tasks/Task";

export type KanbanColumnId = "backlog" | "planning" | "in_progress" | "testing" | "review" | "ready_to_pr" | "done" | "failed";

export type KanbanColumn = {
	id: KanbanColumnId;
	title: string;
	statuses: TaskStatus[];
};

export type KanbanCard = {
	id: string;
	title: string;
	description: string;
	status: TaskStatus;
	agent: string;
	branchName?: string;
	worktreePath?: string;
	testStatus?: string;
};

export type KanbanBoard = {
	columns: Array<KanbanColumn & { cards: KanbanCard[] }>;
};

export const DEFAULT_KANBAN_COLUMNS: KanbanColumn[] = [
	{ id: "backlog", title: "Backlog", statuses: ["draft"] },
	{ id: "planning", title: "Planning", statuses: ["planning", "awaiting_approval"] },
	{ id: "in_progress", title: "In progress", statuses: ["running"] },
	{ id: "testing", title: "Testing", statuses: ["testing"] },
	{ id: "review", title: "Review", statuses: ["reviewing", "ready_to_commit"] },
	{ id: "ready_to_pr", title: "Ready to PR", statuses: ["ready_to_pr"] },
	{ id: "done", title: "Done", statuses: ["done"] },
	{ id: "failed", title: "Failed", statuses: ["failed", "cancelled"] },
];

export function taskToKanbanCard(task: WorkbenchTask): KanbanCard {
	return {
		id: task.id,
		title: task.title,
		description: task.description,
		status: task.status,
		agent: task.agent,
		branchName: task.branchName,
		worktreePath: task.worktreePath,
		testStatus: task.testStatus,
	};
}

export function buildKanbanBoard(tasks: WorkbenchTask[], columns = DEFAULT_KANBAN_COLUMNS): KanbanBoard {
	return {
		columns: columns.map((column) => ({
			...column,
			cards: tasks.filter((task) => column.statuses.includes(task.status)).map(taskToKanbanCard),
		})),
	};
}
