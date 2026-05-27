import { spawn } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";

export type CommandResult = {
	command: string;
	args: string[];
	cwd: string;
	exitCode: number;
	stdout: string;
	stderr: string;
};

export type WorktreeCreateInput = {
	repoPath: string;
	taskId: string;
	branchName?: string;
	worktreesRoot?: string;
	baseRef?: string;
};

export type WorktreeCreateResult = {
	path: string;
	branchName: string;
	created: boolean;
	git: CommandResult;
};

export class WorktreeManager {
	async create(input: WorktreeCreateInput): Promise<WorktreeCreateResult> {
		const repoPath = resolve(input.repoPath);
		const safeTaskId = sanitizeBranchSegment(input.taskId);
		const branchName = input.branchName ?? `agent/${safeTaskId}`;
		const worktreesRoot = resolve(input.worktreesRoot ?? join(dirname(repoPath), `${basename(repoPath)}.worktrees`));
		const worktreePath = join(worktreesRoot, safeTaskId);
		await mkdir(worktreesRoot, { recursive: true });
		const args = ["worktree", "add", "-B", branchName, worktreePath];
		if (input.baseRef) args.push(input.baseRef);
		const git = await runCommand("git", args, repoPath);
		if (git.exitCode !== 0) throw new Error(`git worktree add failed: ${git.stderr || git.stdout}`);
		return { path: worktreePath, branchName, created: true, git };
	}

	async remove(repoPath: string, worktreePath: string, force = false): Promise<CommandResult> {
		const args = ["worktree", "remove"];
		if (force) args.push("--force");
		args.push(resolve(worktreePath));
		const result = await runCommand("git", args, resolve(repoPath));
		if (result.exitCode !== 0 && force) await rm(resolve(worktreePath), { recursive: true, force: true });
		return result;
	}

	async diff(worktreePath: string, baseRef = "HEAD"): Promise<CommandResult> {
		return runCommand("git", ["diff", baseRef], resolve(worktreePath));
	}

	async status(worktreePath: string): Promise<CommandResult> {
		return runCommand("git", ["status", "--short", "--branch"], resolve(worktreePath));
	}

	async rollback(worktreePath: string): Promise<CommandResult> {
		return runCommand("git", ["reset", "--hard", "HEAD"], resolve(worktreePath));
	}
}

export function sanitizeBranchSegment(value: string): string {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9._/-]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.replace(/\/{2,}/g, "/")
		.slice(0, 96) || "task";
}

export function runCommand(command: string, args: string[], cwd: string): Promise<CommandResult> {
	return new Promise((resolveResult, reject) => {
		const child = spawn(command, args, { cwd, shell: false });
		const stdout: Buffer[] = [];
		const stderr: Buffer[] = [];
		child.stdout?.on("data", (chunk) => stdout.push(Buffer.from(chunk)));
		child.stderr?.on("data", (chunk) => stderr.push(Buffer.from(chunk)));
		child.on("error", reject);
		child.on("close", (exitCode) => {
			resolveResult({
				command,
				args,
				cwd,
				exitCode: exitCode ?? 1,
				stdout: Buffer.concat(stdout).toString("utf8"),
				stderr: Buffer.concat(stderr).toString("utf8"),
			});
		});
	});
}
