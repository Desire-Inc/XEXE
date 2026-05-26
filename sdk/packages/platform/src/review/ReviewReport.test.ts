import { describe, expect, it } from "vitest";
import { deriveReviewStatus } from "./ReviewReport";

describe("deriveReviewStatus", () => {
	it("blocks on blocker findings", () => {
		expect(deriveReviewStatus([{ severity: "blocker", title: "Secret", description: "Potential secret" }])).toBe("blocked");
	});

	it("requests changes on warnings", () => {
		expect(deriveReviewStatus([{ severity: "warning", title: "Missing test", description: "Add test" }])).toBe("changes_requested");
	});

	it("approves clean reports", () => {
		expect(deriveReviewStatus([])).toBe("approved");
	});
});
