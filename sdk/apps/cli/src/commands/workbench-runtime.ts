import { spawn } from "node:child_process";
import { ClineRuntimeBridge, type ClineAgentRunInput, type ClineAgentRunOutput, type ClineAgentRunner } from "@xexe/platform";
import type { Config } from "../utils/types";
import { runAgent } from "../runtime/run-agent";

export type ClineWorkbenchRunnerOptions = {
	config: Config;
};

export class ClineCliAgentRunner implements ClineAgentRunner {
	constructor(private readonly options: ClineWorkbenchRunnerOptions) {}

	async run(input: ClineAgentRunInput): Promise<ClineAgentRunOutput> {
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

export class ClineCliProcessRunner implements ClineAgentRunner {
	constructor(private readonly entrypoint = process.argv[1]) {}

	async run(input: ClineAgentRunInput): Promise<ClineAgentRunOutput> {
		if (!this.entrypoint) throw new Error("Cline CLI entrypoint is not available");
		const prompt = [input.systemContext, input.prompt].filter(Boolean).join("\n\n");
		const result = await runCliProcess(process.execPath, [this.entrypoint, "--cwd", input.cwd, "--output", "json", prompt], input.cwd);
		return {
			ok: result.exitCode === 0,
			summary: result.exitCode === 0 ? "Cline CLI process completed for XEXE workbench task." : "Cline CLI process failed for XEXE workbench task.",
			logs: [result.stdout, result.stderr].filter(Boolean),
		};
	}
}

export function createClineCliRuntimeBridge(config: Config): ClineRuntimeBridge {
	return new ClineRuntimeBridge(new ClineCliAgentRunner({ config }));
}

export function createClineCliProcessRuntimeBridge(entrypoint?: string): ClineRuntimeBridge {
	return new ClineRuntimeBridge(new ClineCliProcessRunner(entrypoint));
}

function runCliProcess(command: string, args: string[], cwd: string): Promise<{ exitCode: number; stdout: string; stderr: string }> {
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
