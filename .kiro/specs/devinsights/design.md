# Design Document

## Overview

DevInsights is structured as a monorepo with three services: a React web app, a Fastify API, and a PostgreSQL-backed worker for background sync. The platform provides PR flow visibility through GitHub App integration.

## Architecture

```text
GitHub OAuth + GitHub App
        -> API (Fastify)
        -> PostgreSQL
        -> Worker (job consumer)
        -> API de dashboard
        -> Web app (/app)
```

Services:
- `apps/web`: Landing page + app shell and dashboard (React + Vite + Tailwind)
- `apps/api`: Auth, organizations, GitHub integration, dashboard endpoints, job enqueue (Fastify)
- `apps/worker`: Job consumption from Postgres and PR synchronization via Octokit

Main flows:
1. Login: OAuth GitHub -> session cookie -> bootstrap endpoint
2. Onboarding: Install GitHub App -> select repos -> initial sync
3. Sync: API creates pending job -> Worker processes with FOR UPDATE SKIP LOCKED -> upsert PRs
4. Dashboard: Read-optimized queries for overview metrics and PR tables

## Components and Interfaces

### API Routes (apps/api/src/routes/)
- `auth-routes.ts`: OAuth login, callback, logout, session management
- `dashboard-routes.ts`: Overview metrics, pull-requests list with filters and risk signals
- `integration-routes.ts`: GitHub App install, repositories, sync control, logs, jobs history
- `organization-routes.ts`: Organization listing and active org switching
- `settings-routes.ts`: Production environment configuration
- `dora-routes.ts`: DORA metrics overview

### Web Components (apps/web/src/)
- `main.tsx`: Single-file app with AppLoginPage and AppDashboardPage
- Dashboard sections: productivity, metrics, repositories, teams, integrations, settings
- Reusable state components: LoadingState, EmptyState, ErrorState

### Worker (apps/worker/src/)
- `worker.ts`: Job consumption loop with retries and backoff

## Data Models

### Core Tables
- `users`: GitHub user profiles
- `organizations`: Tenant isolation
- `organization_members`: User-org membership with roles
- `sessions`: Active user sessions
- `auth_states`: OAuth state tokens

### Integration Tables
- `github_installations`: GitHub App installation per org
- `tracked_repositories`: Repos authorized and selected for monitoring
- `integration_sync_jobs`: Sync job queue (status, phase, progress, timestamps, retries)
- `integration_preferences`: Auto-reconcile settings per org

### Data Tables
- `pull_requests`: Synced PR data (state, metrics, timestamps)
- `repository_sync_stats`: Per-repo sync statistics

## Error Handling

- API returns structured JSON errors with consistent format via `sendValidationError`
- Input validation uses Zod schemas with `parseQuery` and `parseBody` helpers
- Worker uses retries with exponential backoff for transient failures
- Frontend shows contextual error states with retry actions

## Testing Strategy

- Smoke tests E2E for the main flow (login -> dashboard)
- API route validation through Zod schema enforcement
- Worker idempotency ensures safe re-processing
