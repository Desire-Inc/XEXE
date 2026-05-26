import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { WorkbenchOrchestrator } from "../orchestration/WorkbenchOrchestrator";
import { AutomationDaemon } from "./AutomationDaemon";
import { AutomationRunner } from "./AutomationRunner";
import { AutomationStore } from "./AutomationStore";
import { BackgroundWorker } from "./BackgroundWorker";

describe("BackgroundWorker", () => {
	it("queues events and executes matching automations", async () => {
		const dir = await mkdtemp(join(tmpdir(), "xexe-background-worker-"));
		try {
			const store = new AutomationStore(dir);
			const daemon = new AutomationDaemon(store);
			await daemon.bootstrapDefaults();
			const worker = new BackgroundWorker(daemon, new AutomationRunner(store, new WorkbenchOrchestrator({ root: dir })));
			const result = await worker.tick([{ trigger: "ci_failed" }]);
			expect(result.queued).toBeGreaterThan(0);
			expect(result.executed[0]?.taskId).toBeTruthy();
		} finally {
			await rm(dir, { recursive: true, force: true });
		}
	});
});
