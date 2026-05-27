import { describe, expect, it } from "vitest";
import { parseShellPrefix, renderZshShim } from "./ShellPrefix";

describe("ShellPrefix", () => {
	it("parses colon-prefixed commands", () => {
		expect(parseShellPrefix(":build fix typecheck")).toEqual({ command: "build", prompt: "fix typecheck" });
		expect(parseShellPrefix("plain command")).toBeUndefined();
	});

	it("renders a valid zsh shim without interpolating shell variables", () => {
		const shim = renderZshShim("xexe");
		expect(shim).toContain('local prompt="${BUFFER#:}"');
		expect(shim).toContain('BUFFER="xexe shell');
	});
});
