import Fastify from "fastify";
import FastifyCookie from "@fastify/cookie";
import FastifyHelmet from "@fastify/helmet";
import FastifyRateLimit from "@fastify/rate-limit";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./lib/config.js";
import { ensureDatabase, getPool, getOrganizationIdForUser, getRawPool } from "./lib/db.js";
import { createAuthState, consumeAuthState, getSessionUser } from "./lib/session.js";
import { exchangeOAuthCode, fetchGitHubUser } from "./lib/github-oauth.js";
import { createInstallationClient, resolveInstallationIdForAccount } from "./lib/github-app.js";
import { createSyncJob } from "./lib/sync-jobs.js";
import { normalizeBaseUrl, getWebBaseUrl } from "./lib/web.js";
import { registerApiRoutes } from "./routes/api-routes.js";
import { registerStaticRoutes } from "./routes/static-routes.js";
import { runMigrations } from "./storage/migration-runner.js";

const {
  port, host, apiBasePath, isProduction, webBaseUrl,
  sessionCookieName, sessionSecret, sessionTtlSeconds, sessionCookieSameSite,
  githubClientId, githubOAuthCallbackUrl, githubAppName, hasDatabase,
} = config;

const __dirname = dirname(fileURLToPath(import.meta.url));
const webDistPath = join(__dirname, "../../web/dist");
const migrationsPathCandidates = [
  join(__dirname, "./storage/migrations"),
  join(__dirname, "../src/storage/migrations"),
];
const migrationsPath =
  migrationsPathCandidates.find((p) => existsSync(p)) ?? migrationsPathCandidates[0];

// ── Fastify instance ──────────────────────────────────────────────────────────

const app = Fastify({
  logger: true,
  genReqId: () => randomUUID(),
  requestIdHeader: "x-request-id",
});

app.register(FastifyCookie, { secret: sessionSecret });
app.register(FastifyHelmet, {
  global: true,
  contentSecurityPolicy: false,
  hsts: isProduction ? { maxAge: 15552000, includeSubDomains: true, preload: true } : false,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
});
app.register(FastifyRateLimit, { global: false, max: 120, timeWindow: "1 minute" });

app.addHook("onRequest", async (request, reply) => {
  const origin = request.headers.origin;
  const expectedOrigin = normalizeBaseUrl(webBaseUrl || getWebBaseUrl(request));
  if (origin && normalizeBaseUrl(origin) === expectedOrigin) {
    reply.header("Access-Control-Allow-Origin", origin);
    reply.header("Access-Control-Allow-Credentials", "true");
    reply.header("Access-Control-Allow-Headers", "Content-Type, X-Requested-With");
    reply.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    reply.header("Vary", "Origin");
  }
});

app.options("*", async (_, reply) => { reply.code(204).send(); });

app.setErrorHandler((error, request, reply) => {
  app.log.error({ err: error, url: request.url, method: request.method }, "unhandled error");
  const err = error as { statusCode?: number; code?: string; message?: string };
  const statusCode = err.statusCode ?? 500;
  if (statusCode >= 500) {
    return reply.code(statusCode).send({
      error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" },
    });
  }
  return reply.code(statusCode).send({
    error: { code: err.code ?? "ERROR", message: err.message ?? "Request failed" },
  });
});

// ── Routes ────────────────────────────────────────────────────────────────────

registerApiRoutes(app, {
  apiBasePath, githubClientId, githubOAuthCallbackUrl, githubAppName,
  sessionCookieName, sessionCookieSameSite, sessionTtlSeconds, isProduction, hasDatabase,
  ensureDatabase, getPool, createAuthState, consumeAuthState,
  exchangeOAuthCode, fetchGitHubUser, getSessionUser, getOrganizationIdForUser,
  createInstallationClient, resolveInstallationIdForAccount, createSyncJob, getWebBaseUrl,
});

registerStaticRoutes(app, { webDistPath, apiBasePath, getWebBaseUrl });

// ── Lifecycle ─────────────────────────────────────────────────────────────────

const start = async () => {
  try {
    const pool = getRawPool();
    if (pool) await runMigrations(pool, migrationsPath);
    await app.listen({ port, host });
    app.log.info({ hasDatabase }, `api listening on ${port}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

const shutdown = async (signal: NodeJS.Signals) => {
  app.log.info({ signal }, "shutting down api");
  await app.close();
  const pool = getRawPool();
  if (pool) await pool.end();
  process.exit(0);
};

process.on("SIGINT", () => { void shutdown("SIGINT"); });
process.on("SIGTERM", () => { void shutdown("SIGTERM"); });

void start();
