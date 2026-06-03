alter table integration_sync_jobs add column if not exists attempts integer not null default 0;
alter table integration_sync_jobs add column if not exists max_attempts integer not null default 5;
alter table integration_sync_jobs add column if not exists next_retry_at timestamptz;

create index if not exists sync_jobs_retry_idx on integration_sync_jobs (status, next_retry_at);
