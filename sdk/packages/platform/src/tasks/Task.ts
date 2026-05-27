import { z } from "zod";

export const TaskStatusSchema = z.enum([
	"draft",
	"planning",
	"awaiting_approval",
	"running",
	"testing",
	"reviewing",
	"ready_to_commit",
	"ready_to_pr",
	"done",
	"failed",
	"cancelled",
]);

export type TaskStatus = z.infer<typeof TaskStatusSchema>;

export const TaskSchema = z.object({
	id: z.string().min(1),
	title: z.string().min(1),
	description: z.string().default(""),
	status: TaskStatusSchema.default("draft"),
	agent: z.string().default("planner"),
	workspacePath: z.string().optional(),
	worktreePath: z.string().optional(),
	branchName: z.string().optional(),
	conversationId: z.string().optional(),
	plan: z.string().optional(),
	diff: z.string().optional(),
	testStatus: z.string().optional(),
	createdAt: z.string(),
	updatedAt: z.string(),
	metadata: z.record(z.string(), z.unknown()).default({}),
});

export type WorkbenchTask = z.infer<typeof TaskSchema>;

export type CreateTaskInput = {
	title: string;
	description?: string;
	agent?: string;
	workspacePath?: string;
	branchName?: string;
	metadata?: Record<string, unknown>;
};

export type UpdateTaskInput = Partial<Omit<WorkbenchTask, "id" | "createdAt">>;

export function createTaskId(title: string, now = new Date()): string {
	const slug = title
		.toLowerCase()
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 48);
	const timestamp = now.toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
	return `${timestamp}-${slug || "task"}`;
}

export function createTask(input: CreateTaskInput, now = new Date()): WorkbenchTask {
	const iso = now.toISOString();
	return TaskSchema.parse({
		id: createTaskId(input.title, now),
		title: input.title,
		description: input.description ?? "",
		status: "draft",
		agent: input.agent ?? "planner",
		workspacePath: input.workspacePath,
		branchName: input.branchName,
		createdAt: iso,
		updatedAt: iso,
		metadata: input.metadata ?? {},
	});
}
