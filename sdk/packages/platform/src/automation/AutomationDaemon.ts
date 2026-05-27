import { DEFAULT_AUTOMATION_TEMPLATES } from "./AutomationTemplates";
import { AutomationRegistry } from "./AutomationRegistry";
import { AutomationStore } from "./AutomationStore";
import type { AutomationRun, AutomationSpec, AutomationTriggerType } from "./Automation";

export type AutomationDaemonEvent = {
	trigger: AutomationTriggerType;
	payload?: Record<string, unknown>;
};

export type AutomationDaemonRunResult = {
	spec: AutomationSpec;
	run: AutomationRun;
};

export class AutomationDaemon {
	constructor(private readonly store: AutomationStore) {}

	async bootstrapDefaults(): Promise<AutomationRegistry> {
		const registry = new AutomationRegistry(await this.store.read());
		for (const spec of DEFAULT_AUTOMATION_TEMPLATES) {
			if (!registry.list().some((existing) => existing.id === spec.id)) registry.register(spec);
		}
		await this.store.write(registry.snapshot());
		return registry;
	}

	async trigger(event: AutomationDaemonEvent): Promise<AutomationDaemonRunResult[]> {
		const registry = new AutomationRegistry(await this.store.read());
		const specs = registry.findByTrigger(event.trigger).filter((spec) => matchesConditions(spec, event.payload ?? {}));
		const results = specs.map((spec) => ({ spec, run: registry.queueRun(spec.id) }));
		await this.store.write(registry.snapshot());
		return results;
	}

	async complete(runId: string, ok: boolean, logs: string[] = []): Promise<AutomationRun> {
		const registry = new AutomationRegistry(await this.store.read());
		const run = registry.updateRun(runId, { status: ok ? "succeeded" : "failed", finishedAt: new Date().toISOString(), logs });
		await this.store.write(registry.snapshot());
		return run;
	}
}

function matchesConditions(spec: AutomationSpec, payload: Record<string, unknown>): boolean {
	const conditions = spec.conditions ?? {};
	for (const [key, expected] of Object.entries(conditions)) {
		if (key === "cron") continue;
		if (payload[key] !== expected) return false;
	}
	return true;
}
