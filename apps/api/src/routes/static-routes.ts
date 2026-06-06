import { existsSync } from "node:fs";
import type { FastifyInstance } from "fastify";
import FastifyStatic from "@fastify/static";

export const registerStaticRoutes = (
  app: FastifyInstance,
  options: {
    webDistPath: string;
    apiBasePath: string;
    getWebBaseUrl: (request: { headers: Record<string, string | string[] | undefined>; url?: string }) => string;
  }
) => {
  const { webDistPath, apiBasePath, getWebBaseUrl } = options;

  const hasWebDist = existsSync(webDistPath);
  app.log.info({ webDistPath, hasWebDist }, "[static-routes] web dist check");

  if (hasWebDist) {
    app.register(FastifyStatic, {
      root: webDistPath,
      prefix: "/"
    });

    // SPA fallback: any non-API route that didn't match a static file serves index.html
    app.setNotFoundHandler((request, reply) => {
      if (request.url.startsWith(apiBasePath)) {
        return reply.code(404).send({ error: "not_found" });
      }
      return reply.sendFile("index.html");
    });
    return;
  }

  // Fallback: no static files available, redirect to WEB_BASE_URL
  app.log.warn({ webDistPath }, "[static-routes] web dist NOT found, using redirects");

  app.get("/", async (request, reply) => {
    const target = `${getWebBaseUrl(request)}/`;
    if (target.replace(/\/$/, "") === `${request.protocol}://${request.hostname}`) {
      return reply.code(503).send({ error: "web_dist_not_found", message: "Frontend assets not available" });
    }
    return reply.redirect(target);
  });

  app.get("/app", async (request, reply) => {
    const target = `${getWebBaseUrl(request)}/app`;
    if (new URL(target).hostname === request.hostname) {
      return reply.code(503).send({ error: "web_dist_not_found", message: "Frontend assets not available" });
    }
    return reply.redirect(target);
  });

  app.get("/app/*", async (request, reply) => {
    const suffix = request.url.replace(/^\/app/, "");
    const target = `${getWebBaseUrl(request)}/app${suffix}`;
    if (new URL(target).hostname === request.hostname) {
      return reply.code(503).send({ error: "web_dist_not_found", message: "Frontend assets not available" });
    }
    return reply.redirect(target);
  });
};
