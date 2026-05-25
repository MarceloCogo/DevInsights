import { randomBytes } from "node:crypto";
import type { FastifyInstance } from "fastify";

type GitHubUser = {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string | null;
};

type RouteDeps = {
  apiBasePath: string;
  githubClientId: string;
  githubOAuthCallbackUrl: string;
  githubAppName: string;
  sessionCookieName: string;
  sessionCookieSameSite: "lax" | "strict" | "none";
  sessionTtlSeconds: number;
  isProduction: boolean;
  hasDatabase: boolean;
  ensureDatabase: (reply: { code: (statusCode: number) => { send: (payload: unknown) => unknown } }) => boolean;
  getPool: () => { query: (query: string, values?: unknown[]) => Promise<{ rowCount: number | null; rows: any[] }> };
  createAuthState: (stateType: "oauth" | "installation", organizationId?: number) => Promise<string>;
  consumeAuthState: (state: string | undefined, expectedType: "oauth" | "installation") => Promise<{ ok: boolean; organizationId: number | null }>;
  exchangeOAuthCode: (code: string) => Promise<string>;
  fetchGitHubUser: (accessToken: string) => Promise<GitHubUser>;
  getSessionUser: (sessionId: string | undefined) => Promise<{ sessionId: string; user: any; activeOrganizationId: number | null } | null>;
  getOrganizationIdForUser: (userId: number, preferredOrganizationId?: number | null) => Promise<number | null>;
  createInstallationClient: (installationId: number) => Promise<any>;
  createSyncJob: (organizationId: number) => Promise<number>;
  getWebBaseUrl: (request: { headers: Record<string, string | string[] | undefined> }) => string;
};

export const registerApiRoutes = (app: FastifyInstance, deps: RouteDeps) => {
  const {
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
    createSyncJob,
    getWebBaseUrl
  } = deps;

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
        sameSite: sessionCookieSameSite,
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
    if (!ensureDatabase(reply)) return;
    const db = getPool();
    const session = await getSessionUser(request.cookies[sessionCookieName]);
    if (!session) return reply.code(401).send({ error: "unauthorized" });
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
    return { user: session.user, organization: orgResult.rows[0] ?? null, activeOrganizationId };
  });

  app.get(`${apiBasePath}/organizations`, async (request, reply) => {
    if (!ensureDatabase(reply)) return;
    const db = getPool();
    const session = await getSessionUser(request.cookies[sessionCookieName]);
    if (!session) return reply.code(401).send({ error: "unauthorized" });
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
    return { organizations: organizations.rows, activeOrganizationId };
  });

  app.post(`${apiBasePath}/organizations/active`, async (request, reply) => {
    if (!ensureDatabase(reply)) return;
    const db = getPool();
    const session = await getSessionUser(request.cookies[sessionCookieName]);
    if (!session) return reply.code(401).send({ error: "unauthorized" });
    const body = request.body as { organizationId?: number };
    const organizationId = Number(body.organizationId);
    if (!organizationId) return reply.code(400).send({ error: "invalid_organization_id" });
    const membership = await db.query(
      `select organization_id from organization_members where user_id = $1 and organization_id = $2 limit 1`,
      [session.user.id, organizationId]
    );
    if ((membership.rowCount ?? 0) === 0) return reply.code(403).send({ error: "organization_access_denied" });
    await db.query(`update sessions set active_organization_id = $1 where id = $2`, [organizationId, session.sessionId]);
    return { ok: true, activeOrganizationId: organizationId };
  });

  app.get(`${apiBasePath}/app/bootstrap`, async (request, reply) => {
    if (!ensureDatabase(reply)) return;
    const db = getPool();
    const session = await getSessionUser(request.cookies[sessionCookieName]);
    if (!session) return reply.code(401).send({ error: "unauthorized" });

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
    const installationResult = await db.query(`select installation_id from github_installations where organization_id = $1 limit 1`, [organizationId]);
    const selectedRepositoriesResult = await db.query(`select count(*)::int as count from tracked_repositories where organization_id = $1 and selected = true`, [organizationId]);
    const lastSyncResult = await db.query(`select id, status, processed_repositories, total_prs, error_message, started_at, finished_at from integration_sync_jobs where organization_id = $1 order by created_at desc limit 1`, [organizationId]);
    const repoStatsResult = await db.query(`select count(*)::int as repositories, coalesce(sum(open_prs), 0)::int as open_prs, coalesce(sum(merged_prs), 0)::int as merged_prs from repository_sync_stats where organization_id = $1`, [organizationId]);

    return {
      user: session.user,
      organization: orgResult.rows[0] ?? null,
      organizations: (await db.query(`select o.id, o.name, om.role from organization_members om join organizations o on o.id = om.organization_id where om.user_id = $1 order by o.created_at asc`, [session.user.id])).rows,
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
    if (!ensureDatabase(reply)) return;
    const db = getPool();
    const session = await getSessionUser(request.cookies[sessionCookieName]);
    if (session) await db.query(`delete from sessions where id = $1`, [session.sessionId]);
    reply.clearCookie(sessionCookieName, {
      path: "/",
      httpOnly: true,
      sameSite: sessionCookieSameSite,
      secure: isProduction
    });
    return reply.code(204).send();
  });

  app.get(`${apiBasePath}/integrations/github/install-url`, async (request, reply) => {
    if (!ensureDatabase(reply)) return;
    const session = await getSessionUser(request.cookies[sessionCookieName]);
    if (!session) return reply.code(401).send({ error: "unauthorized" });
    if (!githubAppName) return reply.code(500).send({ error: "missing_github_app_name" });
    const organizationId = await getOrganizationIdForUser(session.user.id, session.activeOrganizationId);
    if (!organizationId) return reply.code(400).send({ error: "missing_organization" });
    const state = await createAuthState("installation", organizationId);
    const installUrl = `https://github.com/apps/${githubAppName}/installations/new?state=${encodeURIComponent(state)}`;
    return { installUrl };
  });

  app.get(`${apiBasePath}/integrations/github/callback`, async (request, reply) => {
    if (!ensureDatabase(reply)) return;
    const db = getPool();
    const session = await getSessionUser(request.cookies[sessionCookieName]);
    if (!session) return reply.redirect(`${getWebBaseUrl(request)}/app/login`);
    const { installation_id: installationId, setup_action: setupAction, state } = request.query as { installation_id?: string; setup_action?: string; state?: string };
    if (!installationId) return reply.redirect(`${getWebBaseUrl(request)}/app?error=missing_installation_id`);
    const installationState = await consumeAuthState(state, "installation");
    const organizationId = await getOrganizationIdForUser(session.user.id, (installationState.ok ? installationState.organizationId : null) ?? session.activeOrganizationId);
    if (!organizationId) return reply.redirect(`${getWebBaseUrl(request)}/app?error=missing_organization`);
    await db.query(`insert into github_installations (organization_id, installation_id, account_login, account_type, installed_by_user_id) values ($1, $2, null, null, $3) on conflict (organization_id) do update set installation_id = excluded.installation_id, installed_by_user_id = excluded.installed_by_user_id, updated_at = now()`, [organizationId, Number(installationId), session.user.id]);
    return reply.redirect(`${getWebBaseUrl(request)}/app?integration=${setupAction ?? "installed"}`);
  });

  app.get(`${apiBasePath}/integrations/github/repositories`, async (request, reply) => {
    if (!ensureDatabase(reply)) return;
    const db = getPool();
    const session = await getSessionUser(request.cookies[sessionCookieName]);
    if (!session) return reply.code(401).send({ error: "unauthorized" });
    const organizationId = await getOrganizationIdForUser(session.user.id, session.activeOrganizationId);
    if (!organizationId) return { connected: false, repositories: [] };
    const installationResult = await db.query(`select organization_id, installation_id from github_installations where organization_id = $1 limit 1`, [organizationId]);
    if (installationResult.rowCount === 0) return { connected: false, repositories: [] };
    const { installation_id: installationId } = installationResult.rows[0];
    try {
      const octokit = await createInstallationClient(Number(installationId));
      const payload = await octokit.paginate(octokit.apps.listReposAccessibleToInstallation, { per_page: 100 });
      for (const repository of payload as Array<{ id: number; full_name: string; private: boolean }>) {
        await db.query(`insert into tracked_repositories (organization_id, repository_id, full_name, private) values ($1, $2, $3, $4) on conflict (organization_id, repository_id) do update set full_name = excluded.full_name, private = excluded.private, updated_at = now()`, [organizationId, repository.id, repository.full_name, repository.private]);
      }
      const savedRepositories = await db.query(`select repository_id as id, full_name, private, selected from tracked_repositories where organization_id = $1 order by full_name asc`, [organizationId]);
      return { connected: true, repositories: savedRepositories.rows };
    } catch (error) {
      app.log.error(error);
      return reply.code(500).send({ error: "repositories_sync_failed" });
    }
  });

  app.post(`${apiBasePath}/integrations/github/repositories/select`, async (request, reply) => {
    if (!ensureDatabase(reply)) return;
    const db = getPool();
    const session = await getSessionUser(request.cookies[sessionCookieName]);
    if (!session) return reply.code(401).send({ error: "unauthorized" });
    const body = request.body as { repositoryIds?: number[] };
    const repositoryIds = Array.isArray(body.repositoryIds) ? body.repositoryIds : [];
    const organizationId = await getOrganizationIdForUser(session.user.id, session.activeOrganizationId);
    if (!organizationId) return reply.code(400).send({ error: "missing_organization" });
    await db.query(`update tracked_repositories set selected = false where organization_id = $1`, [organizationId]);
    if (repositoryIds.length > 0) {
      await db.query(`update tracked_repositories set selected = true where organization_id = $1 and repository_id = any($2::bigint[])`, [organizationId, repositoryIds]);
    }
    const jobId = await createSyncJob(organizationId);
    return { ok: true, selectedCount: repositoryIds.length, syncStatus: "queued", jobId };
  });

  app.post(`${apiBasePath}/integrations/github/sync-now`, async (request, reply) => {
    if (!ensureDatabase(reply)) return;
    const session = await getSessionUser(request.cookies[sessionCookieName]);
    if (!session) return reply.code(401).send({ error: "unauthorized" });
    const organizationId = await getOrganizationIdForUser(session.user.id, session.activeOrganizationId);
    if (!organizationId) return reply.code(400).send({ error: "missing_organization" });
    const jobId = await createSyncJob(organizationId);
    return { ok: true, syncStatus: "queued", jobId };
  });

  app.get(`${apiBasePath}/integrations/github/status`, async (request, reply) => {
    if (!ensureDatabase(reply)) return;
    const db = getPool();
    const session = await getSessionUser(request.cookies[sessionCookieName]);
    if (!session) return reply.code(401).send({ error: "unauthorized" });
    const organizationId = await getOrganizationIdForUser(session.user.id, session.activeOrganizationId);
    if (!organizationId) return { connected: false, status: "disconnected" };
    const installationResult = await db.query(`select installation_id, account_login, account_type from github_installations where organization_id = $1 limit 1`, [organizationId]);
    const selectedRepositoriesResult = await db.query(`select count(*)::int as count from tracked_repositories where organization_id = $1 and selected = true`, [organizationId]);
    return {
      connected: (installationResult.rowCount ?? 0) > 0,
      status: (installationResult.rowCount ?? 0) > 0 ? "connected" : "disconnected",
      installation: installationResult.rows[0] ?? null,
      selectedRepositories: selectedRepositoriesResult.rows[0]?.count ?? 0
    };
  });

  app.post(`${apiBasePath}/integrations/github/disconnect`, async (request, reply) => {
    if (!ensureDatabase(reply)) return;
    const db = getPool();
    const session = await getSessionUser(request.cookies[sessionCookieName]);
    if (!session) return reply.code(401).send({ error: "unauthorized" });
    const organizationId = await getOrganizationIdForUser(session.user.id, session.activeOrganizationId);
    if (!organizationId) return reply.code(400).send({ error: "missing_organization" });
    await db.query(`delete from github_installations where organization_id = $1`, [organizationId]);
    await db.query(`update tracked_repositories set selected = false where organization_id = $1`, [organizationId]);
    return { ok: true, status: "disconnected" };
  });

  app.get(`${apiBasePath}/dashboard/overview`, async (request, reply) => {
    if (!ensureDatabase(reply)) return;
    const db = getPool();
    const session = await getSessionUser(request.cookies[sessionCookieName]);
    if (!session) return reply.code(401).send({ error: "unauthorized" });
    const organizationId = await getOrganizationIdForUser(session.user.id, session.activeOrganizationId);
    if (!organizationId) return reply.code(400).send({ error: "missing_organization" });
    const staleCutoff = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const reposResult = await db.query(`select count(*)::int as count from tracked_repositories where organization_id = $1 and selected = true`, [organizationId]);
    const openResult = await db.query(`select count(*)::int as count from pull_requests where organization_id = $1 and state = 'open'`, [organizationId]);
    const merged7dResult = await db.query(`select count(*)::int as count from pull_requests where organization_id = $1 and merged_at >= now() - interval '7 days'`, [organizationId]);
    const merged30dResult = await db.query(`select count(*)::int as count from pull_requests where organization_id = $1 and merged_at >= now() - interval '30 days'`, [organizationId]);
    const avgSizeResult = await db.query(`select coalesce(round(avg(additions + deletions)), 0)::int as avg_size from pull_requests where organization_id = $1`, [organizationId]);
    const staleResult = await db.query(`select count(*)::int as count from pull_requests where organization_id = $1 and state = 'open' and coalesce(updated_at, opened_at) < $2`, [organizationId, staleCutoff]);
    const latestSyncResult = await db.query(`select status, started_at, finished_at, total_prs from integration_sync_jobs where organization_id = $1 order by created_at desc limit 1`, [organizationId]);
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
    if (!ensureDatabase(reply)) return;
    const db = getPool();
    const session = await getSessionUser(request.cookies[sessionCookieName]);
    if (!session) return reply.code(401).send({ error: "unauthorized" });
    const organizationId = await getOrganizationIdForUser(session.user.id, session.activeOrganizationId);
    if (!organizationId) return reply.code(400).send({ error: "missing_organization" });
    const query = request.query as { state?: string; repository?: string; period?: "7d" | "30d" };
    const conditions: string[] = ["organization_id = $1"];
    const values: unknown[] = [organizationId];
    if (query.state && ["open", "closed", "all"].includes(query.state) && query.state !== "all") {
      values.push(query.state);
      conditions.push(`state = $${values.length}`);
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
        select github_pr_id, number, title, repository_full_name, author_login, state, draft, additions, deletions, changed_files, opened_at, merged_at, updated_at, html_url
        from pull_requests
        where ${conditions.join(" and ")}
        order by coalesce(updated_at, opened_at, created_at) desc
        limit 200
      `,
      values
    );
    const reposResult = await db.query(`select distinct repository_full_name from pull_requests where organization_id = $1 order by repository_full_name asc`, [organizationId]);
    return {
      repositories: reposResult.rows.map((row) => row.repository_full_name as string),
      pullRequests: prsResult.rows
    };
  });
};
