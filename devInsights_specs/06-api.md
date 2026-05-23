# DevPulse AI — Especificação de API

## 1. Padrões gerais

Base path:

```text
/api/v1
```

Formato:

- JSON;
- datas em ISO 8601;
- erros padronizados;
- autenticação via sessão segura;
- validação com Zod;
- paginação em endpoints de lista;
- filtros por query string.

## 2. Formato de erro

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request payload",
    "details": []
  }
}
```

## 3. Auth

### GET /auth/github/login

Inicia autenticação OAuth com GitHub.

### GET /auth/github/callback

Processa callback OAuth do GitHub e cria sessão do usuário.

### POST /auth/logout

Encerra sessão.

### GET /auth/me

Retorna usuário autenticado e permissões.

## 4. Organizations

### GET /organizations

Lista organizações acessíveis.

### POST /organizations

Cria organização.

### GET /organizations/:organizationId

Detalhes da organização.

### PATCH /organizations/:organizationId

Atualiza organização.

## 5. Teams

### GET /organizations/:organizationId/teams

Lista squads.

Query params:

- search
- includeArchived

### POST /organizations/:organizationId/teams

Cria squad.

### GET /teams/:teamId

Detalhes do squad.

### PATCH /teams/:teamId

Atualiza squad.

### POST /teams/:teamId/members

Adiciona membro.

### DELETE /teams/:teamId/members/:userId

Remove membro.

## 6. Repositories

### GET /organizations/:organizationId/repositories

Lista repositórios.

Query params:

- search
- teamId
- language
- isCritical
- syncStatus

### GET /repositories/:repositoryId

Detalhes do repositório.

### PATCH /repositories/:repositoryId

Atualiza configurações locais do repositório.

### POST /repositories/:repositoryId/teams

Associa repositório a squad.

## 7. GitHub Integration

### GET /integrations/github/install-url

Retorna URL de instalação do GitHub App.

### GET /integrations/github/callback

Callback após instalação.

### GET /organizations/:organizationId/integrations/github/status

Status da integração.

### POST /organizations/:organizationId/integrations/github/sync

Dispara sincronização manual.

Payload:

```json
{
  "repositoryIds": ["uuid"],
  "backfillDays": 90
}
```

### POST /webhooks/github

Endpoint público para webhooks do GitHub.

Requisitos:

- validar assinatura;
- registrar evento;
- criar job;
- responder 2xx rápido.

## 8. Pull Requests

### GET /organizations/:organizationId/pull-requests

Lista PRs.

Query params:

- teamId
- repositoryId
- author
- reviewer
- state
- from
- to
- hasAiUsage
- minSize
- maxSize
- isStale
- page
- pageSize

### GET /pull-requests/:pullRequestId

Detalhes do PR.

### GET /pull-requests/:pullRequestId/timeline

Timeline do PR:

- opened;
- ready for review;
- first review;
- changes requested;
- approved;
- merged;
- workflows;
- deployments.

### POST /pull-requests/:pullRequestId/ai-usage

Registra uso de IA.

Payload:

```json
{
  "intensity": "assistive",
  "toolName": "Claude Code",
  "purposes": ["code", "tests"],
  "humanValidationChecked": true,
  "validationChecklist": {
    "reviewedCode": true,
    "understoodSolution": true,
    "validatedSecurity": true,
    "validatedTests": true
  },
  "notes": "Usado para gerar testes unitários."
}
```

### PATCH /pull-requests/:pullRequestId/ai-usage

Atualiza declaração de IA.

## 9. Metrics

### GET /organizations/:organizationId/metrics/overview

Dashboard executivo.

Query params:

- from
- to
- teamId
- repositoryId

Retorna:

- PR cycle time;
- pickup time;
- review time;
- throughput;
- deployment frequency;
- AI assisted PR rate;
- stale PR count;
- alerts.

### GET /organizations/:organizationId/metrics/pr-flow

Métricas de PR.

### GET /organizations/:organizationId/metrics/dora

Métricas DORA.

### GET /organizations/:organizationId/metrics/ai-impact

Métricas de impacto de IA.

### GET /organizations/:organizationId/metrics/reviewer-load

Carga de reviewers.

### GET /organizations/:organizationId/metrics/investment

Alocação de esforço por tipo de trabalho.

## 10. Deployments

### GET /organizations/:organizationId/deployments

Lista deployments.

Query params:

- repositoryId
- environment
- from
- to

### PATCH /deployments/:deploymentId

Atualiza classificação local.

## 11. Incidents

### GET /organizations/:organizationId/incidents

Lista incidentes.

### POST /organizations/:organizationId/incidents

Cria incidente manual.

Payload:

```json
{
  "repositoryId": "uuid",
  "deploymentId": "uuid",
  "title": "Falha após deploy",
  "severity": "high",
  "startedAt": "2026-05-23T10:00:00Z",
  "resolvedAt": "2026-05-23T11:30:00Z"
}
```

### PATCH /incidents/:incidentId

Atualiza incidente.

## 12. Automation Rules

### GET /organizations/:organizationId/automation-rules

Lista regras.

### POST /organizations/:organizationId/automation-rules

Cria regra.

### PATCH /automation-rules/:ruleId

Atualiza regra.

### DELETE /automation-rules/:ruleId

Remove regra.

## 13. Surveys

### GET /organizations/:organizationId/surveys

Lista surveys.

### POST /organizations/:organizationId/surveys

Cria survey.

### POST /surveys/:surveyId/responses

Registra resposta.

### GET /surveys/:surveyId/results

Resultados agregados.

## 14. Privacy Settings

### GET /organizations/:organizationId/privacy-settings

Consulta configurações.

### PATCH /organizations/:organizationId/privacy-settings

Atualiza configurações.

Payload:

```json
{
  "collectPrBody": false,
  "collectReviewBody": false,
  "collectCommitMessages": false,
  "collectIssueBody": false,
  "anonymizeSurveys": true,
  "showIndividualMetrics": false,
  "dataRetentionDays": 365
}
```

## 15. Audit Logs

### GET /organizations/:organizationId/audit-logs

Lista logs de auditoria.

Query params:

- action
- actorUserId
- from
- to
- page
- pageSize
