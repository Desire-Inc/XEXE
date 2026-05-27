export type DesktopHostCommandResult = {
	exitCode: number;
	stdout: string;
	stderr: string;
};

export type DesktopHostWorkspace = {
	rootPath: string;
	name: string;
};

export interface DesktopHost {
	pickWorkspace(): Promise<DesktopHostWorkspace | undefined>;
	readTextFile(path: string): Promise<string>;
	writeTextFile(path: string, content: string): Promise<void>;
	runTerminalCommand(command: string, args: string[], cwd: string): Promise<DesktopHostCommandResult>;
	openExternal(url: string): Promise<void>;
}

export class MemoryDesktopHost implements DesktopHost {
	readonly files = new Map<string, string>();
	readonly commands: Array<{ command: string; args: string[]; cwd: string }> = [];
	openedUrls: string[] = [];

	constructor(private readonly workspace?: DesktopHostWorkspace) {}

	async pickWorkspace(): Promise<DesktopHostWorkspace | undefined> {
		return this.workspace;
	}

	async readTextFile(path: string): Promise<string> {
		return this.files.get(path) ?? "";
	}

	async writeTextFile(path: string, content: string): Promise<void> {
		this.files.set(path, content);
	}

	async runTerminalCommand(command: string, args: string[], cwd: string): Promise<DesktopHostCommandResult> {
		this.commands.push({ command, args, cwd });
		return { exitCode: 0, stdout: `${command} ${args.join(" ")}`.trim(), stderr: "" };
	}

	async openExternal(url: string): Promise<void> {
		this.openedUrls.push(url);
	}
}
