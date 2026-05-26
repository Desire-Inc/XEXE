import { AutomationDaemon, AutomationRunner, AutomationStore, BackgroundWorker, WorkbenchOrchestrator } from "@xexe/platform";

export type DesktopBackgroundProcessOptions = {
	root: string;
	intervalMs?: number;
	signal?: AbortSignal;
	onError?: (error: unknown) => void;
};

export async function runDesktopBackgroundProcess(options: DesktopBackgroundProcessOptions): Promise<void> {
	const store = new AutomationStore(options.root);
	const daemon = new AutomationDaemon(store);
	await daemon.bootstrapDefaults();
	const worker = new BackgroundWorker(daemon, new AutomationRunner(store, new WorkbenchOrchestrator({ root: options.root })));
	await worker.run({ intervalMs: options.intervalMs, signal: options.signal, onError: options.onError });
}
