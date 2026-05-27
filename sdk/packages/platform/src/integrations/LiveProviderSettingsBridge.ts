import type { LiveProviderBinding, ProviderMcpBridge } from "./ProviderMcpBridge";
import type { McpServerConfig } from "../mcp/McpRegistry";
import type { ProviderProfile } from "../providers/ProviderRouter";

export type ProviderSettingsRecord = {
	provider: string;
	model?: string;
	baseUrl?: string;
	apiKey?: string;
	auth?: { accessToken?: string; apiKey?: string };
};

export interface ProviderSettingsSource {
	getProviderSettings(providerId: string): ProviderSettingsRecord | undefined;
	getLastUsedProviderSettings?(): ProviderSettingsRecord | undefined;
}

export class LiveProviderSettingsBridge implements Pick<ProviderMcpBridge, "bindProvider"> {
	constructor(private readonly source: ProviderSettingsSource) {}

	async bindProvider(profile: ProviderProfile): Promise<LiveProviderBinding> {
		const settings = this.source.getProviderSettings(profile.id) ?? this.source.getLastUsedProviderSettings?.();
		const modelId = settings?.model ?? profile.models[0] ?? "default";
		return {
			profile: {
				...profile,
				baseUrl: settings?.baseUrl ?? profile.baseUrl,
			},
			settingsKey: settings?.provider ?? profile.id,
			modelId,
		};
	}
}

export class CompositeProviderMcpBridge implements ProviderMcpBridge {
	constructor(
		private readonly providerBridge: Pick<ProviderMcpBridge, "bindProvider">,
		private readonly mcpBridge: Pick<ProviderMcpBridge, "bindMcpServer">,
	) {}

	bindProvider(profile: ProviderProfile): Promise<LiveProviderBinding> {
		return this.providerBridge.bindProvider(profile);
	}

	bindMcpServer(server: McpServerConfig) {
		return this.mcpBridge.bindMcpServer(server);
	}
}
