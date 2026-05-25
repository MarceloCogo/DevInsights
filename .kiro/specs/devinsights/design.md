# DevInsights — Design (Estado Atual)

## 1. Arquitetura

```text
GitHub OAuth + GitHub App
        -> API (Fastify)
        -> PostgreSQL
        -> Worker (job consumer)
        -> API de dashboard
        -> Web app (/app)
```

### Servicos

- `apps/web`: landing + app shell e dashboard.
- `apps/api`: auth, organizacoes, integracao GitHub, endpoints de dashboard, enqueue de jobs.
- `apps/worker`: consumo de jobs em Postgres e sincronizacao de PRs.

## 2. Fluxos principais

### 2.1 Login e sessao

1. Usuario acessa `/app/login`.
2. API inicia OAuth GitHub com state assinado e persistido.
3. Callback cria/atualiza usuario e sessao.
4. Cookie de sessao e enviado e frontend acessa `/api/v1/app/bootstrap`.

### 2.2 Onboarding GitHub App

1. Usuario solicita install URL.
2. GitHub retorna callback com `installation_id`.
3. API salva instalacao na organizacao ativa.
4. Frontend lista repositorios autorizados.
5. Usuario seleciona repositorios monitorados.

### 2.3 Sync

1. API cria registro `pending` em `integration_sync_jobs`.
2. Worker busca jobs com `FOR UPDATE SKIP LOCKED`.
3. Worker executa sync com Octokit.
4. Worker faz upsert em `pull_requests` e `repository_sync_stats`.
5. Worker atualiza status do job.

## 3. Modelo de dados minimo

- `users`
- `organizations`
- `organization_members`
- `sessions`
- `auth_states`
- `github_installations`
- `tracked_repositories`
- `integration_sync_jobs`
- `pull_requests`
- `repository_sync_stats`

## 4. API (visao resumida)

- Auth: `/auth/github/login`, `/auth/github/callback`, `/auth/me`, `/auth/logout`
- Organizacoes: `/organizations`, `/organizations/active`
- App: `/app/bootstrap`
- Integracoes: `/integrations/github/*`
- Dashboard: `/dashboard/overview`, `/dashboard/pull-requests`

## 5. UX `/app`

Padrao visual orientado a dashboard de mercado:

- sidebar vertical persistente
- topbar contextual
- banner de status operacional
- cards de metricas
- tabela principal de PRs com filtros
- secoes consistentes: `overview`, `pr`, `integrations`, `settings`

## 6. Diretrizes de evolucao (sem overengineering)

- Proximo passo recomendado: migrations formais e modularizacao do `apps/api/src/server.ts`.
- Manter jobs em Postgres ate haver demanda real por Redis/BullMQ.
- Evitar introduzir camadas abstratas sem ganho operacional claro.
