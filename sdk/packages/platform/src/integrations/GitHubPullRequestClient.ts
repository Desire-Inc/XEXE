import type { LivePullRequest, PullRequestClient } from "./LivePullRequestService";
import type { PullRequestDraft } from "./PullRequestService";

export type GitHubPullRequestClientOptions = {
	owner: string;
	repo: string;
	token?: string;
	apiBaseUrl?: string;
};

type GitHubCreatePullRequestResponse = {
	html_url: string;
	number: number;
	title: string;
	head?: { ref?: string };
};

export class GitHubPullRequestClient implements PullRequestClient {
	private readonly apiBaseUrl: string;

	constructor(private readonly options: GitHubPullRequestClientOptions) {
		this.apiBaseUrl = options.apiBaseUrl ?? "https://api.github.com";
	}

	async create(input: PullRequestDraft): Promise<LivePullRequest> {
		if (!input.branchName) throw new Error("Pull request draft requires branchName");
		const token = this.options.token ?? process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
		if (!token) throw new Error("GitHub token is required. Set GITHUB_TOKEN or GH_TOKEN.");
		const response = await fetch(`${this.apiBaseUrl}/repos/${this.options.owner}/${this.options.repo}/pulls`, {
			method: "POST",
			headers: {
				accept: "application/vnd.github+json",
				authorization: `Bearer ${token}`,
				"content-type": "application/json",
				"x-github-api-version": "2022-11-28",
			},
			body: JSON.stringify({
				title: input.title,
				body: input.body,
				head: input.branchName,
				base: input.baseBranch,
				draft: true,
				maintainer_can_modify: true,
			}),
		});
		const body = (await response.json()) as Partial<GitHubCreatePullRequestResponse> & { message?: string };
		if (!response.ok || !body.html_url || !body.title) {
			throw new Error(body.message ?? `GitHub PR creation failed with ${response.status}`);
		}
		return {
			url: body.html_url,
			number: body.number,
			title: body.title,
			branchName: body.head?.ref ?? input.branchName,
		};
	}
}
