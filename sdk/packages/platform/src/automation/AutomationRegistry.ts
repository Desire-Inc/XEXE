import { createAutomationRun, type AutomationRun, type AutomationSpec, type AutomationTriggerType } from "./Automation";

export type AutomationRegistrySnapshot = {
	version: 1;
	specs: AutomationSpec[];
	runs: AutomationRun[];
};

export class AutomationRegistry {
	private readonly specs = new Map<string, AutomationSpec>();
	private readonly runs = new Map<string, AutomationRun>();

	constructor(snapshot?: Partial<AutomationRegistrySnapshot>) {
		for (const spec of snapshot?.specs ?? []) this.register(spec);
		for (const run of snapshot?.runs ?? []) this.runs.set(run.id, run);
	}

	register(spec: AutomationSpec): void {
		if (!spec.id.trim()) throw new Error("Automation id is required");
		if (!spec.name.trim()) throw new Error("Automation name is required");
		this.specs.set(spec.id, spec);
	}

	list(): AutomationSpec[] {
		return [...this.specs.values()].sort((a, b) => a.name.localeCompare(b.name));
	}

	findByTrigger(trigger: AutomationTriggerType): AutomationSpec[] {
		return this.list().filter((spec) => spec.enabled && spec.trigger === trigger);
	}

	queueRun(specId: string): AutomationRun {
		if (!this.specs.has(specId)) throw new Error(`Automation not found: ${specId}`);
		const run = createAutomationRun(specId);
		this.runs.set(run.id, run);
		return run;
	}

	updateRun(runId: string, updates: Partial<Omit<AutomationRun, "id" | "specId" | "startedAt">>): AutomationRun {
		const run = this.runs.get(runId);
		if (!run) throw new Error(`Automation run not found: ${runId}`);
		const updated = { ...run, ...updates };
		this.runs.set(runId, updated);
		return updated;
	}

	listRuns(): AutomationRun[] {
		return [...this.runs.values()].sort((a, b) => b.startedAt.localeCompare(a.startedAt));
	}

	snapshot(): AutomationRegistrySnapshot {
		return { version: 1, specs: this.list(), runs: this.listRuns() };
	}
}
