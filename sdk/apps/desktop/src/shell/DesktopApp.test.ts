import { describe, expect, it } from "vitest";
import { createDesktopAppState } from "./DesktopApp";
import { routeDesktopCommand } from "./DesktopCommandRouter";

describe("desktop app shell", () => {
	it("creates a desktop-first state with command palette entries", () => {
		const state = createDesktopAppState();
		expect(state.layout.mainPanels).toContain("editor");
		expect(state.layout.bottomPanels).toContain("terminal");
		expect(state.availableCommands.some((command) => command.command === "xexe.desktop.openWorkbench")).toBe(true);
	});

	it("routes commands to panels and modes", () => {
		const state = createDesktopAppState();
		const route = routeDesktopCommand("xexe.desktop.openTerminal", state);
		expect(route.matched).toBe(true);
		expect(route.panel).toBe("terminal");
		expect(route.mode).toBe("terminal");
	});
});
