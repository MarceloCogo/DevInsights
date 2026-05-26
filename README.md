# DevInsights

DevInsights is an open-source, self-hosted PR Intelligence starter for engineering teams.

It provides a lightweight workflow inspired by market tools (like LinearB), focused on GitHub-only onboarding and actionable pull request visibility.

## Scope (Current)

- GitHub OAuth login
- GitHub App installation flow
- Repository selection per organization
- Initial PR sync via worker jobs
- Dashboard at `/app` with:
  - overview cards
  - PR table with filters
  - integration status and sync controls

This repository is intentionally limited in scope for early-stage teams and internal pilots.

## What This Project Is Not (Yet)

- Not a full Engineering Intelligence suite
- Not complete DORA coverage
- No Jira/Azure DevOps integration in the current runtime
- No billing/freemium features

## Architecture

- `apps/web`: React + Vite + Tailwind dashboard and landing
- `apps/api`: Fastify API (auth, orgs, integration, dashboard endpoints)
- `apps/worker`: Postgres-backed sync worker (queue consumer)
- `infra/docker-compose.yml`: local stack with Postgres + services

Job strategy is intentionally simple:

- API enqueues sync jobs in PostgreSQL
- Worker picks jobs with row locking and processes GitHub sync

## Quick Start

1. Install dependencies

```bash
pnpm install
```

2. Copy env file

```bash
cp .env.example .env
```

3. Start local stack

```bash
docker compose -f infra/docker-compose.yml up --build
```

4. Open app

- Web: `http://localhost:3000`
- API health: `http://localhost:3001/health`
- Worker health: `http://localhost:3002/health`

## Required Environment Variables

- `DATABASE_URL`
- `WEB_BASE_URL`
- `SESSION_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GITHUB_OAUTH_CALLBACK_URL`
- `GITHUB_APP_ID`
- `GITHUB_APP_NAME`
- `GITHUB_APP_PRIVATE_KEY`

See `.env.example` for defaults and local values.

## Security Baseline

- Session cookie with `HttpOnly`, `Secure` (prod), and SameSite policy
- API security headers via Fastify Helmet
- API rate limiting on sensitive auth route(s)
- Strict CORS with credentialed requests for configured web origin
- Web security headers and CSP baseline

## Operations

- API boot runs versioned SQL migrations from `apps/api/src/storage/migrations`.
- Run smoke checks with `pnpm smoke:e2e`.
- Optionally pass authenticated session cookie:
  - `SMOKE_BASE_URL=https://devinsightsapp.up.railway.app`
  - `SESSION_COOKIE_NAME=devinsights.sid`
  - `SMOKE_SESSION_COOKIE=<session-id>`

## Product Positioning

DevInsights is built for:

- small to mid-size engineering teams
- self-hosted/internal use
- iterative adoption without heavy platform overhead

If you need enterprise-scale governance, advanced analytics, and multi-provider integrations, treat this codebase as a foundation rather than a finished platform.
