import type { LiveMcpBinding, ProviderMcpBridge } from "./ProviderMcpBridge";
import type { McpServerConfig } from "../mcp/McpRegistry";

export type LiveMcpToolRecord = {
	name: string;
	description?: string;
};

export interface McpManagerAdapter {
	connect(server: McpServerConfig): Promise<{ tools?: LiveMcpToolRecord[] }>;
	disconnect?(serverId: string): Promise<void>;
}

export class LiveMcpManagerBridge implements Pick<ProviderMcpBridge, "bindMcpServer"> {
	constructor(private readonly manager: McpManagerAdapter) {}

	async bindMcpServer(server: McpServerConfig): Promise<LiveMcpBinding> {
		if (server.disabled) return { server, tools: [], connected: false };
		const connection = await this.manager.connect(server);
		return { server, tools: (connection.tools ?? []).map((tool) => tool.name), connected: true };
	}
}
