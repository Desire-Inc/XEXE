export type CustomDistribution = {
	id: string;
	name: string;
	branding: {
		displayName: string;
		icon?: string;
		primaryColor?: string;
	};
	defaultProviders: string[];
	defaultMcpServers: string[];
	defaultAgents: string[];
	defaultSkills: string[];
	defaultRules: string[];
};

export const DEFAULT_XEXE_DISTRIBUTION: CustomDistribution = {
	id: "xexe-dev-workbench",
	name: "XEXE Developer Workbench",
	branding: {
		displayName: "XEXE",
		primaryColor: "#7C3AED",
	},
	defaultProviders: ["anthropic", "openai", "google", "openrouter", "ollama"],
	defaultMcpServers: ["github", "notion", "linear", "filesystem"],
	defaultAgents: ["architect", "planner", "researcher", "builder", "reviewer", "tester", "debugger", "committer", "release"],
	defaultSkills: ["execute-plan", "github-pr-description", "debug-failing-test", "security-review", "create-release"],
	defaultRules: ["xexe-platform"],
};

export function validateDistribution(distribution: CustomDistribution): string[] {
	const errors: string[] = [];
	if (!distribution.id.trim()) errors.push("Distribution id is required");
	if (!distribution.name.trim()) errors.push("Distribution name is required");
	if (!distribution.branding.displayName.trim()) errors.push("Display name is required");
	if (distribution.defaultAgents.length === 0) errors.push("At least one default agent is required");
	return errors;
}
