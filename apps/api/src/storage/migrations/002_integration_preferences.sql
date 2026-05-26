create table if not exists integration_preferences (
  organization_id bigint primary key references organizations(id),
  auto_reconcile_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

insert into integration_preferences (organization_id, auto_reconcile_enabled)
select o.id, true
from organizations o
on conflict (organization_id) do nothing;
