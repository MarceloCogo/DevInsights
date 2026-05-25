import type { FastifyInstance } from "fastify";
import type { RouteDeps } from "./types.js";

export const registerDoraRoutes = (app: FastifyInstance, deps: RouteDeps) => {
  const { apiBasePath, sessionCookieName, ensureDatabase, getPool, getSessionUser, getOrganizationIdForUser } = deps;

  app.get(`${apiBasePath}/dashboard/dora-overview`, async (request, reply) => {
    if (!ensureDatabase(reply)) return;

    const db = getPool();
    const session = await getSessionUser(request.cookies[sessionCookieName]);
    if (!session) return reply.code(401).send({ error: "unauthorized" });

    const organizationId = await getOrganizationIdForUser(session.user.id, session.activeOrganizationId);
    if (!organizationId) return reply.code(400).send({ error: "missing_organization" });

    const productionEnvironmentsResult = await db.query(
      `select count(*)::int as count from production_environments where organization_id = $1`,
      [organizationId]
    );

    const deployments30dResult = await db.query(
      `
        select count(*)::int as count
        from deployments
        where organization_id = $1 and deployed_at >= now() - interval '30 days'
      `,
      [organizationId]
    );

    const workflowRuns30dResult = await db.query(
      `
        select count(*)::int as count
        from workflow_runs
        where organization_id = $1 and finished_at >= now() - interval '30 days'
      `,
      [organizationId]
    );

    const incidents30dResult = await db.query(
      `
        select count(*)::int as count,
               coalesce(avg(extract(epoch from (coalesce(resolved_at, now()) - started_at)) / 3600), 0)::numeric(10,2) as avg_mttr_hours
        from incidents
        where organization_id = $1 and started_at >= now() - interval '30 days'
      `,
      [organizationId]
    );

    const productionConfigured = (productionEnvironmentsResult.rows[0]?.count ?? 0) > 0;
    const deploymentsCount30d = deployments30dResult.rows[0]?.count ?? 0;
    const workflowRunsCount30d = workflowRuns30dResult.rows[0]?.count ?? 0;
    const incidentsCount30d = incidents30dResult.rows[0]?.count ?? 0;

    const status = !productionConfigured
      ? "setup_required"
      : deploymentsCount30d === 0
        ? "partial"
        : "available";

    return {
      status,
      period: "30d",
      deploymentFrequency30d: deploymentsCount30d,
      leadTimeForChangesHours: null,
      changeFailureRate: null,
      mttrHours: incidentsCount30d > 0 ? Number(incidents30dResult.rows[0]?.avg_mttr_hours ?? 0) : null,
      coverage: {
        productionEnvironmentsConfigured: productionConfigured,
        deploymentsAvailable: deploymentsCount30d > 0,
        workflowRunsAvailable: workflowRunsCount30d > 0,
        incidentsAvailable: incidentsCount30d > 0
      }
    };
  });
};
