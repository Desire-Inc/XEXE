import { runCommand, type CommandResult } from "../worktrees/WorktreeManager";

export type TestCommand = {
	name: string;
	command: string;
	args: string[];
};

export type TestRunResult = {
	ok: boolean;
	worktreePath: string;
	results: Array<CommandResult & { name: string }>;
};

export const DEFAULT_TEST_COMMANDS: TestCommand[] = [
	{ name: "typecheck", command: "bun", args: ["-F", "@xexe/platform", "typecheck"] },
	{ name: "test", command: "bun", args: ["-F", "@xexe/platform", "test"] },
	{ name: "build", command: "bun", args: ["-F", "@xexe/platform", "build"] },
];

export class TestRunner {
	constructor(private readonly commands: TestCommand[] = DEFAULT_TEST_COMMANDS) {}

	async run(worktreePath: string): Promise<TestRunResult> {
		const results: Array<CommandResult & { name: string }> = [];
		for (const item of this.commands) {
			const result = await runCommand(item.command, item.args, worktreePath);
			results.push({ ...result, name: item.name });
			if (result.exitCode !== 0) break;
		}
		return { ok: results.every((result) => result.exitCode === 0), worktreePath, results };
	}
}
