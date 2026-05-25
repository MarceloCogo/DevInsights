# DevInsights — API (MVP Atual)

Base path: `/api/v1`

Formato:

- JSON
- datas em ISO 8601
- autenticacao por cookie de sessao
- respostas de erro no formato `{ "error": "..." }`

## Auth

- `GET /auth/github/login`
- `GET /auth/github/callback`
- `GET /auth/me`
- `POST /auth/logout`

## Organizacoes

- `GET /organizations`
- `POST /organizations/active`

## App bootstrap

- `GET /app/bootstrap`

Retorna dados iniciais do app:

- usuario
- organizacao ativa
- lista de organizacoes
- status da integracao
- status de sync
- resumo de repositorios

## Integracao GitHub

- `GET /integrations/github/install-url`
- `GET /integrations/github/callback`
- `GET /integrations/github/repositories`
- `POST /integrations/github/repositories/select`
- `POST /integrations/github/sync-now`
- `GET /integrations/github/status`
- `POST /integrations/github/disconnect`

## Dashboard

- `GET /dashboard/overview`
- `GET /dashboard/pull-requests`

### Query de `GET /dashboard/pull-requests`

- `period`: `7d | 30d`
- `state`: `open | closed | all`
- `repository`: `owner/repo`

## Health

- `GET /health`
- `GET /ready`

## Notas de seguranca

- CORS com credenciais e origin estrito
- cookie de sessao com `HttpOnly` e `Secure` em producao
- limitacao de taxa em rota de login OAuth
