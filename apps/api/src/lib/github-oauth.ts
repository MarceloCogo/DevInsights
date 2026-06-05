import { config } from "./config.js";

export type GitHubUser = {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string | null;
};

/**
 * Exchanges a GitHub OAuth authorization code for an access token.
 */
export const exchangeOAuthCode = async (code: string): Promise<string> => {
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: config.githubClientId,
      client_secret: config.githubClientSecret,
      code,
      redirect_uri: config.githubOAuthCallbackUrl,
    }),
  });

  if (!response.ok) {
    throw new Error(`oauth exchange failed (${response.status})`);
  }

  const body = (await response.json()) as { access_token?: string };
  if (!body.access_token) throw new Error("missing access token");
  return body.access_token;
};

/**
 * Fetches the authenticated GitHub user using the provided access token.
 */
export const fetchGitHubUser = async (accessToken: string): Promise<GitHubUser> => {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "DevInsights",
    },
  });

  if (!response.ok) {
    throw new Error(`failed to fetch github user (${response.status})`);
  }

  return (await response.json()) as GitHubUser;
};
