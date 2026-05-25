# DevInsights — Arquitetura Tecnica (MVP Atual)

## Stack

- Frontend: React + Vite + TypeScript + Tailwind
- API: Fastify + TypeScript + PostgreSQL (`pg`)
- Worker: Node.js + TypeScript + PostgreSQL + Octokit
- Infra local: Docker Compose

## Topologia

```text
web (3000) <-> api (3001) <-> postgres
                     ^
                     |
                worker (3002)
```

## Responsabilidades

### web

- landing em `/`
- app shell em `/app/*`
- consumo de APIs com `credentials: include`

### api

- OAuth GitHub
- sessao e organizacao ativa
- integracao GitHub App (install callback, repos)
- enqueue de jobs de sync
- endpoints de dashboard

### worker

- polling da fila em `integration_sync_jobs`
- lock de linhas com `FOR UPDATE SKIP LOCKED`
- sync de PRs por organizacao
- atualizacao de status de jobs

## Padroes de seguranca ativos

- cookie HttpOnly com policy por ambiente
- CORS estrito por `WEB_BASE_URL`
- headers de seguranca em API e web
- rate limiting em rota sensivel de auth

## Decisoes de simplicidade

- fila em Postgres no MVP (sem Redis por enquanto)
- sem camada de abstração complexa no runtime atual
- evolucao incremental guiada por uso real

## Debitos tecnicos priorizados

- substituir schema runtime por migrations formais
- quebrar `apps/api/src/server.ts` em modulos
- ampliar testes automatizados de fluxo
