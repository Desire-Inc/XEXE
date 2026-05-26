import { describe, expect, it } from "vitest";
import { MemoryDesktopHost } from "./DesktopHost";
import { DesktopRuntime } from "./DesktopRuntime";

describe("DesktopRuntime", () => {
	it("adapts desktop workflow to a host", async () => {
		const host = new MemoryDesktopHost({ rootPath: "/repo", name: "repo" });
		const runtime = new DesktopRuntime({ root: "/repo", host });
		expect(await runtime.openWorkspace()).toBe("/repo");
		expect(await runtime.runCli(["doctor"])).toContain("xexe doctor");
		await runtime.openPullRequest("https://example.com/pr/1");
		expect(host.openedUrls).toEqual(["https://example.com/pr/1"]);
	});
});
