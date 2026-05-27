import {
	createDesktopShellState,
	DESKTOP_WORKBENCH_COMMANDS,
	type DesktopPanelId,
	type DesktopShellState,
	type WorkbenchTask,
} from "@xexe/platform";

export type DesktopAppMode = "visual" | "terminal" | "cli" | "agent";

export type DesktopAppState = DesktopShellState & {
	mode: DesktopAppMode;
	availableCommands: typeof DESKTOP_WORKBENCH_COMMANDS;
};

export type CreateDesktopAppInput = {
	mode?: DesktopAppMode;
	activePanel?: DesktopPanelId;
	tasks?: WorkbenchTask[];
	activeTaskId?: string;
};

export function createDesktopAppState(input: CreateDesktopAppInput = {}): DesktopAppState {
	return {
		...createDesktopShellState({
			activePanel: input.activePanel,
			tasks: input.tasks ?? [],
			activeTaskId: input.activeTaskId,
		}),
		mode: input.mode ?? "visual",
		availableCommands: DESKTOP_WORKBENCH_COMMANDS,
	};
}
