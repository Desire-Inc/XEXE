import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { dirname, extname, join, relative, resolve } from "node:path";

export type WorkspaceFileRecord = {
	path: string;
	extension: string;
	bytes: number;
	sha1: string;
	imports: string[];
	exports: string[];
	headings: string[];
};

export type WorkspaceIndex = {
	version: 1;
	root: string;
	createdAt: string;
	files: WorkspaceFileRecord[];
};

export type WorkspaceIndexerOptions = {
	root: string;
	ignore?: string[];
	maxFileBytes?: number;
	indexPath?: string;
};

const DEFAULT_IGNORE = [".git", "node_modules", "dist", "build", "out", "coverage", ".next", ".turbo", ".cache", "target", "vendor"];
const TEXT_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".json", ".md", ".mdx", ".yml", ".yaml", ".toml", ".rs", ".go", ".py", ".sh", ".css", ".html"]);

export class WorkspaceIndexer {
	readonly root: string;
	readonly indexPath: string;
	private readonly ignore: string[];
	private readonly maxFileBytes: number;

	constructor(options: WorkspaceIndexerOptions) {
		this.root = resolve(options.root);
		this.ignore = [...DEFAULT_IGNORE, ...(options.ignore ?? [])];
		this.maxFileBytes = options.maxFileBytes ?? 512_000;
		this.indexPath = options.indexPath ?? join(this.root, ".agent/workspace-index.json");
	}

	async sync(): Promise<WorkspaceIndex> {
		const files = await this.walk(this.root);
		const index: WorkspaceIndex = { version: 1, root: this.root, createdAt: new Date().toISOString(), files };
		await mkdir(dirname(this.indexPath), { recursive: true });
		await writeFile(this.indexPath, `${JSON.stringify(index, null, "\t")}\n`, "utf8");
		return index;
	}

	async load(): Promise<WorkspaceIndex> {
		return JSON.parse(await readFile(this.indexPath, "utf8")) as WorkspaceIndex;
	}

	async query(text: string, limit = 20): Promise<WorkspaceFileRecord[]> {
		const index = await this.load();
		const terms = tokenize(text);
		return index.files
			.map((file) => ({ file, score: scoreFile(file, terms) }))
			.filter((item) => item.score > 0)
			.sort((a, b) => b.score - a.score || a.file.path.localeCompare(b.file.path))
			.slice(0, limit)
			.map((item) => item.file);
	}

	private async walk(dir: string): Promise<WorkspaceFileRecord[]> {
		const entries = await readdir(dir, { withFileTypes: true });
		const records: WorkspaceFileRecord[] = [];
		for (const entry of entries) {
			if (this.ignore.includes(entry.name)) continue;
			const absolute = join(dir, entry.name);
			const rel = relative(this.root, absolute);
			if (entry.isDirectory()) {
				records.push(...(await this.walk(absolute)));
				continue;
			}
			if (!entry.isFile()) continue;
			const extension = extname(entry.name).toLowerCase();
			if (!TEXT_EXTENSIONS.has(extension)) continue;
			const info = await stat(absolute);
			if (info.size > this.maxFileBytes) continue;
			const content = await readFile(absolute, "utf8");
			records.push({ path: rel, extension, bytes: info.size, sha1: createHash("sha1").update(content).digest("hex"), imports: extractImports(content), exports: extractExports(content), headings: extractHeadings(content) });
		}
		return records;
	}
}

function extractImports(content: string): string[] {
	const matches = content.matchAll(/(?:import|from)\s+(?:[^"']*?\s+from\s+)?["']([^"']+)["']/g);
	return [...new Set([...matches].map((match) => match[1]).filter(Boolean))];
}
function extractExports(content: string): string[] {
	const matches = content.matchAll(/export\s+(?:class|function|const|type|interface|enum)\s+([A-Za-z0-9_]+)/g);
	return [...new Set([...matches].map((match) => match[1]).filter(Boolean))];
}
function extractHeadings(content: string): string[] {
	return [...content.matchAll(/^#{1,6}\s+(.+)$/gm)].map((match) => match[1].trim()).filter(Boolean);
}
function tokenize(text: string): string[] {
	return text.toLowerCase().split(/[^a-z0-9_/-]+/).filter((term) => term.length > 1);
}
function scoreFile(file: WorkspaceFileRecord, terms: string[]): number {
	const haystack = [file.path, file.extension, ...file.imports, ...file.exports, ...file.headings].join(" ").toLowerCase();
	return terms.reduce((score, term) => score + (haystack.includes(term) ? 1 : 0), 0);
}
