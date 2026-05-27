export type ReleaseChecklistItem = {
	id: string;
	title: string;
	required: boolean;
	completed: boolean;
	notes?: string;
};

export type ReleaseChecklist = {
	version: string;
	items: ReleaseChecklistItem[];
};

export const DEFAULT_RELEASE_CHECKLIST_ITEMS: ReleaseChecklistItem[] = [
	{ id: "tests", title: "All tests pass", required: true, completed: false },
	{ id: "typecheck", title: "Typecheck passes", required: true, completed: false },
	{ id: "lint", title: "Lint passes", required: true, completed: false },
	{ id: "docs", title: "Docs updated", required: true, completed: false },
	{ id: "security", title: "Secrets and dangerous tool usage reviewed", required: true, completed: false },
	{ id: "rollback", title: "Rollback plan documented", required: true, completed: false },
	{ id: "changelog", title: "Changelog or release notes prepared", required: false, completed: false },
];

export function createReleaseChecklist(version: string): ReleaseChecklist {
	return { version, items: DEFAULT_RELEASE_CHECKLIST_ITEMS.map((item) => ({ ...item })) };
}

export function isReleaseReady(checklist: ReleaseChecklist): boolean {
	return checklist.items.every((item) => !item.required || item.completed);
}
