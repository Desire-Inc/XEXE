import { runWorkbenchCli, type WorkbenchCliOptions } from "@xexe/platform/cli";

export type WorkbenchCommandIo = {
	writeln: (message: string) => void;
	writeErr: (message: string) => void;
};

export type RunWorkbenchCommandOptions = {
	args: string[];
	cwd: string;
	io: WorkbenchCommandIo;
	workbench?: WorkbenchCliOptions;
};

export async function runWorkbenchCommand(options: RunWorkbenchCommandOptions): Promise<number> {
	const originalLog = console.log;
	const originalError = console.error;
	try {
		console.log = (...args: unknown[]) => options.io.writeln(args.map(String).join(" "));
		console.error = (...args: unknown[]) => options.io.writeErr(args.map(String).join(" "));
		return await runWorkbenchCli(options.args, options.cwd, options.workbench);
	} finally {
		console.log = originalLog;
		console.error = originalError;
	}
}
