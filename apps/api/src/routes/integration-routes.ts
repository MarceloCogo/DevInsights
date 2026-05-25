import type { FastifyInstance } from "fastify";
import type { RouteDeps } from "./types.js";

export const registerIntegrationRoutes = (app: FastifyInstance, deps: RouteDeps) => {
  const {
    apiBasePath,
    githubAppName,
    sessionCookieName,
    ensureDatabase,
    getPool,
    createAuthState,
    consumeAuthState,
    getSessionUser,
    getOrganizationIdForUser,
    createInstallationClient,
    createSyncJob,
    getWebBaseUrl
  } = deps;

  app.get(`${apiBasePath}/integrations/github/install-url`, async (request, reply) => {
    if (!ensureDatabase(reply)) return;
    const session = await getSessionUser(request.cookies[sessionCookieName]);
    if (!session) return reply.code(401).send({ error: "unauthorized" });
    if (!githubAppName) return reply.code(500).send({ error: "missing_github_app_name" });
    const organizationId = await getOrganizationIdForUser(session.user.id, session.activeOrganizationId);
    if (!organizationId) return reply.code(400).send({ error: "missing_organization" });
    const state = await createAuthState("installation", organizationId);
    return { installUrl: `https://github.com/apps/${githubAppName}/installations/new?state=${encodeURIComponent(state)}` };
  });

  app.get(`${apiBasePath}/integrations/github/callback`, async (request, reply) => {
    if (!ensureDatabase(reply)) return;
    const db = getPool();
    const session = await getSessionUser(request.cookies[sessionCookieName]);
    if (!session) return reply.redirect(`${getWebBaseUrl(request)}/app/login`);
    const { installation_id: installationId, setup_action: setupAction, state } = request.query as { installation_id?: string; setup_action?: string; state?: string };
    if (!installationId) return reply.redirect(`${getWebBaseUrl(request)}/app?error=missing_installation_id`);
    const installationState = await consumeAuthState(state, "installation");
    const organizationId = await getOrganizationIdForUser(session.user.id, (installationState.ok ? installationState.organizationId : null) ?? session.activeOrganizationId);
    if (!organizationId) return reply.redirect(`${getWebBaseUrl(request)}/app?error=missing_organization`);
    await db.query(`insert into github_installations (organization_id, installation_id, account_login, account_type, installed_by_user_id) values ($1, $2, null, null, $3) on conflict (organization_id) do update set installation_id = excluded.installation_id, installed_by_user_id = excluded.installed_by_user_id, updated_at = now()`, [organizationId, Number(installationId), session.user.id]);
    return reply.redirect(`${getWebBaseUrl(request)}/app?integration=${setupAction ?? "installed"}`);
  });

  app.get(`${apiBasePath}/integrations/github/repositories`, async (request, reply) => {
    if (!ensureDatabase(reply)) return;
    const db = getPool();
    const session = await getSessionUser(request.cookies[sessionCookieName]);
    if (!session) return reply.code(401).send({ error: "unauthorized" });
    const organizationId = await getOrganizationIdForUser(session.user.id, session.activeOrganizationId);
    if (!organizationId) return { connected: false, repositories: [] };
    const installationResult = await db.query(`select organization_id, installation_id from github_installations where organization_id = $1 limit 1`, [organizationId]);
    if (installationResult.rowCount === 0) return { connected: false, repositories: [] };

    try {
      const octokit = await createInstallationClient(Number(installationResult.rows[0].installation_id));
      const payload = await octokit.paginate(octokit.apps.listReposAccessibleToInstallation, { per_page: 100 });
      for (const repository of payload as Array<{ id: number; full_name: string; private: boolean }>) {
        await db.query(`insert into tracked_repositories (organization_id, repository_id, full_name, private) values ($1, $2, $3, $4) on conflict (organization_id, repository_id) do update set full_name = excluded.full_name, private = excluded.private, updated_at = now()`, [organizationId, repository.id, repository.full_name, repository.private]);
      }
      const savedRepositories = await db.query(`select repository_id as id, full_name, private, selected from tracked_repositories where organization_id = $1 order by full_name asc`, [organizationId]);
      return { connected: true, repositories: savedRepositories.rows };
    } catch (error) {
      app.log.error(error);
      return reply.code(500).send({ error: "repositories_sync_failed" });
    }
  });

  app.post(`${apiBasePath}/integrations/github/repositories/select`, async (request, reply) => {
    if (!ensureDatabase(reply)) return;
    const db = getPool();
    const session = await getSessionUser(request.cookies[sessionCookieName]);
    if (!session) return reply.code(401).send({ error: "unauthorized" });
    const body = request.body as { repositoryIds?: number[] };
    const repositoryIds = Array.isArray(body.repositoryIds) ? body.repositoryIds : [];
    const organizationId = await getOrganizationIdForUser(session.user.id, session.activeOrganizationId);
    if (!organizationId) return reply.code(400).send({ error: "missing_organization" });
    const installationResult = await db.query(`select installation_id from github_installations where organization_id = $1 limit 1`, [organizationId]);
    if ((installationResult.rowCount ?? 0) === 0) {
      return reply.code(400).send({ error: "integration_not_connected" });
    }
    await db.query(`update tracked_repositories set selected = false where organization_id = $1`, [organizationId]);
    if (repositoryIds.length > 0) {
      await db.query(`update tracked_repositories set selected = true where organization_id = $1 and repository_id = any($2::bigint[])`, [organizationId, repositoryIds]);
    }
    const jobId = await createSyncJob(organizationId);
    return { ok: true, selectedCount: repositoryIds.length, syncStatus: "queued", jobId };
  });

  app.post(`${apiBasePath}/integrations/github/sync-now`, async (request, reply) => {
    if (!ensureDatabase(reply)) return;
    const db = getPool();
    const session = await getSessionUser(request.cookies[sessionCookieName]);
    if (!session) return reply.code(401).send({ error: "unauthorized" });
    const organizationId = await getOrganizationIdForUser(session.user.id, session.activeOrganizationId);
    if (!organizationId) return reply.code(400).send({ error: "missing_organization" });
    const installationResult = await db.query(`select installation_id from github_installations where organization_id = $1 limit 1`, [organizationId]);
    if ((installationResult.rowCount ?? 0) === 0) {
      return reply.code(400).send({ error: "integration_not_connected" });
    }
    const selectedRepositoriesResult = await db.query(
      `select count(*)::int as count from tracked_repositories where organization_id = $1 and selected = true`,
      [organizationId]
    );
    const selectedRepositories = selectedRepositoriesResult.rows[0]?.count ?? 0;
    if (selectedRepositories === 0) {
      return reply.code(400).send({ error: "no_selected_repositories" });
    }
    const jobId = await createSyncJob(organizationId);
    return { ok: true, syncStatus: "queued", jobId };
  });

  app.get(`${apiBasePath}/integrations/github/status`, async (request, reply) => {
    if (!ensureDatabase(reply)) return;
    const db = getPool();
    const session = await getSessionUser(request.cookies[sessionCookieName]);
    if (!session) return reply.code(401).send({ error: "unauthorized" });
    const organizationId = await getOrganizationIdForUser(session.user.id, session.activeOrganizationId);
    if (!organizationId) return { connected: false, status: "disconnected" };
    const installationResult = await db.query(`select installation_id, account_login, account_type from github_installations where organization_id = $1 limit 1`, [organizationId]);
    const selectedRepositoriesResult = await db.query(`select count(*)::int as count from tracked_repositories where organization_id = $1 and selected = true`, [organizationId]);
    return {
      connected: (installationResult.rowCount ?? 0) > 0,
      status: (installationResult.rowCount ?? 0) > 0 ? "connected" : "disconnected",
      installation: installationResult.rows[0] ?? null,
      selectedRepositories: selectedRepositoriesResult.rows[0]?.count ?? 0
    };
  });

  app.post(`${apiBasePath}/integrations/github/disconnect`, async (request, reply) => {
    if (!ensureDatabase(reply)) return;
    const db = getPool();
    const session = await getSessionUser(request.cookies[sessionCookieName]);
    if (!session) return reply.code(401).send({ error: "unauthorized" });
    const organizationId = await getOrganizationIdForUser(session.user.id, session.activeOrganizationId);
    if (!organizationId) return reply.code(400).send({ error: "missing_organization" });
    await db.query(`delete from github_installations where organization_id = $1`, [organizationId]);
    await db.query(`update tracked_repositories set selected = false where organization_id = $1`, [organizationId]);
    return { ok: true, status: "disconnected" };
  });

  app.get(`${apiBasePath}/integrations/github/sync-progress`, async (request, reply) => {
    if (!ensureDatabase(reply)) return;
    const db = getPool();
    const session = await getSessionUser(request.cookies[sessionCookieName]);
    if (!session) return reply.code(401).send({ error: "unauthorized" });
    const organizationId = await getOrganizationIdForUser(session.user.id, session.activeOrganizationId);
    if (!organizationId) return { status: "idle", phase: "pending", totalRepositories: 0, processedRepositories: 0, totalPrs: 0 };

    const result = await db.query(
      `select status, phase, total_repositories, processed_repositories, total_prs, started_at, finished_at, error_message
       from integration_sync_jobs where organization_id = $1 order by created_at desc limit 1`,
      [organizationId]
    );

    if ((result.rowCount ?? 0) === 0) {
      return { status: "idle", phase: "pending", totalRepositories: 0, processedRepositories: 0, totalPrs: 0 };
    }

    const row = result.rows[0];
    return {
      status: row.status,
      phase: row.phase,
      totalRepositories: row.total_repositories ?? 0,
      processedRepositories: row.processed_repositories ?? 0,
      totalPrs: row.total_prs ?? 0,
      startedAt: row.started_at ?? null,
      finishedAt: row.finished_at ?? null,
      errorMessage: row.error_message ?? null
    };
  });

  app.get(`${apiBasePath}/integrations/github/logs`, async (request, reply) => {
    if (!ensureDatabase(reply)) return;
    const db = getPool();
    const session = await getSessionUser(request.cookies[sessionCookieName]);
    if (!session) return reply.code(401).send({ error: "unauthorized" });
    const organizationId = await getOrganizationIdForUser(session.user.id, session.activeOrganizationId);
    if (!organizationId) return { logs: [] };

    const result = await db.query(
      `
        select status, phase, total_repositories, processed_repositories, total_prs, error_message, started_at, finished_at, created_at
        from integration_sync_jobs
        where organization_id = $1
        order by created_at desc
        limit 20
      `,
      [organizationId]
    );

    return {
      logs: result.rows.map((row) => ({
        status: row.status,
        phase: row.phase,
        totalRepositories: row.total_repositories ?? 0,
        processedRepositories: row.processed_repositories ?? 0,
        totalPrs: row.total_prs ?? 0,
        errorMessage: row.error_message ?? null,
        startedAt: row.started_at ?? null,
        finishedAt: row.finished_at ?? null,
        createdAt: row.created_at ?? null
      }))
    };
  });
};
