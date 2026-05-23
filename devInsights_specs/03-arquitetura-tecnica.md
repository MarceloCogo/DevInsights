# DevPulse AI — Arquitetura Técnica

## 1. Decisão de stack

Stack recomendada para o MVP:

- Frontend: React + Vite + TypeScript + Tailwind CSS
- Backend: Node.js + Fastify + TypeScript
- Banco: PostgreSQL
- ORM: Prisma
- Worker: Node.js + TypeScript
- Jobs: PostgreSQL no MVP
- Containerização: Docker Compose
- Testes: Vitest
- Validação de dados: Zod
- Autenticação: sessão HTTP segura ou JWT com refresh token seguro
- Integração inicial: GitHub App

## 2. Princípios arquiteturais

- Clean Architecture.
- Separação clara entre frontend, backend e worker.
- Domínio independente de framework.
- Integrações externas isoladas na camada de infraestrutura.
- Métricas calculadas por serviços de domínio.
- Webhooks tratados de forma assíncrona.
- Eventos brutos preservados quando fizer sentido.
- Snapshots de métricas para performance.
- Privacy by design.
- Open source self-hosted first.

## 3. Estrutura de monorepo

```text
/devpulse-ai
  /apps
    /web
    /api
    /worker
  /packages
    /domain
    /application
    /database
    /github
    /config
    /ui
    /shared
  /docs
  /infra
    docker-compose.yml
  package.json
  pnpm-workspace.yaml
```

## 4. Apps

### 4.1 apps/web

Responsável pela interface.

Tecnologias:

- React
- Vite
- Tailwind
- TypeScript
- React Router
- TanStack Query, se necessário para cache e estados assíncronos
- Recharts, se necessário para gráficos

Evitar libs pesadas no início. Componentes devem ser próprios com Tailwind.

### 4.2 apps/api

Responsável por:

- autenticação;
- APIs REST;
- autorização;
- endpoints de dashboard;
- endpoints de configuração;
- recebimento de webhooks GitHub;
- criação de jobs para worker.

Tecnologias:

- Fastify
- Zod
- Prisma client
- logger estruturado

### 4.3 apps/worker

Responsável por:

- sincronização GitHub;
- backfill histórico;
- processamento de webhooks;
- cálculo de métricas;
- geração de snapshots;
- limpeza de dados antigos;
- retries.

## 5. Packages

### 5.1 packages/domain

Contém entidades, value objects e regras puras.

Exemplos:

- PullRequestMetricsCalculator
- DoraMetricsCalculator
- AiImpactCalculator
- FlowRiskClassifier
- PrSizeClassifier
- PrivacyPolicyRules

Essa camada não pode importar Prisma, Fastify, React ou GitHub SDK.

### 5.2 packages/application

Contém casos de uso.

Exemplos:

- SyncGitHubRepositoriesUseCase
- SyncPullRequestsUseCase
- CalculatePullRequestMetricsUseCase
- GetExecutiveDashboardUseCase
- DeclareAiUsageUseCase
- CreateTeamUseCase
- GenerateMetricSnapshotsUseCase

### 5.3 packages/database

Contém:

- schema Prisma;
- migrations;
- repositories concretos;
- transações;
- helpers de paginação;
- seeds.

### 5.4 packages/github

Contém:

- GitHub App auth;
- clients da API GitHub;
- adapters;
- webhook verifier;
- mapeadores GitHub → entidades internas;
- tratamento de rate limit.

### 5.5 packages/shared

Contém:

- tipos compartilhados;
- contratos de API;
- enums;
- utilitários puros;
- constantes.

### 5.6 packages/ui

Opcional no início. Pode conter componentes reutilizáveis se o frontend crescer.

## 6. Fluxo de dados GitHub

```text
GitHub App Installation
        ↓
API salva installation_id e repositórios autorizados
        ↓
Worker executa backfill histórico
        ↓
Dados são normalizados em tabelas internas
        ↓
Metric Engine calcula snapshots
        ↓
Dashboard consulta APIs otimizadas
```

## 7. Fluxo de webhook

```text
GitHub envia webhook
        ↓
API valida assinatura
        ↓
API registra evento bruto
        ↓
API cria job de processamento
        ↓
Worker processa evento
        ↓
Worker atualiza entidades normalizadas
        ↓
Worker recalcula métricas afetadas
```

## 8. Estratégia de jobs no MVP

Para reduzir dependências, começar com tabela `integration_sync_jobs` no PostgreSQL.

Campos:

- id
- organization_id
- provider
- job_type
- status
- payload
- attempts
- max_attempts
- scheduled_at
- started_at
- finished_at
- error_message
- created_at
- updated_at

Status:

- pending
- running
- completed
- failed
- cancelled

No futuro, migrar para BullMQ + Redis se houver necessidade de escala.

## 9. Estratégia de métricas

### 9.1 Métricas on-demand

Usar para telas específicas e baixa cardinalidade.

Exemplo:

- detalhes de um PR;
- cálculo de uma métrica individual simples.

### 9.2 Metric snapshots

Usar para dashboards.

Snapshots devem ser calculados por:

- organização;
- squad;
- repositório;
- período;
- métrica;
- dimensões.

Isso evita recalcular histórico pesado em toda consulta.

## 10. API style

REST é suficiente para o MVP.

Padrões:

- `/api/v1/...`
- paginação cursor-based ou page-based;
- filtros por query string;
- respostas tipadas;
- erros padronizados;
- validação com Zod;
- autorização em todas as rotas.

## 11. Autenticação e autorização

### MVP

- e-mail/senha;
- sessão segura em cookie HttpOnly;
- RBAC básico;
- convite de usuários.

### Futuro

- SSO OIDC;
- Microsoft Entra;
- Google Workspace;
- SCIM.

### Perfis

- INSTANCE_ADMIN
- ORG_ADMIN
- ENGINEERING_MANAGER
- TECH_LEAD
- DEVELOPER
- EXECUTIVE_VIEWER

## 12. Segurança

- Validar assinatura dos webhooks GitHub.
- Criptografar installation tokens, quando armazenados temporariamente.
- Preferir gerar GitHub installation token sob demanda.
- Não logar secrets.
- Sanitizar logs.
- Usar variáveis de ambiente para segredos.
- Aplicar rate limit nas APIs públicas.
- Validar input com Zod.
- Usar CORS restritivo.
- Usar cookies HttpOnly/Secure/SameSite conforme ambiente.
- Criar audit logs para ações sensíveis.

## 13. Privacidade

- Métricas individuais desabilitáveis.
- Visibilidade individual restrita por papel.
- Surveys com anonimização.
- Retenção configurável.
- Exclusão/anonimização de usuário.
- Documentação dos dados coletados.
- Avisos de finalidade no onboarding.

## 14. Performance

- Índices em campos de filtro.
- Snapshots para dashboards.
- Paginação em listas grandes.
- Backfill incremental.
- Rate limit aware sync.
- Evitar busca síncrona pesada no carregamento de telas.
- Cache opcional no frontend via TanStack Query.

## 15. Observabilidade interna

- Logs estruturados.
- Health check da API.
- Health check do worker.
- Tela de status das integrações.
- Histórico de jobs.
- Tempo médio de sync.
- Erros por integração.
- Última sincronização por repositório.

## 16. Docker Compose inicial

Serviços:

- web
- api
- worker
- postgres

Redis fica fora do MVP, salvo necessidade.

## 17. Variáveis de ambiente

```text
DATABASE_URL=
APP_SECRET=
WEB_URL=
API_URL=
GITHUB_APP_ID=
GITHUB_APP_PRIVATE_KEY=
GITHUB_WEBHOOK_SECRET=
ENCRYPTION_KEY=
NODE_ENV=
```

## 18. Testes

Prioridade:

- testes unitários para cálculo de métricas;
- testes de domínio;
- testes de autorização;
- testes de webhook verifier;
- testes de mapeamento GitHub;
- testes de integração com banco para repositories críticos.

## 19. Qualidade de código

- TypeScript strict.
- ESLint.
- Prettier.
- Conventional commits.
- Husky/lint-staged opcional.
- CI com lint, typecheck e testes.

