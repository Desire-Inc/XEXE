import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { TaskStore } from "./TaskStore";

describe("TaskStore", () => {
	it("creates and lists tasks", async () => {
		const dir = await mkdtemp(join(tmpdir(), "xexe-task-store-"));
		try {
			const store = new TaskStore({ rootDir: dir });
			const task = await store.create({ title: "Implement auth worktree" });
			expect(task.status).toBe("draft");
			expect(await store.get(task.id)).toMatchObject({ title: "Implement auth worktree" });
			expect(await store.list()).toHaveLength(1);
		} finally {
			await rm(dir, { recursive: true, force: true });
		}
	});
});
