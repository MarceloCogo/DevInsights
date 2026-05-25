import type { FastifyInstance } from "fastify";
import type { RouteDeps } from "./types.js";

export const registerDashboardRoutes = (app: FastifyInstance, deps: RouteDeps) => {
  const { apiBasePath, sessionCookieName, ensureDatabase, getPool, getSessionUser, getOrganizationIdForUser } = deps;

  app.get(`${apiBasePath}/dashboard/overview`, async (request, reply) => {
    if (!ensureDatabase(reply)) return;
    const db = getPool();
    const session = await getSessionUser(request.cookies[sessionCookieName]);
    if (!session) return reply.code(401).send({ error: "unauthorized" });
    const organizationId = await getOrganizationIdForUser(session.user.id, session.activeOrganizationId);
    if (!organizationId) return reply.code(400).send({ error: "missing_organization" });
    const staleCutoff = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const reposResult = await db.query(`select count(*)::int as count from tracked_repositories where organization_id = $1 and selected = true`, [organizationId]);
    const openResult = await db.query(`select count(*)::int as count from pull_requests where organization_id = $1 and state = 'open'`, [organizationId]);
    const merged7dResult = await db.query(`select count(*)::int as count from pull_requests where organization_id = $1 and merged_at >= now() - interval '7 days'`, [organizationId]);
    const merged30dResult = await db.query(`select count(*)::int as count from pull_requests where organization_id = $1 and merged_at >= now() - interval '30 days'`, [organizationId]);
    const avgSizeResult = await db.query(`select coalesce(round(avg(additions + deletions)), 0)::int as avg_size from pull_requests where organization_id = $1`, [organizationId]);
    const staleResult = await db.query(`select count(*)::int as count from pull_requests where organization_id = $1 and state = 'open' and coalesce(updated_at, opened_at) < $2`, [organizationId, staleCutoff]);
    const latestSyncResult = await db.query(`select status, started_at, finished_at, total_prs from integration_sync_jobs where organization_id = $1 order by created_at desc limit 1`, [organizationId]);
    return {
      selectedRepositories: reposResult.rows[0]?.count ?? 0,
      openPrs: openResult.rows[0]?.count ?? 0,
      throughput7d: merged7dResult.rows[0]?.count ?? 0,
      throughput30d: merged30dResult.rows[0]?.count ?? 0,
      avgPrSize: avgSizeResult.rows[0]?.avg_size ?? 0,
      stalePrs: staleResult.rows[0]?.count ?? 0,
      lastSync: latestSyncResult.rows[0] ?? null
    };
  });

  app.get(`${apiBasePath}/dashboard/pull-requests`, async (request, reply) => {
    if (!ensureDatabase(reply)) return;
    const db = getPool();
    const session = await getSessionUser(request.cookies[sessionCookieName]);
    if (!session) return reply.code(401).send({ error: "unauthorized" });
    const organizationId = await getOrganizationIdForUser(session.user.id, session.activeOrganizationId);
    if (!organizationId) return reply.code(400).send({ error: "missing_organization" });
    const query = request.query as { state?: string; repository?: string; period?: "7d" | "30d" };
    const conditions: string[] = ["organization_id = $1"];
    const values: unknown[] = [organizationId];
    if (query.state && ["open", "closed", "all"].includes(query.state) && query.state !== "all") {
      values.push(query.state);
      conditions.push(`state = $${values.length}`);
    }
    if (query.repository) {
      values.push(query.repository);
      conditions.push(`repository_full_name = $${values.length}`);
    }
    if (query.period && ["7d", "30d"].includes(query.period)) {
      const interval = query.period === "7d" ? "7 days" : "30 days";
      conditions.push(`coalesce(updated_at, opened_at, created_at) >= now() - interval '${interval}'`);
    }

    const prsResult = await db.query(
      `
        select github_pr_id, number, title, repository_full_name, author_login, state, draft, additions, deletions, changed_files, opened_at, merged_at, updated_at, html_url
        from pull_requests
        where ${conditions.join(" and ")}
        order by coalesce(updated_at, opened_at, created_at) desc
        limit 200
      `,
      values
    );
    const reposResult = await db.query(`select distinct repository_full_name from pull_requests where organization_id = $1 order by repository_full_name asc`, [organizationId]);
    return {
      repositories: reposResult.rows.map((row) => row.repository_full_name as string),
      pullRequests: prsResult.rows
    };
  });
};
