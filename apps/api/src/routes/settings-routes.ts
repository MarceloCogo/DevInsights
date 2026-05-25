import type { FastifyInstance } from "fastify";
import type { RouteDeps } from "./types.js";

export const registerSettingsRoutes = (app: FastifyInstance, deps: RouteDeps) => {
  const { apiBasePath, sessionCookieName, ensureDatabase, getPool, getSessionUser, getOrganizationIdForUser } = deps;

  app.post(`${apiBasePath}/settings/production-environments`, async (request, reply) => {
    if (!ensureDatabase(reply)) return;

    const db = getPool();
    const session = await getSessionUser(request.cookies[sessionCookieName]);
    if (!session) return reply.code(401).send({ error: "unauthorized" });

    const organizationId = await getOrganizationIdForUser(session.user.id, session.activeOrganizationId);
    if (!organizationId) return reply.code(400).send({ error: "missing_organization" });

    const body = request.body as { environments?: string[] };
    const environments = Array.isArray(body.environments)
      ? body.environments.map((item) => item.trim()).filter((item) => item.length > 0)
      : [];

    if (environments.length === 0) {
      return reply.code(400).send({ error: "invalid_environments" });
    }

    await db.query(`delete from production_environments where organization_id = $1`, [organizationId]);

    for (const environment of environments) {
      await db.query(
        `insert into production_environments (organization_id, environment_name) values ($1, $2) on conflict do nothing`,
        [organizationId, environment]
      );
    }

    return {
      ok: true,
      organizationId,
      environments
    };
  });
};
