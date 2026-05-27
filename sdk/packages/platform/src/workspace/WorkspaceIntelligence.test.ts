import { describe, expect, it } from "vitest";
import { buildImportGraph, rankFilesForTask, suggestRelatedTests } from "./WorkspaceIntelligence";
import type { WorkspaceIndex } from "./WorkspaceIndexer";

const index: WorkspaceIndex = {
	version: 1,
	root: "/repo",
	createdAt: new Date(0).toISOString(),
	files: [
		{ path: "src/auth.ts", extension: ".ts", bytes: 1, sha1: "a", imports: ["./token"], exports: ["AuthService"], headings: [] },
		{ path: "src/token.ts", extension: ".ts", bytes: 1, sha1: "b", imports: [], exports: ["TokenStore"], headings: [] },
		{ path: "src/auth.test.ts", extension: ".ts", bytes: 1, sha1: "c", imports: ["./auth"], exports: [], headings: [] },
	],
};

describe("WorkspaceIntelligence", () => {
	it("builds import graphs", () => {
		const graph = buildImportGraph(index);
		expect(graph.edges).toContainEqual({ from: "src/auth.ts", to: "src/token.ts" });
	});

	it("ranks files and suggests related tests", () => {
		expect(rankFilesForTask(index, "auth service")[0]?.path).toBe("src/auth.ts");
		expect(suggestRelatedTests(index, "src/auth.ts")[0]?.path).toBe("src/auth.test.ts");
	});
});
