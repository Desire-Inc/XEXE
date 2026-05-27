import { describe, expect, it } from "vitest";
import { createBugHuntReport } from "./BugHunt";

describe("createBugHuntReport", () => {
	it("passes built-in policy invariants", () => {
		const report = createBugHuntReport();
		expect(report.ok).toBe(true);
	});
});
