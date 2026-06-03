import { z } from "zod";
import type { FastifyInstance } from "fastify";
import { parseBody } from "../lib/validate.js";
import { sendValidationError } from "../lib/errors.js";
import type { RouteDeps } from "./types.js";

export const registerSettingsRoutes = (app: FastifyInstance, deps: RouteDeps) => {
  const { apiBasePath, sessionCookieName, ensureDatabase, getPool, getSessionUser, getOrganizationIdForUser } = deps;

  const productionEnvironmentsSchema = z.object({
    environments: z.array(z.string().trim().min(1).max(100)).min(1).max(20),
  });

  app.post(`${apiBasePath}/settings/production-environments`, async (request, reply) => {
    if (!ensureDatabase(reply)) return;

    const db = getPool();
    const session = await getSessionUser(request.cookies[sessionCookieName]);
    if (!session) return reply.code(401).send({ error: "unauthorized" });

    const organizationId = await getOrganizationIdForUser(session.user.id, session.activeOrganizationId);
    if (!organizationId) return reply.code(400).send({ error: "missing_organization" });

    const parsed = parseBody(productionEnvironmentsSchema, request.body);
    if (!parsed.success) return sendValidationError(reply, parsed.details);
    const environments = parsed.data.environments;

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
