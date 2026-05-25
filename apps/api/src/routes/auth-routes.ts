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
      const db = getPool();
      const accessToken = await exchangeOAuthCode(code);
      const githubUser = await fetchGitHubUser(accessToken);
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
