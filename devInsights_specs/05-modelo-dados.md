# DevInsights — Modelo de Dados Inicial

## 1. Visão geral

O modelo de dados deve suportar:

- organizações;
- usuários;
- squads;
- repositórios;
- integração GitHub;
- pull requests;
- reviews;
- commits;
- workflows;
- deployments;
- incidentes;
- declaração de uso de IA;
- métricas agregadas;
- jobs;
- auditoria;
- privacidade.

## 2. Entidades principais

```text
Organization
User
Team
TeamMember
Repository
RepositoryTeam
GitHubInstallation
PullRequest
PullRequestReview
PullRequestCommit
WorkflowRun
Deployment
Issue
Incident
AIUsageDeclaration
MetricSnapshot
IntegrationSyncJob
AuditLog
PrivacySettings
```

## 3. Relacionamentos

```text
Organization 1:N Team
Organization 1:N Repository
Organization 1:N User
Team N:N User via TeamMember
Team N:N Repository via RepositoryTeam
Repository 1:N PullRequest
PullRequest 1:N PullRequestReview
PullRequest 1:N PullRequestCommit
Repository 1:N WorkflowRun
Repository 1:N Deployment
Deployment N:N PullRequest via DeploymentPullRequest futura
PullRequest 1:0..1 AIUsageDeclaration
Organization 1:N MetricSnapshot
Organization 1:N IntegrationSyncJob
Organization 1:N AuditLog
```

## 4. Tabelas

### 4.1 organizations

```text
id uuid pk
name text not null
slug text unique not null
created_at timestamp not null
updated_at timestamp not null
```

### 4.2 users

```text
id uuid pk
organization_id uuid fk
name text not null
email text not null
github_login text null
avatar_url text null
role text not null
disabled_at timestamp null
created_at timestamp not null
updated_at timestamp not null
```

Índices:

- organization_id
- email
- github_login

### 4.3 teams

```text
id uuid pk
organization_id uuid fk
name text not null
slug text not null
description text null
created_at timestamp not null
updated_at timestamp not null
archived_at timestamp null
```

### 4.4 team_members

```text
id uuid pk
team_id uuid fk
user_id uuid fk
team_role text not null
created_at timestamp not null
```

### 4.5 repositories

```text
id uuid pk
organization_id uuid fk
github_id bigint unique not null
name text not null
full_name text not null
owner text not null
default_branch text null
visibility text null
primary_language text null
is_archived boolean not null default false
is_critical boolean not null default false
html_url text null
last_synced_at timestamp null
created_at timestamp not null
updated_at timestamp not null
```

### 4.6 repository_teams

```text
id uuid pk
repository_id uuid fk
team_id uuid fk
is_primary boolean not null default false
created_at timestamp not null
```

### 4.7 github_installations

```text
id uuid pk
organization_id uuid fk
installation_id bigint unique not null
account_login text not null
account_type text not null
permissions jsonb not null
events jsonb not null
installed_at timestamp not null
suspended_at timestamp null
created_at timestamp not null
updated_at timestamp not null
```

Observação: preferir gerar installation tokens sob demanda. Evitar armazenar tokens de curta duração.

### 4.8 pull_requests

```text
id uuid pk
repository_id uuid fk
github_id bigint unique not null
number int not null
title text not null
author_user_id uuid null
github_author_login text not null
state text not null
is_draft boolean not null default false
base_branch text not null
head_branch text not null
opened_at timestamp not null
ready_for_review_at timestamp null
closed_at timestamp null
merged_at timestamp null
merge_commit_sha text null
additions int not null default 0
deletions int not null default 0
changed_files int not null default 0
commits_count int not null default 0
comments_count int not null default 0
review_comments_count int not null default 0
labels jsonb not null default '[]'
html_url text not null
created_at timestamp not null
updated_at timestamp not null
```

Índices:

- repository_id
- github_id
- repository_id, number
- opened_at
- merged_at
- github_author_login
- state

### 4.9 pull_request_reviews

```text
id uuid pk
pull_request_id uuid fk
github_id bigint unique not null
reviewer_user_id uuid null
github_reviewer_login text not null
state text not null
submitted_at timestamp not null
comments_count int not null default 0
created_at timestamp not null
updated_at timestamp not null
```

### 4.10 pull_request_commits

```text
id uuid pk
pull_request_id uuid fk
sha text not null
github_author_login text null
committed_at timestamp not null
created_at timestamp not null
```

### 4.11 workflow_runs

```text
id uuid pk
repository_id uuid fk
github_id bigint unique not null
name text not null
status text not null
conclusion text null
branch text null
commit_sha text not null
event text null
started_at timestamp null
completed_at timestamp null
duration_seconds int null
html_url text null
created_at timestamp not null
updated_at timestamp not null
```

### 4.12 deployments

```text
id uuid pk
repository_id uuid fk
github_id bigint unique null
environment text not null
status text not null
commit_sha text not null
workflow_run_id uuid null
deployed_at timestamp null
created_at timestamp not null
updated_at timestamp not null
```

### 4.13 issues

```text
id uuid pk
repository_id uuid fk
github_id bigint unique not null
number int not null
title text not null
author_login text null
state text not null
labels jsonb not null default '[]'
opened_at timestamp not null
closed_at timestamp null
html_url text not null
created_at timestamp not null
updated_at timestamp not null
```

### 4.14 incidents

```text
id uuid pk
organization_id uuid fk
repository_id uuid null
deployment_id uuid null
issue_id uuid null
title text not null
severity text not null
source text not null
status text not null
started_at timestamp not null
resolved_at timestamp null
labels jsonb not null default '[]'
html_url text null
created_at timestamp not null
updated_at timestamp not null
```

### 4.15 ai_usage_declarations

```text
id uuid pk
pull_request_id uuid fk unique
user_id uuid null
intensity text not null
tool_name text null
purposes jsonb not null default '[]'
human_validation_checked boolean not null default false
validation_checklist jsonb not null default '{}'
notes text null
created_at timestamp not null
updated_at timestamp not null
```

Intensidades:

- none
- assistive
- intensive
- agentic

### 4.16 metric_snapshots

```text
id uuid pk
organization_id uuid fk
team_id uuid null
repository_id uuid null
metric_name text not null
metric_value numeric not null
aggregation text not null
dimensions jsonb not null default '{}'
period_start timestamp not null
period_end timestamp not null
created_at timestamp not null
```

Exemplos de metric_name:

- pr_cycle_time_hours
- pickup_time_hours
- review_time_hours
- merge_time_hours
- deployment_frequency
- lead_time_for_changes_hours
- change_failure_rate
- mttr_hours
- ai_assisted_pr_rate
- ai_cycle_time_delta
- stale_pr_count
- reviewer_load

### 4.17 integration_sync_jobs

```text
id uuid pk
organization_id uuid fk
provider text not null
job_type text not null
status text not null
payload jsonb not null default '{}'
attempts int not null default 0
max_attempts int not null default 5
scheduled_at timestamp not null
started_at timestamp null
finished_at timestamp null
error_message text null
created_at timestamp not null
updated_at timestamp not null
```

### 4.18 audit_logs

```text
id uuid pk
organization_id uuid fk
actor_user_id uuid null
action text not null
resource_type text not null
resource_id text null
metadata jsonb not null default '{}'
ip_address text null
user_agent text null
created_at timestamp not null
```

### 4.19 privacy_settings

```text
id uuid pk
organization_id uuid fk unique
collect_pr_body boolean not null default false
collect_review_body boolean not null default false
collect_commit_messages boolean not null default false
collect_issue_body boolean not null default false
anonymize_surveys boolean not null default true
show_individual_metrics boolean not null default false
data_retention_days int null
created_at timestamp not null
updated_at timestamp not null
```

## 5. Métricas calculadas

### 5.1 PR Cycle Time

```text
merged_at - opened_at
```

### 5.2 Pickup Time

```text
first_review_at - ready_for_review_at
```

Fallback:

```text
first_review_at - opened_at
```

### 5.3 Review Time

```text
approved_at - first_review_at
```

### 5.4 Merge Time

```text
merged_at - approved_at
```

### 5.5 PR Size

```text
additions + deletions
```

### 5.6 Rework After Review

```text
commits_after_first_review
```

### 5.7 Deployment Frequency

```text
count(deployments where environment=production and period)
```

### 5.8 Lead Time for Changes

```text
deployed_at - first_commit_at
```

### 5.9 Change Failure Rate

```text
deployments_with_incident / total_production_deployments
```

### 5.10 MTTR

```text
resolved_at - started_at
```

### 5.11 AI Assisted PR Rate

```text
prs_with_ai_usage / total_prs
```

### 5.12 AI Review Burden

```text
avg(review_comments_or_rework for ai_prs) vs avg(review_comments_or_rework for non_ai_prs)
```

## 6. Índices recomendados

- pull_requests(repository_id, opened_at)
- pull_requests(repository_id, merged_at)
- pull_requests(repository_id, state)
- pull_requests(github_author_login)
- pull_request_reviews(pull_request_id, submitted_at)
- workflow_runs(repository_id, completed_at)
- deployments(repository_id, deployed_at)
- incidents(organization_id, started_at)
- metric_snapshots(organization_id, metric_name, period_start, period_end)
- integration_sync_jobs(status, scheduled_at)
