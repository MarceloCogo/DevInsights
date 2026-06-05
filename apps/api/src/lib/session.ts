import { createHmac, randomBytes } from "node:crypto";
import { config } from "./config.js";
import { getPool, getRawPool } from "./db.js";

/** Signs a raw state string with the session secret. */
export const signState = (raw: string): string =>
  createHmac("sha256", config.sessionSecret).update(raw).digest("hex");

/**
 * Creates a new auth state token, persists it to the DB, and returns the
 * signed state string.
 */
export const createAuthState = async (
  stateType: "oauth" | "installation",
  organizationId?: number
): Promise<string> => {
  const raw = randomBytes(24).toString("hex");
  const signature = signState(raw);
  const state = `${raw}.${signature}`;
  await getPool().query(
    `insert into auth_states (state, state_type, organization_id, expires_at)
     values ($1, $2, $3, now() + interval '10 minutes')`,
    [state, stateType, organizationId ?? null]
  );
  return state;
};

/**
 * Validates and consumes an auth state token from the DB.
 * Returns `{ ok: true, organizationId }` on success, `{ ok: false, organizationId: null }` otherwise.
 */
export const consumeAuthState = async (
  state: string | undefined,
  expectedType: "oauth" | "installation"
): Promise<{ ok: boolean; organizationId: number | null }> => {
  if (!state) return { ok: false, organizationId: null };
  const [raw, signature] = state.split(".");
  if (!raw || !signature || signState(raw) !== signature) {
    return { ok: false, organizationId: null };
  }

  const result = await getPool().query(
    `delete from auth_states
     where state = $1 and state_type = $2 and expires_at > now()
     returning organization_id`,
    [state, expectedType]
  );

  if ((result.rowCount ?? 0) === 0) return { ok: false, organizationId: null };
  return { ok: true, organizationId: result.rows[0].organization_id as number | null };
};

/**
 * Looks up the session and returns the associated user, or null if the session
 * is missing / expired.
 */
export const getSessionUser = async (
  sessionId: string | undefined
): Promise<{ sessionId: string; user: any; activeOrganizationId: number | null } | null> => {
  const pool = getRawPool();
  if (!pool || !sessionId) return null;
  const result = await pool.query(
    `select u.id, u.github_id, u.github_login, u.name, u.avatar_url, s.active_organization_id
     from sessions s
     join users u on u.id = s.user_id
     where s.id = $1 and s.expires_at > now()`,
    [sessionId]
  );
  if (result.rowCount === 0) return null;
  return {
    sessionId,
    user: result.rows[0],
    activeOrganizationId: result.rows[0].active_organization_id as number | null,
  };
};
