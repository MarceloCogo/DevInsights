import type { FastifyInstance } from "fastify";
import type { RouteDeps } from "./types.js";

export const registerOrganizationRoutes = (app: FastifyInstance, deps: RouteDeps) => {
  const { apiBasePath, sessionCookieName, ensureDatabase, getPool, getSessionUser, getOrganizationIdForUser } = deps;

  app.get(`${apiBasePath}/organizations`, async (request, reply) => {
    if (!ensureDatabase(reply)) return;
    const db = getPool();
    const session = await getSessionUser(request.cookies[sessionCookieName]);
    if (!session) return reply.code(401).send({ error: "unauthorized" });
    const organizations = await db.query(
      `select o.id, o.name, om.role from organization_members om join organizations o on o.id = om.organization_id where om.user_id = $1 order by o.created_at asc`,
      [session.user.id]
    );
    const activeOrganizationId = await getOrganizationIdForUser(session.user.id, session.activeOrganizationId);
    return { organizations: organizations.rows, activeOrganizationId };
  });

  app.post(`${apiBasePath}/organizations/active`, async (request, reply) => {
    if (!ensureDatabase(reply)) return;
    const db = getPool();
    const session = await getSessionUser(request.cookies[sessionCookieName]);
    if (!session) return reply.code(401).send({ error: "unauthorized" });
    const body = request.body as { organizationId?: number };
    const organizationId = Number(body.organizationId);
    if (!organizationId) return reply.code(400).send({ error: "invalid_organization_id" });
    const membership = await db.query(
      `select organization_id from organization_members where user_id = $1 and organization_id = $2 limit 1`,
      [session.user.id, organizationId]
    );
    if ((membership.rowCount ?? 0) === 0) return reply.code(403).send({ error: "organization_access_denied" });
    await db.query(`update sessions set active_organization_id = $1 where id = $2`, [organizationId, session.sessionId]);
    return { ok: true, activeOrganizationId: organizationId };
  });

  app.get(`${apiBasePath}/app/bootstrap`, async (request, reply) => {
    if (!ensureDatabase(reply)) return;
    const db = getPool();
    const session = await getSessionUser(request.cookies[sessionCookieName]);
    if (!session) return reply.code(401).send({ error: "unauthorized" });

    const organizationId = await getOrganizationIdForUser(session.user.id, session.activeOrganizationId);
    if (!organizationId) {
      return {
        user: session.user,
        organization: null,
        organizations: [],
        activeOrganizationId: null,
        integration: { connected: false, selectedRepositories: 0 },
        sync: null,
        repositoryInsights: { repositories: 0, open_prs: 0, merged_prs: 0 }
      };
    }

    const orgResult = await db.query(`select id, name from organizations where id = $1`, [organizationId]);
    const installationResult = await db.query(`select installation_id from github_installations where organization_id = $1 limit 1`, [organizationId]);
    const selectedRepositoriesResult = await db.query(`select count(*)::int as count from tracked_repositories where organization_id = $1 and selected = true`, [organizationId]);
    const lastSyncResult = await db.query(`select id, status, processed_repositories, total_prs, error_message, started_at, finished_at from integration_sync_jobs where organization_id = $1 order by created_at desc limit 1`, [organizationId]);
    const repoStatsResult = await db.query(`select count(*)::int as repositories, coalesce(sum(open_prs), 0)::int as open_prs, coalesce(sum(merged_prs), 0)::int as merged_prs from repository_sync_stats where organization_id = $1`, [organizationId]);

    return {
      user: session.user,
      organization: orgResult.rows[0] ?? null,
      organizations: (await db.query(`select o.id, o.name, om.role from organization_members om join organizations o on o.id = om.organization_id where om.user_id = $1 order by o.created_at asc`, [session.user.id])).rows,
      activeOrganizationId: organizationId,
      integration: {
        connected: (installationResult.rowCount ?? 0) > 0,
        selectedRepositories: selectedRepositoriesResult.rows[0]?.count ?? 0
      },
      sync: lastSyncResult.rows[0] ?? null,
      repositoryInsights: repoStatsResult.rows[0] ?? { repositories: 0, open_prs: 0, merged_prs: 0 }
    };
  });

  app.get(`${apiBasePath}/onboarding/status`, async (request, reply) => {
    if (!ensureDatabase(reply)) return;
    const db = getPool();
    const session = await getSessionUser(request.cookies[sessionCookieName]);
    if (!session) return reply.code(401).send({ error: "unauthorized" });

    const organizationId = await getOrganizationIdForUser(session.user.id, session.activeOrganizationId);
    if (!organizationId) {
      return {
        organizationId: null,
        step: 0,
        githubConnected: false,
        repositoriesSelected: false,
        syncStarted: false,
        syncCompleted: false
      };
    }

    const installationResult = await db.query(`select installation_id from github_installations where organization_id = $1 limit 1`, [organizationId]);
    const reposResult = await db.query(`select count(*)::int as count from tracked_repositories where organization_id = $1 and selected = true`, [organizationId]);
    const syncResult = await db.query(`select status from integration_sync_jobs where organization_id = $1 order by created_at desc limit 1`, [organizationId]);

    const githubConnected = (installationResult.rowCount ?? 0) > 0;
    const repositoriesSelected = (reposResult.rows[0]?.count ?? 0) > 0;
    const syncStatus = (syncResult.rows[0]?.status as string | undefined) ?? null;
    const syncStarted = Boolean(syncStatus);
    const syncCompleted = syncStatus === "completed";
    const step = !githubConnected ? 1 : !repositoriesSelected ? 2 : !syncCompleted ? 3 : 4;

    return {
      organizationId,
      step,
      githubConnected,
      repositoriesSelected,
      syncStarted,
      syncCompleted,
      syncStatus
    };
  });
};
