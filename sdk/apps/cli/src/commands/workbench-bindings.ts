import { CompositeProviderMcpBridge, LiveMcpManagerBridge, LiveProviderSettingsBridge, type McpManagerAdapter, type ProviderSettingsSource } from "@xexe/platform";
import { resolveDefaultMcpSettingsPath, resolveMcpServerRegistrations } from "@cline/core";

export async function createClineProviderSettingsBridge() {
	const { ProviderSettingsManager } = await import("@cline/core");
	return new LiveProviderSettingsBridge(new ProviderSettingsManager() as ProviderSettingsSource);
}

export function createClineMcpSettingsBridge() {
	const manager: McpManagerAdapter = {
		async connect(server) {
			return { tools: [], server };
		},
	};
	return new LiveMcpManagerBridge(manager);
}

export async function createClineProviderMcpBridge() {
	return new CompositeProviderMcpBridge(await createClineProviderSettingsBridge(), createClineMcpSettingsBridge());
}

export function listClineMcpServers() {
	const filePath = resolveDefaultMcpSettingsPath();
	return resolveMcpServerRegistrations({ filePath }).map((registration) => ({
		id: registration.name,
		name: registration.name,
		transport: registration.transport.type,
		disabled: registration.disabled === true,
	}));
}
