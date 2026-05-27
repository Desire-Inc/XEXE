import type { DesktopHost, DesktopHostCommandResult, DesktopHostWorkspace } from "./DesktopHost";

export type TauriDesktopApi = {
	invoke<T = unknown>(command: string, args?: Record<string, unknown>): Promise<T>;
	open?(url: string): Promise<void>;
};

export class TauriDesktopHost implements DesktopHost {
	constructor(private readonly api: TauriDesktopApi) {}

	pickWorkspace(): Promise<DesktopHostWorkspace | undefined> {
		return this.api.invoke<DesktopHostWorkspace | undefined>("xexe_pick_workspace");
	}

	readTextFile(path: string): Promise<string> {
		return this.api.invoke<string>("xexe_read_text_file", { path });
	}

	writeTextFile(path: string, content: string): Promise<void> {
		return this.api.invoke<void>("xexe_write_text_file", { path, content });
	}

	runTerminalCommand(command: string, args: string[], cwd: string): Promise<DesktopHostCommandResult> {
		return this.api.invoke<DesktopHostCommandResult>("xexe_run_terminal_command", { command, args, cwd });
	}

	async openExternal(url: string): Promise<void> {
		if (this.api.open) {
			await this.api.open(url);
			return;
		}
		await this.api.invoke<void>("xexe_open_external", { url });
	}
}
