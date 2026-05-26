import { DESKTOP_WORKBENCH_COMMANDS, type DesktopPanelId } from "@xexe/platform";
import type { DesktopAppMode, DesktopAppState } from "./DesktopApp";

export type DesktopCommandRouteResult = {
	matched: boolean;
	command: string;
	panel?: DesktopPanelId;
	mode?: DesktopAppMode;
	description?: string;
};

export function routeDesktopCommand(command: string, state: DesktopAppState): DesktopCommandRouteResult {
	const match = DESKTOP_WORKBENCH_COMMANDS.find((item) => item.command === command);
	if (!match) return { matched: false, command };
	return {
		matched: true,
		command,
		panel: match.panel,
		mode: inferMode(match.panel, state.mode),
		description: match.description,
	};
}

function inferMode(panel: DesktopPanelId, fallback: DesktopAppMode): DesktopAppMode {
	if (panel === "terminal") return "terminal";
	if (panel === "cli") return "cli";
	if (panel === "agents" || panel === "runs") return "agent";
	return fallback;
}
