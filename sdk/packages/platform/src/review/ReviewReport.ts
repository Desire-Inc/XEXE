export type ReviewSeverity = "info" | "warning" | "blocker";

export type ReviewFinding = {
	severity: ReviewSeverity;
	title: string;
	description: string;
	file?: string;
	line?: number;
	recommendation?: string;
};

export type ReviewReport = {
	taskId: string;
	status: "approved" | "changes_requested" | "blocked";
	summary: string;
	findings: ReviewFinding[];
	testsRun: string[];
	risks: string[];
	rollbackPlan: string;
	createdAt: string;
};

export function createReviewReport(input: Omit<ReviewReport, "createdAt">, now = new Date()): ReviewReport {
	return { ...input, createdAt: now.toISOString() };
}

export function deriveReviewStatus(findings: ReviewFinding[]): ReviewReport["status"] {
	if (findings.some((finding) => finding.severity === "blocker")) return "blocked";
	if (findings.some((finding) => finding.severity === "warning")) return "changes_requested";
	return "approved";
}
