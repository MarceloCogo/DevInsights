# DevInsights — Roadmap Enxuto

## Fase 1 (Concluida)

- Monorepo e apps `web`, `api`, `worker`
- OAuth GitHub e sessao segura
- Fluxo GitHub App (instalacao + callback)
- Selecao de repositorios
- Dashboard `/app` com secoes e filtros

## Fase 2 (Concluida)

- Fila de sync em Postgres
- Worker consumidor de jobs
- Endpoints de overview e PR list
- Hardening inicial de seguranca

## Fase 3 (Proxima)

- Migrations formais (remover schema runtime)
- Modularizacao do `apps/api/src/server.ts`
- Testes E2E do fluxo principal
- Melhorias de observabilidade

## Fase 4 (Proxima)

- Historico de jobs e reprocessamento
- Melhor classificacao de sinais de risco em PRs
- Otimizacoes de performance para orgs maiores

## Fase 5 (Futuro)

- Webhooks GitHub em producao
- DORA parcial
- Fundacao para novos provedores (Azure DevOps)

## Principio de execucao

Construir simples e correto:

- sem overengineering
- sem hardcode sensivel
- sem acoplamento que bloqueie evolucao
