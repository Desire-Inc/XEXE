import type { McpServerConfig } from "../mcp/McpRegistry";
import type { ProviderProfile } from "../providers/ProviderRouter";

export type LiveProviderBinding = {
	profile: ProviderProfile;
	settingsKey: string;
	modelId: string;
};

export type LiveMcpBinding = {
	server: McpServerConfig;
	tools: string[];
	connected: boolean;
};

export interface ProviderMcpBridge {
	bindProvider(profile: ProviderProfile): Promise<LiveProviderBinding>;
	bindMcpServer(server: McpServerConfig): Promise<LiveMcpBinding>;
}

export class PlanningProviderMcpBridge implements ProviderMcpBridge {
	async bindProvider(profile: ProviderProfile): Promise<LiveProviderBinding> {
		return { profile, settingsKey: profile.id, modelId: profile.models[0] ?? "default" };
	}

	async bindMcpServer(server: McpServerConfig): Promise<LiveMcpBinding> {
		return { server, tools: [], connected: !server.disabled };
	}
}
