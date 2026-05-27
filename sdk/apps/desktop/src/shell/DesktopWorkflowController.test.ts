import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { DesktopWorkflowController } from "./DesktopWorkflowController";

describe("DesktopWorkflowController", () => {
	it("creates tasks and routes panels", async () => {
		const dir = await mkdtemp(join(tmpdir(), "xexe-desktop-controller-"));
		try {
			const controller = new DesktopWorkflowController({ root: dir });
			const created = await controller.createTask("Ship visual Kanban");
			expect(created.task?.title).toBe("Ship visual Kanban");
			expect(created.state.activePanel).toBe("kanban");
			const routed = controller.routeCommand("xexe.desktop.openTerminal");
			expect(routed.state.activePanel).toBe("terminal");
			expect(routed.state.mode).toBe("terminal");
		} finally {
			await rm(dir, { recursive: true, force: true });
		}
	});
});
