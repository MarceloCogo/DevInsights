# DevInsights — Design

## 1. Arquitetura Geral

O DevInsights segue uma arquitetura em camadas baseada em Clean Architecture, com separação clara entre frontend, backend, worker e pacotes de domínio compartilhados.

```text
GitHub App / Webhooks / API
Azure DevOps API / Webhooks (futuro)
              ↓
Integration Layer (packages/github, packages/azure-devops)
              ↓
  Raw Events → Normalized Tables (PostgreSQL)
              ↓
      Metric Engine (packages/domain)
              ↓
  Metric Snapshots / Aggregations
              ↓
    Application API (apps/api — Fastify)
              ↓
      React Dashboard (apps/web)
```

### Fluxo de dados principal

1. GitHub envia webhook ou o worker faz polling via API.
2. A camada de integração normaliza os dados para entidades internas.
3. O metric engine calcula métricas e gera snapshots.
4. A API expõe endpoints otimizados para o dashboard.
5. O frontend consome a API e exibe os dados.
6. Futuramente, Azure DevOps seguirá o mesmo fluxo via seu próprio adaptador.

---

## 2. Estrutura de Pastas

```text
devinsights/
├── apps/
│   ├── web/                    # Frontend React + Vite + Tailwind
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/       # Chamadas à API
│   │   │   ├── stores/         # Estado global mínimo
│   │   │   └── utils/
│   │   ├── Dockerfile
│   │   ├── vite.config.ts
│   │   └── tailwind.config.ts
│   ├── api/                    # Backend Fastify
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   ├── plugins/        # Auth, CORS, rate limit
│   │   │   ├── middleware/
│   │   │   └── server.ts
│   │   └── Dockerfile
│   └── worker/                 # Worker de sincronização
│       ├── src/
│       │   ├── jobs/
│       │   ├── processors/
│       │   └── scheduler.ts
│       └── Dockerfile
├── packages/
│   ├── domain/                 # Entidades e regras puras
│   │   ├── src/
│   │   │   ├── entities/
│   │   │   ├── value-objects/
│   │   │   ├── calculators/    # Metric calculators
│   │   │   └── classifiers/
│   ├── application/            # Casos de uso
│   │   ├── src/
│   │   │   ├── use-cases/
│   │   │   └── ports/          # Interfaces de repositório e integração
│   ├── database/               # Prisma + repositórios concretos
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   ├── src/
│   │   │   ├── repositories/
│   │   │   └── seeds/
│   ├── github/                 # Integração GitHub
│   │   ├── src/
│   │   │   ├── client/
│   │   │   ├── webhook/
│   │   │   ├── mappers/
│   │   │   └── rate-limit/
│   ├── azure-devops/           # Integração Azure DevOps (planejada)
│   │   ├── src/
│   │   │   ├── client/
│   │   │   ├── webhook/
│   │   │   ├── mappers/
│   │   │   └── rate-limit/
│   └── shared/                 # Tipos, enums, utilitários
│       ├── src/
│       │   ├── types/
│       │   ├── enums/
│       │   └── utils/
├── docs/
│   ├── installation.md
│   ├── github-app-setup.md
│   ├── metrics.md
│   ├── privacy.md
│   └── deploy-railway.md
├── docker-compose.yml
├── .env.example
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

---

## 3. Separação entre Apps, Worker e Packages

### apps/web

Responsabilidade exclusiva de interface. Não contém lógica de negócio.

- React + Vite + TypeScript + Tailwind CSS
- Componentes próprios (sem UI library pesada no MVP)
- TanStack Query para cache e estados assíncronos
- Recharts para gráficos (mínimo necessário)
- React Router para navegação
- Dockerfile multi-stage para build e servir estáticos

### apps/api

Responsabilidade de expor a API REST e receber webhooks.

- Fastify + TypeScript
- Zod para validação de input
- Prisma Client para acesso ao banco
- Logger estruturado (pino)
- Plugins: autenticação, CORS, rate limit, headers de segurança
- Não contém lógica de domínio — delega para packages/application
- Dockerfile multi-stage para build e execução

### apps/worker

Responsabilidade de executar jobs assíncronos.

- Node.js + TypeScript
- Polling na tabela `integration_sync_jobs`
- Processadores por tipo de job
- Não expõe HTTP (exceto health check interno)
- Delega lógica para packages/application, packages/github e packages/azure-devops
- Dockerfile multi-stage para build e execução

### packages/domain

Camada mais interna. Zero dependências externas.

- Entidades puras (PullRequest, Review, Deployment, WorkItem, Sprint, etc.)
- Value objects (CycleTime, PrSize, ReviewerLoad, WorkItemCycleTime, etc.)
- Calculadores de métricas (funções puras, testáveis isoladamente)
- Classificadores (StaleClassifier, PrSizeClassifier, RiskClassifier)
- Regras de privacidade

### packages/application

Orquestra casos de uso. Depende apenas de interfaces (ports).

- Use cases (SyncPullRequestsUseCase, CalculatePrMetricsUseCase, SyncWorkItemsUseCase, etc.)
- Ports (interfaces de repositório, interfaces de integração)
- Define `ICodeHostingProvider` e `IProjectManagementProvider`
- Não importa Prisma, Fastify, GitHub SDK ou Azure DevOps SDK diretamente

### packages/database

Implementação concreta dos ports de repositório.

- Schema Prisma
- Migrations
- Repositórios concretos implementando os ports
- Seeds para desenvolvimento

### packages/github

Adaptador para a API GitHub.

- GitHub App authentication
- REST e GraphQL clients
- Webhook signature verifier
- Mappers GitHub → entidades internas
- Rate limit handler
- Implementa `ICodeHostingProvider`

### packages/azure-devops

Adaptador planejado para a API Azure DevOps. Detalhes na Seção 3.1.

### packages/shared

Contratos e utilitários compartilhados.

- Tipos de API (request/response)
- Enums compartilhados
- Utilitários puros (datas, strings, etc.)

---

### 3.1 packages/azure-devops (planejado)

Package responsável por toda a integração com o Azure DevOps. Segue o mesmo padrão do `packages/github`.

**Responsabilidades:**

- **Azure DevOps REST API client** — cliente autenticado via Personal Access Token (PAT) ou OAuth, com suporte a paginação e retry
- **Work Items sync** — busca e normaliza Work Items (Epics, Features, User Stories, Tasks, Bugs) para entidades internas
- **Iterations/Sprints sync** — busca e normaliza Sprints e suas associações com Work Items
- **Webhook handler (futuro)** — recebe e valida eventos do Azure DevOps via Service Hooks
- **Mappers Azure DevOps → entidades internas** — converte modelos do Azure DevOps para entidades do domínio
- **Rate limit handler** — respeita os limites de requisição da API do Azure DevOps

**Implementa:** `IProjectManagementProvider` (definido em packages/application)

---

## 4. Camadas da Clean Architecture

```text
┌─────────────────────────────────────────────┐
│              Frameworks & Drivers            │
│   (Fastify, React, Prisma, GitHub SDK,       │
│    Azure DevOps SDK)                         │
├─────────────────────────────────────────────┤
│           Interface Adapters                 │
│   (Routes, Controllers, Repositories,        │
│    Mappers, Presenters)                      │
├─────────────────────────────────────────────┤
│           Application Business Rules         │
│   (Use Cases, Ports/Interfaces)              │
├─────────────────────────────────────────────┤
│           Enterprise Business Rules          │
│   (Entities, Value Objects, Calculators,     │
│    Domain Rules)                             │
└─────────────────────────────────────────────┘
```

**Regra de dependência:** camadas internas nunca importam camadas externas. Dependências apontam sempre para dentro.

---

## 5. Módulos do Domínio

### 5.1 Auth

Entidades: Session, UserCredentials
Regras: validação de senha, geração de token de sessão

### 5.2 Organization

Entidades: Organization
Regras: slug único, isolamento de dados

### 5.3 Team

Entidades: Team, TeamMember
Regras: papéis de membro, associação com repositórios

### 5.4 Repository

Entidades: Repository, RepositoryTeam
Regras: repositório crítico, squad principal

### 5.5 GitHub Integration

Entidades: GitHubInstallation
Regras: escopos mínimos, geração de token sob demanda

### 5.6 PullRequest

Entidades: PullRequest, PullRequestReview, PullRequestCommit
Value Objects: CycleTime, PickupTime, ReviewTime, PrSize
Calculadores: PrMetricsCalculator
Classificadores: StalePrClassifier, LargePrClassifier

### 5.7 WorkflowRun

Entidades: WorkflowRun
Regras: associação com commit SHA e PR

### 5.8 AIUsage

Entidades: AIUsageDeclaration
Value Objects: AiIntensity, AiPurpose
Calculadores: AiImpactCalculator

### 5.9 Metrics

Entidades: MetricSnapshot
Calculadores: ReviewerLoadCalculator, ThroughputCalculator
Regras: agregação por período, squad, repositório

### 5.10 Jobs

Entidades: IntegrationSyncJob
Regras: retry exponencial, status transitions

### 5.11 Privacy

Entidades: PrivacySettings
Regras: defaults restritivos, controle de coleta

### 5.12 Audit

Entidades: AuditLog
Regras: ações auditáveis, imutabilidade

### 5.13 Integration (multi-provider)

Entidades: IntegrationProvider, IntegrationAccount, ExternalUserMapping

**Regras:**
- Isolamento por provider: cada provider tem suas próprias credenciais e configurações, sem vazamento entre provedores
- Mapeamento de usuários entre provedores: um usuário interno pode ter identidades em múltiplos provedores (ex: mesmo desenvolvedor no GitHub e no Azure DevOps)
- Credenciais armazenadas de forma criptografada no campo `encrypted_credentials`
- Status de conexão rastreado por conta de integração

### 5.14 WorkItem (Azure DevOps)

Entidades: WorkItem, WorkItemStatusTransition, WorkItemPullRequestLink
Value Objects: WorkItemCycleTime, WorkItemLeadTime
Calculadores: WorkItemMetricsCalculator

**Regras:**
- Correlação com PRs: um Work Item pode estar associado a um ou mais Pull Requests via `WorkItemPullRequestLink`
- Cycle time por tipo de work item: calculado separadamente para Bugs, User Stories, Tasks, etc.
- Transições de estado rastreadas em `WorkItemStatusTransition` para cálculo preciso de tempo em cada estado
- Lead time calculado desde a criação do Work Item até o fechamento

### 5.15 Sprint (Azure DevOps)

Entidades: Sprint, SprintWorkItem
Calculadores: SprintThroughputCalculator, PlannedVsUnplannedCalculator

**Regras:**
- Throughput por sprint: quantidade de Work Items concluídos por sprint
- Bug ratio: proporção de Bugs em relação ao total de Work Items do sprint
- Planejado vs não planejado: Work Items adicionados após o início do sprint são marcados como não planejados
- Sprints têm status (past, current, future) para facilitar filtros no dashboard

---

## 6. Modelo de Dados Inicial

### organizations
```
id uuid pk | name text | slug text unique | created_at | updated_at
```

### users
```
id uuid pk | organization_id fk | name | email unique | github_login |
avatar_url | role | disabled_at | created_at | updated_at
```

### teams
```
id uuid pk | organization_id fk | name | slug | description |
archived_at | created_at | updated_at
```

### team_members
```
id uuid pk | team_id fk | user_id fk | team_role | created_at
```

### repositories
```
id uuid pk | organization_id fk | github_id bigint unique | name |
full_name | owner | default_branch | visibility | primary_language |
is_archived bool | is_critical bool | html_url | last_synced_at |
created_at | updated_at
```

### repository_teams
```
id uuid pk | repository_id fk | team_id fk | is_primary bool | created_at
```

### github_installations
```
id uuid pk | organization_id fk | installation_id bigint unique |
account_login | account_type | permissions jsonb | events jsonb |
installed_at | suspended_at | created_at | updated_at
```

### pull_requests
```
id uuid pk | repository_id fk | github_id bigint unique | number |
title | author_user_id fk null | github_author_login | state |
is_draft bool | base_branch | head_branch | opened_at |
ready_for_review_at null | closed_at null | merged_at null |
merge_commit_sha null | additions | deletions | changed_files |
commits_count | comments_count | review_comments_count |
labels jsonb | html_url | created_at | updated_at
```

### pull_request_reviews
```
id uuid pk | pull_request_id fk | github_id bigint unique |
reviewer_user_id fk null | github_reviewer_login | state |
submitted_at | comments_count | created_at | updated_at
```

### pull_request_commits
```
id uuid pk | pull_request_id fk | sha | github_author_login null |
committed_at | created_at
```

### workflow_runs
```
id uuid pk | repository_id fk | github_id bigint unique | name |
status | conclusion null | branch null | commit_sha | event null |
started_at null | completed_at null | duration_seconds null |
html_url null | created_at | updated_at
```

### ai_usage_declarations
```
id uuid pk | pull_request_id fk unique | user_id fk null |
intensity text | tool_name null | purposes jsonb |
human_validation_checked bool | validation_checklist jsonb |
notes null | created_at | updated_at
```

### metric_snapshots
```
id uuid pk | organization_id fk | team_id fk null |
repository_id fk null | metric_name | metric_value numeric |
aggregation | dimensions jsonb | period_start | period_end | created_at
```

### integration_sync_jobs
```
id uuid pk | organization_id fk | provider | job_type | status |
payload jsonb | attempts | max_attempts | scheduled_at |
started_at null | finished_at null | error_message null |
created_at | updated_at
```

### audit_logs
```
id uuid pk | organization_id fk | actor_user_id fk null | action |
resource_type | resource_id null | metadata jsonb | ip_address null |
user_agent null | created_at
```

### privacy_settings
```
id uuid pk | organization_id fk unique | collect_pr_body bool default false |
collect_review_body bool default false | collect_commit_messages bool default false |
collect_issue_body bool default false | anonymize_surveys bool default true |
show_individual_metrics bool default false | data_retention_days null |
created_at | updated_at
```

### integration_providers
```
id uuid pk | organization_id fk | provider_type text (github|azure_devops|jira) |
display_name text | is_active bool | created_at | updated_at
```

### integration_accounts
```
id uuid pk | integration_provider_id fk | organization_id fk |
external_account_id text | external_account_name text |
encrypted_credentials jsonb | scopes jsonb |
connected_at | last_synced_at | status text | created_at | updated_at
```

### external_user_mappings
```
id uuid pk | organization_id fk | user_id fk |
provider_type text | external_user_id text | external_login text |
external_display_name text | created_at | updated_at
```

### work_items
```
id uuid pk | organization_id fk | integration_account_id fk |
external_id text | external_url text | work_item_type text (epic|feature|user_story|task|bug) |
title text | state text | assigned_to_user_id fk null |
external_assigned_to text null | area_path text null |
iteration_path text null | sprint_id fk null |
parent_work_item_id fk null | tags jsonb |
created_at_external timestamp | updated_at_external timestamp |
closed_at_external timestamp null | created_at | updated_at
```

### work_item_status_transitions
```
id uuid pk | work_item_id fk | from_state text null |
to_state text | transitioned_at timestamp |
transitioned_by_external text null | created_at
```

### work_item_pull_request_links
```
id uuid pk | work_item_id fk | pull_request_id fk |
link_type text (referenced|implemented_by|related) |
created_at
```

### sprints
```
id uuid pk | organization_id fk | integration_account_id fk |
external_id text | name text | path text |
start_date date null | end_date date null |
status text (past|current|future) | created_at | updated_at
```

---

## 7. Estratégia de Integração com GitHub

### 7.1 GitHub App vs Personal Access Token

O produto usa GitHub App por:
- Melhor governança e escopos mínimos
- Instalação por organização/repositório
- Revogação centralizada
- Suporte nativo a webhooks
- Melhor experiência para self-hosted

### 7.2 Permissões mínimas do GitHub App

Repository permissions:
- Metadata: read
- Pull requests: read
- Contents: read
- Checks: read
- Actions: read
- Deployments: read
- Issues: read

Organization permissions:
- Members: read (para mapear usuários)

Webhook events:
- pull_request, pull_request_review, pull_request_review_comment
- check_run, check_suite, workflow_run
- deployment, deployment_status
- issues, issue_comment, push

### 7.3 Fluxo de instalação

```text
1. Admin clica "Conectar GitHub"
2. API gera URL de instalação do GitHub App
3. Admin instala o App na organização GitHub
4. GitHub redireciona para callback com installation_id
5. API salva installation_id na tabela github_installations
6. API dispara job de sync de repositórios
7. Worker lista repositórios autorizados via API GitHub
8. Admin seleciona repositórios a monitorar
9. API dispara jobs de backfill por repositório
```

### 7.4 Autenticação com GitHub

- Nunca armazenar installation token permanentemente
- Gerar installation token sob demanda (válido por 1 hora)
- Private key do GitHub App carregada via variável de ambiente
- Usar `@octokit/auth-app` para autenticação

### 7.5 Fluxo de webhook

```text
1. GitHub envia POST para /webhooks/github
2. API valida X-Hub-Signature-256
3. API rejeita com 401 se inválido
4. API cria job na tabela integration_sync_jobs
5. API responde 200 imediatamente
6. Worker processa o job assincronamente
7. Worker atualiza entidades normalizadas
8. Worker recalcula métricas afetadas
```

---

## 8. Estratégia de Integração Multi-Provider

### 8.1 Abstração de provedores

O domínio não conhece GitHub ou Azure DevOps diretamente. Ele trabalha com entidades normalizadas. Cada provedor tem seu próprio package de adaptador que:

- Autentica com o provedor usando o mecanismo adequado (GitHub App, PAT, OAuth)
- Busca dados via API do provedor
- Mapeia para entidades internas do domínio
- Registra jobs de sync na tabela `integration_sync_jobs`

Essa separação garante que adicionar um novo provedor (ex: Jira, GitLab) não exige alterações no domínio ou nos casos de uso existentes.

### 8.2 Ports de integração

O `packages/application` define ports (interfaces) que os adaptadores implementam:

- `ICodeHostingProvider` — para provedores de hospedagem de código como GitHub. Responsável por PRs, reviews, workflows e deployments.
- `IProjectManagementProvider` — para provedores de gestão de projetos como Azure DevOps. Responsável por work items, sprints e boards.

Cada package de integração (`packages/github`, `packages/azure-devops`) implementa a interface correspondente, permitindo que os casos de uso em `packages/application` operem de forma agnóstica ao provedor.

### 8.3 Correlação GitHub ↔ Azure DevOps

Estratégia de correlação entre Pull Requests do GitHub e Work Items do Azure DevOps:

- **Branch naming convention:** `feature/ADO-1234-description` — o sistema extrai o ID do work item a partir do nome da branch
- **Título do PR:** `[ADO-1234] description` — o sistema extrai o ID do work item a partir do título do PR
- **Link explícito:** o usuário associa manualmente um PR a um Work Item via interface do DevInsights
- **Webhook do Azure DevOps (futuro):** notificação automática quando um PR é associado a um Work Item via Service Hooks

A correlação é armazenada na tabela `work_item_pull_request_links` com o tipo de link correspondente.

### 8.4 Azure DevOps — Permissões mínimas

Escopos necessários para o Personal Access Token (PAT):

- **Work Items: Read** — para sincronizar Work Items, transições de estado e hierarquia
- **Code: Read** — para correlação de commits com Work Items
- **Build: Read** — para pipelines (futuro)
- **Project and Team: Read** — para listar projetos, times e iterações

---

## 9. Estratégia de Jobs

### 9.1 Tabela integration_sync_jobs

No MVP, jobs são gerenciados via PostgreSQL para evitar dependência de Redis.

Status transitions:
```
pending → running → completed
                 → failed (com retry)
pending → cancelled
```

### 9.2 Tipos de job

- `github.sync.repositories` — sincronizar repositórios da instalação
- `github.sync.pull_requests` — backfill de PRs por repositório
- `github.sync.reviews` — sincronizar reviews de PRs
- `github.sync.workflow_runs` — sincronizar workflow runs
- `github.process.webhook` — processar evento de webhook
- `azure_devops.sync.work_items` — sincronizar Work Items por projeto
- `azure_devops.sync.sprints` — sincronizar Sprints e iterações
- `azure_devops.process.webhook` — processar evento de webhook do Azure DevOps (futuro)
- `metrics.calculate.snapshots` — recalcular snapshots de métricas

### 9.3 Worker loop

```text
1. Worker faz polling a cada N segundos
2. Busca jobs com status=pending e scheduled_at <= now()
3. Marca job como running (com lock otimista)
4. Executa o processador correspondente
5. Marca como completed ou failed
6. Em caso de falha: incrementa attempts, agenda retry com backoff
7. Após max_attempts: marca como failed definitivo
```

### 9.4 Rate limit handling

- Respeitar headers `X-RateLimit-Remaining` e `X-RateLimit-Reset` (GitHub)
- Respeitar limites de requisição do Azure DevOps
- Pausar jobs quando rate limit estiver próximo do esgotamento
- Usar paginação em todas as chamadas de listagem
- Priorizar processamento de webhooks recentes sobre backfill

---

## 10. Estratégia de Cálculo de Métricas

### 10.1 Métricas on-demand

Para telas de detalhe e baixa cardinalidade:
- Detalhes de um PR específico
- Métricas de um repositório individual

### 10.2 Metric snapshots

Para dashboards e alta cardinalidade:
- Calculados pelo worker após sincronização
- Armazenados em `metric_snapshots`
- Dimensões: organization_id, team_id, repository_id, period
- Evitam recálculo pesado em cada consulta

### 10.3 Fórmulas de cálculo

| Métrica | Fórmula |
|---------|---------|
| PR Cycle Time | `merged_at - opened_at` |
| Pickup Time | `first_review_submitted_at - ready_for_review_at` (fallback: `- opened_at`) |
| Review Time | `approved_at - first_review_submitted_at` |
| PR Size | `additions + deletions` |
| Throughput | `count(merged PRs) / period` |
| Reviewer Load | `count(open PRs where reviewer = X)` |
| AI Assisted PR Rate | `count(PRs with ai_usage) / count(total PRs)` |
| AI Cycle Time Delta | `avg(cycle_time with AI) - avg(cycle_time without AI)` |
| Deployment Frequency | `count(production deployments) / period` |
| Lead Time for Changes | `deployed_at - first_commit_at` |
| Work Item Cycle Time | `closed_at_external - first_in_progress_at` |
| Work Item Lead Time | `closed_at_external - created_at_external` |
| Sprint Throughput | `count(work items completed in sprint)` |
| Bug Ratio | `count(bugs in sprint) / count(total work items in sprint)` |

### 10.4 Detecção de PRs parados

Um PR é considerado parado quando:
- Estado: open (não draft, não merged, não closed)
- Última atividade (push, review, comment) há mais de X dias (configurável, padrão: 3 dias)

### 10.5 Classificação de PR grande

Um PR é considerado grande quando:
- `additions + deletions > threshold` (configurável, padrão: 500 linhas)

---

## 11. Estratégia de Autenticação e Autorização

### 11.1 Autenticação no MVP

- E-mail e senha com hash bcrypt/argon2
- Sessão via cookie HttpOnly, Secure, SameSite=Strict
- Sem JWT no MVP (sessão server-side é mais simples e segura)
- Rate limit em `/auth/login`

### 11.2 RBAC

| Papel | Acesso |
|-------|--------|
| INSTANCE_ADMIN | Gerencia instância, todas as organizações |
| ORG_ADMIN | Gerencia organização, integrações, usuários |
| ENGINEERING_MANAGER | Métricas dos squads permitidos, sem drill-down individual |
| TECH_LEAD | Detalhes técnicos dos squads permitidos |
| DEVELOPER | Próprios PRs, dados agregados do squad |
| EXECUTIVE_VIEWER | Dashboards agregados, sem drill-down sensível |

### 11.3 Middleware de autorização

```text
1. Verificar sessão válida
2. Carregar usuário e papel
3. Verificar se usuário pertence à organização do recurso
4. Verificar se papel tem permissão para a ação
5. Para métricas individuais: verificar privacy_settings.show_individual_metrics
```

---

## 12. Estratégia de Privacidade

### 12.1 Defaults restritivos

Todos os campos de conteúdo textual são desabilitados por padrão:
- `collect_pr_body = false`
- `collect_review_body = false`
- `collect_commit_messages = false`
- `collect_issue_body = false`
- `show_individual_metrics = false`
- `anonymize_surveys = true`

### 12.2 Aplicação no sync

O worker verifica `privacy_settings` antes de salvar cada campo. Campos desabilitados são armazenados como `null`, nunca como string vazia.

### 12.3 Política anti-ranking

- Nenhum endpoint retorna ranking de desenvolvedores
- Métricas individuais só são retornadas se `show_individual_metrics = true` E o papel do usuário permite
- Dashboards padrão mostram visão por squad/repositório

---

## 13. Design System Inicial

### 13.1 Direção visual

Estética próxima a LinearB, GitHub, Vercel e Linear:
- Interface limpa com muito espaço em branco
- Foco em tabelas e dashboards
- Cards objetivos com métricas em destaque
- Gráficos simples e informativos
- Navegação lateral
- Visual técnico mas acessível para liderança

### 13.2 Tokens de design (Tailwind)

```
Background: gray-50 / white
Cards: white com border gray-200
Texto principal: gray-900
Texto secundário: gray-500
Sucesso: green-600
Atenção: amber-500
Risco: red-600
Info: blue-600 / violet-600
```

### 13.3 Componentes essenciais

| Componente | Descrição |
|-----------|-----------|
| MetricCard | Card com valor, label, tendência e tooltip |
| TrendBadge | Badge com seta e % de variação |
| HealthBadge | Badge de status (healthy, warning, critical) |
| FilterBar | Barra de filtros com período, squad, repo |
| DateRangePicker | Seletor de período |
| DataTable | Tabela densa com paginação e ordenação |
| InsightCard | Card de insight com severidade e ação |
| AlertCard | Card de alerta com tipo e contexto |
| Timeline | Timeline de eventos do PR |
| EmptyState | Estado vazio com ação sugerida |
| LoadingSkeleton | Skeleton de carregamento |
| TooltipInfo | Tooltip explicativo de métricas |

### 13.4 Layout base

```
┌─────────────────────────────────────────────┐
│  Sidebar (240px)  │  Header                 │
│  - Overview       │  Org | Período | Filtros │
│  - Squads         ├─────────────────────────┤
│  - PR Intelligence│                         │
│  - DORA           │   Área principal        │
│  - AI Impact      │   (cards, gráficos,     │
│  - Work Items     │    tabelas, insights)   │
│  - Sprints        │                         │
│  - Settings       │                         │
└─────────────────────────────────────────────┘
```

### 13.5 Microcopy

Evitar: "baixo desempenho", "pior dev", "ranking individual"
Preferir: "gargalo de fluxo", "oportunidade de melhoria", "risco de entrega", "sobrecarga de revisão"

---

## 14. Decisões Técnicas e Trade-offs

### 14.1 Monorepo com pnpm workspaces

**Decisão:** Monorepo com pnpm workspaces.
**Motivo:** Facilita compartilhamento de tipos e pacotes entre apps. Simplifica CI e versionamento.
**Trade-off:** Curva de aprendizado inicial maior. Aceitável dado o benefício de longo prazo.

### 14.2 Jobs via PostgreSQL no MVP

**Decisão:** Gerenciar jobs via tabela PostgreSQL, sem Redis/BullMQ.
**Motivo:** Reduz dependências no MVP. Docker Compose mais simples. Suficiente para volume inicial.
**Trade-off:** Menor throughput e sem filas avançadas. Migração para BullMQ planejada se necessário.

### 14.3 Sessão server-side vs JWT

**Decisão:** Sessão server-side com cookie HttpOnly.
**Motivo:** Mais seguro para MVP. Sem risco de token leakage no cliente. Revogação imediata.
**Trade-off:** Requer armazenamento de sessão no servidor. Aceitável para self-hosted.

### 14.4 REST vs GraphQL

**Decisão:** REST para o MVP.
**Motivo:** Mais simples de implementar, documentar e consumir. Suficiente para os casos de uso do MVP.
**Trade-off:** Possível over-fetching em algumas telas. GraphQL pode ser adicionado depois.

### 14.5 Metric snapshots vs cálculo on-demand

**Decisão:** Snapshots para dashboards, on-demand para detalhes.
**Motivo:** Dashboards com filtros de 90 dias seriam lentos sem snapshots. Detalhes de PR único são rápidos on-demand.
**Trade-off:** Dados de dashboard podem ter delay de minutos. Aceitável para o caso de uso.

### 14.6 Sem UI library pesada

**Decisão:** Componentes próprios com Tailwind CSS.
**Motivo:** Controle total sobre design, sem dependência de biblioteca externa. Tailwind é suficiente.
**Trade-off:** Mais trabalho inicial de componentes. Compensado pela flexibilidade e performance.

### 14.7 GitHub App vs PAT

**Decisão:** GitHub App obrigatório.
**Motivo:** Melhor governança, escopos mínimos, revogação centralizada, melhor para open source.
**Trade-off:** Configuração inicial mais complexa. Documentação clara mitiga isso.

### 14.8 Prisma como ORM

**Decisão:** Prisma.
**Motivo:** Type-safety nativa, migrations gerenciadas, excelente DX com TypeScript.
**Trade-off:** Overhead de geração de tipos. Aceitável dado o benefício de segurança.

### 14.9 Multi-provider via ports/adapters

**Decisão:** Abstrair provedores de integração via interfaces (ports) no `packages/application`.
**Motivo:** Permite adicionar Azure DevOps, Jira e outros sem alterar o domínio ou os casos de uso existentes.
**Trade-off:** Mais abstração inicial. Compensa pela extensibilidade e pela separação clara de responsabilidades.

### 14.10 Railway como plataforma de deploy inicial

**Decisão:** Railway como plataforma de deploy recomendada para o MVP.
**Motivo:** Suporte nativo a Docker, PostgreSQL gerenciado, deploy simples via push, custo acessível para MVP.
**Trade-off:** Vendor lock-in leve. Mitigado pelo uso de Docker, que permite migração para qualquer plataforma que suporte containers.

### 14.11 Frontend servido pelo backend no MVP

**Decisão:** No MVP, o frontend React/Vite pode ser servido como arquivos estáticos pelo Fastify.
**Motivo:** Reduz de 4 para 3 serviços no Railway, simplificando o deploy inicial e reduzindo custo.
**Trade-off:** Sem CDN para o frontend. Aceitável para MVP; Vercel ou outro CDN pode ser adicionado depois quando o produto precisar de escala global.

---

## 15. Estratégia de Deploy Railway

### 15.1 Opção A — Railway all-in-one (recomendada para MVP)

Serviços no Railway:

- `api` — Node.js Fastify, porta configurável via variável de ambiente `PORT`
- `worker` — Node.js worker, sem porta exposta externamente
- `web` — React/Vite servido como estático pelo backend OU serviço separado
- `postgres` — PostgreSQL gerenciado pelo Railway

**Vantagens:**
- Menor complexidade operacional: todos os serviços em um único projeto Railway
- Melhor para validar o produto rapidamente sem overhead de infraestrutura
- Custo inicial menor: menos serviços externos
- Configuração centralizada no Railway dashboard
- Variáveis de ambiente compartilhadas entre serviços via Railway

### 15.2 Opção B — Vercel + Railway (possível no futuro)

- Frontend na Vercel (CDN global, preview deployments por PR)
- API, worker e PostgreSQL no Railway
- Não é a arquitetura principal do MVP
- Pode ser adotada quando o frontend precisar de CDN global ou quando o tráfego justificar a separação

### 15.3 Variáveis de ambiente obrigatórias

```
DATABASE_URL=
APP_SECRET=
ENCRYPTION_KEY=
WEB_URL=
API_URL=
NODE_ENV=
GITHUB_APP_ID=
GITHUB_APP_PRIVATE_KEY=
GITHUB_WEBHOOK_SECRET=
GITHUB_APP_CALLBACK_URL=
GITHUB_WEBHOOK_URL=
```

Variáveis sensíveis (`APP_SECRET`, `ENCRYPTION_KEY`, `GITHUB_APP_PRIVATE_KEY`) devem ser configuradas diretamente no Railway dashboard e nunca commitadas no repositório.

### 15.4 Processo de deploy

1. Push para branch `main`
2. Railway detecta a mudança e inicia o build automaticamente
3. Docker build via Dockerfile de cada serviço (multi-stage)
4. Migrations Prisma executadas como release command antes de subir o serviço `api`
5. Serviços sobem com graceful startup
6. Health check confirma disponibilidade antes de rotear tráfego

---

## 16. Production Readiness

### 16.1 Health checks

- `GET /health` — liveness: confirma que o serviço está rodando e respondendo
- `GET /ready` — readiness: confirma que o serviço está pronto para receber tráfego (banco conectado, dependências inicializadas)

O Railway usa o health check para determinar se o deploy foi bem-sucedido e para reiniciar serviços com falha.

### 16.2 Graceful shutdown

- **API:** ao receber `SIGTERM`, para de aceitar novas conexões e aguarda os requests em andamento completarem (timeout: 30 segundos)
- **Worker:** ao receber `SIGTERM`, conclui o job atual antes de encerrar; não inicia novos jobs após o sinal
- O sinal `SIGTERM` é enviado pelo Railway (e pelo Docker) durante deploys e restarts

### 16.3 Logs estruturados

- **Biblioteca:** pino
- **Formato:** JSON em produção, pretty-print em desenvolvimento
- **Campos obrigatórios em todo log:** `timestamp`, `level`, `service`, `correlationId`
- **Campos proibidos:** tokens, passwords, cookies, secrets, chaves privadas

O `correlationId` é gerado por request (API) ou por job (worker) e propagado em todos os logs relacionados, facilitando rastreamento.

### 16.4 Dockerfiles

Cada serviço (`apps/api`, `apps/worker`, `apps/web`) tem um Dockerfile multi-stage:

- **Stage 1 (builder):** instala todas as dependências (incluindo devDependencies), compila TypeScript para JavaScript
- **Stage 2 (runner):** parte de uma imagem mínima (ex: `node:alpine`), copia apenas os artefatos compilados e as dependências de produção
- Executa com usuário não-root para segurança
- Imagem final menor e com menor superfície de ataque
