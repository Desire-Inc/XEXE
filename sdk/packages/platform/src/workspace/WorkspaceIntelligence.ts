import type { WorkspaceFileRecord, WorkspaceIndex } from "./WorkspaceIndexer";

export type ImportGraphEdge = {
	from: string;
	to: string;
};

export type ImportGraph = {
	nodes: string[];
	edges: ImportGraphEdge[];
};

export type RankedWorkspaceFile = WorkspaceFileRecord & {
	score: number;
	reasons: string[];
};

export function buildImportGraph(index: WorkspaceIndex): ImportGraph {
	const pathSet = new Set(index.files.map((file) => normalizePath(file.path)));
	const edges: ImportGraphEdge[] = [];
	for (const file of index.files) {
		for (const imported of file.imports) {
			const resolved = resolveImportPath(file.path, imported, pathSet);
			if (resolved) edges.push({ from: file.path, to: resolved });
		}
	}
	return { nodes: [...pathSet].sort(), edges };
}

export function rankFilesForTask(index: WorkspaceIndex, query: string, limit = 20): RankedWorkspaceFile[] {
	const terms = tokenize(query);
	return index.files
		.map((file) => rankFile(file, terms))
		.filter((file) => file.score > 0)
		.sort((a, b) => b.score - a.score || a.path.localeCompare(b.path))
		.slice(0, limit);
}

export function suggestRelatedTests(index: WorkspaceIndex, filePath: string): WorkspaceFileRecord[] {
	const normalized = normalizePath(filePath);
	const baseName = normalized.split("/").pop()?.replace(/\.[^.]+$/, "") ?? normalized;
	return index.files.filter((file) => {
		const path = normalizePath(file.path).toLowerCase();
		return (path.includes("test") || path.includes("spec")) && path.includes(baseName.toLowerCase());
	});
}

function rankFile(file: WorkspaceFileRecord, terms: string[]): RankedWorkspaceFile {
	const reasons: string[] = [];
	let score = 0;
	const path = file.path.toLowerCase();
	const symbols = [...file.exports, ...file.headings].join(" ").toLowerCase();
	const imports = file.imports.join(" ").toLowerCase();
	for (const term of terms) {
		if (path.includes(term)) {
			score += 5;
			reasons.push(`path:${term}`);
		}
		if (symbols.includes(term)) {
			score += 4;
			reasons.push(`symbol:${term}`);
		}
		if (imports.includes(term)) {
			score += 2;
			reasons.push(`import:${term}`);
		}
	}
	return { ...file, score, reasons };
}

function resolveImportPath(from: string, imported: string, paths: Set<string>): string | undefined {
	if (!imported.startsWith(".")) return undefined;
	const baseParts = normalizePath(from).split("/").slice(0, -1);
	const importedParts = imported.split("/");
	const candidateParts: string[] = [...baseParts];
	for (const part of importedParts) {
		if (part === "." || part === "") continue;
		if (part === "..") candidateParts.pop();
		else candidateParts.push(part);
	}
	const candidate = candidateParts.join("/");
	const candidates = [candidate, `${candidate}.ts`, `${candidate}.tsx`, `${candidate}.js`, `${candidate}.jsx`, `${candidate}/index.ts`, `${candidate}/index.tsx`];
	return candidates.find((item) => paths.has(item));
}

function normalizePath(path: string): string {
	return path.replace(/\\/g, "/");
}

function tokenize(text: string): string[] {
	return text.toLowerCase().split(/[^a-z0-9_/-]+/).filter((term) => term.length > 1);
}
