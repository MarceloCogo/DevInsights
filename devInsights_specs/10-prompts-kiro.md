# DevPulse AI — Prompts para Kiro Dev

## Prompt 1 — Criar base do monorepo

Crie um monorepo TypeScript para o projeto DevPulse AI com a seguinte estrutura:

- apps/web: React + Vite + Tailwind CSS + TypeScript
- apps/api: Node.js + Fastify + TypeScript
- apps/worker: Node.js + TypeScript
- packages/domain
- packages/application
- packages/database
- packages/github
- packages/shared
- infra/docker-compose.yml

Use pnpm workspaces. Configure ESLint, Prettier, Vitest e TypeScript strict. Crie um Docker Compose com PostgreSQL. Crie README inicial e .env.example. Não adicione bibliotecas desnecessárias.

## Prompt 2 — Criar schema inicial do banco

Implemente Prisma no package database e crie migrations iniciais para as entidades:

- Organization
- User
- Team
- TeamMember
- Repository
- RepositoryTeam
- GitHubInstallation
- PullRequest
- PullRequestReview
- PullRequestCommit
- WorkflowRun
- Deployment
- Issue
- Incident
- AIUsageDeclaration
- MetricSnapshot
- IntegrationSyncJob
- AuditLog
- PrivacySettings

Siga a especificação do arquivo 05-modelo-dados.md. Crie seeds mínimos para ambiente local.

## Prompt 3 — Criar API base

No app api, crie servidor Fastify com:

- health check em /health
- prefixo /api/v1
- validação com Zod
- tratamento padronizado de erros
- logger estruturado
- conexão com Prisma
- middleware básico de autenticação fake temporária para desenvolvimento

Não implemente autenticação real ainda, mas deixe a arquitetura preparada.

## Prompt 4 — Criar layout frontend

No app web, crie layout base com:

- sidebar esquerda
- header superior
- seletor de período fake
- páginas: Overview, Squads, PR Intelligence, DORA, AI Impact, Investment, DevEx, Automations, Insights, Settings
- componentes: MetricCard, TrendBadge, HealthBadge, DataTable, EmptyState, LoadingSkeleton, InsightCard

Use Tailwind CSS e estética limpa, próxima a ferramentas modernas como LinearB, Linear, GitHub e Vercel.

## Prompt 5 — Implementar organizações e squads

Implemente APIs e telas para:

- criar organização
- listar organização
- criar squads
- listar squads
- editar squads
- adicionar membros ao squad
- associar repositórios a squads futuramente

Use clean architecture: regras no domain/application e persistência no database.

## Prompt 6 — Implementar GitHub App install flow

Implemente integração GitHub App:

- endpoint para gerar URL de instalação
- callback de instalação
- persistência de installation_id
- client GitHub usando app private key
- listagem de repositórios autorizados
- tela GitHub Settings com status

Use escopos mínimos e não armazene installation token permanente.

## Prompt 7 — Sincronizar repositórios

Implemente sync de repositórios GitHub:

- buscar repositórios da instalação
- salvar em repositories
- atualizar registros existentes
- marcar arquivados
- registrar job de sincronização
- mostrar última sincronização na interface

Inclua tratamento de erro e retries simples via tabela integration_sync_jobs.

## Prompt 8 — Sincronizar PRs

Implemente backfill de pull requests dos últimos 90 dias:

- buscar PRs por repositório
- salvar campos principais
- salvar labels
- salvar métricas brutas: additions, deletions, changed_files, commits_count
- associar usuário por github_login quando existir
- registrar progresso do job

Crie endpoint manual para disparar sync por organização/repositório.

## Prompt 9 — Sincronizar reviews e commits

Para cada PR importado, sincronize:

- reviews
- commits associados

Salve em pull_request_reviews e pull_request_commits. O processamento deve ser idempotente.

## Prompt 10 — Implementar métricas de PR

No package domain, implemente funções puras para:

- calculatePrCycleTime
- calculatePickupTime
- calculateReviewTime
- calculateMergeTime
- calculatePrSize
- calculateReworkAfterReview
- classifyStalePr
- calculateReviewerLoad

Crie testes unitários com cenários reais.

## Prompt 11 — Criar dashboard PR Intelligence

Implemente APIs e telas para PR Intelligence:

- cards de PR Cycle Time, Pickup Time, Review Time, Throughput, Stale PRs
- gráfico de cycle time por semana
- tabela de PRs
- filtros por período, squad, repo, autor, reviewer, status
- tabela de reviewer load
- tela de detalhe do PR com timeline

## Prompt 12 — Implementar webhooks GitHub

Implemente endpoint /webhooks/github:

- validar assinatura X-Hub-Signature-256
- registrar evento bruto ou job
- processar eventos pull_request e pull_request_review
- atualizar PR e reviews
- recalcular métricas afetadas
- responder rápido ao GitHub

## Prompt 13 — Implementar declaração de uso de IA

Implemente AIUsageDeclaration:

- API para criar/editar declaração em PR
- componente no PR Detail
- campos: intensity, toolName, purposes, humanValidationChecked, validationChecklist, notes
- filtros com IA / sem IA
- métricas AI Assisted PR Rate, AI Cycle Time Delta e AI Review Burden

## Prompt 14 — Criar dashboard AI Impact

Crie tela AI Impact com:

- AI Assisted PR Rate
- uso por ferramenta
- uso por finalidade
- cycle time com IA vs sem IA
- review burden com IA vs sem IA
- PRs com IA intensiva sem teste
- cards de governança

Use linguagem cautelosa, sem inferências absolutas.

## Prompt 15 — Implementar DORA parcial

Implemente importação de workflow_runs e deployments:

- configurar workflows de produção
- configurar ambientes de produção
- calcular deployment frequency
- calcular lead time for changes básico
- criar tela DORA indicando quais métricas ainda são parciais

## Prompt 16 — Implementar incidentes

Crie cadastro manual de incidentes:

- repositoryId
- deploymentId opcional
- title
- severity
- status
- startedAt
- resolvedAt

Calcule MTTR e Change Failure Rate quando houver associação com deployment.

## Prompt 17 — Implementar automations MVP

Crie motor simples de regras com templates:

- PR stale
- PR grande
- PR com IA intensiva sem teste
- reviewer sobrecarregado
- aumento de review time

As regras devem gerar alertas internos na tela Insights.

## Prompt 18 — Preparar projeto open source

Crie arquivos:

- README.md
- CONTRIBUTING.md
- CODE_OF_CONDUCT.md
- SECURITY.md
- LICENSE placeholder
- docs/installation.md
- docs/github-app-setup.md
- docs/privacy.md
- docs/metrics.md

Inclua instruções para rodar localmente com Docker Compose.
