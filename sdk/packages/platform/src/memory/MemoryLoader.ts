import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

export type MemoryKind = "rule" | "skill" | "agent" | "command" | "memory";
export type MemoryRecord = { kind: MemoryKind; path: string; content: string };

const MEMORY_DIRS: Record<MemoryKind, string> = {
	rule: ".agent/rules",
	skill: ".agent/skills",
	agent: ".agent/agents",
	command: ".agent/commands",
	memory: ".agent/memory",
};

export class MemoryLoader {
	constructor(private readonly root: string) {}

	async loadAll(): Promise<MemoryRecord[]> {
		const groups = await Promise.all((Object.keys(MEMORY_DIRS) as MemoryKind[]).map((kind) => this.loadKind(kind)));
		return groups.flat();
	}

	async loadKind(kind: MemoryKind): Promise<MemoryRecord[]> {
		const dir = resolve(this.root, MEMORY_DIRS[kind]);
		try {
			const entries = await readdir(dir, { withFileTypes: true });
			const records: MemoryRecord[] = [];
			for (const entry of entries) {
				if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
				const path = join(dir, entry.name);
				records.push({ kind, path, content: await readFile(path, "utf8") });
			}
			return records;
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
			throw error;
		}
	}

	async buildSystemContext(): Promise<string> {
		const records = await this.loadAll();
		return records.map((record) => `## ${record.kind}: ${record.path}\n\n${record.content.trim()}`).join("\n\n---\n\n");
	}
}
