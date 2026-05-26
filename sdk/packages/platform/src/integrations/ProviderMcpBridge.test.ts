import { describe, expect, it } from "vitest";
import { PlanningProviderMcpBridge } from "./ProviderMcpBridge";

describe("PlanningProviderMcpBridge", () => {
	it("binds providers and MCP servers in planning mode", async () => {
		const bridge = new PlanningProviderMcpBridge();
		const provider = await bridge.bindProvider({ id: "anthropic", name: "Anthropic", models: ["claude"], capabilities: ["chat"] });
		expect(provider.modelId).toBe("claude");
		const mcp = await bridge.bindMcpServer({ id: "github", name: "GitHub", transport: "streamable-http", url: "https://example.com" });
		expect(mcp.connected).toBe(true);
	});
});
