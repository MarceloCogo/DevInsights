# DevInsights — SPEC.md

## 1. Visão do Produto

O **DevInsights** é uma aplicação SaaS de métricas de engenharia de software inspirada em ferramentas como LinearB e Swarmia, mas com uma diferenciação própria: a metodologia **PVE — Points of Value Delivered**.

O objetivo do MVP é permitir que um usuário conecte **1 repositório GitHub** e, em poucos minutos, visualize métricas úteis de fluxo de engenharia, gargalos de Pull Requests e uma primeira leitura de valor entregue por desenvolvedor.

O produto não deve começar tentando ser uma plataforma completa de engenharia. O foco inicial é entregar valor rápido, com dados reais e uma experiência clara.

---

## 2. Proposta de Valor

O DevInsights deve responder perguntas que o GitHub não responde claramente para gestores de tecnologia:

- O time está entregando com fluidez?
- Quantos PRs foram mergeados nos últimos dias?
- O ciclo dos PRs está saudável?
- Existem PRs parados?
- Os PRs estão grandes demais?
- Quem mais contribuiu para entregas recentes?
- Quais entregas parecem ter mais valor para o negócio?
- Quais sinais indicam risco no fluxo de engenharia?
- O repositório possui dados suficientes para métricas DORA confiáveis?

A proposta central do MVP é:

> **Conecte um repositório GitHub e veja, em poucos minutos, fluxo de engenharia, gargalos de PR e valor entregue por desenvolvedor.**

---

## 3. Direção do MVP

O MVP deve priorizar:

1. **PR Flow**
   - Métricas reais baseadas em Pull Requests.
   - Baixa dependência de configuração.
   - Funciona com quase qualquer repositório que use PRs.

2. **PVE v0**
   - Metodologia própria do DevInsights.
   - Calcula pontos de valor entregue com base em PRs mergeados.
   - Agrega valor por desenvolvedor e futuramente por squad.

3. **DORA parcial**
   - Deve existir, mas não ser o centro do MVP.
   - Métricas DORA devem ser transparentes quanto à qualidade dos dados.
   - Quando não houver dados suficientes, mostrar `N/A`, `Missing` ou `Needs setup`.

4. **UI clara e não repetitiva**
   - Cada página deve ter função específica.
   - Evitar repetir os mesmos cards em todas as telas.
   - O produto deve parecer uma ferramenta de gestão de engenharia, não apenas um dashboard técnico.

---

## 4. Arquitetura Atual

```text
GitHub OAuth + GitHub App
        -> API Fastify
        -> PostgreSQL
        -> Worker de sync
        -> API de dashboard
        -> Web app (/app)
```

### Serviços

- `apps/web`
  - Landing page.
  - App shell.
  - Sidebar.
  - Dashboard.
  - Telas do produto.

- `apps/api`
  - Autenticação.
  - Organizações.
  - Integração GitHub.
  - Endpoints de dashboard.
  - Criação de jobs de sync.

- `apps/worker`
  - Consumo de jobs em PostgreSQL.
  - Sincronização de Pull Requests via GitHub/Octokit.
  - Upsert de dados de PRs e estatísticas de sync.

---

## 5. Fluxos Principais

### 5.1 Login e Sessão

1. Usuário acessa `/app/login`.
2. API inicia OAuth GitHub com `state` assinado e persistido.
3. Callback cria ou atualiza o usuário.
4. API cria sessão.
5. Cookie de sessão é enviado.
6. Frontend acessa `/api/v1/app/bootstrap`.

### 5.2 Onboarding GitHub App

1. Usuário solicita URL de instalação do GitHub App.
2. GitHub retorna callback com `installation_id`.
3. API salva a instalação na organização ativa.
4. Frontend lista repositórios autorizados.
5. Usuário seleciona os repositórios monitorados.

### 5.3 Sync

1. API cria registro `pending` em `integration_sync_jobs`.
2. Worker busca jobs usando `FOR UPDATE SKIP LOCKED`.
3. Worker executa sync via Octokit.
4. Worker faz upsert em:
   - `pull_requests`
   - `repository_sync_stats`
5. Worker atualiza status do job.

---

## 6. Modelo de Dados Atual

Modelo mínimo existente:

- `users`
- `organizations`
- `organization_members`
- `sessions`
- `auth_states`
- `github_installations`
- `tracked_repositories`
- `integration_sync_jobs`
- `pull_requests`
- `repository_sync_stats`
- `production_environments`

### Dados relevantes já disponíveis para o MVP

A tabela `pull_requests` já permite calcular uma primeira versão de PR Flow e PVE v0 com campos como:

- `number`
- `title`
- `state`
- `opened_at`
- `merged_at`
- `author_login`
- `repository_full_name`
- `additions`
- `deletions`

### Dados ainda não disponíveis

Ainda não existem, ou não devem ser considerados confiáveis no MVP inicial:

- commits persistidos
- reviews persistidos
- labels de PRs
- labels de issues
- relacionamento PR ↔ issue
- relacionamento commit ↔ PR ↔ deployment
- squads

Esses itens devem ser tratados como evolução futura, não como bloqueio para o MVP.

---

## 7. API Atual

### Auth

- `/auth/github/login`
- `/auth/github/callback`
- `/auth/me`
- `/auth/logout`

### Organizações

- `/organizations`
- `/organizations/active`

### App

- `/app/bootstrap`

### Integrações

- `/integrations/github/*`

### Dashboard

- `/dashboard/overview`
- `/dashboard/pull-requests`
- `/dashboard/dora-overview`
- `/dashboard/dora-timeseries`

---

## 8. Nova Navegação Desejada

A navegação do MVP deve ser simplificada para refletir a proposta do produto.

### Menu desejado

```text
Overview
PR Flow
PVE
DORA
Repositories
Settings
```

### Mapeamento a partir do estado atual

| Atual | Novo destino |
|---|---|
| Dashboard | Overview |
| Productivity | PR Flow |
| Metrics | DORA |
| Teams | Ocultar por enquanto |
| Integrations | Mover para Settings ou ocultar por enquanto |
| Repositories | Repositories |
| Settings | Settings |

---

## 9. Papel de Cada Tela

### 9.1 Overview

Tela principal do produto.

Objetivo: dar uma visão executiva do repositório em poucos segundos.

Deve mostrar:

- repositório atual;
- período analisado;
- última sincronização;
- status da conexão GitHub;
- principais cards do produto;
- visão resumida de PR Flow;
- espaço para PVE;
- sinais recentes de PR Intelligence.

Cards sugeridos:

- **PVE Delivered**
  - Inicialmente pode aparecer como `N/A` até o PVE v0 ser implementado.
- **Merged PRs**
  - PRs mergeados no período.
- **Avg PR Cycle Time**
  - Tempo médio entre abertura e merge.
- **Flow Risk**
  - Sinal baseado em PRs parados, PRs grandes ou baixa entrega.

### 9.2 PR Flow

Tela operacional de fluxo de Pull Requests.

Deve mostrar apenas métricas relacionadas a PRs.

Métricas iniciais:

- PRs mergeados nos últimos 30 dias.
- Cycle time médio.
- Tamanho médio de PR.
- PRs abertos há mais de 7 dias.
- Top contributors por PRs mergeados.
- PR Intelligence.

Não deve mostrar DORA.

Não deve mostrar PVE completo.

Não deve depender de commits, reviews ou labels nesta primeira versão.

### 9.3 PVE

Tela da metodologia própria do DevInsights.

Objetivo: mostrar valor entregue por PR e por desenvolvedor.

No MVP inicial, PVE deve ser simples, explicável e baseado em dados já existentes.

Deve mostrar:

- PVE total no período.
- Ranking PVE por desenvolvedor.
- Top PRs por PVE.
- Explicação do score por PR.

A tela pode começar como placeholder discreto, mas deve ser priorizada logo após PR Flow.

### 9.4 DORA

Tela técnica de métricas DORA.

Deve mostrar:

- Deployment Frequency.
- Lead Time for Changes.
- MTTR.
- Change Failure Rate.
- Data Coverage.

Toda métrica DORA deve indicar qualidade:

- `real`
- `estimated`
- `missing`
- `needs_setup`

DORA não deve ser o centro do MVP, pois depende de maturidade do repositório e configuração de deploys/incidentes.

### 9.5 Repositories

Tela de configuração de repositórios monitorados.

Deve mostrar:

- repositórios autorizados;
- checkbox de monitoramento;
- último sync;
- status do sync;
- botão `Run sync`;
- quantidade de PRs sincronizados, se disponível.

Não deve repetir cards gerais do dashboard.

Não deve repetir PR Intelligence.

### 9.6 Settings

Tela de configuração.

Deve concentrar:

- conexão GitHub;
- status da instalação;
- configurações futuras de DORA;
- configurações futuras de PVE;
- logout;
- preferências da organização.

---

## 10. Diretrizes de UI

### 10.1 Princípios

A UI deve passar três mensagens:

1. **Clareza executiva**
   - Um gestor deve entender o estado do repositório rapidamente.

2. **Profundidade técnica**
   - Um tech lead deve conseguir investigar gargalos.

3. **Confiança nos dados**
   - O usuário deve saber quando uma métrica é real, estimada ou ausente.

### 10.2 Evitar repetição

Problema atual:

- várias páginas repetem os mesmos cards;
- várias páginas repetem a tabela PR Intelligence;
- páginas diferentes parecem a mesma tela com título diferente.

Diretriz:

- cada página deve ter função clara;
- cards gerais devem ficar no Overview;
- métricas de PR devem ficar no PR Flow;
- DORA deve ficar na tela DORA;
- repositórios devem ficar na tela Repositories;
- configurações devem ficar em Settings.

### 10.3 Empty states

Evitar mensagens genéricas como:

```text
No data yet
```

Preferir mensagens explicativas:

```text
Run sync to calculate PR Flow metrics.
```

```text
Lead Time requires production deployments linked to merged PRs.
```

```text
Incident labels are required to calculate MTTR.
```

```text
PVE v0 is not calculated yet.
```

### 10.4 Badges de qualidade

Métricas devem poder exibir badges:

- `Real`
- `Estimated`
- `Missing`
- `Needs setup`

Esses badges são especialmente importantes para DORA.

---

## 11. PR Flow — MVP

### Objetivo

Criar uma primeira seção útil baseada somente nos dados atuais de `pull_requests`.

### Métricas iniciais

#### 1. Merged PRs 30d

Quantidade de PRs mergeados nos últimos 30 dias.

Regra:

```sql
merged_at IS NOT NULL
AND merged_at >= now() - interval '30 days'
```

#### 2. Avg PR Cycle Time

Tempo médio entre `opened_at` e `merged_at` para PRs mergeados.

Regra:

```sql
AVG(merged_at - opened_at)
```

Se não houver PRs mergeados, retornar `null`, não `0`.

#### 3. Avg PR Size

Tamanho médio dos PRs mergeados.

Regra:

```sql
COALESCE(additions, 0) + COALESCE(deletions, 0)
```

Se não houver PRs mergeados, retornar `null`, não `0`.

#### 4. Stuck Open PRs

Quantidade de PRs abertos há mais de 7 dias.

Regra:

```sql
state = 'open'
AND opened_at < now() - interval '7 days'
```

#### 5. Top Contributors by Merged PRs

Ranking por `author_login`, considerando PRs mergeados nos últimos 30 dias.

Importante:

Esse ranking não é PVE. O título deve deixar claro que se trata de PRs mergeados, não valor entregue.

---

## 12. PVE — Points of Value Delivered

### 12.1 Definição

PVE significa **Points of Value Delivered**.

É uma metodologia própria do DevInsights para estimar pontos de valor entregue a partir de PRs mergeados.

A unidade base do PVE deve ser o **Pull Request mergeado**, não o commit.

Motivo:

- PR tem contexto;
- PR possui título;
- PR possui autor;
- PR possui tamanho;
- PR possui datas de abertura e merge;
- futuramente PR poderá ter labels, reviews, issues e relação com deploys.

### 12.2 Objetivo

O PVE deve ajudar gestores a enxergar valor entregue, não apenas volume de atividade.

O ranking PVE não deve ser um ranking cego de commits ou linhas de código.

Deve ser explicável.

### 12.3 PVE v0

Na primeira versão, usar apenas dados já disponíveis em `pull_requests`.

Fórmula inicial:

```text
PVE = base_points
    + complexity_points
    + flow_bonus
    - penalties
```

#### Base

```text
+5 pontos por PR mergeado
```

#### Complexidade por tamanho

Usar:

```text
pr_size = additions + deletions
```

Pontuação sugerida:

```text
+1 se pr_size <= 100
+3 se pr_size entre 101 e 500
+5 se pr_size > 500
```

#### Bônus de fluxo

```text
+2 se cycle_time <= 48h
```

#### Penalidades

```text
-3 se cycle_time > 7 dias
-3 se pr_size > 1000
```

#### PVE mínimo

```text
PVE mínimo por PR mergeado = 1
```

### 12.4 Saídas esperadas

A tela PVE deve mostrar:

- PVE total no período;
- PVE por desenvolvedor;
- Top PRs por PVE;
- explicação do cálculo por PR.

Exemplo de explicação:

```text
Base: +5
Size complexity: +3
Fast flow bonus: +2
Large PR penalty: -3
Total: 7 PVE
```

### 12.5 Evoluções futuras do PVE

Futuramente, enriquecer PVE com:

- labels de negócio;
- labels de bugfix;
- labels de incident;
- reviews;
- approvals;
- relação com issues;
- relação com cliente;
- relação com squad;
- leitura de título/descrição por IA;
- classificação de impacto de negócio;
- reverts/rollbacks.

---

## 13. DORA — Direção Correta

DORA deve ser mantida, mas com transparência.

### 13.1 Métricas

- Deployment Frequency
- Lead Time for Changes
- MTTR
- Change Failure Rate

### 13.2 Qualidade dos dados

Cada métrica deve retornar:

```text
value
unit
quality
source
explanation
```

Qualidades possíveis:

```text
real
estimated
missing
needs_setup
```

### 13.3 Deployment Frequency

Regra correta:

- contar apenas deployments de produção;
- considerar apenas status de sucesso;
- se usar workflow como fallback, marcar como `estimated`;
- se não houver dados suficientes, mostrar `missing`.

### 13.4 Lead Time for Changes

Só calcular quando for possível ligar:

```text
PR/commit -> deployment
```

Se não houver ligação suficiente, mostrar `missing`.

### 13.5 MTTR

Só calcular quando existirem incidentes confiáveis.

No MVP, isso pode depender de labels futuras como:

```text
incident
sev1
sev2
production-bug
```

### 13.6 Change Failure Rate

Só calcular quando houver sinal confiável de falha, como:

- incidentes;
- hotfix;
- rollback;
- revert;
- falha pós-deploy.

Não inventar CFR.

---

## 14. Roadmap de Implementação

### Fase 1 — Reorganização de UI

Objetivo: reduzir poluição e repetição.

Entregas:

- renomear Dashboard para Overview;
- renomear Productivity para PR Flow;
- renomear Metrics para DORA;
- ocultar Teams;
- ocultar Integrations ou mover para Settings;
- remover repetição de cards e PR Intelligence em páginas onde não fazem sentido;
- Repositories deve mostrar apenas configuração de repositórios.

### Fase 2 — PR Flow Overview

Objetivo: gerar valor com dados já existentes.

Entregas:

- rota `/dashboard/pr-flow-overview`;
- cards de PR Flow;
- top contributors por PRs mergeados;
- stuck PRs;
- empty states explicativos.

### Fase 3 — PVE v0

Objetivo: implementar a primeira versão da metodologia própria.

Entregas:

- cálculo PVE por PR;
- agregação por autor;
- ranking PVE por dev;
- top PRs por PVE;
- explicação do score.

### Fase 4 — Overview Executivo

Objetivo: deixar a tela inicial forte para demonstração.

Entregas:

- cards principais:
  - PVE Delivered;
  - Merged PRs;
  - Avg PR Cycle Time;
  - Flow Risk;
- resumo PR Flow;
- resumo PVE;
- sinais recentes.

### Fase 5 — DORA Correta e Transparente

Objetivo: melhorar DORA sem inventar dados.

Entregas:

- corrigir Deployment Frequency;
- adicionar qualidade das métricas;
- exibir Data Coverage;
- manter MTTR/CFR como `missing` quando não houver configuração.

---

## 15. Diretrizes para Uso do Kiro

Para evitar overengineering, toda tarefa enviada ao Kiro deve seguir estas regras:

- não gerar requirements;
- não gerar tech design;
- não gerar task list;
- não criar documentação longa;
- não alterar banco salvo quando explicitamente pedido;
- não implementar escopo futuro;
- não criar abstrações grandes;
- não usar mock como dado real;
- não mexer em DORA quando a tarefa for PR Flow;
- não mexer em PVE quando a tarefa for UI;
- antes de editar, listar arquivos que serão alterados;
- preferir alterações de até 3 arquivos;
- trabalhar em microtarefas.

Prompt base recomendado:

```text
Trabalhe em modo econômico.

Não gere requirements.
Não gere tech design.
Não gere task list.
Não crie documentação.
Não altere banco.
Não implemente escopo futuro.

Tarefa única:
[descrever uma tarefa pequena]

Restrições:
- alterar no máximo 3 arquivos
- não criar arquivos novos salvo se indispensável
- não usar mock como dado real
- não mexer em áreas fora do escopo

Antes de editar:
Liste os arquivos que pretende alterar e aguarde aprovação.
```

---

## 16. Não Objetivos do MVP

O MVP não deve tentar entregar agora:

- LinearB completo;
- Swarmia completo;
- Azure DevOps;
- multi-provider abstrato;
- squads complexos;
- DORA completo;
- MTTR completo;
- CFR completo;
- análise avançada por IA;
- ranking definitivo de performance individual;
- métricas baseadas em commits como principal unidade de valor;
- arquitetura complexa de filas;
- Redis/BullMQ;
- data warehouse;
- modelagem extensa antes de necessidade real.

---

## 17. Definição de Produto Divulgável

O DevInsights estará pronto para uma primeira divulgação quando um usuário conseguir:

1. acessar o produto;
2. conectar GitHub;
3. selecionar 1 repositório;
4. rodar sync;
5. visualizar PR Flow real;
6. visualizar PVE v0 por desenvolvedor;
7. ver top PRs por valor entregue;
8. entender quais métricas são reais e quais estão ausentes;
9. ter uma tela Overview clara o suficiente para demonstração.

Critério principal:

> O produto deve demonstrar valor em poucos minutos, mesmo sem DORA completo.
