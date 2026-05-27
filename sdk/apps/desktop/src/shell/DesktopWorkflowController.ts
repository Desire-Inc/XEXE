import { WorkbenchOrchestrator, type AgentRoleId, type DesktopPanelId, type WorkbenchTask } from "@xexe/platform";
import { createDesktopAppState, type DesktopAppState } from "./DesktopApp";
import { routeDesktopCommand, type DesktopCommandRouteResult } from "./DesktopCommandRouter";

export type DesktopWorkflowControllerOptions = {
	root: string;
	state?: DesktopAppState;
	orchestrator?: WorkbenchOrchestrator;
};

export type DesktopWorkflowResult = {
	state: DesktopAppState;
	route?: DesktopCommandRouteResult;
	task?: WorkbenchTask;
};

export class DesktopWorkflowController {
	private state: DesktopAppState;
	readonly orchestrator: WorkbenchOrchestrator;

	constructor(options: DesktopWorkflowControllerOptions) {
		this.orchestrator = options.orchestrator ?? new WorkbenchOrchestrator({ root: options.root });
		this.state = options.state ?? createDesktopAppState();
	}

	getState(): DesktopAppState {
		return this.state;
	}

	async refresh(): Promise<DesktopAppState> {
		const tasks = await this.orchestrator.tasks.list();
		this.state = createDesktopAppState({ mode: this.state.mode, activePanel: this.state.activePanel, tasks, activeTaskId: this.state.activeTask?.id });
		return this.state;
	}

	async createTask(title: string, description = "", agent: AgentRoleId = "planner"): Promise<DesktopWorkflowResult> {
		const task = await this.orchestrator.createTask(title, description, agent);
		this.state = createDesktopAppState({ mode: "visual", activePanel: "kanban", tasks: await this.orchestrator.tasks.list(), activeTaskId: task.id });
		return { state: this.state, task };
	}

	async startTask(taskId: string): Promise<DesktopWorkflowResult> {
		const task = await this.orchestrator.startTask({ taskId });
		this.state = createDesktopAppState({ mode: "agent", activePanel: "runs", tasks: await this.orchestrator.tasks.list(), activeTaskId: task.id });
		return { state: this.state, task };
	}

	routeCommand(command: string): DesktopWorkflowResult {
		const route = routeDesktopCommand(command, this.state);
		const activePanel = route.panel ?? this.state.activePanel;
		this.state = createDesktopAppState({ mode: route.mode ?? this.state.mode, activePanel, tasks: this.state.tasks, activeTaskId: this.state.activeTask?.id });
		return { state: this.state, route };
	}

	openPanel(panel: DesktopPanelId): DesktopWorkflowResult {
		this.state = createDesktopAppState({ mode: this.state.mode, activePanel: panel, tasks: this.state.tasks, activeTaskId: this.state.activeTask?.id });
		return { state: this.state };
	}
}
