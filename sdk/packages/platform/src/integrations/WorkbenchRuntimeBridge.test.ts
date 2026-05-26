import { describe, expect, it } from "vitest";
import { PlanningRuntimeBridge } from "./WorkbenchRuntimeBridge";
import type { WorkbenchTask } from "../tasks/Task";

const task: WorkbenchTask = {
	id: "task-1",
	title: "Run task",
	description: "",
	status: "running",
	agent: "builder",
	createdAt: new Date(0).toISOString(),
	updatedAt: new Date(0).toISOString(),
	metadata: {},
};

describe("PlanningRuntimeBridge", () => {
	it("returns a deterministic planning result", async () => {
		const bridge = new PlanningRuntimeBridge();
		const result = await bridge.runTask({ role: "builder", prompt: "Do it", context: { task, memory: "", files: [] } });
		expect(result.ok).toBe(true);
		expect(result.summary).toContain(task.title);
	});
});
