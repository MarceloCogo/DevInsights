# Implementation Plan: DevInsights

## Overview

Plano de implementação incremental do DevInsights, organizado em 9 fases. Cada fase entrega valor verificável e constrói sobre a anterior. O produto é desenvolvido production-first desde a Fase 1, com Railway como plataforma de deploy alvo.

GitHub é a primeira integração implementada. Azure DevOps entra na Fase 7 como foundation arquitetural, com implementação completa pós-MVP.

## Tasks

- [ ] 1. Criar monorepo com pnpm workspaces e estrutura base
- [ ] 2. Configurar TypeScript strict em todos os packages
- [ ] 3. Criar apps/api com Fastify e health/ready endpoints
- [ ] 4. Criar apps/worker com loop de jobs e health endpoint
- [ ] 5. Criar apps/web com React, Vite e Tailwind
- [ ] 6. Configurar PostgreSQL e Prisma com schema inicial
- [ ] 7. Criar Docker Compose para ambiente local
- [ ] 8. Criar Dockerfiles multi-stage para api, worker e web
- [ ] 9. Implementar graceful shutdown em api e worker
- [ ] 10. Configurar logs estruturados com pino
- [ ] 11. Criar .env.example com todas as variáveis documentadas
- [ ] 12. Criar README de instalação local e guia de deploy Railway
- [ ] 13. Criar schema Prisma: organizations, users, teams, team_members
- [ ] 14. Criar schema Prisma: repositories, repository_teams, privacy_settings
- [ ] 15. Criar schema Prisma: integration_providers, integration_accounts, external_user_mappings
- [ ] 16. Criar schema Prisma: pull_requests, pull_request_reviews, pull_request_commits
- [ ] 17. Criar schema Prisma: workflow_runs, ai_usage_declarations, metric_snapshots
- [ ] 18. Criar schema Prisma: integration_sync_jobs, audit_logs, github_installations
- [ ] 19. Criar schema Prisma: work_items, work_item_status_transitions, work_item_pull_request_links, sprints
- [ ] 20. Implementar autenticação com e-mail e senha (bcrypt, sessão HttpOnly)
- [ ] 21. Implementar middleware de autorização e RBAC
- [ ] 22. Implementar CRUD de organizações com isolamento de dados
- [ ] 23. Implementar CRUD de squads e membros
- [ ] 24. Implementar CRUD de usuários com associação a GitHub login
- [ ] 25. Implementar privacy settings com defaults restritivos
- [ ] 26. Implementar ports ICodeHostingProvider e IProjectManagementProvider
- [ ] 27. Implementar audit log para ações sensíveis
- [ ] 28. Criar telas de login, organização e squads no frontend
- [ ] 29. Implementar fluxo de instalação do GitHub App (install URL + callback)
- [ ] 30. Salvar installation_id e dados da instalação com criptografia
- [ ] 31. Listar repositórios autorizados via API GitHub
- [ ] 32. Implementar seleção e mapeamento de repositórios para squads
- [ ] 33. Implementar validação de assinatura X-Hub-Signature-256 nos webhooks
- [ ] 34. Criar endpoint público /webhooks/github com resposta rápida e criação de job
- [ ] 35. Criar tela GitHub Settings com status da integração
- [ ] 36. Implementar job de sync de repositórios com rate limit handling
- [ ] 37. Implementar backfill de Pull Requests (90 dias, idempotente)
- [ ] 38. Implementar sync de Pull Request Reviews
- [ ] 39. Implementar sync de commits associados a PRs
- [ ] 40. Implementar sync de Workflow Runs
- [ ] 41. Implementar processamento de webhooks pull_request e pull_request_review
- [ ] 42. Implementar retry exponencial e status de jobs na interface
- [ ] 43. Implementar calculador de PR Cycle Time (funções puras com testes unitários)
- [ ] 44. Implementar calculador de Pickup Time com fallback
- [ ] 45. Implementar calculador de Review Time
- [ ] 46. Implementar calculador de PR Size e classificador de PR grande
- [ ] 47. Implementar calculador de Throughput por período
- [ ] 48. Implementar classificador de Stale PR com threshold configurável
- [ ] 49. Implementar calculador de Reviewer Load
- [ ] 50. Implementar geração de metric snapshots no worker
- [ ] 51. Criar API de métricas: overview, pr-flow, reviewer-load
- [ ] 52. Criar dashboard PR Intelligence com cards, gráficos e lista de PRs
- [ ] 53. Implementar filtros por período, squad, repositório, autor e reviewer
- [ ] 54. Criar tela de detalhe do PR com timeline de eventos
- [ ] 55. Criar tabela de reviewer load e lista de PRs parados
- [ ] 56. Implementar API de declaração de uso de IA no PR
- [ ] 57. Criar componente de declaração de IA no detalhe do PR
- [ ] 58. Implementar checklist de validação humana para PRs com IA
- [ ] 59. Implementar calculadores de AI Assisted PR Rate, AI Cycle Time Delta e AI Review Burden
- [ ] 60. Criar dashboard AI Impact com comparação PRs com IA vs sem IA
- [ ] 61. Criar schema Prisma e migrations para work_items, sprints e links (já incluído no item 19)
- [ ] 62. Implementar ports e interfaces para IProjectManagementProvider no packages/application
- [ ] 63. Criar estrutura base do packages/azure-devops com client, mappers e rate limit handler
- [ ] 64. Documentar permissões mínimas do PAT Azure DevOps e estratégia de correlação com PRs
- [ ] 65. Implementar sync de Deployments do GitHub
- [ ] 66. Configurar ambientes de produção e workflows de deploy
- [ ] 67. Implementar calculador de Deployment Frequency
- [ ] 68. Implementar calculador de Lead Time for Changes
- [ ] 69. Criar cadastro manual de incidentes e associação com deployments
- [ ] 70. Implementar MTTR e Change Failure Rate parciais
- [ ] 71. Criar dashboard DORA com indicação de métricas parciais
- [ ] 72. Criar README.md completo com visão do produto e instalação
- [ ] 73. Criar CONTRIBUTING.md com guia de contribuição
- [ ] 74. Criar SECURITY.md com política de segurança
- [ ] 75. Criar docs/deploy-railway.md com guia passo a passo
- [ ] 76. Criar docs/github-app-setup.md
- [ ] 77. Criar docs/metrics.md explicando cada métrica
- [ ] 78. Criar docs/privacy.md com política de privacidade
- [ ] 79. Criar seed de desenvolvimento com dados de exemplo
- [ ] 80. Definir licença (Apache-2.0 ou AGPL-3.0)

## Task Dependency Graph

```json
{
  "waves": [
    {
      "wave": 1,
      "description": "Fase 1 - Fundação: monorepo e TypeScript",
      "tasks": [1, 2]
    },
    {
      "wave": 2,
      "description": "Fase 1 - Fundação: apps base (api, worker, web)",
      "tasks": [3, 4, 5]
    },
    {
      "wave": 3,
      "description": "Fase 1 - Fundação: PostgreSQL, Prisma e Docker",
      "tasks": [6, 7, 8]
    },
    {
      "wave": 4,
      "description": "Fase 1 - Fundação: production readiness",
      "tasks": [9, 10, 11, 12]
    },
    {
      "wave": 5,
      "description": "Fase 2 - Núcleo: schema Prisma completo",
      "tasks": [13, 14, 15, 16, 17, 18, 19]
    },
    {
      "wave": 6,
      "description": "Fase 2 - Núcleo: auth, RBAC e CRUDs",
      "tasks": [20, 21, 22, 23, 24, 25, 26, 27]
    },
    {
      "wave": 7,
      "description": "Fase 2 - Núcleo: frontend base",
      "tasks": [28]
    },
    {
      "wave": 8,
      "description": "Fase 3 - GitHub App: instalação e webhooks",
      "tasks": [29, 30, 31, 32, 33, 34, 35]
    },
    {
      "wave": 9,
      "description": "Fase 4 - Sync GitHub: repositórios e PRs",
      "tasks": [36, 37, 38, 39, 40, 41, 42]
    },
    {
      "wave": 10,
      "description": "Fase 5 - PR Intelligence: métricas e calculadores",
      "tasks": [43, 44, 45, 46, 47, 48, 49, 50]
    },
    {
      "wave": 11,
      "description": "Fase 5 - PR Intelligence: API e dashboard",
      "tasks": [51, 52, 53, 54, 55]
    },
    {
      "wave": 12,
      "description": "Fase 6 - AI Usage: declaração e dashboard",
      "tasks": [56, 57, 58, 59, 60]
    },
    {
      "wave": 13,
      "description": "Fase 7 - Azure DevOps Foundation",
      "tasks": [61, 62, 63, 64]
    },
    {
      "wave": 14,
      "description": "Fase 8 - DORA parcial",
      "tasks": [65, 66, 67, 68, 69, 70, 71]
    },
    {
      "wave": 15,
      "description": "Fase 9 - Open source hardening",
      "tasks": [72, 73, 74, 75, 76, 77, 78, 79, 80]
    }
  ]
}
```

## Notes

### Fase 1 — Fundação production-first
Estabelece a base técnica do monorepo com foco em production-readiness desde o início. Todos os serviços têm Dockerfile, health checks, graceful shutdown e logs estruturados antes de qualquer feature de negócio.

**Segurança/Privacidade:** `.env.example` não deve conter valores reais. Secrets nunca devem ser commitados.

### Fase 2 — Núcleo do domínio
Cria as entidades centrais do produto e a base arquitetural para múltiplos provedores. O schema Prisma inclui as tabelas de Azure DevOps desde o início para evitar migrations disruptivas no futuro.

**Segurança/Privacidade:** Privacy settings criados com defaults restritivos. RBAC implementado antes de qualquer dado sensível ser exposto.

### Fase 3 — GitHub App
Implementa o fluxo completo de instalação do GitHub App. A callback URL deve ser configurável via variável de ambiente para funcionar tanto localmente quanto no Railway.

**Segurança:** Installation tokens gerados sob demanda, nunca armazenados. Private key carregada via env. Webhook secret validado em todas as requisições.

### Fase 4 — Sincronização GitHub
Implementa o backfill histórico e o processamento de webhooks. Rate limit handling é obrigatório para não bloquear a API do GitHub.

**Privacidade:** O worker verifica privacy_settings antes de salvar body de PR, mensagens de commit e body de review.

### Fase 5 — PR Intelligence
Toda a lógica de cálculo de métricas deve estar em funções puras no packages/domain, com testes unitários cobrindo casos extremos (PR sem review, PR em draft, etc.).

### Fase 6 — AI Usage
A declaração de IA é voluntária. O checklist de validação humana deve ser exibido mas não obrigatório para não criar atrito.

### Fase 7 — Azure DevOps Foundation
Esta fase cria a base arquitetural para Azure DevOps sem implementar a sincronização completa. O objetivo é garantir que o modelo de dados e os ports estejam prontos para a implementação futura sem reestruturação.

### Fase 8 — DORA parcial
Métricas DORA são parciais no MVP. A interface deve indicar claramente quais métricas são completas e quais dependem de configuração adicional (incidentes manuais, configuração de ambiente de produção).

### Fase 9 — Open source hardening
Prepara o projeto para publicação open source. A documentação deve ser suficiente para que um desenvolvedor externo consiga rodar o produto localmente e fazer deploy no Railway sem suporte adicional.
