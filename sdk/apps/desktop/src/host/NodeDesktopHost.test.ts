import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { NodeDesktopHost } from "./NodeDesktopHost";

describe("NodeDesktopHost", () => {
	it("reads and writes files for a real desktop host adapter", async () => {
		const dir = await mkdtemp(join(tmpdir(), "xexe-node-host-"));
		try {
			const host = new NodeDesktopHost({ workspacePath: dir });
			const file = join(dir, "note.txt");
			await host.writeTextFile(file, "hello");
			expect(await host.readTextFile(file)).toBe("hello");
			expect(await readFile(file, "utf8")).toBe("hello");
			expect((await host.pickWorkspace())?.rootPath).toBe(dir);
		} finally {
			await rm(dir, { recursive: true, force: true });
		}
	});
});
