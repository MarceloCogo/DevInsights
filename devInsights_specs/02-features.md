# DevInsights — Especificação de Features

## 1. Módulo: Onboarding

### Objetivo

Guiar o administrador na configuração inicial da organização, integração GitHub, squads e repositórios.

### Features

- Criar organização.
- Criar primeiro usuário administrador.
- Instalar GitHub App.
- Selecionar organização GitHub.
- Selecionar repositórios monitorados.
- Criar squads.
- Associar repositórios a squads.
- Associar usuários GitHub a usuários internos.
- Configurar branches principais.
- Configurar ambientes de deploy.
- Configurar labels de bug, incidente, hotfix e IA.
- Executar importação histórica inicial.
- Exibir progresso da sincronização.

### Critérios de aceite

- O admin consegue concluir onboarding sem configurar nada via banco.
- O sistema mostra claramente quais dados serão coletados.
- O usuário consegue testar a conexão GitHub.
- O usuário consegue reprocessar a importação inicial em caso de falha.

## 2. Módulo: Organizações, Squads e Repositórios

### Features

- CRUD de organização.
- CRUD de squads.
- Associação N:N entre squads e repositórios.
- Squad principal por repositório.
- Associação de usuários a squads.
- Papel do usuário no squad: member, lead, manager.
- Definição de repositórios críticos.
- Definição de produtos/sistemas.
- Arquivamento de squads e repositórios.

### Métricas por squad

- PR cycle time médio.
- Pickup time médio.
- Review time médio.
- Throughput.
- PRs abertos.
- PRs stale.
- PR size médio.
- AI assisted PR rate.
- Deployment frequency.
- Alertas ativos.

## 3. Módulo: GitHub Integration

### Features

- Integração via GitHub App.
- Instalação por organização/repositório.
- Controle de escopos mínimos.
- Sincronização de repositórios.
- Sincronização de pull requests.
- Sincronização de reviews.
- Sincronização de commits.
- Sincronização de check runs/workflow runs.
- Sincronização de deployments.
- Sincronização de issues e labels.
- Webhooks em tempo real.
- Backfill histórico configurável.
- Rate limit handling.
- Retry automático de falhas.
- Tela de status da integração.
- Logs de sincronização.

### Eventos GitHub desejados

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

## 4. Módulo: PR Intelligence

### Features principais

- Lista de PRs com filtros avançados.
- Dashboard de fluxo de PR.
- Cálculo de PR cycle time.
- Cálculo de pickup time.
- Cálculo de review time.
- Cálculo de merge time.
- Cálculo de coding time aproximado.
- Identificação de PRs stale.
- Identificação de PRs grandes.
- Identificação de PRs sem reviewer.
- Identificação de PRs sem teste.
- Identificação de rework após review.
- Carga por reviewer.
- Tempo até primeira revisão.
- Tempo em draft.
- Tempo aguardando merge.
- PR timeline.
- Relação PR → commits → workflow → deployment.

### Filtros

- Período.
- Organização.
- Squad.
- Repositório.
- Autor.
- Reviewer.
- Label.
- Branch base.
- Status.
- Com IA / sem IA.
- Tamanho de PR.
- Com teste / sem teste.

### Alertas

- PR parado há mais de X dias.
- PR sem reviewer há mais de X horas.
- PR grande demais.
- PR com changes requested e sem nova atividade.
- Reviewer sobrecarregado.
- Aumento anormal de review time.
- Muitos commits após review.
- PR com IA intensiva e sem teste.

## 5. Módulo: DORA Metrics

### Features MVP

- Configurar quais workflows representam deploy.
- Configurar quais ambientes são produção.
- Importar deployments do GitHub.
- Calcular deployment frequency.
- Calcular lead time for changes.
- Cadastro manual de incidentes.
- Marcação de issue como incidente.
- Associação manual ou automática entre incidente e deploy.
- Calcular change failure rate parcial.
- Calcular MTTR parcial.
- Dashboard DORA por período, squad e repositório.

### Features futuras

- Integração com Sentry.
- Integração com Datadog.
- Integração com New Relic.
- Integração com Statuspage.
- Detecção automática de rollback.
- Associação automática deploy → incidente por janela temporal.
- Benchmark interno por squad.

## 6. Módulo: AI Productivity

### Features

- Declaração de uso de IA no PR.
- Intensidade de uso: none, assistive, intensive, agentic.
- Ferramenta usada: Copilot, Claude Code, Cursor, OpenCode, Kiro, ChatGPT, outra.
- Finalidade: código, testes, refatoração, debug, documentação, análise de legado, segurança, arquitetura.
- Checklist de validação humana.
- Campo de observação opcional.
- Dashboard AI Impact.
- Comparação PRs com IA vs sem IA.
- AI cycle time delta.
- AI review burden.
- AI rework rate.
- AI test lift.
- AI defect rate futuro.
- Uso por squad.
- Uso por repositório.
- Uso por tipo de tarefa.
- Alertas de risco.

### Checklist de validação humana

- Eu revisei o código gerado ou sugerido por IA.
- Eu entendo a solução implementada.
- Eu validei impactos de segurança.
- Eu validei testes ou cenários críticos.
- Eu removi trechos desnecessários ou inseguros.

## 7. Módulo: Workflow Automation

### Objetivo

Aproximar o produto de plataformas como LinearB, com automações de melhoria sobre sinais do fluxo.

### Features MVP

- Regras configuráveis.
- Alertas na interface.
- Notificações por e-mail opcional.
- Webhook genérico.

### Features futuras

- Integração Slack.
- Integração Teams.
- Comentário automático no PR.
- Sugestão automática de reviewer.
- Alerta de PR stale.
- Alerta de PR grande.
- Alerta de PR sem teste.
- Policy-as-code para PR.
- Merge guard baseado em regras.
- Automação para Dependabot.

### Exemplos de regras

- Se PR > 800 linhas, solicitar review adicional.
- Se PR está parado há 48h, notificar squad lead.
- Se PR com IA intensiva não tem teste, marcar risco alto.
- Se review time médio subiu 30%, gerar insight para manager.
- Se reviewer tem mais de 10 PRs pendentes, redistribuir sugestão.

## 8. Módulo: Developer Experience

### Features

- Survey mensal.
- Perguntas configuráveis.
- Anonimização configurável.
- Dashboard por squad.
- Evolução temporal.
- Heatmap de fricções.
- Comentários qualitativos.
- Relação DevEx x métricas de fluxo.
- Perguntas sobre uso de IA.

### Perguntas iniciais

- Consegui entregar com poucas interrupções.
- Os requisitos estavam claros.
- O processo de review ajudou.
- O ambiente local/pipeline atrapalhou minha produtividade.
- As ferramentas de IA melhoraram minha produtividade.
- Tenho confiança para revisar código gerado por IA.
- O volume de trabalho esteve saudável.

## 9. Módulo: Investment Allocation

### Features

- Classificar PRs/issues por tipo de trabalho.
- Roadmap.
- Bugfix.
- Sustentação.
- Segurança.
- Débito técnico.
- Inovação.
- Incidente.
- Trabalho não planejado.
- Dashboard de alocação por squad.
- Dashboard de alocação por repositório.
- Evolução mensal.

### Fontes de classificação

- Labels GitHub.
- Branch naming.
- Issue type futura.
- Classificação manual.
- Integração Jira futura.

## 10. Módulo: Insights e Coaching

### Features

- Feed de insights.
- Cards de recomendação.
- Detecção de gargalos.
- Detecção de tendência negativa.
- Recomendações por squad.
- Recomendações por repositório.
- Relatório semanal.
- Histórico de ações.
- Registro de metas de melhoria.

### Exemplos de insights

- O tempo até primeira revisão aumentou 35% no squad Plataforma.
- PRs com mais de 800 linhas tiveram 2x mais rework.
- PRs assistidos por IA foram 22% mais rápidos, mas receberam 40% mais comentários.
- O reviewer João concentrou 47% das revisões do squad.
- O gargalo atual parece estar em review, não em codificação.

## 11. Módulo: Administração e Privacidade

### Features

- RBAC.
- Controle de acesso por organização.
- Controle de acesso por squad.
- Configuração de visibilidade individual.
- Data retention.
- Exportação de dados.
- Exclusão/anonimização de usuário.
- Logs de auditoria.
- Configuração de escopos GitHub.
- Visualização dos dados coletados.
- Política anti-ranking.
- Configuração de métricas sensíveis.
