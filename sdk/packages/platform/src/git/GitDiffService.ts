import { runCommand, type CommandResult } from "../worktrees/WorktreeManager";

export type GitDiffSummary = {
	worktreePath: string;
	baseRef: string;
	status: string;
	diff: string;
	filesChanged: string[];
};

export class GitDiffService {
	async summarize(worktreePath: string, baseRef = "HEAD"): Promise<GitDiffSummary> {
		const status = await runCommand("git", ["status", "--short"], worktreePath);
		const diff = await runCommand("git", ["diff", baseRef], worktreePath);
		return {
			worktreePath,
			baseRef,
			status: status.stdout,
			diff: diff.stdout,
			filesChanged: parseStatusFiles(status),
		};
	}

	async commit(worktreePath: string, message: string): Promise<CommandResult> {
		const add = await runCommand("git", ["add", "-A"], worktreePath);
		if (add.exitCode !== 0) return add;
		return runCommand("git", ["commit", "-m", message], worktreePath);
	}
}

function parseStatusFiles(result: CommandResult): string[] {
	return result.stdout
		.split("\n")
		.map((line) => line.trim().slice(2).trim())
		.filter(Boolean);
}
