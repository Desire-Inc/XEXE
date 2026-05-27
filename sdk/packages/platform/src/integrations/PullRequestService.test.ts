import { describe, expect, it } from "vitest";
import { createPullRequestDraft } from "./PullRequestService";
import type { WorkbenchTask } from "../tasks/Task";

const task: WorkbenchTask = {
	id: "task-1",
	title: "Ship PR automation",
	description: "Create PR drafts from task state",
	status: "ready_to_pr",
	agent: "committer",
	branchName: "agent/task-1",
	createdAt: new Date(0).toISOString(),
	updatedAt: new Date(0).toISOString(),
	metadata: {},
};

describe("createPullRequestDraft", () => {
	it("builds a complete PR draft", () => {
		const draft = createPullRequestDraft({ task, testsRun: ["bun test"], risks: ["Needs runtime wiring"] });
		expect(draft.title).toContain(task.title);
		expect(draft.body).toContain("bun test");
		expect(draft.body).toContain("Needs runtime wiring");
	});
});
