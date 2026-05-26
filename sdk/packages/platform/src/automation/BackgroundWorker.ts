import type { AutomationDaemonEvent } from "./AutomationDaemon";
import { AutomationDaemon } from "./AutomationDaemon";
import { AutomationRunner, type AutomationExecutionResult } from "./AutomationRunner";

export type BackgroundWorkerTickResult = {
	queued: number;
	executed: AutomationExecutionResult[];
};

export type BackgroundWorkerOptions = {
	intervalMs?: number;
	onError?: (error: unknown) => void;
	signal?: AbortSignal;
};

export class BackgroundWorker {
	constructor(
		private readonly daemon: AutomationDaemon,
		private readonly runner: AutomationRunner,
	) {}

	async tick(events: AutomationDaemonEvent[] = []): Promise<BackgroundWorkerTickResult> {
		let queued = 0;
		for (const event of events) {
			queued += (await this.daemon.trigger(event)).length;
		}
		const executed = await this.runner.runQueued();
		return { queued, executed };
	}

	async run(options: BackgroundWorkerOptions = {}): Promise<void> {
		const intervalMs = options.intervalMs ?? 30_000;
		while (!options.signal?.aborted) {
			try {
				await this.tick();
			} catch (error) {
				options.onError?.(error);
			}
			await sleep(intervalMs, options.signal);
		}
	}
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
	return new Promise((resolve) => {
		if (signal?.aborted) {
			resolve();
			return;
		}
		const timeout = setTimeout(resolve, ms);
		signal?.addEventListener("abort", () => {
			clearTimeout(timeout);
			resolve();
		}, { once: true });
	});
}
