import type { Pool } from "pg";

export type GitHubUser = {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string | null;
};

export type SessionUser = {
  sessionId: string;
  user: any;
  activeOrganizationId: number | null;
};

export type RouteDeps = {
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
  getPool: () => Pool;
  createAuthState: (stateType: "oauth" | "installation", organizationId?: number) => Promise<string>;
  consumeAuthState: (state: string | undefined, expectedType: "oauth" | "installation") => Promise<{ ok: boolean; organizationId: number | null }>;
  exchangeOAuthCode: (code: string) => Promise<string>;
  fetchGitHubUser: (accessToken: string) => Promise<GitHubUser>;
  getSessionUser: (sessionId: string | undefined) => Promise<SessionUser | null>;
  getOrganizationIdForUser: (userId: number, preferredOrganizationId?: number | null) => Promise<number | null>;
  createInstallationClient: (installationId: number) => Promise<any>;
  resolveInstallationIdForAccount: (accountLogin: string) => Promise<number | null>;
  createSyncJob: (organizationId: number) => Promise<number>;
  getWebBaseUrl: (request: { headers: Record<string, string | string[] | undefined> }) => string;
};
