import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { runWorkbenchCli } from "./cli";

describe("runWorkbenchCli", () => {
	it("runs doctor", async () => {
		const dir = await mkdtemp(join(tmpdir(), "xexe-cli-"));
		const log = vi.spyOn(console, "log").mockImplementation(() => {});
		try {
			await mkdir(join(dir, ".agent/rules"), { recursive: true });
			await writeFile(join(dir, ".agent/rules/test.md"), "# Test rule\n", "utf8");
			const code = await runWorkbenchCli(["doctor"], dir);
			expect(code).toBe(0);
			expect(log).toHaveBeenCalled();
		} finally {
			log.mockRestore();
			await rm(dir, { recursive: true, force: true });
		}
	});

	it("creates a task", async () => {
		const dir = await mkdtemp(join(tmpdir(), "xexe-cli-task-"));
		const log = vi.spyOn(console, "log").mockImplementation(() => {});
		try {
			const code = await runWorkbenchCli(["task", "create", "Ship", "feature"], dir);
			expect(code).toBe(0);
			expect(log.mock.calls[0]?.[0]).toContain("Ship feature");
		} finally {
			log.mockRestore();
			await rm(dir, { recursive: true, force: true });
		}
	});
});
