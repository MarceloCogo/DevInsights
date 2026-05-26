# DevInsights — Implementation Tasks

## Status geral

- [x] Monorepo com `apps/web`, `apps/api`, `apps/worker` e `packages/*`
- [x] OAuth GitHub com sessao por cookie
- [x] Onboarding GitHub App (install URL + callback)
- [x] Selecao de repositorios monitorados
- [x] Dashboard `/app` completo com secoes e filtros
- [x] API de overview e lista de PRs
- [x] Worker consumindo jobs em Postgres
- [x] Hardening inicial de seguranca (headers, cookie policy, CORS, rate limit)

## Backlog curto (prioridade)

### P0 - Fundacao para escalar sem gambiarra

- [x] Substituir `ensureSchema` por migrations versionadas
- [ ] Modularizar `apps/api/src/server.ts` por dominio
- [ ] Padronizar erros de API e validacao de input por rota
- [x] Criar smoke tests E2E do fluxo principal (`/app/login` -> dashboard)

### P1 - Confiabilidade operacional

- [ ] Adicionar retries e backoff no worker
- [ ] Adicionar idempotencia e deduplicacao de jobs
- [ ] Melhorar observabilidade (request_id, org_id, job_id)
- [ ] Criar politica de retention para jobs e snapshots

### P2 - Produto

- [ ] Evoluir painel PR com sinais de risco mais robustos
- [ ] Adicionar pagina de historico de sync/jobs
- [ ] Melhorar empty/error/loading states com consistencia visual

## Fora de escopo imediato

- Azure DevOps runtime
- DORA completo
- AI Impact completo
- Billing/freemium
