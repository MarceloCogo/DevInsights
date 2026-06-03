import { config } from "./config.js";

/** Normalises a URL string: trims trailing slashes and ensures a scheme. */
export const normalizeBaseUrl = (value: string): string => {
  const trimmed = value.trim().replace(/\/$/, "");
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `https://${trimmed}`;
};

/**
 * Resolves the web base URL from config or from the incoming request headers.
 * Used for CORS checks and redirect targets.
 */
export const getWebBaseUrl = (
  request: { headers: Record<string, string | string[] | undefined> }
): string => {
  if (config.webBaseUrl) return normalizeBaseUrl(config.webBaseUrl);
  const proto = (request.headers["x-forwarded-proto"] as string | undefined) ?? "http";
  const hostHeader =
    (request.headers["x-forwarded-host"] as string | undefined) ??
    (request.headers.host as string | undefined) ??
    "localhost:3000";
  return normalizeBaseUrl(`${proto}://${hostHeader}`);
};
