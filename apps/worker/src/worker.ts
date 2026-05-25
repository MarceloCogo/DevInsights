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

const pool = new Pool({ connectionString: databaseUrl });
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

const syncWorkflowRuns = async (
  octokit: Octokit,
  organizationId: number,
  repositoryFullName: string
) => {
  const [owner, repo] = repositoryFullName.split("/");
  if (!owner || !repo) return;

  const runs = await octokit.paginate(octokit.actions.listWorkflowRunsForRepo, {
    owner,
    repo,
    per_page: 50
  });

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

  const deploymentResponse = await octokit.repos.listDeployments({
    owner,
    repo,
    per_page: 30
  });

  for (const deployment of deploymentResponse.data as Array<{
    id: number;
    environment?: string;
    created_at?: string;
  }>) {
    let state: string | null = null;
    let deployedAt = deployment.created_at ?? null;

    try {
      const statuses = await octokit.repos.listDeploymentStatuses({
        owner,
        repo,
        deployment_id: deployment.id,
        per_page: 1
      });
      const latestStatus = statuses.data[0];
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

    const pulls = (await octokit.paginate(octokit.pulls.list, {
      owner,
      repo,
      state: "all",
      per_page: 100
    })) as Array<{
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

    for (const pr of pulls) {
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
            additions = excluded.additions,
            deletions = excluded.deletions,
            changed_files = excluded.changed_files,
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

const processJob = async (jobId: number, organizationId: number) => {
  try {
    await pool.query(`update integration_sync_jobs set phase = 'discovering', updated_at = now() where id = $1`, [jobId]);
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
    await pool.query(
      `
        update integration_sync_jobs
        set status = 'failed', phase = 'failed', error_message = $1, finished_at = now(), updated_at = now()
        where id = $2
      `,
      [message, jobId]
    );
    console.error("sync job failed", { jobId, organizationId, message });
  }
};

const pickPendingJobs = async () => {
  const client = await pool.connect();
  try {
    await client.query("begin");
    const result = await client.query(
      `
        select id, organization_id
        from integration_sync_jobs
        where status = 'pending'
        order by created_at asc
        limit $1
        for update skip locked
      `,
      [maxJobsPerCycle]
    );

    const jobs = result.rows as Array<{ id: number; organization_id: number }>;
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
    const jobs = await pickPendingJobs();
    for (const job of jobs) {
      await processJob(Number(job.id), Number(job.organization_id));
    }
  } catch (error) {
    console.error("worker loop failed", error);
  } finally {
    setTimeout(() => {
      void runLoop();
    }, pollIntervalMs);
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
  console.log(`worker listening on ${port}`);
  void runLoop();
});

const shutdown = async (signal: NodeJS.Signals) => {
  shuttingDown = true;
  console.log(`shutting down worker (${signal})`);
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
