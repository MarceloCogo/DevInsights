import { createServer } from "node:http";
import { App as GitHubApp } from "@octokit/app";
import { Octokit } from "@octokit/rest";
import { Pool } from "pg";

const port = Number(process.env.WORKER_PORT ?? 3002);
const databaseUrl = process.env.DATABASE_URL;
const githubAppId = process.env.GITHUB_APP_ID ?? "";
const githubAppPrivateKey = process.env.GITHUB_APP_PRIVATE_KEY ?? "";
const pollIntervalMs = Number(process.env.WORKER_POLL_INTERVAL_MS ?? 5000);
const maxJobsPerCycle = Number(process.env.WORKER_MAX_JOBS_PER_CYCLE ?? 5);

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

if (!githubAppId || !githubAppPrivateKey) {
  throw new Error("GITHUB_APP_ID and GITHUB_APP_PRIVATE_KEY are required");
}

const pool = new Pool({
  connectionString: databaseUrl,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  keepAlive: true,
});
pool.on("error", (err) => {
  console.error("Unexpected pool error", { error: String(err) });
});
const githubAppClient = new GitHubApp({
  appId: githubAppId,
  privateKey: githubAppPrivateKey.replace(/\\n/g, "\n")
});

let heartbeat = new Date().toISOString();
let shuttingDown = false;

const createInstallationClient = async (installationId: number) => {
  const octokit = await githubAppClient.getInstallationOctokit(installationId);
  return octokit as unknown as Octokit;
};

const paginateWithRequest = async <T>(
  octokit: Octokit,
  route: string,
  baseParams: Record<string, unknown>,
  readItems: (data: any) => T[]
) => {
  const items: T[] = [];
  let page = 1;

  while (true) {
    const response = await octokit.request(route, {
      ...baseParams,
      per_page: 100,
      page
    });
    const batch = readItems(response.data);
    items.push(...batch);
    if (batch.length < 100) {
      break;
    }
    page += 1;
  }

  return items;
};

const syncWorkflowRuns = async (
  octokit: Octokit,
  organizationId: number,
  repositoryFullName: string
) => {
  const [owner, repo] = repositoryFullName.split("/");
  if (!owner || !repo) return;

  const runs = await paginateWithRequest(
    octokit,
    "GET /repos/{owner}/{repo}/actions/runs",
    { owner, repo },
    (data) => (data.workflow_runs ?? []) as Array<any>
  );

  for (const run of runs as Array<{
    id: number;
    name?: string;
    status?: string;
    conclusion?: string | null;
    head_branch?: string | null;
    head_sha?: string | null;
    run_started_at?: string;
    updated_at?: string;
  }>) {
    await pool.query(
      `
        insert into workflow_runs (
          organization_id, repository_full_name, github_workflow_run_id, workflow_name,
          status, conclusion, branch, commit_sha, started_at, finished_at, updated_at
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now())
        on conflict (organization_id, github_workflow_run_id)
        do update set
          workflow_name = excluded.workflow_name,
          status = excluded.status,
          conclusion = excluded.conclusion,
          branch = excluded.branch,
          commit_sha = excluded.commit_sha,
          started_at = excluded.started_at,
          finished_at = excluded.finished_at,
          updated_at = now()
      `,
      [
        organizationId,
        repositoryFullName,
        run.id,
        run.name ?? null,
        run.status ?? null,
        run.conclusion ?? null,
        run.head_branch ?? null,
        run.head_sha ?? null,
        run.run_started_at ?? null,
        run.updated_at ?? null
      ]
    );
  }
};

const syncDeployments = async (
  octokit: Octokit,
  organizationId: number,
  repositoryFullName: string
) => {
  const [owner, repo] = repositoryFullName.split("/");
  if (!owner || !repo) return;

  const deployments = await paginateWithRequest(
    octokit,
    "GET /repos/{owner}/{repo}/deployments",
    { owner, repo },
    (data) => data as Array<any>
  );

  for (const deployment of deployments as Array<{
    id: number;
    environment?: string;
    created_at?: string;
  }>) {
    let state: string | null = null;
    let deployedAt = deployment.created_at ?? null;

    try {
      const statuses = await octokit.request("GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses", {
        owner,
        repo,
        deployment_id: deployment.id,
        per_page: 1
      });
      const latestStatus = statuses.data[0] as { state?: string; updated_at?: string; created_at?: string } | undefined;
      if (latestStatus) {
        state = latestStatus.state ?? null;
        deployedAt = latestStatus.updated_at ?? latestStatus.created_at ?? deployedAt;
      }
    } catch {
      // keep deployment defaults when statuses are unavailable
    }

    await pool.query(
      `
        insert into deployments (
          organization_id, repository_full_name, github_deployment_id, environment_name, state, deployed_at, updated_at
        )
        values ($1, $2, $3, $4, $5, $6, now())
        on conflict (organization_id, github_deployment_id)
        do update set
          repository_full_name = excluded.repository_full_name,
          environment_name = excluded.environment_name,
          state = excluded.state,
          deployed_at = excluded.deployed_at,
          updated_at = now()
      `,
      [
        organizationId,
        repositoryFullName,
        deployment.id,
        deployment.environment ?? "production",
        state,
        deployedAt
      ]
    );
  }
};

const runInitialSync = async (organizationId: number, jobId: number) => {
  const installationResult = await pool.query(
    `select installation_id from github_installations where organization_id = $1 limit 1`,
    [organizationId]
  );

  if (installationResult.rowCount === 0) {
    throw new Error("missing_installation");
  }

  const selectedRepositoriesResult = await pool.query(
    `
      select repository_id, full_name
      from tracked_repositories
      where organization_id = $1 and selected = true
      order by full_name asc
    `,
    [organizationId]
  );

  const repositories = selectedRepositoriesResult.rows as Array<{ repository_id: number; full_name: string }>;
  await pool.query(
    `update integration_sync_jobs set phase = 'syncing_prs', total_repositories = $1, processed_repositories = 0, updated_at = now() where id = $2`,
    [repositories.length, jobId]
  );
  const octokit = await createInstallationClient(Number(installationResult.rows[0].installation_id));

  let totalPrs = 0;
  let processed = 0;

  for (const repository of repositories) {
    const [owner, repo] = repository.full_name.split("/");
    if (!owner || !repo) {
      continue;
    }

    const pulls = (await paginateWithRequest(
      octokit,
      "GET /repos/{owner}/{repo}/pulls",
      {
        owner,
        repo,
        state: "all"
      },
      (data) => data as Array<any>
    )) as Array<{
      id: number;
      number: number;
      title: string;
      state: string;
      draft: boolean;
      additions?: number;
      deletions?: number;
      changed_files?: number;
      user?: { login?: string };
      created_at?: string;
      closed_at?: string | null;
      merged_at?: string | null;
      updated_at?: string;
      html_url?: string;
    }>;

    const openPrs = pulls.filter((item) => item.state === "open").length;
    const mergedPrs = pulls.filter((item) => item.merged_at !== null).length;

    totalPrs += pulls.length;
    processed += 1;

    await pool.query(
      `update integration_sync_jobs set processed_repositories = $1, updated_at = now() where id = $2`,
      [processed, jobId]
    );

    // Cutoff for fetching individual PR details (last 90 days)
    const enrichmentCutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

    for (const pr of pulls) {
      // Basic upsert from listing data
      await pool.query(
        `
          insert into pull_requests (
            organization_id, repository_id, repository_full_name, github_pr_id, number, title, author_login,
            state, draft, additions, deletions, changed_files, opened_at, closed_at, merged_at, updated_at, html_url
          )
          values (
            $1, $2, $3, $4, $5, $6, $7,
            $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
          )
          on conflict (organization_id, repository_id, github_pr_id)
          do update set
            number = excluded.number,
            title = excluded.title,
            author_login = excluded.author_login,
            state = excluded.state,
            draft = excluded.draft,
            opened_at = excluded.opened_at,
            closed_at = excluded.closed_at,
            merged_at = excluded.merged_at,
            updated_at = excluded.updated_at,
            html_url = excluded.html_url
        `,
        [
          organizationId,
          repository.repository_id,
          repository.full_name,
          pr.id,
          pr.number,
          pr.title,
          pr.user?.login ?? null,
          pr.state,
          Boolean(pr.draft),
          pr.additions ?? 0,
          pr.deletions ?? 0,
          pr.changed_files ?? 0,
          pr.created_at ?? null,
          pr.closed_at ?? null,
          pr.merged_at ?? null,
          pr.updated_at ?? null,
          pr.html_url ?? null
        ]
      );

      // Fetch individual PR detail for enrichment (only for recent PRs)
      const prUpdatedAt = pr.updated_at ?? pr.created_at ?? null;
      if (prUpdatedAt && prUpdatedAt >= enrichmentCutoff) {
        try {
          // Check if we already have up-to-date detail
          const existingResult = await pool.query(
            `SELECT updated_at FROM pull_requests WHERE organization_id = $1 AND repository_id = $2 AND github_pr_id = $3`,
            [organizationId, repository.repository_id, pr.id]
          );
          const existingUpdatedAt = existingResult.rows[0]?.updated_at as string | null;
          const needsEnrichment = !existingUpdatedAt || (prUpdatedAt && new Date(prUpdatedAt) >= new Date(existingUpdatedAt));

          if (needsEnrichment) {
            const detail = await octokit.request("GET /repos/{owner}/{repo}/pulls/{pull_number}", {
              owner,
              repo,
              pull_number: pr.number
            });

            const d = detail.data as {
              body?: string | null;
              additions?: number;
              deletions?: number;
              changed_files?: number;
              commits?: number;
              comments?: number;
              review_comments?: number;
              merge_commit_sha?: string | null;
              labels?: Array<{ name?: string; color?: string; description?: string | null }>;
              base?: { ref?: string };
              head?: { ref?: string };
              draft?: boolean;
              updated_at?: string;
            };

            const labels = (d.labels ?? []).map((l) => ({ name: l.name ?? "", color: l.color ?? "", description: l.description ?? "" }));

            await pool.query(
              `
                UPDATE pull_requests SET
                  body = $1,
                  draft = $2,
                  additions = $3,
                  deletions = $4,
                  changed_files = $5,
                  commits_count = $6,
                  comments_count = $7,
                  review_comments_count = $8,
                  merge_commit_sha = $9,
                  labels = $10,
                  base_branch = $11,
                  head_branch = $12,
                  updated_at = $13
                WHERE organization_id = $14 AND repository_id = $15 AND github_pr_id = $16
              `,
              [
                d.body ?? null,
                Boolean(d.draft),
                d.additions ?? 0,
                d.deletions ?? 0,
                d.changed_files ?? 0,
                d.commits ?? null,
                d.comments ?? null,
                d.review_comments ?? null,
                d.merge_commit_sha ?? null,
                JSON.stringify(labels),
                d.base?.ref ?? null,
                d.head?.ref ?? null,
                d.updated_at ?? pr.updated_at ?? null,
                organizationId,
                repository.repository_id,
                pr.id
              ]
            );

            // Get the pull_request row id for review tables
            const prIdResult = await pool.query(
              `SELECT id FROM pull_requests WHERE organization_id = $1 AND repository_id = $2 AND github_pr_id = $3`,
              [organizationId, repository.repository_id, pr.id]
            );
            const pullRequestId = prIdResult.rows[0]?.id as number | undefined;

            if (pullRequestId) {
              // Collect PR reviews
              try {
                const reviewsResponse = await octokit.request("GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews", {
                  owner,
                  repo,
                  pull_number: pr.number,
                  per_page: 100
                });
                for (const review of reviewsResponse.data as Array<{ id: number; user?: { login?: string }; state?: string; submitted_at?: string; commit_id?: string; html_url?: string }>) {
                  await pool.query(
                    `INSERT INTO pull_request_reviews (organization_id, pull_request_id, github_review_id, reviewer_login, state, submitted_at, commit_id, html_url)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                     ON CONFLICT (organization_id, github_review_id) DO UPDATE SET
                       reviewer_login = excluded.reviewer_login,
                       state = excluded.state,
                       submitted_at = excluded.submitted_at,
                       commit_id = excluded.commit_id,
                       html_url = excluded.html_url,
                       updated_at = now()`,
                    [organizationId, pullRequestId, review.id, review.user?.login ?? null, review.state ?? null, review.submitted_at ?? null, review.commit_id ?? null, review.html_url ?? null]
                  );
                }
              } catch (reviewErr) {
                console.error("PR reviews collection failed", { repo: repository.full_name, prNumber: pr.number, error: String(reviewErr) });
              }

              // Collect PR review comments
              try {
                const commentsResponse = await octokit.request("GET /repos/{owner}/{repo}/pulls/{pull_number}/comments", {
                  owner,
                  repo,
                  pull_number: pr.number,
                  per_page: 100
                });
                for (const comment of commentsResponse.data as Array<{ id: number; user?: { login?: string }; path?: string; line?: number | null; side?: string; created_at?: string; updated_at?: string; html_url?: string }>) {
                  await pool.query(
                    `INSERT INTO pull_request_review_comments (organization_id, pull_request_id, github_comment_id, reviewer_login, path, line, side, created_at, updated_at, html_url)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                     ON CONFLICT (organization_id, github_comment_id) DO UPDATE SET
                       reviewer_login = excluded.reviewer_login,
                       path = excluded.path,
                       line = excluded.line,
                       side = excluded.side,
                       updated_at = excluded.updated_at,
                       html_url = excluded.html_url`,
                    [organizationId, pullRequestId, comment.id, comment.user?.login ?? null, comment.path ?? null, comment.line ?? null, comment.side ?? null, comment.created_at ?? null, comment.updated_at ?? null, comment.html_url ?? null]
                  );
                }
              } catch (commentErr) {
                console.error("PR review comments collection failed", { repo: repository.full_name, prNumber: pr.number, error: String(commentErr) });
              }

              // Collect requested reviewers from PR detail
              try {
                const requestedReviewers = (detail.data as any).requested_reviewers ?? [];
                const requestedTeams = (detail.data as any).requested_teams ?? [];
                for (const reviewer of requestedReviewers as Array<{ login?: string }>) {
                  if (reviewer.login) {
                    await pool.query(
                      `INSERT INTO pull_request_requested_reviewers (organization_id, pull_request_id, reviewer_login, reviewer_type)
                       VALUES ($1, $2, $3, 'user')
                       ON CONFLICT (pull_request_id, reviewer_login, reviewer_type) DO UPDATE SET updated_at = now()`,
                      [organizationId, pullRequestId, reviewer.login]
                    );
                  }
                }
                for (const team of requestedTeams as Array<{ slug?: string; name?: string }>) {
                  const teamLogin = team.slug ?? team.name ?? null;
                  if (teamLogin) {
                    await pool.query(
                      `INSERT INTO pull_request_requested_reviewers (organization_id, pull_request_id, reviewer_login, reviewer_type)
                       VALUES ($1, $2, $3, 'team')
                       ON CONFLICT (pull_request_id, reviewer_login, reviewer_type) DO UPDATE SET updated_at = now()`,
                      [organizationId, pullRequestId, teamLogin]
                    );
                  }
                }
              } catch (reqRevErr) {
                console.error("PR requested reviewers collection failed", { repo: repository.full_name, prNumber: pr.number, error: String(reqRevErr) });
              }
            }

            // Small delay to respect rate limits
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        } catch (enrichError) {
          console.error("PR detail enrichment failed", { repo: repository.full_name, prNumber: pr.number, error: String(enrichError) });
          // Continue with next PR - don't break the sync
        }
      }
    }

    await pool.query(
      `
        insert into repository_sync_stats (organization_id, repository_id, full_name, open_prs, merged_prs)
        values ($1, $2, $3, $4, $5)
        on conflict (organization_id, repository_id)
        do update set full_name = excluded.full_name, open_prs = excluded.open_prs, merged_prs = excluded.merged_prs, updated_at = now()
      `,
      [organizationId, repository.repository_id, repository.full_name, openPrs, mergedPrs]
    );
  }

  await pool.query(
    `update integration_sync_jobs set phase = 'syncing_workflows', processed_repositories = 0, updated_at = now() where id = $1`,
    [jobId]
  );

  let processedWorkflows = 0;
  for (const repository of repositories) {
    try {
      await syncWorkflowRuns(octokit, organizationId, repository.full_name);
    } catch (error) {
      console.error("workflow run sync failed", { organizationId, repository: repository.full_name, error });
    }
    processedWorkflows += 1;
    await pool.query(`update integration_sync_jobs set processed_repositories = $1, updated_at = now() where id = $2`, [processedWorkflows, jobId]);
  }

  await pool.query(
    `update integration_sync_jobs set phase = 'syncing_deployments', processed_repositories = 0, updated_at = now() where id = $1`,
    [jobId]
  );

  let processedDeployments = 0;
  for (const repository of repositories) {
    try {
      await syncDeployments(octokit, organizationId, repository.full_name);
    } catch (error) {
      console.error("deployment sync failed", { organizationId, repository: repository.full_name, error });
    }
    processedDeployments += 1;
    await pool.query(`update integration_sync_jobs set processed_repositories = $1, updated_at = now() where id = $2`, [processedDeployments, jobId]);
  }

  return {
    processedRepositories: processed,
    totalPrs
  };
};

const MAX_ATTEMPTS = 5;

const log = (level: "info" | "warn" | "error", message: string, context?: Record<string, unknown>) => {
  const entry = { timestamp: new Date().toISOString(), level, service: "worker", message, ...context };
  if (level === "error") console.error(JSON.stringify(entry));
  else if (level === "warn") console.warn(JSON.stringify(entry));
  else console.log(JSON.stringify(entry));
};

const calculateBackoffMs = (attempts: number): number => {
  // Exponential backoff: 10s, 30s, 90s, 270s, 810s
  return Math.min(10_000 * Math.pow(3, attempts), 15 * 60 * 1000);
};

const processJob = async (jobId: number, organizationId: number, attempts: number) => {
  try {
    await pool.query(
      `update integration_sync_jobs set phase = 'discovering', attempts = $1, updated_at = now() where id = $2`,
      [attempts + 1, jobId]
    );
    const result = await runInitialSync(organizationId, jobId);
    await pool.query(
      `
        update integration_sync_jobs
        set status = 'completed', phase = 'completed', processed_repositories = $1, total_prs = $2, finished_at = now(), updated_at = now()
        where id = $3
      `,
      [result.processedRepositories, result.totalPrs, jobId]
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "sync_failed";
    const currentAttempts = attempts + 1;

    if (currentAttempts < MAX_ATTEMPTS) {
      const backoffMs = calculateBackoffMs(currentAttempts);
      const nextRetryAt = new Date(Date.now() + backoffMs).toISOString();
      await pool.query(
        `
          update integration_sync_jobs
          set status = 'pending', phase = 'retry_scheduled', attempts = $1, error_message = $2, next_retry_at = $3, updated_at = now()
          where id = $4
        `,
        [currentAttempts, message, nextRetryAt, jobId]
      );
      log("warn", "sync job scheduled for retry", { jobId, organizationId, attempts: currentAttempts, nextRetryAt });
    } else {
      await pool.query(
        `
          update integration_sync_jobs
          set status = 'failed', phase = 'failed', attempts = $1, error_message = $2, finished_at = now(), updated_at = now()
          where id = $3
        `,
        [currentAttempts, message, jobId]
      );
      log("error", "sync job permanently failed", { jobId, organizationId, attempts: currentAttempts, errorMessage: message });
    }
  }
};

const pickPendingJobs = async () => {
  const client = await pool.connect();
  try {
    await client.query("begin");
    const result = await client.query(
      `
        select id, organization_id, attempts
        from integration_sync_jobs
        where status = 'pending'
          and (next_retry_at is null or next_retry_at <= now())
        order by created_at asc
        limit $1
        for update skip locked
      `,
      [maxJobsPerCycle]
    );

    const jobs = result.rows as Array<{ id: number; organization_id: number; attempts: number }>;
    for (const job of jobs) {
      await client.query(
        `update integration_sync_jobs set status = 'running', phase = 'pending', updated_at = now() where id = $1`,
        [job.id]
      );
    }

    await client.query("commit");
    return jobs;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
};

const runLoop = async () => {
  if (shuttingDown) {
    return;
  }

  heartbeat = new Date().toISOString();

  try {
    // Periodically clean up old jobs (every 100 loops ~= every ~8 minutes at 5s interval)
    if (Math.random() < 0.01) {
      await cleanupExpiredJobs();
    }

    const jobs = await pickPendingJobs();
    for (const job of jobs) {
      await processJob(Number(job.id), Number(job.organization_id), Number(job.attempts ?? 0));
    }
  } catch (error) {
    log("error", "worker loop failed", { error: error instanceof Error ? error.message : String(error) });
  } finally {
    setTimeout(() => {
      void runLoop();
    }, pollIntervalMs);
  }
};

const cleanupExpiredJobs = async () => {
  try {
    const result = await pool.query(
      `delete from integration_sync_jobs
       where status in ('completed', 'failed')
         and finished_at is not null
         and finished_at < now() - interval '30 days'`
    );
    if ((result.rowCount ?? 0) > 0) {
      log("info", "cleaned up expired sync jobs", { deleted: result.rowCount });
    }
  } catch (error) {
    log("error", "cleanup failed", { error: error instanceof Error ? error.message : String(error) });
  }
};

const baseHeaders = {
  "content-type": "application/json",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "no-referrer"
};

const server = createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, baseHeaders);
    res.end(JSON.stringify({ status: "ok", service: "worker", heartbeat }));
    return;
  }

  res.writeHead(404, baseHeaders);
  res.end(JSON.stringify({ error: "not_found" }));
});

server.listen(port, "0.0.0.0", () => {
  log("info", `worker listening on ${port}`);
  void runLoop();
});

const shutdown = async (signal: NodeJS.Signals) => {
  shuttingDown = true;
  log("info", `shutting down worker`, { signal });
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
};

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});
process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});
