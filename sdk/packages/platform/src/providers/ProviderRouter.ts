export type ProviderCapability = "chat" | "tools" | "vision" | "reasoning" | "local" | "embeddings";
export type ProviderProfile = { id: string; name: string; baseUrl?: string; models: string[]; capabilities: ProviderCapability[]; priority?: number };
export type ProviderSelectionInput = { preferredProviderId?: string; requiredCapabilities?: ProviderCapability[]; preferredModel?: string };

export class ProviderRouter {
	private readonly providers = new Map<string, ProviderProfile>();
	register(profile: ProviderProfile): void { this.providers.set(profile.id, profile); }
	list(): ProviderProfile[] { return [...this.providers.values()].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0)); }
	select(input: ProviderSelectionInput = {}): ProviderProfile | undefined {
		return this.list().filter((provider) => {
			if (input.preferredProviderId && provider.id !== input.preferredProviderId) return false;
			if (input.preferredModel && !provider.models.includes(input.preferredModel)) return false;
			return (input.requiredCapabilities ?? []).every((capability) => provider.capabilities.includes(capability));
		})[0];
	}
}

export function createDefaultProviderRouter(): ProviderRouter {
	const router = new ProviderRouter();
	router.register({ id: "anthropic", name: "Anthropic", models: ["claude-sonnet", "claude-opus"], capabilities: ["chat", "tools", "vision", "reasoning"], priority: 100 });
	router.register({ id: "openai", name: "OpenAI", models: ["gpt-4.1", "o3", "o4-mini"], capabilities: ["chat", "tools", "vision", "reasoning"], priority: 90 });
	router.register({ id: "google", name: "Google Gemini", models: ["gemini-2.5-pro", "gemini-2.0-flash"], capabilities: ["chat", "tools", "vision", "reasoning"], priority: 80 });
	router.register({ id: "openrouter", name: "OpenRouter", models: ["openrouter/auto"], capabilities: ["chat", "tools", "vision"], priority: 70 });
	router.register({ id: "ollama", name: "Ollama", baseUrl: "http://localhost:11434", models: ["qwen2.5-coder", "llama3.1"], capabilities: ["chat", "local"], priority: 40 });
	return router;
}
