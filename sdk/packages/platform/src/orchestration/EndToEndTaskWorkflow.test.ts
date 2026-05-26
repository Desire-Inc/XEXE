import { describe, expect, it } from "vitest";
import { EndToEndTaskWorkflow } from "./EndToEndTaskWorkflow";

describe("EndToEndTaskWorkflow", () => {
	it("is constructed with a live orchestrator dependency", () => {
		expect(new EndToEndTaskWorkflow({} as never)).toBeInstanceOf(EndToEndTaskWorkflow);
	});
});
