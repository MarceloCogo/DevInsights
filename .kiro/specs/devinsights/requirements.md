# DevInsights — Requirements

## 1. Visão do Produto

DevInsights é uma plataforma open source de Engineering Intelligence para times de engenharia modernos. Inspirada em ferramentas como LinearB, Swarmia e DX, foi desenhada desde o início para o cenário de desenvolvimento acelerado por IA.

O produto ajuda CTOs, Engineering Managers, Tech Leads e times de plataforma a entender a saúde do fluxo de engenharia, identificar gargalos reais, medir o impacto do uso de IA e promover melhoria contínua — sem criar vigilância individual ou rankings simplistas.

### Caso de uso real

O produto será usado inicialmente na própria organização do autor, que utiliza:
- **GitHub** para código, PRs, reviews, workflow runs e deployments.
- **Azure DevOps Boards** para backlog, work items (Epics, Features, User Stories, Tasks, Bugs), sprints/iterations e area paths.

Essa combinação é o cenário-alvo do MVP e guia as decisões de integração e modelo de dados.

### Perguntas que o produto responde

- Onde estão os gargalos reais do fluxo de desenvolvimento?
- Os pull requests estão esperando muito tempo por revisão?
- Os reviewers estão sobrecarregados?
- PRs grandes estão gerando mais retrabalho?
- A IA está reduzindo cycle time ou aumentando a carga de revisão?
- Os times estão melhorando velocidade de entrega sem sacrificar qualidade?
- Como está a saúde do fluxo de engenharia ao longo do tempo?
- Qual o lead time real de uma demanda, do backlog ao deploy?
- O trabalho entregue no sprint foi planejado ou emergencial?

### Princípios inegociáveis

1. Métricas devem ser usadas para melhoria contínua, não para vigilância.
2. Não criar ranking público de desenvolvedores.
3. Priorizar visão por squad, repositório e fluxo.
4. Métricas individuais, quando existirem, servem para coaching e contexto, com controle de permissão.
5. Coletar o mínimo necessário de dados.
6. Tokens e segredos de integração devem ser criptografados.
7. GitHub App deve usar escopos mínimos.
8. Webhooks devem validar assinatura.
9. O produto deve ser fácil de rodar localmente com Docker Compose E deployável em produção no Railway.
10. A arquitetura deve permitir evolução futura para SaaS/freemium sem prejudicar o core open source.
11. A arquitetura deve suportar múltiplos provedores de integração (GitHub, Azure DevOps) sem acoplamento ao domínio.

---

## 2. Personas

### 2.1 CTO / Diretor de Engenharia

**Contexto:** Responsável pela estratégia de engenharia e saúde organizacional do time técnico.

**Necessidades:**
- Visão executiva sobre eficiência, previsibilidade e risco.
- Entender adoção e impacto real do uso de IA.
- Acompanhar evolução dos squads ao longo do tempo.
- Identificar onde há gargalos sistêmicos.

**Frustrações atuais:**
- Dados espalhados em múltiplas ferramentas.
- Métricas que medem atividade, não resultado.
- Falta de visibilidade sobre impacto da IA no fluxo.

### 2.2 Engineering Manager

**Contexto:** Responsável pelo dia a dia dos squads, entrega e desenvolvimento das pessoas.

**Necessidades:**
- Entender gargalos de fluxo por squad.
- Identificar sobrecarga de reviewers.
- Acompanhar cycle time e throughput.
- Ter dados para conversas de coaching.

**Frustrações atuais:**
- Falta de dados objetivos para conversas de melhoria.
- Dificuldade de identificar onde o fluxo trava.
- Ferramentas caras e complexas para times menores.

### 2.3 Tech Lead

**Contexto:** Responsável pela qualidade técnica e fluxo de revisão do time.

**Necessidades:**
- Acompanhar PRs parados e PRs grandes.
- Entender carga de revisão do time.
- Identificar padrões de risco técnico.
- Monitorar uso de IA e qualidade das entregas.

**Frustrações atuais:**
- Falta de visibilidade sobre PRs aguardando revisão.
- Dificuldade de identificar PRs que precisam de atenção.

### 2.4 Desenvolvedor

**Contexto:** Trabalha diretamente no código, abre e revisa PRs.

**Necessidades:**
- Visibilidade do próprio fluxo e pendências.
- Saber quais PRs estão aguardando revisão.
- Declarar uso de IA de forma simples.
- Entender seu próprio ciclo de entrega.

**Frustrações atuais:**
- Falta de feedback sobre o próprio fluxo.
- Processo de revisão opaco.

### 2.5 Time de Plataforma / DevEx

**Contexto:** Responsável pela experiência do desenvolvedor e qualidade do pipeline.

**Necessidades:**
- Medir fricções no pipeline de CI/CD.
- Identificar gargalos de automação.
- Medir impacto de ferramentas de IA.
- Acompanhar saúde do fluxo de revisão.

### 2.6 Product Manager / Scrum Master

**Contexto:** Responsável pelo backlog, sprints e planejamento de entrega.

**Necessidades:**
- Correlacionar work items com os PRs que os implementaram.
- Medir cycle time de demandas (criação do work item → fechamento).
- Acompanhar throughput por sprint.
- Identificar trabalho não planejado que entrou no sprint.
- Medir lead time real da demanda (criação → deploy).

**Frustrações atuais:**
- Dados de código e backlog em ferramentas separadas sem correlação.
- Impossibilidade de medir lead time real sem integração entre GitHub e Azure DevOps.
- Dificuldade de distinguir trabalho planejado de trabalho emergencial.

---

## 3. Problemas Resolvidos

### 3.1 Falta de visibilidade sobre gargalos de fluxo

Times não sabem onde o desenvolvimento trava: se é na codificação, na espera por revisão, no processo de aprovação ou no merge. O DevInsights torna esses gargalos visíveis com métricas de cycle time, pickup time e review time.

### 3.2 Sobrecarga de reviewers não identificada

Alguns reviewers concentram a maior parte das revisões sem que isso seja visível. O produto identifica e exibe a carga por reviewer, permitindo redistribuição.

### 3.3 PRs grandes e parados sem detecção

PRs grandes aumentam o risco de retrabalho e dificultam revisão. PRs parados bloqueiam o fluxo. O produto detecta e alerta sobre ambos.

### 3.4 Impacto da IA no fluxo não mensurável

Times usam IA mas não sabem se ela está ajudando ou criando novos problemas (mais comentários de review, mais retrabalho, menos testes). O produto permite declaração e análise do impacto real.

### 3.5 Métricas DORA sem infraestrutura cara

DORA Metrics são referência de mercado mas exigem integração com múltiplas ferramentas. O produto oferece uma versão inicial baseada em GitHub, acessível para times menores.

### 3.6 Ferramentas de Engineering Intelligence inacessíveis

LinearB, Swarmia e similares são caros e fechados. O DevInsights oferece capacidades equivalentes em modelo open source e self-hosted.

### 3.7 Dados de código e backlog desconectados

Times usam GitHub para código e Azure DevOps para backlog, mas não conseguem correlacionar uma User Story com os PRs que a implementaram, nem medir o lead time real da demanda. O DevInsights conecta essas duas fontes, tornando visível o caminho completo de uma demanda: da criação no backlog até o deploy em produção.

---

## 4. Requisitos Funcionais

### RF-01 — Autenticação

- RF-01.1: O sistema deve permitir login com e-mail e senha.
- RF-01.2: O sistema deve manter sessão segura via cookie HttpOnly.
- RF-01.3: O sistema deve permitir logout.
- RF-01.4: O sistema deve retornar o usuário autenticado e suas permissões.
- RF-01.5: O sistema deve suportar convite de novos usuários por e-mail.

### RF-02 — Organizações

- RF-02.1: O sistema deve permitir criar uma organização.
- RF-02.2: O sistema deve permitir atualizar dados da organização.
- RF-02.3: O sistema deve suportar múltiplas organizações por instância.
- RF-02.4: O sistema deve isolar dados entre organizações.

### RF-03 — Squads / Times

- RF-03.1: O sistema deve permitir criar, editar e arquivar squads.
- RF-03.2: O sistema deve permitir adicionar e remover membros de squads.
- RF-03.3: O sistema deve suportar papéis de membro no squad: member, lead, manager.
- RF-03.4: O sistema deve permitir associar repositórios a squads (N:N).
- RF-03.5: O sistema deve suportar definição de squad principal por repositório.

### RF-04 — Usuários e Permissões (RBAC)

- RF-04.1: O sistema deve suportar os papéis: INSTANCE_ADMIN, ORG_ADMIN, ENGINEERING_MANAGER, TECH_LEAD, DEVELOPER, EXECUTIVE_VIEWER.
- RF-04.2: O sistema deve restringir acesso a rotas e dados com base no papel do usuário.
- RF-04.3: O sistema deve permitir associar usuário interno a login GitHub.
- RF-04.4: O sistema deve permitir desativar usuários.

### RF-05 — Integração GitHub App

- RF-05.1: O sistema deve gerar URL de instalação do GitHub App.
- RF-05.2: O sistema deve processar o callback de instalação e salvar o installation_id.
- RF-05.3: O sistema deve listar repositórios autorizados pela instalação.
- RF-05.4: O sistema deve exibir status da integração (conectado, suspenso, desconectado).
- RF-05.5: O sistema deve permitir desconectar a integração.
- RF-05.6: O sistema deve usar escopos mínimos no GitHub App.
- RF-05.7: O sistema deve gerar installation tokens sob demanda, sem armazenamento permanente.

### RF-06 — Seleção e Mapeamento de Repositórios

- RF-06.1: O sistema deve permitir selecionar quais repositórios serão monitorados.
- RF-06.2: O sistema deve permitir associar repositórios a squads.
- RF-06.3: O sistema deve permitir marcar repositórios como críticos.
- RF-06.4: O sistema deve exibir status de sincronização por repositório.

### RF-07 — Sincronização de Pull Requests

- RF-07.1: O sistema deve importar PRs dos últimos 90 dias por padrão no backfill inicial.
- RF-07.2: O sistema deve sincronizar: número, título, autor, estado, branch base, branch head, datas de abertura/fechamento/merge, additions, deletions, changed_files, commits_count, labels.
- RF-07.3: O sistema deve suportar backfill configurável (30, 90, 180, 365 dias ou período customizado).
- RF-07.4: O sistema deve processar sincronização de forma idempotente.
- RF-07.5: O sistema deve registrar progresso e erros de sincronização.

### RF-08 — Sincronização de Pull Request Reviews

- RF-08.1: O sistema deve importar reviews de cada PR sincronizado.
- RF-08.2: O sistema deve sincronizar: reviewer, estado (approved, changes_requested, commented), data de submissão.
- RF-08.3: O sistema deve processar sincronização de forma idempotente.

### RF-09 — Sincronização de Workflow Runs

- RF-09.1: O sistema deve importar workflow runs associados aos repositórios monitorados.
- RF-09.2: O sistema deve sincronizar: nome, status, conclusão, branch, commit SHA, datas de início e fim.

### RF-10 — Webhooks GitHub

- RF-10.1: O sistema deve expor endpoint público para receber webhooks do GitHub.
- RF-10.2: O sistema deve validar a assinatura X-Hub-Signature-256 de cada webhook.
- RF-10.3: O sistema deve rejeitar webhooks com assinatura inválida.
- RF-10.4: O sistema deve responder ao GitHub em menos de 3 segundos.
- RF-10.5: O sistema deve processar eventos de forma assíncrona via jobs.
- RF-10.6: O sistema deve processar eventos: pull_request, pull_request_review, workflow_run.
- RF-10.7: O sistema deve atualizar métricas após processar eventos relevantes.

### RF-11 — Jobs de Sincronização

- RF-11.1: O sistema deve gerenciar jobs via tabela PostgreSQL no MVP.
- RF-11.2: O sistema deve suportar status: pending, running, completed, failed, cancelled.
- RF-11.3: O sistema deve implementar retry exponencial com até 5 tentativas.
- RF-11.4: O sistema deve respeitar rate limits da API GitHub.
- RF-11.5: O sistema deve permitir reprocessamento manual de jobs com falha.
- RF-11.6: O sistema deve exibir histórico e status dos jobs na interface.

### RF-12 — Cálculo de Métricas de PR

- RF-12.1: O sistema deve calcular PR Cycle Time (merged_at - opened_at).
- RF-12.2: O sistema deve calcular Pickup Time (first_review_at - ready_for_review_at, com fallback para opened_at).
- RF-12.3: O sistema deve calcular Review Time (approved_at - first_review_at).
- RF-12.4: O sistema deve calcular PR Size (additions + deletions).
- RF-12.5: O sistema deve calcular Throughput (PRs merged por período).
- RF-12.6: O sistema deve identificar PRs parados (sem atividade por mais de X dias configurável).
- RF-12.7: O sistema deve identificar PRs grandes (acima de threshold configurável).
- RF-12.8: O sistema deve calcular Reviewer Load (PRs pendentes por reviewer).
- RF-12.9: O sistema deve gerar metric snapshots para performance de dashboards.

### RF-13 — Dashboard PR Intelligence

- RF-13.1: O sistema deve exibir cards de métricas: PR Cycle Time, Pickup Time, Review Time, Throughput, Stale PRs.
- RF-13.2: O sistema deve exibir gráfico de tendência de cycle time por semana.
- RF-13.3: O sistema deve exibir lista de PRs com filtros avançados.
- RF-13.4: O sistema deve suportar filtros por: período, squad, repositório, autor, reviewer, estado, com IA / sem IA, tamanho.
- RF-13.5: O sistema deve exibir tabela de reviewer load.
- RF-13.6: O sistema deve exibir lista de PRs parados.
- RF-13.7: O sistema deve exibir tela de detalhe do PR com timeline.

### RF-14 — Declaração de Uso de IA

- RF-14.1: O sistema deve permitir declarar uso de IA em um PR.
- RF-14.2: O sistema deve suportar intensidades: none, assistive, intensive, agentic.
- RF-14.3: O sistema deve suportar ferramentas: Copilot, Claude Code, Cursor, OpenCode, Kiro, ChatGPT, outra.
- RF-14.4: O sistema deve suportar finalidades: código, testes, refatoração, debug, documentação, segurança, arquitetura.
- RF-14.5: O sistema deve exibir checklist de validação humana para PRs com IA.
- RF-14.6: O sistema deve permitir editar a declaração de IA.

### RF-15 — Dashboard AI Impact

- RF-15.1: O sistema deve calcular AI Assisted PR Rate (PRs com IA / total de PRs).
- RF-15.2: O sistema deve calcular AI Cycle Time Delta (diferença de cycle time entre PRs com e sem IA).
- RF-15.3: O sistema deve calcular AI Review Burden (comparação de comentários/rework entre PRs com e sem IA).
- RF-15.4: O sistema deve exibir uso de IA por ferramenta e por finalidade.
- RF-15.5: O sistema deve identificar PRs com IA intensiva sem testes.
- RF-15.6: O sistema deve usar linguagem cautelosa, sem inferências absolutas.

### RF-16 — Configurações de Privacidade

- RF-16.1: O sistema deve permitir configurar coleta de body de PR (padrão: desabilitado).
- RF-16.2: O sistema deve permitir configurar coleta de body de review (padrão: desabilitado).
- RF-16.3: O sistema deve permitir configurar coleta de mensagens de commit (padrão: desabilitado).
- RF-16.4: O sistema deve permitir configurar coleta de body de issues (padrão: desabilitado).
- RF-16.5: O sistema deve permitir configurar anonimização de surveys (padrão: habilitado).
- RF-16.6: O sistema deve permitir configurar visibilidade de métricas individuais (padrão: desabilitado).
- RF-16.7: O sistema deve permitir configurar período de retenção de dados.

### RF-17 — Audit Logs

- RF-17.1: O sistema deve registrar audit log para: login, alteração de permissões, instalação/desconexão GitHub, alteração de privacy settings, exportação de dados, exclusão/anonimização de usuário.
- RF-17.2: O sistema deve permitir consultar audit logs com filtros por ação, ator e período.

### RF-18 — Integração Azure DevOps (planejada, não no MVP inicial)

> Esta integração não faz parte do MVP, mas deve estar refletida no modelo de dados e na arquitetura desde o início, garantindo que a implementação futura não exija reestruturação do domínio.

- RF-18.1: O sistema deve suportar conexão com Azure DevOps Organization e Project via Personal Access Token ou OAuth.
- RF-18.2: O sistema deve sincronizar Work Items dos tipos: Epic, Feature, User Story, Task e Bug.
- RF-18.3: O sistema deve sincronizar Iterations/Sprints e Area Paths da organização.
- RF-18.4: O sistema deve sincronizar transições de estado (status transitions) de Work Items.
- RF-18.5: O sistema deve correlacionar Work Items com Pull Requests do GitHub por meio de referências em branch names, títulos de PR ou links explícitos.
- RF-18.6: O sistema deve calcular cycle time por Work Item (data de criação → data de fechamento).
- RF-18.7: O sistema deve calcular lead time da demanda (data de criação do Work Item → data do deploy associado).
- RF-18.8: O sistema deve calcular throughput por sprint (Work Items concluídos por sprint).
- RF-18.9: O sistema deve identificar trabalho planejado vs. não planejado dentro de cada sprint.
- RF-18.10: O sistema deve calcular bug ratio por sprint/período (bugs / total de work items entregues).
- RF-18.11: O sistema deve exibir allocation por tipo de trabalho: roadmap, bug, sustentação, segurança, débito técnico.

---

## 5. Requisitos Não Funcionais

### RNF-01 — Performance

- RNF-01.1: Dashboards devem carregar em menos de 3 segundos para períodos de até 90 dias.
- RNF-01.2: Endpoints de lista devem suportar paginação para evitar sobrecarga.
- RNF-01.3: Metric snapshots devem ser usados para evitar recálculo pesado em cada consulta.
- RNF-01.4: Índices devem ser criados em campos de filtro frequente.

### RNF-02 — Confiabilidade

- RNF-02.1: Jobs de sincronização devem ter retry automático com backoff exponencial.
- RNF-02.2: Processamento de webhooks deve ser idempotente.
- RNF-02.3: Falhas de sincronização não devem impedir o funcionamento do dashboard.

### RNF-03 — Manutenibilidade

- RNF-03.1: O código deve seguir Clean Architecture com separação clara entre domínio, aplicação e infraestrutura.
- RNF-03.2: O domínio não deve ter dependências de frameworks (Fastify, Prisma, React).
- RNF-03.3: TypeScript strict deve ser habilitado em todos os pacotes.
- RNF-03.4: Testes unitários devem cobrir toda a lógica de cálculo de métricas.

### RNF-04 — Operabilidade

- RNF-04.1: O produto deve ser executável localmente com um único comando (`docker compose up`).
- RNF-04.2: A API deve expor health check em `/health`.
- RNF-04.3: Logs devem ser estruturados (JSON) e sanitizados.
- RNF-04.4: O produto deve ter documentação de instalação clara.

### RNF-05 — Escalabilidade

- RNF-05.1: A arquitetura deve permitir migração futura de jobs PostgreSQL para BullMQ/Redis sem mudança no domínio.
- RNF-05.2: A arquitetura deve permitir evolução para modelo SaaS/multi-tenant sem quebrar o core open source.

### RNF-06 — Compatibilidade

- RNF-06.1: O produto deve funcionar com PostgreSQL 14+.
- RNF-06.2: O produto deve funcionar com Node.js 20+.
- RNF-06.3: O frontend deve funcionar nos navegadores modernos (Chrome, Firefox, Safari, Edge).

### RNF-07 — Deploy e Operação em Produção

- RNF-07.1: Cada aplicação (web, api, worker) deve ter seu próprio Dockerfile.
- RNF-07.2: A API deve expor `/health` (liveness) e `/ready` (readiness) como endpoints distintos.
- RNF-07.3: O worker deve expor `/health` interno para verificação de liveness.
- RNF-07.4: Todos os serviços devem implementar graceful shutdown, garantindo que jobs em andamento sejam concluídos antes do encerramento.
- RNF-07.5: Logs devem ser estruturados em JSON utilizando pino como biblioteca padrão.
- RNF-07.6: Migrations Prisma devem ser executadas de forma segura e automatizada no processo de deploy, sem intervenção manual.
- RNF-07.7: Todas as variáveis de ambiente necessárias devem estar documentadas em `.env.example` com descrição e exemplo de valor.
- RNF-07.8: Secrets nunca devem ser hardcoded no código-fonte; devem ser sempre injetados via variáveis de ambiente.
- RNF-07.9: A callback URL do GitHub App deve ser configurável via variável de ambiente (`GITHUB_APP_CALLBACK_URL`).
- RNF-07.10: A webhook URL do GitHub deve ser configurável via variável de ambiente (`GITHUB_WEBHOOK_URL`).

### RNF-08 — Deploy Railway (recomendado para MVP)

- RNF-08.1: O produto deve ser deployável no Railway com 4 serviços: `web`, `api`, `worker` e `PostgreSQL`.
- RNF-08.2: No MVP, o frontend pode ser servido pelo backend para simplificar o deploy e reduzir o número de serviços.
- RNF-08.3: A documentação deve incluir guia passo a passo de deploy no Railway.
- RNF-08.4: Todas as variáveis de ambiente devem ser configuráveis via Railway dashboard, sem necessidade de acesso ao servidor.

---

## 6. Requisitos de Privacidade

### RP-01 — Coleta mínima de dados

- RP-01.1: O sistema deve coletar apenas metadados necessários para gerar insights de engenharia.
- RP-01.2: Conteúdo textual (body de PR, mensagens de commit, body de review) não deve ser coletado por padrão.
- RP-01.3: O sistema deve documentar claramente quais dados são coletados e por quê.

### RP-02 — Controle pelo administrador

- RP-02.1: O administrador deve poder configurar quais dados são coletados via privacy settings.
- RP-02.2: O administrador deve poder configurar período de retenção de dados.
- RP-02.3: O administrador deve poder desativar visibilidade de métricas individuais.

### RP-03 — Política anti-ranking

- RP-03.1: O sistema não deve criar ranking público de desenvolvedores.
- RP-03.2: Métricas individuais devem ser restritas por papel (RBAC).
- RP-03.3: Dashboards devem priorizar visão por squad e repositório.

### RP-04 — Exclusão e anonimização

- RP-04.1: O sistema deve permitir desativar e anonimizar usuários.
- RP-04.2: A anonimização deve remover associação com GitHub login e dados pessoais.
- RP-04.3: Métricas agregadas devem ser preservadas após anonimização.

### RP-05 — Transparência

- RP-05.1: O sistema deve exibir, no onboarding, quais dados serão coletados.
- RP-05.2: O sistema deve explicar como cada métrica é calculada.
- RP-05.3: O sistema deve ter página de documentação de privacidade.

---

## 7. Requisitos de Segurança

### RS-01 — Autenticação e sessão

- RS-01.1: Senhas devem ser armazenadas com hash seguro (bcrypt ou argon2).
- RS-01.2: Sessões devem usar cookies HttpOnly, Secure e SameSite.
- RS-01.3: O sistema deve implementar rate limit em endpoints de autenticação.

### RS-02 — Integração GitHub

- RS-02.1: Webhooks devem ter assinatura X-Hub-Signature-256 validada.
- RS-02.2: A private key do GitHub App deve ser carregada via variável de ambiente, nunca hardcoded.
- RS-02.3: Installation tokens devem ser gerados sob demanda e não armazenados permanentemente.
- RS-02.4: O GitHub App deve usar escopos mínimos necessários.

### RS-03 — Criptografia

- RS-03.1: Secrets e tokens sensíveis armazenados no banco devem ser criptografados com ENCRYPTION_KEY.
- RS-03.2: HTTPS deve ser obrigatório em produção.

### RS-04 — Aplicação

- RS-04.1: Todos os inputs devem ser validados com Zod antes de processamento.
- RS-04.2: O ORM (Prisma) deve ser usado para prevenir SQL injection.
- RS-04.3: CORS deve ser configurado de forma restritiva.
- RS-04.4: Headers de segurança HTTP devem ser aplicados.
- RS-04.5: Logs não devem conter tokens, senhas, cookies ou payloads sensíveis.
- RS-04.6: Erros internos não devem vazar stack traces para o cliente.

### RS-05 — Autorização

- RS-05.1: Todas as rotas da API devem exigir autenticação, exceto login e webhook.
- RS-05.2: Acesso a dados de uma organização deve ser restrito a usuários daquela organização.
- RS-05.3: Jobs não devem processar dados de organizações diferentes da que originou o job.

---

## 8. Escopo do MVP

O MVP foca em GitHub PR Intelligence e rastreamento declarativo de uso de IA.

### Incluído no MVP

| Área | Funcionalidade |
|------|---------------|
| Auth | Login e-mail/senha, sessão segura, RBAC básico |
| Organização | CRUD de organização |
| Squads | CRUD de squads, membros, associação com repositórios |
| Usuários | Convite, papéis, associação com GitHub login |
| GitHub App | Instalação, callback, listagem de repositórios |
| Repositórios | Seleção, mapeamento para squads, status de sync |
| Sync PRs | Backfill 90 dias, idempotente, com retry |
| Sync Reviews | Importação de reviews por PR |
| Sync Workflows | Importação de workflow runs |
| Webhooks | Validação de assinatura, processamento assíncrono |
| Jobs | Gerenciamento via PostgreSQL, retry, status |
| Métricas PR | Cycle time, pickup time, review time, PR size, throughput |
| Detecção | PRs parados, PRs grandes, reviewer load |
| Dashboard PR | Cards, gráficos, lista de PRs, filtros, detalhe do PR |
| AI Usage | Declaração de intensidade, ferramenta, finalidade, checklist |
| Dashboard AI | AI Assisted PR Rate, cycle time delta, review burden |
| Privacidade | Privacy settings, configurações padrão restritivas |
| Audit Log | Registro de ações sensíveis |
| Produtos | Agrupamento de repositórios por produto/sistema |
| Infra | Dockerfiles para todos os serviços, health/ready endpoints, graceful shutdown, logs estruturados |
| Deploy | Guia de deploy Railway, `.env.example` completo |
| Arquitetura | Base arquitetural preparada para Azure DevOps (modelo de dados, ports/adapters) sem implementação |

### Fora do MVP

| Área | Motivo |
|------|--------|
| Azure DevOps | Integração completa pós-MVP; base arquitetural incluída no MVP |
| Jira | Complexidade de integração, fora do foco inicial |
| SonarQube | Fora do foco inicial |
| Sentry / Datadog | Fora do foco inicial |
| Billing / Freemium | Não é open source core |
| Multi-tenant SaaS complexo | Evolução futura |
| IA generativa para insights | Evolução futura |
| Mobile app | Evolução futura |
| Benchmarks externos | Evolução futura |
| Ranking de desenvolvedores | Contra os princípios do produto |
| SSO / OIDC | Evolução futura |
| Slack / Teams | Evolução futura |
| DevEx surveys | Pós-MVP |
| Investment allocation | Pós-MVP |
| DORA completo (CFR, MTTR) | Parcial no MVP via incidentes manuais |
| Vercel como plataforma de deploy | Possível no futuro; Railway é a premissa do MVP |

---

## 9. Critérios de Aceite Gerais

### CA-01 — Instalação local

- Um desenvolvedor externo consegue clonar o repositório, executar `docker compose up` e acessar o produto em menos de 10 minutos.
- O README contém todos os passos necessários.
- O arquivo `.env.example` documenta todas as variáveis necessárias.

### CA-02 — Integração GitHub

- O administrador consegue instalar o GitHub App sem configurar nada via banco de dados.
- O sistema lista os repositórios autorizados após a instalação.
- O sistema importa PRs dos últimos 90 dias com sucesso.
- O sistema valida e rejeita webhooks com assinatura inválida.

### CA-03 — PR Intelligence

- O dashboard exibe cycle time, pickup time e review time calculados corretamente.
- O sistema identifica PRs parados e PRs grandes.
- O usuário consegue filtrar PRs por squad, repositório, autor e período.
- O detalhe do PR exibe timeline com eventos relevantes.

### CA-04 — AI Usage

- O usuário consegue declarar uso de IA em um PR com intensidade, ferramenta e finalidade.
- O checklist de validação humana é exibido para PRs com IA.
- O dashboard AI Impact exibe comparação entre PRs com e sem IA.

### CA-05 — Privacidade e segurança

- Body de PR não é coletado por padrão.
- Webhooks com assinatura inválida são rejeitados com 401.
- Métricas individuais não são visíveis para DEVELOPER por padrão.
- Audit log registra alterações de privacy settings.

### CA-06 — Qualidade de código

- TypeScript strict habilitado sem erros de compilação.
- Testes unitários cobrem todos os cálculos de métricas.
- Linting passa sem erros.

### CA-07 — Production readiness

- `docker compose up` sobe todos os serviços localmente sem erros.
- `/health` retorna HTTP 200 quando o serviço está saudável.
- `/ready` retorna HTTP 200 quando o serviço está pronto para receber tráfego.
- Graceful shutdown não perde jobs em andamento; jobs em execução são concluídos antes do encerramento.
- Logs não contêm secrets, tokens, senhas ou dados sensíveis.

### CA-08 — Deploy Railway

- O produto pode ser deployado no Railway seguindo o guia de documentação sem passos manuais adicionais.
- Migrations Prisma são executadas automaticamente durante o deploy.
- Variáveis de ambiente documentadas no `.env.example` são suficientes para configurar o produto completo no Railway dashboard.
