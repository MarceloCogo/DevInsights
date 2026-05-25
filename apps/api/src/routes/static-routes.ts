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

  if (existsSync(webDistPath)) {
    app.register(FastifyStatic, {
      root: webDistPath,
      prefix: "/"
    });

    app.get("/", async (_, reply) => reply.sendFile("index.html"));
    app.get("/app", async (_, reply) => reply.sendFile("index.html"));
    app.get("/app/*", async (_, reply) => reply.sendFile("index.html"));
    app.get("/*", async (request, reply) => {
      if (request.url.startsWith(apiBasePath)) {
        return reply.code(404).send({ error: "not_found" });
      }

      return reply.sendFile("index.html");
    });
    return;
  }

  app.get("/", async (request, reply) => {
    const target = `${getWebBaseUrl(request)}/`;
    return reply.redirect(target);
  });

  app.get("/app", async (request, reply) => {
    const target = `${getWebBaseUrl(request)}/app`;
    return reply.redirect(target);
  });

  app.get("/app/*", async (request, reply) => {
    const suffix = request.url.replace(/^\/app/, "");
    const target = `${getWebBaseUrl(request)}/app${suffix}`;
    return reply.redirect(target);
  });
};
