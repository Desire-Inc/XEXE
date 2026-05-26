import { runDesktopBackgroundProcess } from "./DesktopBackgroundProcess";

export type DesktopSupervisorOptions = {
	root: string;
	intervalMs?: number;
	onError?: (error: unknown) => void;
};

export class DesktopSupervisor {
	private controller?: AbortController;
	private running?: Promise<void>;

	start(options: DesktopSupervisorOptions): Promise<void> {
		if (this.running) return this.running;
		this.controller = new AbortController();
		this.running = runDesktopBackgroundProcess({ ...options, signal: this.controller.signal }).finally(() => {
			this.running = undefined;
			this.controller = undefined;
		});
		return this.running;
	}

	stop(): void {
		this.controller?.abort();
	}

	isRunning(): boolean {
		return !!this.running;
	}
}
