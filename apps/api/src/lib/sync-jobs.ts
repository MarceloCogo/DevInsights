import { getPool } from "./db.js";

/**
 * Creates a new integration sync job for the given organization.
 * Deduplicates: if there's already a pending or running job for this org,
 * returns the existing job ID instead of creating a new one.
 */
export const createSyncJob = async (organizationId: number): Promise<number> => {
  const db = getPool();

  // Check for existing active job (pending or running)
  const existing = await db.query(
    `select id from integration_sync_jobs
     where organization_id = $1 and status in ('pending', 'running')
     order by created_at desc limit 1`,
    [organizationId]
  );

  if ((existing.rowCount ?? 0) > 0) {
    return Number(existing.rows[0].id);
  }

  const createdJob = await db.query(
    `insert into integration_sync_jobs (organization_id, status, started_at)
     values ($1, 'pending', now())
     returning id`,
    [organizationId]
  );
  return Number(createdJob.rows[0].id);
};
