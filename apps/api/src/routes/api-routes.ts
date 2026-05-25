import type { FastifyInstance } from "fastify";
import { registerAuthRoutes } from "./auth-routes.js";
import { registerDashboardRoutes } from "./dashboard-routes.js";
import { registerIntegrationRoutes } from "./integration-routes.js";
import { registerOrganizationRoutes } from "./organization-routes.js";
import { registerSystemRoutes } from "./system-routes.js";
import type { RouteDeps } from "./types.js";

export const registerApiRoutes = (app: FastifyInstance, deps: RouteDeps) => {
  registerSystemRoutes(app, { apiBasePath: deps.apiBasePath, hasDatabase: deps.hasDatabase });
  registerAuthRoutes(app, deps);
  registerOrganizationRoutes(app, deps);
  registerIntegrationRoutes(app, deps);
  registerDashboardRoutes(app, deps);
};

export type { RouteDeps } from "./types.js";
