import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { WorkbenchOrchestrator } from "./WorkbenchOrchestrator";

describe("WorkbenchOrchestrator", () => {
	it("creates, plans, executes, reviews, and drafts PRs", async () => {
		const dir = await mkdtemp(join(tmpdir(), "xexe-orchestrator-"));
		try {
			const orchestrator = new WorkbenchOrchestrator({ root: dir });
			const task = await orchestrator.createTask("Build desktop runner", "Wire desktop to runtime", "planner");
			const planned = await orchestrator.planTask({ taskId: task.id, plan: "Implement minimal runner" });
			expect(planned.status).toBe("awaiting_approval");
			const execution = await orchestrator.executeTask({ taskId: task.id, role: "builder" });
			expect(execution.result.ok).toBe(true);
			const review = await orchestrator.reviewTask(task.id, [], ["planning runtime"]);
			expect(review.status).toBe("approved");
			const draft = await orchestrator.createPullRequestDraftForTask(task.id);
			expect(draft.title).toContain("Build desktop runner");
		} finally {
			await rm(dir, { recursive: true, force: true });
		}
	});
});
