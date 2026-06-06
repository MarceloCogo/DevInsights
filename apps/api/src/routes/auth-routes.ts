import { randomBytes } from "node:crypto";
import type { FastifyInstance } from "fastify";
import type { RouteDeps } from "./types.js";

export const registerAuthRoutes = (app: FastifyInstance, deps: RouteDeps) => {
  const {
    apiBasePath,
    githubClientId,
    githubOAuthCallbackUrl,
    sessionCookieName,
    sessionCookieSameSite,
    sessionTtlSeconds,
    isProduction,
    ensureDatabase,
    getPool,
    createAuthState,
    consumeAuthState,
    exchangeOAuthCode,
    fetchGitHubUser,
    getSessionUser,
    getOrganizationIdForUser,
    getWebBaseUrl
  } = deps;

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
    if (!ensureDatabase(reply)) return;
    const { code, state } = request.query as { code?: string; state?: string };
    if ((code?.length ?? 0) > 512 || (state?.length ?? 0) > 512) {
      return reply.code(400).send({ error: "invalid_oauth_payload" });
    }
    const validState = await consumeAuthState(state, "oauth");
    if (!code || !validState.ok) {
      return reply.code(400).send({ error: "invalid_oauth_state_or_code" });
    }

    try {
      app.log.info("[auth:callback] callback invoked");
      const db = getPool();
      const accessToken = await exchangeOAuthCode(code);
      const githubUser = await fetchGitHubUser(accessToken);
      app.log.info({ githubLogin: githubUser.login, githubId: githubUser.id }, "[auth:callback] github user obtained");
      const upsertResult = await db.query(
        `insert into users (github_id, github_login, name, avatar_url) values ($1, $2, $3, $4)
         on conflict (github_id) do update set github_login = excluded.github_login, name = excluded.name, avatar_url = excluded.avatar_url, updated_at = now()
         returning id, github_login, name, avatar_url`,
        [githubUser.id, githubUser.login, githubUser.name, githubUser.avatar_url]
      );
      const user = upsertResult.rows[0];
      const orgResult = await db.query(
        `select om.organization_id from organization_members om where om.user_id = $1 order by om.created_at asc limit 1`,
        [user.id]
      );
      let activeOrganizationId: number;
      if (orgResult.rowCount === 0) {
        const organizationName = `${githubUser.login}'s Organization`;
        const createdOrg = await db.query(`insert into organizations (name, created_by_user_id) values ($1, $2) returning id`, [organizationName, user.id]);
        activeOrganizationId = Number(createdOrg.rows[0].id);
        await db.query(`insert into organization_members (organization_id, user_id, role) values ($1, $2, 'owner')`, [activeOrganizationId, user.id]);
      } else {
        activeOrganizationId = Number(orgResult.rows[0].organization_id);
      }

      const sessionId = randomBytes(24).toString("hex");
      await db.query(`insert into sessions (id, user_id, active_organization_id, expires_at) values ($1, $2, $3, now() + interval '7 days')`, [sessionId, user.id, activeOrganizationId]);
      app.log.info({ sessionIdPrefix: sessionId.slice(0, 6), userId: user.id, organizationId: activeOrganizationId }, "[auth:callback] session created in db");

      const cookieOpts = {
        path: "/",
        httpOnly: true,
        sameSite: sessionCookieSameSite,
        secure: isProduction,
        maxAge: sessionTtlSeconds
      };
      reply.setCookie(sessionCookieName, sessionId, cookieOpts);
      app.log.info({ cookieName: sessionCookieName, sameSite: cookieOpts.sameSite, secure: cookieOpts.secure, path: cookieOpts.path, maxAge: cookieOpts.maxAge }, "[auth:callback] setCookie called");

      const pendingInstallationIdRaw = request.cookies["devinsights.pending_installation_id"];
      const pendingInstallationId = Number(pendingInstallationIdRaw);
      if (pendingInstallationIdRaw && Number.isFinite(pendingInstallationId) && pendingInstallationId > 0) {
        await db.query(
          `insert into integration_preferences (organization_id, auto_reconcile_enabled, updated_at)
           values ($1, true, now())
           on conflict (organization_id)
           do update set auto_reconcile_enabled = true, updated_at = now()`,
          [activeOrganizationId]
        );
        await db.query(
          `insert into github_installations (organization_id, installation_id, account_login, account_type, installed_by_user_id)
           values ($1, $2, null, null, $3)
           on conflict (organization_id)
           do update set installation_id = excluded.installation_id, installed_by_user_id = excluded.installed_by_user_id, updated_at = now()`,
          [activeOrganizationId, pendingInstallationId, user.id]
        );
        reply.clearCookie("devinsights.pending_installation_id", {
          path: "/",
          httpOnly: true,
          sameSite: sessionCookieSameSite,
          secure: isProduction
        });
      }

      const redirectUrl = `${getWebBaseUrl(request)}/app`;
      app.log.info({ redirectUrl }, "[auth:callback] redirecting after login");
      return reply.redirect(redirectUrl);
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
      `select o.id, o.name, om.role from organization_members om join organizations o on o.id = om.organization_id where om.user_id = $1 and om.organization_id = $2 limit 1`,
      [session.user.id, activeOrganizationId]
    );
    return { user: session.user, organization: orgResult.rows[0] ?? null, activeOrganizationId };
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
};
