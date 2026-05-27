import { describe, expect, it } from "vitest";
import { buildKanbanBoard } from "./KanbanBoard";
import type { WorkbenchTask } from "../tasks/Task";

const baseTask: WorkbenchTask = {
	id: "1",
	title: "Task",
	description: "",
	status: "draft",
	agent: "planner",
	createdAt: new Date(0).toISOString(),
	updatedAt: new Date(0).toISOString(),
	metadata: {},
};

describe("buildKanbanBoard", () => {
	it("groups tasks by column", () => {
		const board = buildKanbanBoard([{ ...baseTask }, { ...baseTask, id: "2", status: "running" }]);
		expect(board.columns.find((column) => column.id === "backlog")?.cards).toHaveLength(1);
		expect(board.columns.find((column) => column.id === "in_progress")?.cards).toHaveLength(1);
	});
});
