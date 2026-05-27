import { describe, expect, it } from "vitest";
import { TauriDesktopHost, type TauriDesktopApi } from "./TauriDesktopHost";

describe("TauriDesktopHost", () => {
	it("delegates desktop host actions to injected Tauri commands", async () => {
		const calls: Array<{ command: string; args?: Record<string, unknown> }> = [];
		const api: TauriDesktopApi = {
			async invoke(command, args) {
				calls.push({ command, args });
				if (command === "xexe_pick_workspace") return { rootPath: "/repo", name: "repo" };
				if (command === "xexe_read_text_file") return "content";
				return undefined;
			},
		};
		const host = new TauriDesktopHost(api);
		expect((await host.pickWorkspace())?.rootPath).toBe("/repo");
		expect(await host.readTextFile("a.txt")).toBe("content");
		await host.writeTextFile("a.txt", "next");
		expect(calls.map((call) => call.command)).toContain("xexe_write_text_file");
	});
});
