// All environment variables read once at startup and exported as typed constants.

const isProduction = process.env.NODE_ENV === "production";

export const config = {
  port: Number(process.env.PORT ?? process.env.API_PORT ?? 3001),
  host: "0.0.0.0",
  apiBasePath: "/api/v1",
  isProduction,

  // Web
  webBaseUrl: process.env.WEB_BASE_URL ?? "",

  // Session
  sessionCookieName: process.env.SESSION_COOKIE_NAME ?? "devinsights.sid",
  sessionSecret: process.env.SESSION_SECRET ?? "dev-secret",
  sessionTtlSeconds: 60 * 60 * 24 * 7,
  sessionCookieSameSite: (process.env.SESSION_COOKIE_SAME_SITE as "lax" | "strict" | "none" | undefined) ??
    (isProduction ? "none" : "lax"),

  // GitHub OAuth
  githubClientId: process.env.GITHUB_CLIENT_ID ?? "",
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
  githubOAuthCallbackUrl: process.env.GITHUB_OAUTH_CALLBACK_URL ?? "",

  // GitHub App
  githubAppId: process.env.GITHUB_APP_ID ?? "",
  githubAppName: process.env.GITHUB_APP_NAME ?? "",
  githubAppPrivateKey: process.env.GITHUB_APP_PRIVATE_KEY ?? "",

  // Database
  databaseUrl: process.env.DATABASE_URL,
  get hasDatabase() {
    return Boolean(this.databaseUrl);
  },
} as const satisfies Record<string, unknown>;
