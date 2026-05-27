import { describe, expect, it } from "vitest";
import { AutomationRegistry } from "./AutomationRegistry";

const spec = {
	id: "ci-fixer",
	name: "CI Fixer",
	trigger: "ci_failed" as const,
	enabled: true,
	agent: "tester",
	prompt: "Fix CI",
};

describe("AutomationRegistry", () => {
	it("snapshots specs and runs", () => {
		const registry = new AutomationRegistry();
		registry.register(spec);
		const run = registry.queueRun(spec.id);
		registry.updateRun(run.id, { status: "running", logs: ["started"] });
		const snapshot = registry.snapshot();
		expect(snapshot.specs).toHaveLength(1);
		expect(snapshot.runs[0]?.status).toBe("running");
		expect(new AutomationRegistry(snapshot).listRuns()).toHaveLength(1);
	});
});
