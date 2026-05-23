# DevInsights

DevInsights is an open source Engineering Intelligence platform inspired by tools like LinearB, Swarmia and DX.

The goal is to help engineering teams understand and improve software delivery performance in the AI-assisted development era, combining GitHub-native data, PR flow metrics, DORA metrics, AI usage insights, DevEx signals, quality, security and continuous improvement recommendations.

## Product Vision

DevInsights helps engineering leaders and teams answer questions such as:

- Where is our development flow blocked?
- Are pull requests waiting too long for review?
- Are reviewers overloaded?
- Are large PRs creating more rework?
- Is AI reducing cycle time or increasing review burden?
- Are teams improving delivery speed without sacrificing quality?
- How healthy is our engineering workflow over time?

The product must be used for continuous improvement, not surveillance or simplistic developer ranking.

## Core Principles

### Open source first

DevInsights should be easy to run locally or self-hosted.

Principles:

- simple local setup;
- clear documentation;
- GitHub-native integration;
- modular architecture;
- no mandatory dependency on proprietary external services;
- clean path for future SaaS/freemium without weakening the open source core.

### Privacy by design

The platform must collect only the data needed to generate meaningful engineering insights.

Principles:

- minimal data collection;
- RBAC from the beginning;
- transparent metric calculations;
- no public developer ranking;
- aggregated team-level insights by default;
- configurable data retention;
- encrypted integration secrets;
- auditable access logs;
- anonymized DevEx surveys when enabled.

### Metrics for improvement, not control

DevInsights should prioritize:

- flow health;
- delivery bottlenecks;
- review quality;
- software quality;
- security risk;
- AI impact;
- developer experience;
- team-level improvement.

It should avoid using isolated metrics such as commits, lines of code or number of PRs as a proxy for individual productivity.

## MVP Scope

The first MVP focuses on GitHub PR Intelligence and declarative AI usage tracking.

### Must have

- Basic authentication;
- Organizations;
- Squads/teams;
- Users and roles;
- GitHub App integration;
- Repository selection;
- Pull Request synchronization;
- Pull Request Review synchronization;
- GitHub Workflow Run synchronization;
- PR Intelligence dashboard;
- PR cycle time;
- Pickup time;
- Review time;
- PR size;
- Throughput;
- Stale PR detection;
- Large PR detection;
- Reviewer load;
- Manual AI usage declaration on PRs;
- Basic AI Impact dashboard;
- Privacy settings;
- Local development with Docker Compose.

### Not included in the first MVP

- Jira integration;
- SonarQube integration;
- Sentry/Datadog integration;
- Billing;
- Freemium;
- Complex multi-tenancy;
- AI-generated insights;
- Mobile app;
- External benchmarks.

## Recommended Stack

### Frontend

- React
- Vite
- TypeScript
- Tailwind CSS

### Backend

- Node.js
- Fastify
- TypeScript

### Database

- PostgreSQL
- Prisma ORM

### Jobs

- Initial job system using PostgreSQL tables;
- Redis/BullMQ only later if scale requires it.

### Integration

- GitHub App;
- GitHub REST/GraphQL API;
- GitHub Webhooks.

### Architecture

- Clean Architecture;
- Domain-driven module boundaries;
- Separate frontend, backend and worker;
- Metric engine isolated from framework and infrastructure code.

## High-Level Architecture

```text
GitHub App / Webhooks / API
          ↓
Integration Layer
          ↓
Raw Events / Normalized Tables
          ↓
Metric Engine
          ↓
Metric Snapshots / Aggregations
          ↓
Application API
          ↓
React Dashboard
```

## Suggested Repository Structure

```text
devinsights/
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   ├── domain/
│   ├── database/
│   ├── github/
│   └── shared/
├── workers/
│   └── sync-worker/
├── docs/
│   ├── product/
│   ├── technical/
│   └── design/
├── .kiro/
│   └── specs/
│       └── devinsights/
├── docker-compose.yml
├── README.md
└── LICENSE
```

## Documentation Files

The specification package is organized into the following files:

```text
01-visao-negocio.md
02-features.md
03-arquitetura-tecnica.md
04-github-integration.md
05-modelo-dados.md
06-api.md
07-design-ux.md
08-roadmap-kiro.md
09-privacy-security.md
10-prompts-kiro.md
```

Recommended target structure inside the repository:

```text
docs/
├── product/
│   ├── 01-visao-negocio.md
│   └── 02-features.md
├── technical/
│   ├── 03-arquitetura-tecnica.md
│   ├── 04-github-integration.md
│   ├── 05-modelo-dados.md
│   └── 06-api.md
├── design/
│   └── 07-design-ux.md
└── planning/
    ├── 08-roadmap-kiro.md
    ├── 09-privacy-security.md
    └── 10-prompts-kiro.md
```

## Development Phases

### Phase 1 — Project foundation

- Monorepo setup;
- TypeScript configuration;
- React + Vite + Tailwind setup;
- Fastify API setup;
- PostgreSQL + Prisma setup;
- Docker Compose;
- Basic health check;
- Basic documentation.

### Phase 2 — Core domain

- Organizations;
- Teams/squads;
- Users;
- Repositories;
- RBAC foundation;
- Privacy settings foundation.

### Phase 3 — GitHub integration

- GitHub App installation flow;
- Repository selection;
- Webhook signature validation;
- Historical PR backfill;
- Pull Request sync;
- Review sync;
- Workflow Run sync;
- Sync job status.

### Phase 4 — PR Intelligence

- PR cycle time;
- Pickup time;
- Review time;
- PR size;
- Throughput;
- Stale PRs;
- Large PRs;
- Reviewer load;
- PR dashboard.

### Phase 5 — AI Usage

- AI usage declaration;
- AI intensity classification;
- AI purpose classification;
- Human validation checklist;
- AI Impact dashboard;
- AI vs non-AI comparison.

### Phase 6 — DORA partial

- Deployment configuration;
- Production environment mapping;
- Deployment frequency;
- Lead time for changes;
- Manual incident registration;
- Partial change failure rate;
- Partial MTTR.

## Kiro Usage Recommendation

Start in **Spec mode**.

First ask Kiro to organize and validate the specification files. Do not generate implementation code immediately.

Suggested first instruction:

```text
Read the project documentation and create the initial Kiro spec for DevInsights.

Do not implement code yet.

Generate or update:
- .kiro/specs/devinsights/requirements.md
- .kiro/specs/devinsights/design.md
- .kiro/specs/devinsights/tasks.md

The first implementation scope must be only the technical foundation and local development setup.
```

Then implement in small phases.

## License

License to be defined.

Recommended options:

- Apache-2.0 for permissive open source with patent protection;
- AGPL-3.0 if the goal is to protect against closed SaaS forks;
- MIT if the goal is maximum adoption with minimal restrictions.

## Quickstart (Foundation)

Prerequisites:

- Node.js 22+
- pnpm 9+
- Docker + Docker Compose

Steps:

```bash
cp .env.example .env
pnpm install
pnpm dev
```

Services and health endpoints:

- Web Landing: `http://localhost:3000`
- Web App Login: `http://localhost:3000/app/login`
- API: `http://localhost:3001/health`
- API Ready: `http://localhost:3001/ready`
- Worker: `http://localhost:3002/health`

Run only infrastructure:

```bash
docker compose -f infra/docker-compose.yml up --build
```

## Current Status

Foundation implementation started.

Implemented:

- pnpm monorepo structure (`apps/*`, `packages/*`)
- base API, Web and Worker apps
- health/ready endpoints and graceful shutdown
- Docker Compose with PostgreSQL + app services
- base TypeScript configuration and environment template
- route separation: landing in `/` and app in `/app/*`
- GitHub OAuth login flow with secure session cookie
- GitHub App self-service integration flow (install URL, callback, repository selection)

## GitHub Self-Service Model

Global (platform-level) secrets in environment variables:

- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- `GITHUB_APP_ID`, `GITHUB_APP_NAME`, `GITHUB_APP_PRIVATE_KEY`
- `GITHUB_WEBHOOK_SECRET`

Tenant (customer-level) data stored per organization in database:

- `installation_id` of GitHub App
- repository selection per organization
- integration status and sync state

This means setup is done once by the platform team, then each customer connects GitHub in a self-service onboarding flow.
