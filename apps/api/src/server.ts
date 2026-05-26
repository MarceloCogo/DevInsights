import Fastify from "fastify";
import FastifyCookie from "@fastify/cookie";
import FastifyHelmet from "@fastify/helmet";
import FastifyRateLimit from "@fastify/rate-limit";
import { App as GitHubApp } from "@octokit/app";
import { Octokit } from "@octokit/rest";
import { existsSync } from "node:fs";
import { Pool } from "pg";
import { createHmac, randomBytes } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { registerApiRoutes } from "./routes/api-routes.js";
import { registerStaticRoutes } from "./routes/static-routes.js";
import { runMigrations } from "./storage/migration-runner.js";

type GitHubUser = {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string | null;
};

const app = Fastify({ logger: true });

const port = Number(process.env.PORT ?? process.env.API_PORT ?? 3001);
const host = "0.0.0.0";
const apiBasePath = "/api/v1";
const webBaseUrl = process.env.WEB_BASE_URL ?? "";
const sessionCookieName = process.env.SESSION_COOKIE_NAME ?? "devinsights.sid";
const sessionSecret = process.env.SESSION_SECRET ?? "dev-secret";
const sessionTtlSeconds = 60 * 60 * 24 * 7;
const isProduction = process.env.NODE_ENV === "production";
const sessionCookieSameSite =
  (process.env.SESSION_COOKIE_SAME_SITE as "lax" | "strict" | "none" | undefined) ??
  (isProduction ? "none" : "lax");
const githubClientId = process.env.GITHUB_CLIENT_ID ?? "";
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET ?? "";
const githubOAuthCallbackUrl = process.env.GITHUB_OAUTH_CALLBACK_URL ?? "";
const githubAppId = process.env.GITHUB_APP_ID ?? "";
const githubAppName = process.env.GITHUB_APP_NAME ?? "";
const githubAppPrivateKey = process.env.GITHUB_APP_PRIVATE_KEY ?? "";
const databaseUrl = process.env.DATABASE_URL;
const hasDatabase = Boolean(databaseUrl);

const pool = hasDatabase ? new Pool({ connectionString: databaseUrl }) : null;
const __dirname = dirname(fileURLToPath(import.meta.url));
const webDistPath = join(__dirname, "../../web/dist");
const migrationsPathCandidates = [
  join(__dirname, "./storage/migrations"),
  join(__dirname, "../src/storage/migrations")
];
const migrationsPath = migrationsPathCandidates.find((candidate) => existsSync(candidate)) ?? migrationsPathCandidates[0];

const normalizeBaseUrl = (value: string) => {
  const trimmed = value.trim().replace(/\/$/, "");
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `https://${trimmed}`;
};

const getWebBaseUrl = (request: { headers: Record<string, string | string[] | undefined> }) => {
  if (webBaseUrl) {
    return normalizeBaseUrl(webBaseUrl);
  }

  const proto = (request.headers["x-forwarded-proto"] as string | undefined) ?? "http";
  const hostHeader =
    (request.headers["x-forwarded-host"] as string | undefined) ??
    (request.headers.host as string | undefined) ??
    "localhost:3000";

  return normalizeBaseUrl(`${proto}://${hostHeader}`);
};

const signState = (raw: string) => createHmac("sha256", sessionSecret).update(raw).digest("hex");

const githubAppClient = githubAppId && githubAppPrivateKey
  ? new GitHubApp({ appId: githubAppId, privateKey: githubAppPrivateKey.replace(/\\n/g, "\n") })
  : null;

const fetchGitHubUser = async (accessToken: string): Promise<GitHubUser> => {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "DevInsights"
    }
  });

  if (!response.ok) {
    throw new Error(`failed to fetch github user (${response.status})`);
  }

  return (await response.json()) as GitHubUser;
};

const ensureDatabase = (reply: { code: (statusCode: number) => { send: (payload: unknown) => unknown } }) => {
  if (pool) return true;
  reply.code(503).send({ error: "database_not_configured" });
  return false;
};

const getPool = () => {
  if (!pool) {
    throw new Error("database_not_configured");
  }
  return pool;
};

const createAuthState = async (stateType: "oauth" | "installation", organizationId?: number) => {
  const raw = randomBytes(24).toString("hex");
  const signature = signState(raw);
  const state = `${raw}.${signature}`;
  await getPool().query(
    `insert into auth_states (state, state_type, organization_id, expires_at) values ($1, $2, $3, now() + interval '10 minutes')`,
    [state, stateType, organizationId ?? null]
  );
  return state;
};

const consumeAuthState = async (state: string | undefined, expectedType: "oauth" | "installation") => {
  if (!state) return { ok: false, organizationId: null as number | null };
  const [raw, signature] = state.split(".");
  if (!raw || !signature || signState(raw) !== signature) {
    return { ok: false, organizationId: null as number | null };
  }

  const result = await getPool().query(
    `delete from auth_states where state = $1 and state_type = $2 and expires_at > now() returning organization_id`,
    [state, expectedType]
  );

  if ((result.rowCount ?? 0) === 0) return { ok: false, organizationId: null as number | null };
  return { ok: true, organizationId: result.rows[0].organization_id as number | null };
};

const exchangeOAuthCode = async (code: string) => {
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: githubClientId,
      client_secret: githubClientSecret,
      code,
      redirect_uri: githubOAuthCallbackUrl
    })
  });

  if (!response.ok) {
    throw new Error(`oauth exchange failed (${response.status})`);
  }

  const body = (await response.json()) as { access_token?: string };
  if (!body.access_token) throw new Error("missing access token");
  return body.access_token;
};

const createInstallationClient = async (installationId: number) => {
  if (!githubAppClient) {
    throw new Error("github app env vars are missing");
  }
  const octokit = await githubAppClient.getInstallationOctokit(Number(installationId));
  return octokit as unknown as Octokit;
};

const resolveInstallationIdForAccount = async (accountLogin: string) => {
  if (!githubAppClient || !accountLogin) return null;

  try {
    const installationsResponse = await githubAppClient.octokit.request("GET /app/installations", {
      per_page: 100
    });
    const match = installationsResponse.data.find(
      (installation) => installation.account?.login?.toLowerCase() === accountLogin.toLowerCase()
    );
    return match ? Number(match.id) : null;
  } catch (error) {
    app.log.error({ error, accountLogin }, "failed to resolve installation for account");
    return null;
  }
};

const getSessionUser = async (sessionId: string | undefined) => {
  if (!pool || !sessionId) return null;
  const result = await pool.query(
    `
      select u.id, u.github_id, u.github_login, u.name, u.avatar_url, s.active_organization_id
      from sessions s
      join users u on u.id = s.user_id
      where s.id = $1 and s.expires_at > now()
    `,
    [sessionId]
  );
  if (result.rowCount === 0) return null;
  return { sessionId, user: result.rows[0], activeOrganizationId: result.rows[0].active_organization_id as number | null };
};

const getOrganizationIdForUser = async (userId: number, preferredOrganizationId?: number | null) => {
  const db = getPool();
  if (preferredOrganizationId) {
    const preferred = await db.query(
      `select organization_id from organization_members where user_id = $1 and organization_id = $2 limit 1`,
      [userId, preferredOrganizationId]
    );
    if ((preferred.rowCount ?? 0) > 0) {
      return Number(preferred.rows[0].organization_id);
    }
  }

  const orgResult = await db.query(
    `select organization_id from organization_members where user_id = $1 order by created_at asc limit 1`,
    [userId]
  );
  if (orgResult.rowCount === 0) return null;
  return Number(orgResult.rows[0].organization_id);
};

const createSyncJob = async (organizationId: number) => {
  const createdJob = await getPool().query(
    `insert into integration_sync_jobs (organization_id, status, started_at) values ($1, 'pending', now()) returning id`,
    [organizationId]
  );
  return Number(createdJob.rows[0].id);
};

app.register(FastifyCookie, { secret: sessionSecret });
app.register(FastifyHelmet, {
  global: true,
  contentSecurityPolicy: false,
  hsts: isProduction
    ? { maxAge: 15552000, includeSubDomains: true, preload: true }
    : false,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
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

app.options("*", async (_, reply) => {
  reply.code(204).send();
});

registerApiRoutes(app, {
  apiBasePath,
  githubClientId,
  githubOAuthCallbackUrl,
  githubAppName,
  sessionCookieName,
  sessionCookieSameSite,
  sessionTtlSeconds,
  isProduction,
  hasDatabase,
  ensureDatabase,
  getPool,
  createAuthState,
  consumeAuthState,
  exchangeOAuthCode,
  fetchGitHubUser,
  getSessionUser,
  getOrganizationIdForUser,
  createInstallationClient,
  resolveInstallationIdForAccount,
  createSyncJob,
  getWebBaseUrl
});

registerStaticRoutes(app, {
  webDistPath,
  apiBasePath,
  getWebBaseUrl
});

const start = async () => {
  try {
    if (pool) {
      await runMigrations(pool, migrationsPath);
    }
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
  if (pool) {
    await pool.end();
  }
  process.exit(0);
};

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});
process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

void start();
