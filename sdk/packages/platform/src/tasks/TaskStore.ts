import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { createTask, type CreateTaskInput, TaskSchema, type UpdateTaskInput, type WorkbenchTask } from "./Task";

export type TaskStoreOptions = {
	rootDir: string;
	fileName?: string;
};

export type TaskStoreSnapshot = {
	version: 1;
	tasks: WorkbenchTask[];
};

const EMPTY_SNAPSHOT: TaskStoreSnapshot = { version: 1, tasks: [] };

export class TaskStore {
	readonly filePath: string;

	constructor(private readonly options: TaskStoreOptions) {
		this.filePath = join(options.rootDir, options.fileName ?? ".agent/tasks.json");
	}

	async list(): Promise<WorkbenchTask[]> {
		return (await this.read()).tasks.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
	}

	async get(id: string): Promise<WorkbenchTask | undefined> {
		return (await this.read()).tasks.find((task) => task.id === id);
	}

	async create(input: CreateTaskInput): Promise<WorkbenchTask> {
		const snapshot = await this.read();
		const task = createTask(input);
		const uniqueTask = snapshot.tasks.some((item) => item.id === task.id)
			? { ...task, id: `${task.id}-${snapshot.tasks.length + 1}` }
			: task;
		await this.write({ ...snapshot, tasks: [uniqueTask, ...snapshot.tasks] });
		return uniqueTask;
	}

	async update(id: string, input: UpdateTaskInput): Promise<WorkbenchTask> {
		const snapshot = await this.read();
		const index = snapshot.tasks.findIndex((task) => task.id === id);
		if (index === -1) throw new Error(`Task not found: ${id}`);
		const updated = TaskSchema.parse({ ...snapshot.tasks[index], ...input, updatedAt: new Date().toISOString() });
		snapshot.tasks[index] = updated;
		await this.write(snapshot);
		return updated;
	}

	async delete(id: string): Promise<boolean> {
		const snapshot = await this.read();
		const next = snapshot.tasks.filter((task) => task.id !== id);
		if (next.length === snapshot.tasks.length) return false;
		await this.write({ ...snapshot, tasks: next });
		return true;
	}

	private async read(): Promise<TaskStoreSnapshot> {
		try {
			const raw = await readFile(this.filePath, "utf8");
			const parsed = JSON.parse(raw) as TaskStoreSnapshot;
			return { version: 1, tasks: (parsed.tasks ?? []).map((task) => TaskSchema.parse(task)) };
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code === "ENOENT") return EMPTY_SNAPSHOT;
			throw error;
		}
	}

	private async write(snapshot: TaskStoreSnapshot): Promise<void> {
		await mkdir(dirname(this.filePath), { recursive: true });
		const tmpPath = `${this.filePath}.tmp`;
		await writeFile(tmpPath, `${JSON.stringify(snapshot, null, "\t")}\n`, "utf8");
		await rename(tmpPath, this.filePath);
	}
}
