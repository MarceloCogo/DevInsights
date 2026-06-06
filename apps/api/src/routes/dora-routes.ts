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

    const leadTimeResult = await db.query(
      `
        with production_deployments as (
          select d.repository_full_name, d.deployed_at
          from deployments d
          join production_environments pe
            on pe.organization_id = d.organization_id
           and pe.environment_name = d.environment_name
          where d.organization_id = $1
            and d.deployed_at is not null
            and d.deployed_at >= now() - interval '30 days'
        ),
        merged_prs as (
          select repository_full_name, merged_at
          from pull_requests
          where organization_id = $1
            and merged_at is not null
            and merged_at >= now() - interval '30 days'
        ),
        matched as (
          select
            p.repository_full_name,
            p.merged_at,
            (
              select min(d.deployed_at)
              from production_deployments d
              where d.repository_full_name = p.repository_full_name
                and d.deployed_at >= p.merged_at
            ) as first_deploy_at
          from merged_prs p
        )
        select
          count(*)::int as matched_prs,
          coalesce(avg(extract(epoch from (first_deploy_at - merged_at)) / 3600), 0)::numeric(10,2) as avg_lead_time_hours
        from matched
        where first_deploy_at is not null
      `,
      [organizationId]
    );

    const productionConfigured = (productionEnvironmentsResult.rows[0]?.count ?? 0) > 0;
    const deploymentsCount30d = deployments30dResult.rows[0]?.count ?? 0;
    const workflowRunsCount30d = workflowRuns30dResult.rows[0]?.count ?? 0;
    const incidentsCount30d = incidents30dResult.rows[0]?.count ?? 0;
    const matchedLeadTimePrs = leadTimeResult.rows[0]?.matched_prs ?? 0;
    const leadTimeForChangesHours = matchedLeadTimePrs > 0
      ? Number(leadTimeResult.rows[0]?.avg_lead_time_hours ?? 0)
      : null;

    // Determine quality for each metric
    const deploymentFrequencyQuality = !productionConfigured 
      ? 'missing' as const
      : deploymentsCount30d > 0 
        ? 'real' as const
        : workflowRunsCount30d > 0 
          ? 'estimated' as const
          : 'missing' as const;

    const leadTimeQuality = !productionConfigured
      ? 'missing' as const
      : matchedLeadTimePrs > 0 
        ? 'real' as const
        : 'missing' as const;

    const mttrQuality = incidentsCount30d > 0 
      ? 'real' as const
      : 'missing' as const;

    const status = !productionConfigured
      ? "setup_required"
      : deploymentsCount30d === 0 || matchedLeadTimePrs === 0
        ? "partial"
        : "available";

    return {
      status,
      period: "30d",
      deploymentFrequency30d: deploymentsCount30d,
      deploymentFrequencyQuality,
      leadTimeForChangesHours,
      leadTimeQuality,
      changeFailureRate: null,
      changeFailureRateQuality: 'missing' as const,
      mttrHours: incidentsCount30d > 0 ? Number(incidents30dResult.rows[0]?.avg_mttr_hours ?? 0) : null,
      mttrQuality,
      coverage: {
        productionEnvironmentsConfigured: productionConfigured,
        deploymentsAvailable: deploymentsCount30d > 0,
        workflowRunsAvailable: workflowRunsCount30d > 0,
        incidentsAvailable: incidentsCount30d > 0,
        leadTimeAvailable: matchedLeadTimePrs > 0
      }
    };
  });

  // DORA time series endpoint - returns daily data for charts
  app.get(`${apiBasePath}/dashboard/dora-timeseries`, async (request, reply) => {
    if (!ensureDatabase(reply)) return;

    const db = getPool();
    const session = await getSessionUser(request.cookies[sessionCookieName]);
    if (!session) return reply.code(401).send({ error: "unauthorized" });

    const organizationId = await getOrganizationIdForUser(session.user.id, session.activeOrganizationId);
    if (!organizationId) return reply.code(400).send({ error: "missing_organization" });

    const { period = "90d" } = request.query as { period?: string };
    const days = period === "30d" ? 30 : period === "60d" ? 60 : 90;

    // Cycle Time (lead time) per week
    const cycleTimeResult = await db.query(
      `
        with production_deployments as (
          select d.repository_full_name, d.deployed_at
          from deployments d
          join production_environments pe
            on pe.organization_id = d.organization_id
           and pe.environment_name = d.environment_name
          where d.organization_id = $1
            and d.deployed_at >= now() - interval '1 day' * $2
        ),
        merged_prs as (
          select repository_full_name, merged_at, opened_at
          from pull_requests
          where organization_id = $1
            and merged_at is not null
            and merged_at >= now() - interval '1 day' * $2
        ),
        matched as (
          select
            p.merged_at,
            p.opened_at,
            extract(epoch from (p.merged_at - p.opened_at)) / 3600 as cycle_hours
          from merged_prs p
        )
        select
          date_trunc('week', merged_at)::date as week,
          coalesce(avg(cycle_hours), 0)::numeric(10,2) as avg_cycle_hours,
          count(*)::int as pr_count
        from matched
        group by week
        order by week
      `,
      [organizationId, days]
    );

    // Deploy Frequency per week
    const deployFreqResult = await db.query(
      `
        select
          date_trunc('week', deployed_at)::date as week,
          count(*)::int as deploys
        from deployments
        where organization_id = $1
          and deployed_at >= now() - interval '1 day' * $2
        group by week
        order by week
      `,
      [organizationId, days]
    );

    // MTTR per week
    const mttrResult = await db.query(
      `
        select
          date_trunc('week', started_at)::date as week,
          coalesce(avg(extract(epoch from (coalesce(resolved_at, now()) - started_at)) / 3600), 0)::numeric(10,2) as avg_mttr_hours,
          count(*)::int as incidents
        from incidents
        where organization_id = $1
          and started_at >= now() - interval '1 day' * $2
        group by week
        order by week
      `,
      [organizationId, days]
    );

    // Change Failure Rate per week
    const cfrResult = await db.query(
      `
        select
          date_trunc('week', d.deployed_at)::date as week,
          count(*)::int as total_deploys,
          count(*) filter (where d.state = 'failure')::int as failed_deploys
        from deployments d
        where d.organization_id = $1
          and d.deployed_at >= now() - interval '1 day' * $2
        group by week
        order by week
      `,
      [organizationId, days]
    );

    return {
      period,
      cycleTime: cycleTimeResult.rows.map((r: any) => ({
        week: r.week,
        avgHours: Number(r.avg_cycle_hours),
        prCount: r.pr_count
      })),
      deployFrequency: deployFreqResult.rows.map((r: any) => ({
        week: r.week,
        deploys: r.deploys
      })),
      mttr: mttrResult.rows.map((r: any) => ({
        week: r.week,
        avgHours: Number(r.avg_mttr_hours),
        incidents: r.incidents
      })),
      cfr: cfrResult.rows.map((r: any) => ({
        week: r.week,
        totalDeploys: r.total_deploys,
        failedDeploys: r.failed_deploys,
        rate: r.total_deploys > 0 ? Number(((r.failed_deploys / r.total_deploys) * 100).toFixed(1)) : 0
      }))
    };
  });
};
