import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { WorkbenchOrchestrator } from "../orchestration/WorkbenchOrchestrator";
import { AutomationDaemon } from "./AutomationDaemon";
import { AutomationRunner } from "./AutomationRunner";
import { AutomationStore } from "./AutomationStore";

describe("AutomationRunner", () => {
	it("turns queued automation runs into workbench tasks", async () => {
		const dir = await mkdtemp(join(tmpdir(), "xexe-automation-runner-"));
		try {
			const store = new AutomationStore(dir);
			const daemon = new AutomationDaemon(store);
			await daemon.bootstrapDefaults();
			await daemon.trigger({ trigger: "ci_failed" });
			const runner = new AutomationRunner(store, new WorkbenchOrchestrator({ root: dir }));
			const results = await runner.runQueued();
			expect(results[0]?.taskId).toBeTruthy();
		} finally {
			await rm(dir, { recursive: true, force: true });
		}
	});
});
