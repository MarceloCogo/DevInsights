import { Pool } from "pg";
import { config } from "./config.js";

// Single pool instance, null when DATABASE_URL is not configured.
const pool: Pool | null = config.hasDatabase ? new Pool({ connectionString: config.databaseUrl }) : null;

/**
 * Returns the pool, throwing if the database is not configured.
 * Use this inside route handlers that require a DB connection.
 */
export const getPool = (): Pool => {
  if (!pool) {
    throw new Error("database_not_configured");
  }
  return pool;
};

/**
 * Returns the raw pool reference (may be null).
 * Useful for optional DB operations (e.g. session lookup).
 */
export const getRawPool = (): Pool | null => pool;

/**
 * Sends a 503 response when the database is not configured.
 * Returns true if the database is available, false otherwise.
 */
export const ensureDatabase = (
  reply: { code: (statusCode: number) => { send: (payload: unknown) => unknown } }
): boolean => {
  if (pool) return true;
  reply.code(503).send({ error: "database_not_configured" });
  return false;
};

/**
 * Resolves the active organization ID for a user.
 * Prefers `preferredOrganizationId` if the user is a member of that org,
 * otherwise falls back to the user's first organization.
 */
export const getOrganizationIdForUser = async (
  userId: number,
  preferredOrganizationId?: number | null
): Promise<number | null> => {
  const db = getPool();
  if (preferredOrganizationId) {
    const preferred = await db.query(
      `select organization_id from organization_members
       where user_id = $1 and organization_id = $2 limit 1`,
      [userId, preferredOrganizationId]
    );
    if ((preferred.rowCount ?? 0) > 0) {
      return Number(preferred.rows[0].organization_id);
    }
  }

  const orgResult = await db.query(
    `select organization_id from organization_members
     where user_id = $1 order by created_at asc limit 1`,
    [userId]
  );
  if (orgResult.rowCount === 0) return null;
  return Number(orgResult.rows[0].organization_id);
};
