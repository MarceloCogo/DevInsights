import Fastify from "fastify";
import FastifyStatic from "@fastify/static";
import { SignJWT, importPKCS8 } from "jose";
import { Pool } from "pg";
import { createHmac, randomBytes } from "node:crypto";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

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
const githubClientId = process.env.GITHUB_CLIENT_ID ?? "";
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET ?? "";
const githubOAuthCallbackUrl = process.env.GITHUB_OAUTH_CALLBACK_URL ?? "";
const githubAppId = process.env.GITHUB_APP_ID ?? "";
const githubAppName = process.env.GITHUB_APP_NAME ?? "";
const githubAppPrivateKey = process.env.GITHUB_APP_PRIVATE_KEY ?? "";
const databaseUrl = process.env.DATABASE_URL;
const hasDatabase = Boolean(databaseUrl);

const oauthStateStore = new Map<string, number>();
const pool = hasDatabase ? new Pool({ connectionString: databaseUrl }) : null;
const __dirname = dirname(fileURLToPath(import.meta.url));
const webDistPath = join(__dirname, "../../web/dist");

const getWebBaseUrl = (request: { headers: Record<string, string | string[] | undefined> }) => {
  if (webBaseUrl) {
    return webBaseUrl;
  }

  const proto = (request.headers["x-forwarded-proto"] as string | undefined) ?? "http";
  const hostHeader =
    (request.headers["x-forwarded-host"] as string | undefined) ??
    (request.headers.host as string | undefined) ??
    "localhost:3000";

  return `${proto}://${hostHeader}`;
};

const signState = (raw: string) => createHmac("sha256", sessionSecret).update(raw).digest("hex");

const createState = () => {
  const raw = randomBytes(24).toString("hex");
  const signature = signState(raw);
  const state = `${raw}.${signature}`;
  oauthStateStore.set(state, Date.now() + 10 * 60 * 1000);
  return state;
};

const verifyState = (state: string | undefined) => {
  if (!state) {
    return false;
  }

  const expiry = oauthStateStore.get(state);
  if (!expiry || expiry < Date.now()) {
    return false;
  }

  const [raw, signature] = state.split(".");
  if (!raw || !signature) {
    return false;
  }

  oauthStateStore.delete(state);
  return signState(raw) === signature;
};

const parseCookies = (cookieHeader: string | undefined) => {
  if (!cookieHeader) {
    return {} as Record<string, string>;
  }

  return Object.fromEntries(
    cookieHeader
      .split(";")
      .map((part) => part.trim().split("="))
      .filter((parts) => parts.length === 2)
      .map(([key, value]) => [key, decodeURIComponent(value)])
  );
};

const setSessionCookie = (sessionId: string) => {
  const secure = process.env.NODE_ENV === "production";
  const parts = [
    `${sessionCookieName}=${encodeURIComponent(sessionId)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${60 * 60 * 24 * 7}`
  ];

  if (secure) {
    parts.push("Secure");
  }

  return parts.join("; ");
};

const clearSessionCookie = () => `${sessionCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;

const ensureSchema = async () => {
  if (!pool) {
    return;
  }

  const db = pool;

  await db.query(`
    create table if not exists users (
      id bigserial primary key,
      github_id bigint unique not null,
      github_login text unique not null,
      name text,
      avatar_url text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    create table if not exists organizations (
      id bigserial primary key,
      name text not null,
      created_by_user_id bigint not null references users(id),
      created_at timestamptz not null default now()
    );

    create table if not exists organization_members (
      organization_id bigint not null references organizations(id),
      user_id bigint not null references users(id),
      role text not null default 'owner',
      created_at timestamptz not null default now(),
      primary key (organization_id, user_id)
    );

    create table if not exists sessions (
      id text primary key,
      user_id bigint not null references users(id),
      expires_at timestamptz not null,
      created_at timestamptz not null default now()
    );

    create table if not exists github_installations (
      organization_id bigint primary key references organizations(id),
      installation_id bigint not null,
      account_login text,
      account_type text,
      installed_by_user_id bigint references users(id),
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    create table if not exists tracked_repositories (
      organization_id bigint not null references organizations(id),
      repository_id bigint not null,
      full_name text not null,
      private boolean not null,
      selected boolean not null default false,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      primary key (organization_id, repository_id)
    );
  `);
};

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
  if (pool) {
    return true;
  }

  reply.code(503).send({ error: "database_not_configured" });
  return false;
};

const getPool = () => {
  if (!pool) {
    throw new Error("database_not_configured");
  }

  return pool;
};

const exchangeOAuthCode = async (code: string) => {
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
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
  if (!body.access_token) {
    throw new Error("missing access token");
  }

  return body.access_token;
};

const createInstallationToken = async (installationId: number) => {
  if (!githubAppPrivateKey || !githubAppId) {
    throw new Error("github app env vars are missing");
  }

  const privateKey = await importPKCS8(githubAppPrivateKey.replace(/\\n/g, "\n"), "RS256");
  const now = Math.floor(Date.now() / 1000);
  const jwt = await new SignJWT({})
    .setProtectedHeader({ alg: "RS256" })
    .setIssuedAt(now - 60)
    .setExpirationTime(now + 600)
    .setIssuer(githubAppId)
    .sign(privateKey);

  const response = await fetch(`https://api.github.com/app/installations/${installationId}/access_tokens`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "DevInsights"
    }
  });

  if (!response.ok) {
    throw new Error(`failed to create installation token (${response.status})`);
  }

  const body = (await response.json()) as { token: string };
  return body.token;
};

const getSessionUser = async (cookieHeader: string | undefined) => {
  if (!pool) {
    return null;
  }

  const db = pool;

  const cookies = parseCookies(cookieHeader);
  const sessionId = cookies[sessionCookieName];

  if (!sessionId) {
    return null;
  }

  const result = await db.query(
    `
      select u.id, u.github_id, u.github_login, u.name, u.avatar_url
      from sessions s
      join users u on u.id = s.user_id
      where s.id = $1 and s.expires_at > now()
    `,
    [sessionId]
  );

  if (result.rowCount === 0) {
    return null;
  }

  return { sessionId, user: result.rows[0] };
};

app.addHook("onRequest", async (request, reply) => {
  const origin = request.headers.origin;
  const expectedOrigin = webBaseUrl || getWebBaseUrl(request);
  if (origin && origin.startsWith(expectedOrigin)) {
    reply.header("Access-Control-Allow-Origin", origin);
    reply.header("Access-Control-Allow-Credentials", "true");
    reply.header("Access-Control-Allow-Headers", "Content-Type");
  }
});

app.options("*", async (_, reply) => {
  reply.code(204).send();
});

app.get("/health", async () => ({ status: "ok", service: "api" }));
app.get("/ready", async () => ({ status: hasDatabase ? "ready" : "degraded", service: "api" }));

app.get(`${apiBasePath}/auth/github/login`, async (_, reply) => {
  if (!githubClientId || !githubOAuthCallbackUrl) {
    return reply.code(500).send({ error: "missing_github_oauth_env" });
  }

  const state = createState();
  const loginUrl = new URL("https://github.com/login/oauth/authorize");
  loginUrl.searchParams.set("client_id", githubClientId);
  loginUrl.searchParams.set("redirect_uri", githubOAuthCallbackUrl);
  loginUrl.searchParams.set("scope", "read:user user:email");
  loginUrl.searchParams.set("state", state);

  return reply.redirect(loginUrl.toString());
});

app.get(`${apiBasePath}/auth/github/callback`, async (request, reply) => {
  if (!ensureDatabase(reply)) {
    return;
  }

  const { code, state } = request.query as { code?: string; state?: string };
  if (!code || !verifyState(state)) {
    return reply.code(400).send({ error: "invalid_oauth_state_or_code" });
  }

  try {
    const db = getPool();
    const accessToken = await exchangeOAuthCode(code);
    const githubUser = await fetchGitHubUser(accessToken);

    const upsertResult = await db.query(
      `
        insert into users (github_id, github_login, name, avatar_url)
        values ($1, $2, $3, $4)
        on conflict (github_id)
        do update set github_login = excluded.github_login, name = excluded.name, avatar_url = excluded.avatar_url, updated_at = now()
        returning id, github_login, name, avatar_url
      `,
      [githubUser.id, githubUser.login, githubUser.name, githubUser.avatar_url]
    );

    const user = upsertResult.rows[0];

    const orgResult = await db.query(
      `
        select om.organization_id
        from organization_members om
        where om.user_id = $1
        order by om.created_at asc
        limit 1
      `,
      [user.id]
    );

    if (orgResult.rowCount === 0) {
      const organizationName = `${githubUser.login}'s Organization`;
      const createdOrg = await db.query(
        `insert into organizations (name, created_by_user_id) values ($1, $2) returning id`,
        [organizationName, user.id]
      );
      await db.query(
        `insert into organization_members (organization_id, user_id, role) values ($1, $2, 'owner')`,
        [createdOrg.rows[0].id, user.id]
      );
    }

    const sessionId = randomBytes(24).toString("hex");
    await db.query(`insert into sessions (id, user_id, expires_at) values ($1, $2, now() + interval '7 days')`, [
      sessionId,
      user.id
    ]);

    reply.header("Set-Cookie", setSessionCookie(sessionId));
    return reply.redirect(`${getWebBaseUrl(request)}/app`);
  } catch (error) {
    app.log.error(error);
    return reply.code(500).send({ error: "oauth_callback_failed" });
  }
});

app.get(`${apiBasePath}/auth/me`, async (request, reply) => {
  if (!ensureDatabase(reply)) {
    return;
  }

  const db = getPool();
  const session = await getSessionUser(request.headers.cookie);
  if (!session) {
    return reply.code(401).send({ error: "unauthorized" });
  }

  const orgResult = await db.query(
    `
      select o.id, o.name
      from organization_members om
      join organizations o on o.id = om.organization_id
      where om.user_id = $1
      order by om.created_at asc
      limit 1
    `,
    [session.user.id]
  );

  return {
    user: session.user,
    organization: orgResult.rows[0] ?? null
  };
});

app.post(`${apiBasePath}/auth/logout`, async (request, reply) => {
  if (!ensureDatabase(reply)) {
    return;
  }

  const db = getPool();
  const session = await getSessionUser(request.headers.cookie);
  if (session) {
    await db.query(`delete from sessions where id = $1`, [session.sessionId]);
  }

  reply.header("Set-Cookie", clearSessionCookie());
  return reply.code(204).send();
});

app.get(`${apiBasePath}/integrations/github/install-url`, async (request, reply) => {
  if (!ensureDatabase(reply)) {
    return;
  }

  const session = await getSessionUser(request.headers.cookie);
  if (!session) {
    return reply.code(401).send({ error: "unauthorized" });
  }

  if (!githubAppName) {
    return reply.code(500).send({ error: "missing_github_app_name" });
  }

  const installUrl = `https://github.com/apps/${githubAppName}/installations/new`;
  return { installUrl };
});

app.get(`${apiBasePath}/integrations/github/callback`, async (request, reply) => {
  if (!ensureDatabase(reply)) {
    return;
  }

  const db = getPool();
  const session = await getSessionUser(request.headers.cookie);
  if (!session) {
    return reply.redirect(`${getWebBaseUrl(request)}/app/login`);
  }

  const { installation_id: installationId, setup_action: setupAction } = request.query as {
    installation_id?: string;
    setup_action?: string;
  };

  if (!installationId) {
    return reply.redirect(`${getWebBaseUrl(request)}/app?error=missing_installation_id`);
  }

  const orgResult = await db.query(
    `
      select organization_id
      from organization_members
      where user_id = $1
      order by created_at asc
      limit 1
    `,
    [session.user.id]
  );

  if (orgResult.rowCount === 0) {
    return reply.redirect(`${getWebBaseUrl(request)}/app?error=missing_organization`);
  }

  const organizationId = orgResult.rows[0].organization_id;
  await db.query(
    `
      insert into github_installations (organization_id, installation_id, account_login, account_type, installed_by_user_id)
      values ($1, $2, null, null, $3)
      on conflict (organization_id)
      do update set installation_id = excluded.installation_id, installed_by_user_id = excluded.installed_by_user_id, updated_at = now()
    `,
    [organizationId, Number(installationId), session.user.id]
  );

  return reply.redirect(`${getWebBaseUrl(request)}/app?integration=${setupAction ?? "installed"}`);
});

app.get(`${apiBasePath}/integrations/github/repositories`, async (request, reply) => {
  if (!ensureDatabase(reply)) {
    return;
  }

  const db = getPool();
  const session = await getSessionUser(request.headers.cookie);
  if (!session) {
    return reply.code(401).send({ error: "unauthorized" });
  }

  const installationResult = await db.query(
    `
      select gi.organization_id, gi.installation_id
      from organization_members om
      join github_installations gi on gi.organization_id = om.organization_id
      where om.user_id = $1
      order by om.created_at asc
      limit 1
    `,
    [session.user.id]
  );

  if (installationResult.rowCount === 0) {
    return { connected: false, repositories: [] };
  }

  const { organization_id: organizationId, installation_id: installationId } = installationResult.rows[0];

  try {
    const installationToken = await createInstallationToken(Number(installationId));
    const repositoriesResponse = await fetch("https://api.github.com/installation/repositories?per_page=100", {
      headers: {
        Authorization: `Bearer ${installationToken}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "DevInsights"
      }
    });

    if (!repositoriesResponse.ok) {
      throw new Error(`failed to list installation repositories (${repositoriesResponse.status})`);
    }

    const payload = (await repositoriesResponse.json()) as {
      repositories: Array<{ id: number; full_name: string; private: boolean }>;
    };

    for (const repository of payload.repositories) {
      await db.query(
        `
          insert into tracked_repositories (organization_id, repository_id, full_name, private)
          values ($1, $2, $3, $4)
          on conflict (organization_id, repository_id)
          do update set full_name = excluded.full_name, private = excluded.private, updated_at = now()
        `,
        [organizationId, repository.id, repository.full_name, repository.private]
      );
    }

    const savedRepositories = await db.query(
      `
        select repository_id as id, full_name, private, selected
        from tracked_repositories
        where organization_id = $1
        order by full_name asc
      `,
      [organizationId]
    );

    return {
      connected: true,
      repositories: savedRepositories.rows
    };
  } catch (error) {
    app.log.error(error);
    return reply.code(500).send({ error: "repositories_sync_failed" });
  }
});

app.post(`${apiBasePath}/integrations/github/repositories/select`, async (request, reply) => {
  if (!ensureDatabase(reply)) {
    return;
  }

  const db = getPool();
  const session = await getSessionUser(request.headers.cookie);
  if (!session) {
    return reply.code(401).send({ error: "unauthorized" });
  }

  const body = request.body as { repositoryIds?: number[] };
  const repositoryIds = Array.isArray(body.repositoryIds) ? body.repositoryIds : [];

  const orgResult = await db.query(
    `
      select organization_id
      from organization_members
      where user_id = $1
      order by created_at asc
      limit 1
    `,
    [session.user.id]
  );

  if (orgResult.rowCount === 0) {
    return reply.code(400).send({ error: "missing_organization" });
  }

  const organizationId = orgResult.rows[0].organization_id;
  await db.query(`update tracked_repositories set selected = false where organization_id = $1`, [organizationId]);

  if (repositoryIds.length > 0) {
    await db.query(
      `update tracked_repositories set selected = true where organization_id = $1 and repository_id = any($2::bigint[])`,
      [organizationId, repositoryIds]
    );
  }

  return { ok: true, selectedCount: repositoryIds.length, syncStatus: "queued" };
});

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
}

const start = async () => {
  try {
    await ensureSchema();
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

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

void start();
