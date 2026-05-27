import { describe, expect, it } from "vitest";
import type { WorkbenchTask } from "../tasks/Task";
import { createDesktopShellState } from "./DesktopShell";

const task: WorkbenchTask = {
	id: "task-1",
	title: "Build desktop shell",
	description: "",
	status: "running",
	agent: "builder",
	branchName: "agent/task-1",
	worktreePath: "/tmp/xexe.worktrees/task-1",
	createdAt: new Date(0).toISOString(),
	updatedAt: new Date(0).toISOString(),
	metadata: {},
};

describe("createDesktopShellState", () => {
	it("builds desktop state with active task and status bar", () => {
		const state = createDesktopShellState({ tasks: [task], activeTaskId: task.id });
		expect(state.activeTask?.id).toBe(task.id);
		expect(state.statusBar.runningAgents).toBe(1);
		expect(state.statusBar.branch).toBe("agent/task-1");
		expect(state.layout.mainPanels).toContain("editor");
		expect(state.layout.bottomPanels).toContain("terminal");
	});
});
