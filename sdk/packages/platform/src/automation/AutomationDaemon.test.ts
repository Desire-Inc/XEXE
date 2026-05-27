import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { AutomationStore } from "./AutomationStore";
import { AutomationDaemon } from "./AutomationDaemon";

describe("AutomationDaemon", () => {
	it("bootstraps defaults and queues matching runs", async () => {
		const dir = await mkdtemp(join(tmpdir(), "xexe-automation-"));
		try {
			const daemon = new AutomationDaemon(new AutomationStore(dir));
			await daemon.bootstrapDefaults();
			const results = await daemon.trigger({ trigger: "ci_failed", payload: { branch: "main" } });
			expect(results.length).toBeGreaterThan(0);
			const completed = await daemon.complete(results[0]?.run.id ?? "", true, ["done"]);
			expect(completed.status).toBe("succeeded");
		} finally {
			await rm(dir, { recursive: true, force: true });
		}
	});
});
