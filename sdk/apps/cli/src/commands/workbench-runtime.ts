import { ClineRuntimeBridge, type ClineAgentRunOutput, type ClineAgentRunner } from "@xexe/platform";
import type { Config } from "../utils/types";
import { runAgent } from "../runtime/run-agent";

export type ClineWorkbenchRunnerOptions = {
	config: Config;
};

export class ClineCliAgentRunner implements ClineAgentRunner {
	constructor(private readonly options: ClineWorkbenchRunnerOptions) {}

	async run(input: Parameters<ClineAgentRunner["run"]>[0]): Promise<ClineAgentRunOutput> {
		const config: Config = {
			...this.options.config,
			cwd: input.cwd,
			workspaceRoot: input.cwd,
			systemPrompt: [this.options.config.systemPrompt, input.systemContext].filter(Boolean).join("\n\n"),
			outputMode: "json",
			verbose: false,
		};
		await runAgent(input.prompt, config);
		return {
			ok: process.exitCode === undefined || process.exitCode === 0,
			summary: "Cline runAgent completed for XEXE workbench task.",
			logs: ["runAgent completed", `cwd=${input.cwd}`],
		};
	}
}

export function createClineCliRuntimeBridge(config: Config): ClineRuntimeBridge {
	return new ClineRuntimeBridge(new ClineCliAgentRunner({ config }));
}
