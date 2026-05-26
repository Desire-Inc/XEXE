import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { AutomationRun, AutomationSpec } from "./Automation";

export type AutomationStoreSnapshot = {
	version: 1;
	specs: AutomationSpec[];
	runs: AutomationRun[];
};

const EMPTY_AUTOMATION_SNAPSHOT: AutomationStoreSnapshot = { version: 1, specs: [], runs: [] };

export class AutomationStore {
	readonly filePath: string;

	constructor(rootDir: string, fileName = ".agent/automations.json") {
		this.filePath = join(rootDir, fileName);
	}

	async read(): Promise<AutomationStoreSnapshot> {
		try {
			const raw = await readFile(this.filePath, "utf8");
			const parsed = JSON.parse(raw) as Partial<AutomationStoreSnapshot>;
			return {
				version: 1,
				specs: parsed.specs ?? [],
				runs: parsed.runs ?? [],
			};
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code === "ENOENT") return EMPTY_AUTOMATION_SNAPSHOT;
			throw error;
		}
	}

	async write(snapshot: AutomationStoreSnapshot): Promise<void> {
		await mkdir(dirname(this.filePath), { recursive: true });
		const tmpPath = `${this.filePath}.tmp`;
		await writeFile(tmpPath, `${JSON.stringify(snapshot, null, "\t")}\n`, "utf8");
		await rename(tmpPath, this.filePath);
	}
}
