# DevPulse AI — Roadmap de Implementação para Kiro Dev

## 1. Objetivo do roadmap

Organizar a implementação em fases pequenas, com entregas funcionais e testáveis.

## 2. Fase 0 — Fundação do projeto

### Objetivo

Criar base técnica do monorepo, apps, banco e padrões de desenvolvimento.

### Tarefas

- Criar monorepo com pnpm workspaces.
- Criar apps/web com React + Vite + TypeScript + Tailwind.
- Criar apps/api com Fastify + TypeScript.
- Criar apps/worker com Node + TypeScript.
- Criar packages/domain.
- Criar packages/application.
- Criar packages/database.
- Criar packages/github.
- Criar packages/shared.
- Configurar PostgreSQL via Docker Compose.
- Configurar Prisma.
- Configurar ESLint/Prettier.
- Configurar Vitest.
- Criar health checks.
- Criar arquivo .env.example.
- Criar README de instalação.

### Definition of done

- `docker compose up` sobe banco, API, worker e web.
- API responde health check.
- Web abre tela inicial.
- Prisma executa migrations.
- Testes rodam.

## 3. Fase 1 — Auth GitHub, Organização e RBAC

### Objetivo

Permitir acesso autenticado e criação da estrutura básica.

### Tarefas

- Criar tabela organizations.
- Criar tabela users.
- Criar autenticação OAuth com GitHub como padrão.
- Criar sessão segura.
- Criar papéis de usuário.
- Criar middleware de autorização.
- Criar CRUD de organização.
- Criar CRUD de squads.
- Criar membros de squad.
- Criar audit log inicial.
- Criar tela de login com botão "Entrar com GitHub" e onboarding de organização.

### Definition of done

- Usuário consegue criar organização.
- Usuário consegue criar squads.
- Usuário consegue criar organização no primeiro acesso.
- Rotas protegidas exigem autenticação.
- Ações sensíveis geram audit log.

## 4. Fase 2 — GitHub App

### Objetivo

Conectar organização GitHub e importar repositórios.

### Tarefas

- Criar GitHub App config.
- Implementar install URL.
- Implementar callback.
- Salvar installation_id.
- Listar repositórios autorizados.
- Criar tabela repositories.
- Criar tela GitHub Settings.
- Criar tela Repository Mapping.
- Associar repositórios a squads.
- Criar privacy settings.

### Definition of done

- Admin instala GitHub App.
- Sistema lista repositórios.
- Admin seleciona repositórios monitorados.
- Admin associa repositórios a squads.
- Tela mostra status da integração.

## 5. Fase 3 — Sync de Pull Requests e Reviews

### Objetivo

Importar dados suficientes para PR Intelligence.

### Tarefas

- Criar tabela pull_requests.
- Criar tabela pull_request_reviews.
- Criar tabela pull_request_commits.
- Criar jobs de sync.
- Implementar backfill de PRs.
- Implementar importação de reviews.
- Implementar importação de commits.
- Implementar rate limit handling.
- Implementar retry.
- Criar tela de jobs.

### Definition of done

- Sistema importa PRs dos últimos 90 dias.
- Sistema importa reviews.
- Sistema importa commits associados.
- Jobs com erro aparecem na tela.
- Sync pode ser reprocessado.

## 6. Fase 4 — PR Metrics Engine

### Objetivo

Calcular métricas de fluxo de PR.

### Tarefas

- Implementar PR Cycle Time.
- Implementar Pickup Time.
- Implementar Review Time.
- Implementar Merge Time.
- Implementar PR Size.
- Implementar Rework After Review.
- Implementar Stale PR detection.
- Implementar Reviewer Load.
- Criar testes unitários das métricas.
- Criar metric snapshots.

### Definition of done

- Métricas calculadas corretamente em testes.
- Dashboard consegue exibir médias por período.
- Sistema identifica PRs stale.
- Sistema identifica reviewer load.

## 7. Fase 5 — Dashboard PR Intelligence

### Objetivo

Entregar primeira experiência de valor ao usuário.

### Tarefas

- Criar tela Overview.
- Criar tela PR Intelligence.
- Criar lista de PRs.
- Criar filtros por período, squad, repo, autor e reviewer.
- Criar cards de métricas.
- Criar gráfico de cycle time.
- Criar gráfico de review time.
- Criar tabela de PRs stale.
- Criar tabela de reviewer load.
- Criar tela PR Detail.

### Definition of done

- Usuário visualiza gargalos de PR.
- Usuário filtra por squad e repo.
- Usuário abre detalhe do PR.
- Usuário vê timeline e métricas do PR.

## 8. Fase 6 — Webhooks GitHub

### Objetivo

Atualizar dados em tempo quase real.

### Tarefas

- Implementar endpoint de webhook.
- Validar assinatura.
- Registrar evento bruto.
- Criar job de processamento.
- Processar eventos pull_request.
- Processar eventos pull_request_review.
- Processar workflow_run básico.
- Atualizar métricas após eventos.

### Definition of done

- Novo PR aparece sem backfill manual.
- Review atualiza métricas.
- Merge atualiza cycle time.
- Eventos inválidos são rejeitados.

## 9. Fase 7 — AI Usage MVP

### Objetivo

Adicionar camada AI-native do produto.

### Tarefas

- Criar tabela ai_usage_declarations.
- Criar enums de intensidade.
- Criar finalidades de uso.
- Criar API de declaração de IA.
- Criar componente no PR Detail.
- Criar filtro com IA / sem IA.
- Criar dashboard AI Impact.
- Calcular AI Assisted PR Rate.
- Calcular AI Cycle Time Delta.
- Calcular AI Review Burden.
- Criar checklist de validação humana.

### Definition of done

- Usuário declara uso de IA em um PR.
- Dashboard mostra PRs com IA vs sem IA.
- Sistema compara cycle time.
- Sistema compara review burden.

## 10. Fase 8 — DORA parcial

### Objetivo

Iniciar métricas DORA usando GitHub Deployments e workflows.

### Tarefas

- Criar tabela workflow_runs.
- Criar tabela deployments.
- Importar workflow runs.
- Importar deployments.
- Configurar workflows de produção.
- Configurar ambientes de produção.
- Calcular deployment frequency.
- Calcular lead time for changes básico.
- Criar tela DORA.

### Definition of done

- Usuário configura o que é produção.
- Sistema mostra deployment frequency.
- Sistema mostra lead time básico.
- Tela indica que CFR e MTTR dependem de incidentes.

## 11. Fase 9 — Incidentes e DORA completo inicial

### Objetivo

Permitir cálculo inicial de Change Failure Rate e MTTR.

### Tarefas

- Criar tabela incidents.
- Criar cadastro manual de incidente.
- Permitir associar incidente a deployment.
- Permitir usar issues com label incident.
- Calcular MTTR.
- Calcular Change Failure Rate.
- Exibir limitações da métrica.

### Definition of done

- Usuário cadastra incidente.
- Usuário associa incidente a deploy.
- DORA mostra CFR e MTTR.

## 12. Fase 10 — Automations MVP

### Objetivo

Criar primeira versão de automações e alertas.

### Tarefas

- Criar regras simples.
- Criar templates.
- Criar alertas internos.
- Criar feed de insights.
- Criar regra PR stale.
- Criar regra PR grande.
- Criar regra PR com IA intensiva sem teste.
- Criar histórico de execuções.

### Definition of done

- Usuário ativa regra.
- Sistema gera alerta.
- Alerta aparece no dashboard.

## 13. Fase 11 — DevEx MVP

### Objetivo

Capturar percepção dos desenvolvedores.

### Tarefas

- Criar surveys.
- Criar perguntas padrão.
- Criar respostas anônimas.
- Criar dashboard DevEx.
- Criar heatmap de fricções.
- Relacionar DevEx com métricas de fluxo.

### Definition of done

- Usuário responde survey.
- Manager visualiza resultado agregado.
- Respostas individuais ficam protegidas.

## 14. Fase 12 — Polish Open Source

### Objetivo

Preparar para publicação open source.

### Tarefas

- README completo.
- Guia de instalação.
- Guia de configuração GitHub App.
- Documentação de métricas.
- Documentação de privacidade.
- CONTRIBUTING.md.
- CODE_OF_CONDUCT.md.
- SECURITY.md.
- LICENSE.
- Docker Compose estável.
- Seeds/demo data.
- Screenshots.

### Definition of done

- Uma pessoa externa consegue rodar localmente.
- Uma pessoa externa entende as métricas.
- Projeto está pronto para receber contribuições.

## 15. Ordem recomendada de prompts para Kiro

1. Criar estrutura do monorepo.
2. Criar banco e migrations iniciais.
3. Criar API com health check.
4. Criar frontend base com layout.
5. Criar auth e organizações.
6. Criar squads e repositórios.
7. Implementar GitHub App install flow.
8. Implementar sync de repositórios.
9. Implementar sync de PRs.
10. Implementar sync de reviews.
11. Implementar metric engine de PR.
12. Criar dashboard PR Intelligence.
13. Implementar webhooks.
14. Implementar AI Usage.
15. Implementar DORA parcial.
16. Implementar incidentes.
17. Implementar automations.
18. Implementar DevEx.
19. Preparar open source.
