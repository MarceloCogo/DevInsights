# DevInsights — Especificação da Integração GitHub

## 1. Objetivo

A integração GitHub é o núcleo do MVP. Ela deve coletar dados suficientes para medir fluxo de PR, colaboração, revisão, pipelines, deployments e uso declarado de IA.

## 2. Estratégia

Usar GitHub App, não Personal Access Token.

Motivos:

- melhor governança;
- instalação por organização/repositório;
- escopos mínimos;
- revogação centralizada;
- melhor experiência para open source/self-hosted;
- suporte a webhooks;
- rastreabilidade.

## 3. Permissões iniciais do GitHub App

### Repository permissions

- Metadata: read
- Pull requests: read
- Contents: read
- Checks: read
- Actions: read
- Deployments: read
- Issues: read
- Commit statuses: read

### Organization permissions

- Members: read, se necessário para mapear usuários

### Webhook events

- pull_request
- pull_request_review
- pull_request_review_comment
- check_run
- check_suite
- workflow_run
- deployment
- deployment_status
- issues
- issue_comment
- push

## 4. Dados coletados

### 4.1 Repository

- github_id
- name
- full_name
- owner
- default_branch
- visibility
- primary_language
- is_archived
- html_url
- created_at
- updated_at

### 4.2 Pull Request

- github_id
- number
- title
- body opcional e configurável
- author_login
- state
- draft
- base_branch
- head_branch
- opened_at
- ready_for_review_at
- closed_at
- merged_at
- merge_commit_sha
- additions
- deletions
- changed_files
- commits_count
- comments_count
- review_comments_count
- labels
- html_url

### 4.3 Pull Request Review

- github_id
- pull_request_id
- reviewer_login
- state
- body opcional e configurável
- submitted_at
- comments_count

### 4.4 Commit

- sha
- author_login
- author_email_hash opcional
- message opcional e configurável
- committed_at
- associated_pull_request_id

### 4.5 Workflow Run

- github_id
- repository_id
- name
- status
- conclusion
- branch
- commit_sha
- event
- started_at
- completed_at
- duration_seconds
- html_url

### 4.6 Deployment

- github_id
- repository_id
- environment
- ref
- sha
- creator_login
- created_at
- updated_at
- latest_status
- deployed_at

### 4.7 Issue

- github_id
- number
- title
- body opcional e configurável
- author_login
- state
- labels
- created_at
- closed_at
- html_url

## 5. Privacy settings da integração

A organização deve poder configurar:

- coletar ou não corpo de PR;
- coletar ou não corpo de review;
- coletar ou não mensagens de commit;
- coletar ou não corpo de issues;
- anonimizar e-mails;
- período de retenção;
- escopo de repositórios;
- visibilidade de métricas individuais.

Padrão recomendado:

- coletar títulos e metadados;
- não coletar body de PR por padrão;
- não coletar body de review por padrão;
- não coletar mensagem completa de commit por padrão;
- usar links para GitHub quando o usuário precisar de contexto.

## 6. Backfill histórico

### Configurações

- últimos 30 dias;
- últimos 90 dias;
- últimos 180 dias;
- últimos 365 dias;
- período customizado.

### Estratégia

1. Importar repositórios.
2. Importar PRs por repositório.
3. Importar reviews dos PRs.
4. Importar commits associados aos PRs.
5. Importar workflow runs.
6. Importar deployments.
7. Importar issues com labels relevantes.
8. Calcular métricas iniciais.

## 7. Webhook processing

### Requisitos

- validar assinatura `X-Hub-Signature-256`;
- registrar evento bruto;
- responder rápido ao GitHub;
- processar evento em worker;
- tornar processamento idempotente;
- registrar falhas;
- permitir replay manual.

### Eventos prioritários

#### pull_request

Ações relevantes:

- opened
- edited
- reopened
- synchronize
- ready_for_review
- converted_to_draft
- closed
- labeled
- unlabeled
- review_requested
- review_request_removed

#### pull_request_review

Ações relevantes:

- submitted
- edited
- dismissed

#### workflow_run

Ações relevantes:

- requested
- in_progress
- completed

#### deployment_status

Ações relevantes:

- created

## 8. Associação PR → Workflow → Deployment

Estratégia inicial:

- associar workflow ao commit SHA;
- associar commit SHA a PR;
- associar deployment ao SHA;
- inferir PRs incluídos em um deployment a partir dos commits entre deploy anterior e atual.

## 9. Configuração de produção

Como diferentes empresas usam fluxos diferentes, o sistema deve permitir configurar:

- branch de produção;
- ambientes considerados produção;
- nomes de workflows de deploy;
- labels de release;
- padrão de tags;
- forma de identificar rollback;
- janela temporal para associar incidente a deploy.

## 10. Rate limits

O worker deve:

- respeitar rate limits;
- usar paginação;
- priorizar webhooks recentes;
- pausar jobs quando necessário;
- retomar jobs;
- mostrar status ao usuário.

## 11. Erros e retries

Política inicial:

- retry exponencial até 5 tentativas;
- registrar última mensagem de erro;
- marcar job como failed;
- permitir reprocessamento manual;
- não duplicar dados.

## 12. Telas da integração

### 12.1 GitHub Settings

- status da instalação;
- organização GitHub conectada;
- repositórios autorizados;
- última sincronização;
- escopos concedidos;
- eventos recebidos;
- jobs com falha;
- botão reprocessar;
- botão desconectar.

### 12.2 Repository Mapping

- lista de repositórios;
- squad principal;
- squads adicionais;
- criticidade;
- ambiente de produção;
- status da sync.

## 13. Critérios de aceite do MVP

- O usuário instala o GitHub App.
- O sistema lista repositórios autorizados.
- O sistema importa PRs dos últimos 90 dias.
- O sistema importa reviews dos PRs.
- O sistema calcula cycle time, pickup time e review time.
- O sistema recebe webhooks de novos PRs.
- O sistema atualiza métricas após merge.
- O sistema exibe status de sincronização.
- O sistema respeita privacy settings.
