import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { WorkspaceIndexer } from "./WorkspaceIndexer";

describe("WorkspaceIndexer", () => {
	it("indexes files and queries by symbol", async () => {
		const dir = await mkdtemp(join(tmpdir(), "xexe-index-"));
		try {
			await mkdir(join(dir, "src"));
			await writeFile(join(dir, "src/auth.ts"), "export function login() { return true }\n", "utf8");
			const indexer = new WorkspaceIndexer({ root: dir });
			const index = await indexer.sync();
			expect(index.files).toHaveLength(1);
			const results = await indexer.query("login");
			expect(results[0]?.path).toBe("src/auth.ts");
		} finally {
			await rm(dir, { recursive: true, force: true });
		}
	});
});
