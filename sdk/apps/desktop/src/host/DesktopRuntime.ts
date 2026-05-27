import { DesktopWorkflowController, type DesktopWorkflowControllerOptions } from "../shell/DesktopWorkflowController";
import type { DesktopHost } from "./DesktopHost";

export type DesktopRuntimeOptions = DesktopWorkflowControllerOptions & {
	host: DesktopHost;
};

export class DesktopRuntime {
	readonly controller: DesktopWorkflowController;

	constructor(readonly options: DesktopRuntimeOptions) {
		this.controller = new DesktopWorkflowController(options);
	}

	async openWorkspace(): Promise<string | undefined> {
		const workspace = await this.options.host.pickWorkspace();
		if (!workspace) return undefined;
		await this.controller.refresh();
		return workspace.rootPath;
	}

	async runCli(args: string[]): Promise<string> {
		const result = await this.options.host.runTerminalCommand("xexe", args, this.options.root);
		if (result.exitCode !== 0) throw new Error(result.stderr || `xexe ${args.join(" ")} failed`);
		return result.stdout;
	}

	async openPullRequest(url: string): Promise<void> {
		await this.options.host.openExternal(url);
	}
}
