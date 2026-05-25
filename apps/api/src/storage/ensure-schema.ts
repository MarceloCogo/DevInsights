import type { Pool } from "pg";

export const ensureSchema = async (pool: Pool | null) => {
  if (!pool) {
    return;
  }

  await pool.query(`
    create table if not exists users (
      id bigserial primary key,
      github_id bigint unique not null,
      github_login text unique not null,
      name text,
      avatar_url text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    create table if not exists organizations (
      id bigserial primary key,
      name text not null,
      created_by_user_id bigint not null references users(id),
      created_at timestamptz not null default now()
    );

    create table if not exists organization_members (
      organization_id bigint not null references organizations(id),
      user_id bigint not null references users(id),
      role text not null default 'owner',
      created_at timestamptz not null default now(),
      primary key (organization_id, user_id)
    );

    create table if not exists sessions (
      id text primary key,
      user_id bigint not null references users(id),
      active_organization_id bigint references organizations(id),
      expires_at timestamptz not null,
      created_at timestamptz not null default now()
    );

    create table if not exists github_installations (
      organization_id bigint primary key references organizations(id),
      installation_id bigint not null,
      account_login text,
      account_type text,
      installed_by_user_id bigint references users(id),
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    create table if not exists tracked_repositories (
      organization_id bigint not null references organizations(id),
      repository_id bigint not null,
      full_name text not null,
      private boolean not null,
      selected boolean not null default false,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      primary key (organization_id, repository_id)
    );

    create table if not exists integration_sync_jobs (
      id bigserial primary key,
      organization_id bigint not null references organizations(id),
      status text not null,
      phase text not null default 'pending',
      total_repositories integer not null default 0,
      processed_repositories integer not null default 0,
      total_prs integer not null default 0,
      error_message text,
      started_at timestamptz,
      finished_at timestamptz,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    create table if not exists repository_sync_stats (
      organization_id bigint not null references organizations(id),
      repository_id bigint not null,
      full_name text not null,
      open_prs integer not null default 0,
      merged_prs integer not null default 0,
      updated_at timestamptz not null default now(),
      primary key (organization_id, repository_id)
    );

    create table if not exists pull_requests (
      id bigserial primary key,
      organization_id bigint not null references organizations(id),
      repository_id bigint not null,
      repository_full_name text not null,
      github_pr_id bigint not null,
      number integer not null,
      title text not null,
      author_login text,
      state text not null,
      draft boolean not null default false,
      additions integer not null default 0,
      deletions integer not null default 0,
      changed_files integer not null default 0,
      opened_at timestamptz,
      closed_at timestamptz,
      merged_at timestamptz,
      updated_at timestamptz,
      html_url text,
      created_at timestamptz not null default now(),
      unique (organization_id, repository_id, github_pr_id)
    );

    create table if not exists auth_states (
      state text primary key,
      state_type text not null,
      organization_id bigint,
      expires_at timestamptz not null,
      created_at timestamptz not null default now()
    );

    alter table sessions add column if not exists active_organization_id bigint references organizations(id);
    alter table integration_sync_jobs add column if not exists phase text not null default 'pending';
    alter table integration_sync_jobs add column if not exists total_repositories integer not null default 0;

    create unique index if not exists github_installations_installation_id_idx on github_installations (installation_id);
    create index if not exists tracked_repositories_org_selected_idx on tracked_repositories (organization_id, selected);
    create index if not exists sync_jobs_org_created_idx on integration_sync_jobs (organization_id, created_at desc);
    create index if not exists pull_requests_org_updated_idx on pull_requests (organization_id, updated_at desc);
    create index if not exists pull_requests_org_state_idx on pull_requests (organization_id, state);
  `);
};
