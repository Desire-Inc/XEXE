export type ShellPrefixCommand = {
	name: string;
	alias?: string;
	description: string;
	agent?: string;
};

export const DEFAULT_SHELL_PREFIX_COMMANDS: ShellPrefixCommand[] = [
	{ name: "ask", description: "Ask a read-only research question", agent: "researcher" },
	{ name: "plan", description: "Create an implementation plan", agent: "planner" },
	{ name: "build", description: "Implement an approved plan", agent: "builder" },
	{ name: "review", description: "Review current task diff", agent: "reviewer" },
	{ name: "test", description: "Run test/lint/typecheck workflow", agent: "tester" },
	{ name: "commit", description: "Prepare commit and PR description", agent: "committer" },
	{ name: "suggest", description: "Translate natural language into a shell command", agent: "researcher" },
];

export function parseShellPrefix(input: string): { command: string; prompt: string } | undefined {
	const trimmed = input.trim();
	if (!trimmed.startsWith(":")) return undefined;
	const withoutPrefix = trimmed.slice(1).trim();
	const [command = "ask", ...rest] = withoutPrefix.split(/\s+/);
	return { command, prompt: rest.join(" ").trim() };
}

export function renderZshShim(binary = "xexe"): string {
	return [
		"# XEXE shell prefix shim",
		"# Add to ~/.zshrc after installing xexe.",
		"function xexe_colon_prefix() {",
		"  if [[ $BUFFER == :* ]]; then",
		"    local prompt=\"${BUFFER#:}\"",
		`    BUFFER="${binary} shell \\\"$prompt\\\""`,
		"    zle accept-line",
		"  else",
		"    zle accept-line",
		"  fi",
		"}",
		"zle -N xexe_colon_prefix",
		"bindkey '^M' xexe_colon_prefix",
		"",
	].join("\n");
}
