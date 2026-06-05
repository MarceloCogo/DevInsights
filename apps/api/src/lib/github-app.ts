import { App as GitHubApp } from "@octokit/app";
import { Octokit } from "@octokit/rest";
import { config } from "./config.js";

// Single GitHub App client instance, null when env vars are missing.
const githubAppClient: GitHubApp | null =
  config.githubAppId && config.githubAppPrivateKey
    ? new GitHubApp({
        appId: config.githubAppId,
        privateKey: config.githubAppPrivateKey.replace(/\\n/g, "\n"),
      })
    : null;

/**
 * Returns an Octokit client authenticated as the given installation.
 */
export const createInstallationClient = async (installationId: number): Promise<Octokit> => {
  if (!githubAppClient) {
    throw new Error("github app env vars are missing");
  }
  const octokit = await githubAppClient.getInstallationOctokit(Number(installationId));
  return octokit as unknown as Octokit;
};

/**
 * Finds the installation ID for a given GitHub account login.
 * Returns null if not found or if the GitHub App is not configured.
 */
export const resolveInstallationIdForAccount = async (
  accountLogin: string
): Promise<number | null> => {
  if (!githubAppClient || !accountLogin) return null;

  try {
    const installationsResponse = await githubAppClient.octokit.request(
      "GET /app/installations",
      { per_page: 100 }
    );
    const match = installationsResponse.data.find(
      (installation) =>
        installation.account?.login?.toLowerCase() === accountLogin.toLowerCase()
    );
    return match ? Number(match.id) : null;
  } catch {
    return null;
  }
};
