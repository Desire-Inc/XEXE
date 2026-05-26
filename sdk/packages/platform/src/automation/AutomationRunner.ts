import type { AutomationRun, AutomationSpec } from "./Automation";
import { AutomationRegistry } from "./AutomationRegistry";
import { AutomationStore } from "./AutomationStore";
import type { WorkbenchOrchestrator } from "../orchestration/WorkbenchOrchestrator";

export type AutomationExecutionResult = {
	spec: AutomationSpec;
	run: AutomationRun;
	taskId?: string;
};

export class AutomationRunner {
	constructor(
		private readonly store: AutomationStore,
		private readonly orchestrator: WorkbenchOrchestrator,
	) {}

	async runQueued(): Promise<AutomationExecutionResult[]> {
		const registry = new AutomationRegistry(await this.store.read());
		const queuedRuns = registry.listRuns().filter((run) => run.status === "queued");
		const specs = registry.list();
		const results: AutomationExecutionResult[] = [];
		for (const queuedRun of queuedRuns) {
			const spec = specs.find((item) => item.id === queuedRun.specId);
			if (!spec) continue;
			registry.updateRun(queuedRun.id, { status: "running", logs: ["Starting automation run"] });
			const task = await this.orchestrator.createTask(spec.name, spec.prompt, spec.agent === "tester" ? "tester" : "planner");
			registry.updateRun(queuedRun.id, {
				status: "succeeded",
				finishedAt: new Date().toISOString(),
				logs: ["Created workbench task", task.id],
			});
			results.push({ spec, run: registry.listRuns().find((run) => run.id === queuedRun.id) ?? queuedRun, taskId: task.id });
		}
		await this.store.write(registry.snapshot());
		return results;
	}
}
