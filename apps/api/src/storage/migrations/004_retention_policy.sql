-- Retention: clean up old completed/failed jobs after 30 days
-- This is run by the worker periodically, but we create a helper function here.

-- Add retention_days column to allow per-org configuration
alter table integration_sync_jobs add column if not exists retention_days integer;

-- Create a view for expired jobs (completed or failed older than retention period)
create or replace view expired_sync_jobs as
select j.id, j.organization_id, j.status, j.finished_at
from integration_sync_jobs j
where j.status in ('completed', 'failed')
  and j.finished_at is not null
  and j.finished_at < now() - interval '30 days';
