import { createAutomationRun, type AutomationRun, type AutomationSpec, type AutomationTriggerType } from "./Automation";

export class AutomationRegistry {
	private readonly specs = new Map<string, AutomationSpec>();
	private readonly runs = new Map<string, AutomationRun>();

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

	listRuns(): AutomationRun[] {
		return [...this.runs.values()].sort((a, b) => b.startedAt.localeCompare(a.startedAt));
	}
}
