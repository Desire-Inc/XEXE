import type { PullRequestDraft } from "./PullRequestService";

export type LivePullRequest = {
	url: string;
	number?: number;
	title: string;
	branchName?: string;
};

export interface PullRequestClient {
	create(input: PullRequestDraft): Promise<LivePullRequest>;
}

export class DryRunPullRequestClient implements PullRequestClient {
	async create(input: PullRequestDraft): Promise<LivePullRequest> {
		return {
			url: `dry-run://pull-request/${encodeURIComponent(input.title)}`,
			title: input.title,
			branchName: input.branchName,
		};
	}
}

export async function createLivePullRequest(client: PullRequestClient, draft: PullRequestDraft): Promise<LivePullRequest> {
	return client.create(draft);
}
