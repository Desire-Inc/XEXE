import { describe, expect, it } from "vitest";
import { createReleaseChecklist, isReleaseReady } from "./ReleaseChecklist";

describe("ReleaseChecklist", () => {
	it("requires mandatory items", () => {
		const checklist = createReleaseChecklist("0.1.0");
		expect(isReleaseReady(checklist)).toBe(false);
		for (const item of checklist.items) item.completed = true;
		expect(isReleaseReady(checklist)).toBe(true);
	});
});
