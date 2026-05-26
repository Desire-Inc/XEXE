export type SecretFinding = {
	kind: "api-key" | "private-key" | "token" | "password";
	line: number;
	preview: string;
};

const SECRET_PATTERNS: Array<{ kind: SecretFinding["kind"]; pattern: RegExp }> = [
	{ kind: "private-key", pattern: /-----BEGIN (?:RSA |EC |OPENSSH |)?PRIVATE KEY-----/i },
	{ kind: "api-key", pattern: /\b(?:sk-ant|sk-proj|sk-[A-Za-z0-9])[A-Za-z0-9_-]{16,}\b/ },
	{ kind: "token", pattern: /\b(?:ghp|github_pat|glpat)-?[A-Za-z0-9_]{20,}\b/ },
	{ kind: "password", pattern: /(?:password|passwd|pwd)\s*[:=]\s*["'][^"']{8,}["']/i },
];

export function scanTextForSecrets(text: string): SecretFinding[] {
	const findings: SecretFinding[] = [];
	const lines = text.split(/\r?\n/);
	lines.forEach((line, index) => {
		for (const item of SECRET_PATTERNS) {
			if (item.pattern.test(line)) {
				findings.push({ kind: item.kind, line: index + 1, preview: redact(line) });
			}
		}
	});
	return findings;
}

function redact(value: string): string {
	return value.length <= 12 ? "[redacted]" : `${value.slice(0, 6)}…${value.slice(-4)}`;
}
