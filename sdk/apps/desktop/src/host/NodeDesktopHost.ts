import { spawn } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { basename } from "node:path";
import type { DesktopHost, DesktopHostCommandResult, DesktopHostWorkspace } from "./DesktopHost";

export type NodeDesktopHostOptions = {
	workspacePath?: string;
	openerCommand?: string;
};

export class NodeDesktopHost implements DesktopHost {
	constructor(private readonly options: NodeDesktopHostOptions = {}) {}

	async pickWorkspace(): Promise<DesktopHostWorkspace | undefined> {
		if (!this.options.workspacePath) return undefined;
		return { rootPath: this.options.workspacePath, name: basename(this.options.workspacePath) };
	}

	readTextFile(path: string): Promise<string> {
		return readFile(path, "utf8");
	}

	writeTextFile(path: string, content: string): Promise<void> {
		return writeFile(path, content, "utf8");
	}

	runTerminalCommand(command: string, args: string[], cwd: string): Promise<DesktopHostCommandResult> {
		return new Promise((resolveResult, reject) => {
			const child = spawn(command, args, { cwd, shell: false });
			const stdout: Buffer[] = [];
			const stderr: Buffer[] = [];
			child.stdout?.on("data", (chunk) => stdout.push(Buffer.from(chunk)));
			child.stderr?.on("data", (chunk) => stderr.push(Buffer.from(chunk)));
			child.on("error", reject);
			child.on("close", (exitCode) => resolveResult({ exitCode: exitCode ?? 1, stdout: Buffer.concat(stdout).toString("utf8"), stderr: Buffer.concat(stderr).toString("utf8") }));
		});
	}

	async openExternal(url: string): Promise<void> {
		const command = this.options.openerCommand ?? defaultOpenCommand();
		const args = process.platform === "win32" ? ["/c", "start", "", url] : [url];
		await this.runTerminalCommand(command, args, process.cwd());
	}
}

function defaultOpenCommand(): string {
	if (process.platform === "darwin") return "open";
	if (process.platform === "win32") return "cmd";
	return "xdg-open";
}
