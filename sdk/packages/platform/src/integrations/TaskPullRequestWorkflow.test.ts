import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { GitDiffService } from "../git/GitDiffService";
import { TaskStore } from "../tasks/TaskStore";
import type { PullRequestClient } from "./LivePullRequestService";
import { TaskPullRequestWorkflow } from "./TaskPullRequestWorkflow";

describe("TaskPullRequestWorkflow", () => {
	it("requires a worktree before creating a PR", async () => {
		const dir = await mkdtemp(join(tmpdir(), "xexe-task-pr-"));
		try {
			const tasks = new TaskStore({ rootDir: dir });
			const task = await tasks.create({ title: "ship feature" });
			const workflow = new TaskPullRequestWorkflow({
				tasks,
				git: new GitDiffService(),
				pullRequests: { create: async () => ({ url: "https://example.com/pr/1", title: "PR" }) } satisfies PullRequestClient,
			});
			await expect(workflow.create({ taskId: task.id })).rejects.toThrow("no worktree");
		} finally {
			await rm(dir, { recursive: true, force: true });
		}
	});
});
