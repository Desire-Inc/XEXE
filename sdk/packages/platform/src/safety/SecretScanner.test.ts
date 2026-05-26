import { describe, expect, it } from "vitest";
import { scanTextForSecrets } from "./SecretScanner";

describe("scanTextForSecrets", () => {
	it("finds private keys", () => {
		expect(scanTextForSecrets("-----BEGIN PRIVATE KEY-----")).toHaveLength(1);
	});

	it("finds password assignments", () => {
		const findings = scanTextForSecrets("password = 'super-secret-password'");
		expect(findings[0]?.kind).toBe("password");
	});
});
