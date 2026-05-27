export type McpTransportType = "stdio" | "sse" | "streamable-http";
export type McpServerConfig = { id: string; name: string; transport: McpTransportType; command?: string; args?: string[]; url?: string; env?: Record<string, string>; disabled?: boolean; allowedAgents?: string[] };

export class McpRegistry {
	private readonly servers = new Map<string, McpServerConfig>();
	register(server: McpServerConfig): void { validateMcpServer(server); this.servers.set(server.id, server); }
	list(): McpServerConfig[] { return [...this.servers.values()].sort((a, b) => a.name.localeCompare(b.name)); }
	get(id: string): McpServerConfig | undefined { return this.servers.get(id); }
	setDisabled(id: string, disabled: boolean): McpServerConfig {
		const server = this.servers.get(id);
		if (!server) throw new Error(`MCP server not found: ${id}`);
		const updated = { ...server, disabled };
		this.servers.set(id, updated);
		return updated;
	}
	allowedForAgent(agentId: string): McpServerConfig[] {
		return this.list().filter((server) => !server.disabled && (!server.allowedAgents || server.allowedAgents.includes(agentId)));
	}
}

export function validateMcpServer(server: McpServerConfig): void {
	if (!server.id.trim()) throw new Error("MCP server id is required");
	if (!server.name.trim()) throw new Error("MCP server name is required");
	if (server.transport === "stdio" && !server.command) throw new Error("stdio MCP servers require command");
	if ((server.transport === "sse" || server.transport === "streamable-http") && !server.url) throw new Error(`${server.transport} MCP servers require url`);
}
