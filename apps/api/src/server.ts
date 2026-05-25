import Fastify from "fastify";
import FastifyCookie from "@fastify/cookie";
import FastifyHelmet from "@fastify/helmet";
import FastifyRateLimit from "@fastify/rate-limit";
import FastifyStatic from "@fastify/static";
import { App as GitHubApp } from "@octokit/app";
import { Octokit } from "@octokit/rest";
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
const sessionTtlSeconds = 60 * 60 * 24 * 7;
const isProduction = process.env.NODE_ENV === "production";
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

const normalizeBaseUrl = (value: string) => {
  const trimmed = value.trim().replace(/\/$/, "");
  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

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
  ? new GitHubApp({
      appId: githubAppId,
      privateKey: githubAppPrivateKey.replace(/\\n/g, "\n")
    })
  : null;

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
      active_organization_id bigint references organizations(id),
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

    create table if not exists integration_sync_jobs (
      id bigserial primary key,
      organization_id bigint not null references organizations(id),
      status text not null,
      processed_repositories integer not null default 0,
      total_prs integer not null default 0,
      error_message text,
      started_at timestamptz,
      finished_at timestamptz,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    create table if not exists repository_sync_stats (
      organization_id bigint not null references organizations(id),
      repository_id bigint not null,
      full_name text not null,
      open_prs integer not null default 0,
      merged_prs integer not null default 0,
      updated_at timestamptz not null default now(),
      primary key (organization_id, repository_id)
    );

    create table if not exists pull_requests (
      id bigserial primary key,
      organization_id bigint not null references organizations(id),
      repository_id bigint not null,
      repository_full_name text not null,
      github_pr_id bigint not null,
      number integer not null,
      title text not null,
      author_login text,
      state text not null,
      draft boolean not null default false,
      additions integer not null default 0,
      deletions integer not null default 0,
      changed_files integer not null default 0,
      opened_at timestamptz,
      closed_at timestamptz,
      merged_at timestamptz,
      updated_at timestamptz,
      html_url text,
      created_at timestamptz not null default now(),
      unique (organization_id, repository_id, github_pr_id)
    );

    create table if not exists auth_states (
      state text primary key,
      state_type text not null,
      organization_id bigint,
      expires_at timestamptz not null,
      created_at timestamptz not null default now()
    );

    alter table sessions add column if not exists active_organization_id bigint references organizations(id);

    create unique index if not exists github_installations_installation_id_idx on github_installations (installation_id);
    create index if not exists tracked_repositories_org_selected_idx on tracked_repositories (organization_id, selected);
    create index if not exists sync_jobs_org_created_idx on integration_sync_jobs (organization_id, created_at desc);
    create index if not exists pull_requests_org_updated_idx on pull_requests (organization_id, updated_at desc);
    create index if not exists pull_requests_org_state_idx on pull_requests (organization_id, state);
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

const createAuthState = async (stateType: "oauth" | "installation", organizationId?: number) => {
  const db = getPool();
  const raw = randomBytes(24).toString("hex");
  const signature = signState(raw);
  const state = `${raw}.${signature}`;

  await db.query(
    `
      insert into auth_states (state, state_type, organization_id, expires_at)
      values ($1, $2, $3, now() + interval '10 minutes')
    `,
    [state, stateType, organizationId ?? null]
  );

  return state;
};

const consumeAuthState = async (state: string | undefined, expectedType: "oauth" | "installation") => {
  if (!state) {
    return { ok: false, organizationId: null as number | null };
  }

  const [raw, signature] = state.split(".");
  if (!raw || !signature || signState(raw) !== signature) {
    return { ok: false, organizationId: null as number | null };
  }

  const db = getPool();
  const result = await db.query(
    `
      delete from auth_states
      where state = $1 and state_type = $2 and expires_at > now()
      returning organization_id
    `,
    [state, expectedType]
  );

  if ((result.rowCount ?? 0) === 0) {
    return { ok: false, organizationId: null as number | null };
  }

  return { ok: true, organizationId: result.rows[0].organization_id as number | null };
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

const createInstallationClient = async (installationId: number) => {
  if (!githubAppClient) {
    throw new Error("github app env vars are missing");
  }

  const octokit = await githubAppClient.getInstallationOctokit(Number(installationId));
  return octokit as unknown as Octokit;
};

const getSessionUser = async (sessionId: string | undefined) => {
  if (!pool) {
    return null;
  }

  const db = pool;

  if (!sessionId) {
    return null;
  }

  const result = await db.query(
    `
      select u.id, u.github_id, u.github_login, u.name, u.avatar_url, s.active_organization_id
      from sessions s
      join users u on u.id = s.user_id
      where s.id = $1 and s.expires_at > now()
    `,
    [sessionId]
  );

  if (result.rowCount === 0) {
    return null;
  }

  return { sessionId, user: result.rows[0], activeOrganizationId: result.rows[0].active_organization_id as number | null };
};

const getOrganizationIdForUser = async (userId: number, preferredOrganizationId?: number | null) => {
  const db = getPool();

  if (preferredOrganizationId) {
    const preferred = await db.query(
      `
        select organization_id
        from organization_members
        where user_id = $1 and organization_id = $2
        limit 1
      `,
      [userId, preferredOrganizationId]
    );

    if ((preferred.rowCount ?? 0) > 0) {
      return Number(preferred.rows[0].organization_id);
    }
  }

  const orgResult = await db.query(
    `
      select organization_id
      from organization_members
      where user_id = $1
      order by created_at asc
      limit 1
    `,
    [userId]
  );

  if (orgResult.rowCount === 0) {
    return null;
  }

  return Number(orgResult.rows[0].organization_id);
};

const runInitialSync = async (organizationId: number) => {
  const db = getPool();

  const installationResult = await db.query(
    `select installation_id from github_installations where organization_id = $1 limit 1`,
    [organizationId]
  );

  if (installationResult.rowCount === 0) {
    throw new Error("missing_installation");
  }

  const selectedRepositoriesResult = await db.query(
    `
      select repository_id, full_name
      from tracked_repositories
      where organization_id = $1 and selected = true
      order by full_name asc
    `,
    [organizationId]
  );

  const repositories = selectedRepositoriesResult.rows as Array<{ repository_id: number; full_name: string }>;
  const octokit = await createInstallationClient(Number(installationResult.rows[0].installation_id));

  let totalPrs = 0;
  let processed = 0;

  for (const repository of repositories) {
    const [owner, repo] = repository.full_name.split("/");
    if (!owner || !repo) {
      continue;
    }

    const pulls = (await octokit.paginate(octokit.pulls.list, {
      owner,
      repo,
      state: "all",
      per_page: 100
    })) as Array<{
      id: number;
      number: number;
      title: string;
      state: string;
      draft: boolean;
      additions?: number;
      deletions?: number;
      changed_files?: number;
      user?: { login?: string };
      created_at?: string;
      closed_at?: string | null;
      merged_at?: string | null;
      updated_at?: string;
      html_url?: string;
    }>;
    const openPrs = pulls.filter((item) => item.state === "open").length;
    const mergedPrs = pulls.filter((item) => item.merged_at !== null).length;

    totalPrs += pulls.length;
    processed += 1;

    for (const pr of pulls) {
      await db.query(
        `
          insert into pull_requests (
            organization_id, repository_id, repository_full_name, github_pr_id, number, title, author_login,
            state, draft, additions, deletions, changed_files, opened_at, closed_at, merged_at, updated_at, html_url
          )
          values (
            $1, $2, $3, $4, $5, $6, $7,
            $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
          )
          on conflict (organization_id, repository_id, github_pr_id)
          do update set
            number = excluded.number,
            title = excluded.title,
            author_login = excluded.author_login,
            state = excluded.state,
            draft = excluded.draft,
            additions = excluded.additions,
            deletions = excluded.deletions,
            changed_files = excluded.changed_files,
            opened_at = excluded.opened_at,
            closed_at = excluded.closed_at,
            merged_at = excluded.merged_at,
            updated_at = excluded.updated_at,
            html_url = excluded.html_url
        `,
        [
          organizationId,
          repository.repository_id,
          repository.full_name,
          pr.id,
          pr.number,
          pr.title,
          pr.user?.login ?? null,
          pr.state,
          Boolean(pr.draft),
          pr.additions ?? 0,
          pr.deletions ?? 0,
          pr.changed_files ?? 0,
          pr.created_at ?? null,
          pr.closed_at ?? null,
          pr.merged_at ?? null,
          pr.updated_at ?? null,
          pr.html_url ?? null
        ]
      );
    }

    await db.query(
      `
        insert into repository_sync_stats (organization_id, repository_id, full_name, open_prs, merged_prs)
        values ($1, $2, $3, $4, $5)
        on conflict (organization_id, repository_id)
        do update set full_name = excluded.full_name, open_prs = excluded.open_prs, merged_prs = excluded.merged_prs, updated_at = now()
      `,
      [organizationId, repository.repository_id, repository.full_name, openPrs, mergedPrs]
    );
  }

  return {
    processedRepositories: processed,
    totalPrs
  };
};

const createSyncJob = async (organizationId: number) => {
  const db = getPool();
  const createdJob = await db.query(
    `
      insert into integration_sync_jobs (organization_id, status, started_at)
      values ($1, 'pending', now())
      returning id
    `,
    [organizationId]
  );

  return Number(createdJob.rows[0].id);
};

const processSyncJob = async (jobId: number, organizationId: number) => {
  const db = getPool();

  try {
    await db.query(`update integration_sync_jobs set status = 'running', updated_at = now() where id = $1`, [jobId]);
    const result = await runInitialSync(organizationId);
    await db.query(
      `
        update integration_sync_jobs
        set status = 'completed', processed_repositories = $1, total_prs = $2, finished_at = now(), updated_at = now()
        where id = $3
      `,
      [result.processedRepositories, result.totalPrs, jobId]
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "sync_failed";
    await db.query(
      `
        update integration_sync_jobs
        set status = 'failed', error_message = $1, finished_at = now(), updated_at = now()
        where id = $2
      `,
      [message, jobId]
    );
    app.log.error({ err: error, jobId, organizationId }, "sync job failed");
  }
};

app.register(FastifyCookie, {
  secret: sessionSecret
});

app.register(FastifyHelmet, {
  global: true,
  contentSecurityPolicy: false,
  hsts: isProduction
    ? {
        maxAge: 15552000,
        includeSubDomains: true,
        preload: true
      }
    : false,
  referrerPolicy: {
    policy: "strict-origin-when-cross-origin"
  }
});

app.register(FastifyRateLimit, {
  global: false,
  max: 120,
  timeWindow: "1 minute"
});

app.addHook("onRequest", async (request, reply) => {
  const origin = request.headers.origin;
  const expectedOrigin = normalizeBaseUrl(webBaseUrl || getWebBaseUrl(request));
  if (origin && origin === expectedOrigin) {
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

app.get("/health", async () => ({ status: "ok", service: "api" }));
app.get("/ready", async () => ({ status: hasDatabase ? "ready" : "degraded", service: "api" }));

app.get("/auth/github/login", async (_, reply) => reply.redirect(`${apiBasePath}/auth/github/login`));
app.get("/auth/github/callback", async (_, reply) => reply.redirect(`${apiBasePath}/auth/github/callback`));
app.get("/auth/me", async (_, reply) => reply.redirect(`${apiBasePath}/auth/me`));
app.post("/auth/logout", async (_, reply) => reply.redirect(`${apiBasePath}/auth/logout`));

app.get(
  `${apiBasePath}/auth/github/login`,
  { config: { rateLimit: { max: 20, timeWindow: "1 minute" } } },
  async (_, reply) => {
  if (!githubClientId || !githubOAuthCallbackUrl) {
    return reply.code(500).send({ error: "missing_github_oauth_env" });
  }

  const state = await createAuthState("oauth");
  const loginUrl = new URL("https://github.com/login/oauth/authorize");
  loginUrl.searchParams.set("client_id", githubClientId);
  loginUrl.searchParams.set("redirect_uri", githubOAuthCallbackUrl);
  loginUrl.searchParams.set("scope", "read:user user:email");
  loginUrl.searchParams.set("state", state);

    return reply.redirect(loginUrl.toString());
  }
);

app.get(`${apiBasePath}/auth/github/callback`, async (request, reply) => {
  if (!ensureDatabase(reply)) {
    return;
  }

  const { code, state } = request.query as { code?: string; state?: string };
  if ((code?.length ?? 0) > 512 || (state?.length ?? 0) > 512) {
    return reply.code(400).send({ error: "invalid_oauth_payload" });
  }
  const validState = await consumeAuthState(state, "oauth");
  if (!code || !validState.ok) {
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

    let activeOrganizationId: number;

    if (orgResult.rowCount === 0) {
      const organizationName = `${githubUser.login}'s Organization`;
      const createdOrg = await db.query(
        `insert into organizations (name, created_by_user_id) values ($1, $2) returning id`,
        [organizationName, user.id]
      );
      activeOrganizationId = Number(createdOrg.rows[0].id);
      await db.query(
        `insert into organization_members (organization_id, user_id, role) values ($1, $2, 'owner')`,
        [activeOrganizationId, user.id]
      );
    } else {
      activeOrganizationId = Number(orgResult.rows[0].organization_id);
    }

    const sessionId = randomBytes(24).toString("hex");
    await db.query(
      `insert into sessions (id, user_id, active_organization_id, expires_at) values ($1, $2, $3, now() + interval '7 days')`,
      [sessionId, user.id, activeOrganizationId]
    );

    reply.setCookie(sessionCookieName, sessionId, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
      maxAge: sessionTtlSeconds
    });
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
  const session = await getSessionUser(request.cookies[sessionCookieName]);
  if (!session) {
    return reply.code(401).send({ error: "unauthorized" });
  }

  const activeOrganizationId = await getOrganizationIdForUser(session.user.id, session.activeOrganizationId);
  const orgResult = await db.query(
    `
      select o.id, o.name, om.role
      from organization_members om
      join organizations o on o.id = om.organization_id
      where om.user_id = $1 and om.organization_id = $2
      limit 1
    `,
    [session.user.id, activeOrganizationId]
  );

  return {
    user: session.user,
    organization: orgResult.rows[0] ?? null,
    activeOrganizationId
  };
});

app.get(`${apiBasePath}/organizations`, async (request, reply) => {
  if (!ensureDatabase(reply)) {
    return;
  }

  const db = getPool();
  const session = await getSessionUser(request.cookies[sessionCookieName]);
  if (!session) {
    return reply.code(401).send({ error: "unauthorized" });
  }

  const organizations = await db.query(
    `
      select o.id, o.name, om.role
      from organization_members om
      join organizations o on o.id = om.organization_id
      where om.user_id = $1
      order by o.created_at asc
    `,
    [session.user.id]
  );

  const activeOrganizationId = await getOrganizationIdForUser(session.user.id, session.activeOrganizationId);

  return {
    organizations: organizations.rows,
    activeOrganizationId
  };
});

app.post(`${apiBasePath}/organizations/active`, async (request, reply) => {
  if (!ensureDatabase(reply)) {
    return;
  }

  const db = getPool();
  const session = await getSessionUser(request.cookies[sessionCookieName]);
  if (!session) {
    return reply.code(401).send({ error: "unauthorized" });
  }

  const body = request.body as { organizationId?: number };
  const organizationId = Number(body.organizationId);
  if (!organizationId) {
    return reply.code(400).send({ error: "invalid_organization_id" });
  }

  const membership = await db.query(
    `
      select organization_id
      from organization_members
      where user_id = $1 and organization_id = $2
      limit 1
    `,
    [session.user.id, organizationId]
  );

  if ((membership.rowCount ?? 0) === 0) {
    return reply.code(403).send({ error: "organization_access_denied" });
  }

  await db.query(`update sessions set active_organization_id = $1 where id = $2`, [organizationId, session.sessionId]);
  return { ok: true, activeOrganizationId: organizationId };
});

app.get(`${apiBasePath}/app/bootstrap`, async (request, reply) => {
  if (!ensureDatabase(reply)) {
    return;
  }

  const db = getPool();
  const session = await getSessionUser(request.cookies[sessionCookieName]);
  if (!session) {
    return reply.code(401).send({ error: "unauthorized" });
  }

  const organizationId = await getOrganizationIdForUser(session.user.id, session.activeOrganizationId);
  if (!organizationId) {
    return {
      user: session.user,
      organization: null,
      organizations: [],
      activeOrganizationId: null,
      integration: { connected: false, selectedRepositories: 0 },
      sync: null,
      repositoryInsights: { repositories: 0, open_prs: 0, merged_prs: 0 }
    };
  }

  const orgResult = await db.query(`select id, name from organizations where id = $1`, [organizationId]);
  const installationResult = await db.query(
    `select installation_id from github_installations where organization_id = $1 limit 1`,
    [organizationId]
  );
  const selectedRepositoriesResult = await db.query(
    `select count(*)::int as count from tracked_repositories where organization_id = $1 and selected = true`,
    [organizationId]
  );
  const lastSyncResult = await db.query(
    `
      select id, status, processed_repositories, total_prs, error_message, started_at, finished_at
      from integration_sync_jobs
      where organization_id = $1
      order by created_at desc
      limit 1
    `,
    [organizationId]
  );
  const repoStatsResult = await db.query(
    `
      select count(*)::int as repositories, coalesce(sum(open_prs), 0)::int as open_prs, coalesce(sum(merged_prs), 0)::int as merged_prs
      from repository_sync_stats
      where organization_id = $1
    `,
    [organizationId]
  );

  return {
    user: session.user,
    organization: orgResult.rows[0] ?? null,
    organizations: (
      await db.query(
        `
          select o.id, o.name, om.role
          from organization_members om
          join organizations o on o.id = om.organization_id
          where om.user_id = $1
          order by o.created_at asc
        `,
        [session.user.id]
      )
    ).rows,
    activeOrganizationId: organizationId,
    integration: {
      connected: (installationResult.rowCount ?? 0) > 0,
      selectedRepositories: selectedRepositoriesResult.rows[0]?.count ?? 0
    },
    sync: lastSyncResult.rows[0] ?? null,
    repositoryInsights: repoStatsResult.rows[0] ?? { repositories: 0, open_prs: 0, merged_prs: 0 }
  };
});

app.post(`${apiBasePath}/auth/logout`, async (request, reply) => {
  if (!ensureDatabase(reply)) {
    return;
  }

  const db = getPool();
  const session = await getSessionUser(request.cookies[sessionCookieName]);
  if (session) {
    await db.query(`delete from sessions where id = $1`, [session.sessionId]);
  }

  reply.clearCookie(sessionCookieName, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction
  });
  return reply.code(204).send();
});

app.get(`${apiBasePath}/integrations/github/install-url`, async (request, reply) => {
  if (!ensureDatabase(reply)) {
    return;
  }

  const session = await getSessionUser(request.cookies[sessionCookieName]);
  if (!session) {
    return reply.code(401).send({ error: "unauthorized" });
  }

  if (!githubAppName) {
    return reply.code(500).send({ error: "missing_github_app_name" });
  }

  const organizationId = await getOrganizationIdForUser(session.user.id, session.activeOrganizationId);
  if (!organizationId) {
    return reply.code(400).send({ error: "missing_organization" });
  }

  const state = await createAuthState("installation", organizationId);
  const installUrl = `https://github.com/apps/${githubAppName}/installations/new?state=${encodeURIComponent(state)}`;
  return { installUrl };
});

app.get(`${apiBasePath}/integrations/github/callback`, async (request, reply) => {
  if (!ensureDatabase(reply)) {
    return;
  }

  const db = getPool();
  const session = await getSessionUser(request.cookies[sessionCookieName]);
  if (!session) {
    return reply.redirect(`${getWebBaseUrl(request)}/app/login`);
  }

  const { installation_id: installationId, setup_action: setupAction, state } = request.query as {
    installation_id?: string;
    setup_action?: string;
    state?: string;
  };

  if (!installationId) {
    return reply.redirect(`${getWebBaseUrl(request)}/app?error=missing_installation_id`);
  }

  const installationState = await consumeAuthState(state, "installation");
  const organizationId = await getOrganizationIdForUser(
    session.user.id,
    (installationState.ok ? installationState.organizationId : null) ?? session.activeOrganizationId
  );

  if (!organizationId) {
    return reply.redirect(`${getWebBaseUrl(request)}/app?error=missing_organization`);
  }
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
  const session = await getSessionUser(request.cookies[sessionCookieName]);
  if (!session) {
    return reply.code(401).send({ error: "unauthorized" });
  }

  const organizationId = await getOrganizationIdForUser(session.user.id, session.activeOrganizationId);
  if (!organizationId) {
    return { connected: false, repositories: [] };
  }

  const installationResult = await db.query(
    `
      select organization_id, installation_id
      from github_installations
      where organization_id = $1
      limit 1
    `,
    [organizationId]
  );

  if (installationResult.rowCount === 0) {
    return { connected: false, repositories: [] };
  }

  const { installation_id: installationId } = installationResult.rows[0];

  try {
    const octokit = await createInstallationClient(Number(installationId));
    const payload = await octokit.paginate(octokit.apps.listReposAccessibleToInstallation, {
      per_page: 100
    });

    for (const repository of payload as Array<{ id: number; full_name: string; private: boolean }>) {
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
  const session = await getSessionUser(request.cookies[sessionCookieName]);
  if (!session) {
    return reply.code(401).send({ error: "unauthorized" });
  }

  const body = request.body as { repositoryIds?: number[] };
  const repositoryIds = Array.isArray(body.repositoryIds) ? body.repositoryIds : [];

  const organizationId = await getOrganizationIdForUser(session.user.id, session.activeOrganizationId);
  if (!organizationId) {
    return reply.code(400).send({ error: "missing_organization" });
  }

  await db.query(`update tracked_repositories set selected = false where organization_id = $1`, [organizationId]);

  if (repositoryIds.length > 0) {
    await db.query(
      `update tracked_repositories set selected = true where organization_id = $1 and repository_id = any($2::bigint[])`,
      [organizationId, repositoryIds]
    );
  }

  const jobId = await createSyncJob(organizationId);
  setImmediate(() => {
    void processSyncJob(jobId, organizationId);
  });
  return { ok: true, selectedCount: repositoryIds.length, syncStatus: "queued", jobId };
});

app.post(`${apiBasePath}/integrations/github/sync-now`, async (request, reply) => {
  if (!ensureDatabase(reply)) {
    return;
  }

  const session = await getSessionUser(request.cookies[sessionCookieName]);
  if (!session) {
    return reply.code(401).send({ error: "unauthorized" });
  }

  const organizationId = await getOrganizationIdForUser(session.user.id, session.activeOrganizationId);
  if (!organizationId) {
    return reply.code(400).send({ error: "missing_organization" });
  }

  const jobId = await createSyncJob(organizationId);
  setImmediate(() => {
    void processSyncJob(jobId, organizationId);
  });
  return { ok: true, syncStatus: "queued", jobId };
});

app.get(`${apiBasePath}/integrations/github/status`, async (request, reply) => {
  if (!ensureDatabase(reply)) {
    return;
  }

  const db = getPool();
  const session = await getSessionUser(request.cookies[sessionCookieName]);
  if (!session) {
    return reply.code(401).send({ error: "unauthorized" });
  }

  const organizationId = await getOrganizationIdForUser(session.user.id, session.activeOrganizationId);
  if (!organizationId) {
    return { connected: false, status: "disconnected" };
  }

  const installationResult = await db.query(
    `select installation_id, account_login, account_type from github_installations where organization_id = $1 limit 1`,
    [organizationId]
  );

  const selectedRepositoriesResult = await db.query(
    `select count(*)::int as count from tracked_repositories where organization_id = $1 and selected = true`,
    [organizationId]
  );

  return {
    connected: (installationResult.rowCount ?? 0) > 0,
    status: (installationResult.rowCount ?? 0) > 0 ? "connected" : "disconnected",
    installation: installationResult.rows[0] ?? null,
    selectedRepositories: selectedRepositoriesResult.rows[0]?.count ?? 0
  };
});

app.post(`${apiBasePath}/integrations/github/disconnect`, async (request, reply) => {
  if (!ensureDatabase(reply)) {
    return;
  }

  const db = getPool();
  const session = await getSessionUser(request.cookies[sessionCookieName]);
  if (!session) {
    return reply.code(401).send({ error: "unauthorized" });
  }

  const organizationId = await getOrganizationIdForUser(session.user.id, session.activeOrganizationId);
  if (!organizationId) {
    return reply.code(400).send({ error: "missing_organization" });
  }

  await db.query(`delete from github_installations where organization_id = $1`, [organizationId]);
  await db.query(`update tracked_repositories set selected = false where organization_id = $1`, [organizationId]);

  return { ok: true, status: "disconnected" };
});

app.get(`${apiBasePath}/dashboard/overview`, async (request, reply) => {
  if (!ensureDatabase(reply)) {
    return;
  }

  const db = getPool();
  const session = await getSessionUser(request.cookies[sessionCookieName]);
  if (!session) {
    return reply.code(401).send({ error: "unauthorized" });
  }

  const organizationId = await getOrganizationIdForUser(session.user.id, session.activeOrganizationId);
  if (!organizationId) {
    return reply.code(400).send({ error: "missing_organization" });
  }

  const now = new Date();
  const staleCutoff = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();

  const reposResult = await db.query(
    `select count(*)::int as count from tracked_repositories where organization_id = $1 and selected = true`,
    [organizationId]
  );
  const openResult = await db.query(
    `select count(*)::int as count from pull_requests where organization_id = $1 and state = 'open'`,
    [organizationId]
  );
  const merged7dResult = await db.query(
    `
      select count(*)::int as count
      from pull_requests
      where organization_id = $1 and merged_at >= now() - interval '7 days'
    `,
    [organizationId]
  );
  const merged30dResult = await db.query(
    `
      select count(*)::int as count
      from pull_requests
      where organization_id = $1 and merged_at >= now() - interval '30 days'
    `,
    [organizationId]
  );
  const avgSizeResult = await db.query(
    `
      select coalesce(round(avg(additions + deletions)), 0)::int as avg_size
      from pull_requests
      where organization_id = $1
    `,
    [organizationId]
  );
  const staleResult = await db.query(
    `
      select count(*)::int as count
      from pull_requests
      where organization_id = $1 and state = 'open' and coalesce(updated_at, opened_at) < $2
    `,
    [organizationId, staleCutoff]
  );
  const latestSyncResult = await db.query(
    `
      select status, started_at, finished_at, total_prs
      from integration_sync_jobs
      where organization_id = $1
      order by created_at desc
      limit 1
    `,
    [organizationId]
  );

  return {
    selectedRepositories: reposResult.rows[0]?.count ?? 0,
    openPrs: openResult.rows[0]?.count ?? 0,
    throughput7d: merged7dResult.rows[0]?.count ?? 0,
    throughput30d: merged30dResult.rows[0]?.count ?? 0,
    avgPrSize: avgSizeResult.rows[0]?.avg_size ?? 0,
    stalePrs: staleResult.rows[0]?.count ?? 0,
    lastSync: latestSyncResult.rows[0] ?? null
  };
});

app.get(`${apiBasePath}/dashboard/pull-requests`, async (request, reply) => {
  if (!ensureDatabase(reply)) {
    return;
  }

  const db = getPool();
  const session = await getSessionUser(request.cookies[sessionCookieName]);
  if (!session) {
    return reply.code(401).send({ error: "unauthorized" });
  }

  const organizationId = await getOrganizationIdForUser(session.user.id, session.activeOrganizationId);
  if (!organizationId) {
    return reply.code(400).send({ error: "missing_organization" });
  }

  const query = request.query as {
    state?: string;
    repository?: string;
    period?: "7d" | "30d";
  };

  const conditions: string[] = ["organization_id = $1"];
  const values: unknown[] = [organizationId];

  if (query.state && ["open", "closed", "all"].includes(query.state)) {
    if (query.state !== "all") {
      values.push(query.state);
      conditions.push(`state = $${values.length}`);
    }
  }

  if (query.repository) {
    values.push(query.repository);
    conditions.push(`repository_full_name = $${values.length}`);
  }

  if (query.period && ["7d", "30d"].includes(query.period)) {
    const interval = query.period === "7d" ? "7 days" : "30 days";
    conditions.push(`coalesce(updated_at, opened_at, created_at) >= now() - interval '${interval}'`);
  }

  const prsResult = await db.query(
    `
      select
        github_pr_id,
        number,
        title,
        repository_full_name,
        author_login,
        state,
        draft,
        additions,
        deletions,
        changed_files,
        opened_at,
        merged_at,
        updated_at,
        html_url
      from pull_requests
      where ${conditions.join(" and ")}
      order by coalesce(updated_at, opened_at, created_at) desc
      limit 200
    `,
    values
  );

  const reposResult = await db.query(
    `
      select distinct repository_full_name
      from pull_requests
      where organization_id = $1
      order by repository_full_name asc
    `,
    [organizationId]
  );

  return {
    repositories: reposResult.rows.map((row) => row.repository_full_name as string),
    pullRequests: prsResult.rows
  };
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
} else {
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
