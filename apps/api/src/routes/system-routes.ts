import type { FastifyInstance } from "fastify";

export const registerSystemRoutes = (app: FastifyInstance, options: { apiBasePath: string; hasDatabase: boolean }) => {
  const { apiBasePath, hasDatabase } = options;

  app.get("/health", async () => ({ status: "ok", service: "api" }));
  app.get("/ready", async () => ({ status: hasDatabase ? "ready" : "degraded", service: "api" }));

  app.get("/auth/github/login", async (_, reply) => reply.redirect(`${apiBasePath}/auth/github/login`));
  app.get("/auth/github/callback", async (_, reply) => reply.redirect(`${apiBasePath}/auth/github/callback`));
  app.get("/auth/me", async (_, reply) => reply.redirect(`${apiBasePath}/auth/me`));
  app.post("/auth/logout", async (_, reply) => reply.redirect(`${apiBasePath}/auth/logout`));
};
