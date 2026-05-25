# DevInsights — Requirements (MVP Atual)

## 1. Objetivo do produto

DevInsights e uma plataforma open source, self-hosted, para visibilidade de fluxo de Pull Requests.

O foco atual e entregar um onboarding GitHub simples e um dashboard operacional util para melhoria continua, sem vigilancia individual.

## 2. Escopo funcional atual

### RF-01 Autenticacao

- Login via OAuth GitHub.
- Sessao por cookie HttpOnly.
- Logout.

### RF-02 Organizacoes

- Cada usuario pertence a uma ou mais organizacoes.
- Usuario pode trocar organizacao ativa.
- Isolamento de dados por organizacao.

### RF-03 Integracao GitHub App

- Gerar URL de instalacao do GitHub App.
- Processar callback de instalacao.
- Salvar `installation_id` por organizacao.
- Exibir status de conexao/desconexao.

### RF-04 Repositorios

- Listar repositorios autorizados pela instalacao.
- Selecionar repositorios monitorados.
- Persistir selecao por organizacao.

### RF-05 Sincronizacao

- API cria job de sync em `integration_sync_jobs`.
- Worker consome jobs pendentes e sincroniza PRs.
- Status de job: `pending`, `running`, `completed`, `failed`.
- Sync idempotente por chave de PR (`organization_id`, `repository_id`, `github_pr_id`).

### RF-06 Dashboard `/app`

- Layout completo com secoes: `overview`, `pr`, `integrations`, `settings`.
- Cards de metricas de PR.
- Tabela de PRs com filtros (`period`, `state`, `repository`).
- Acoes de sync e status de integracao.

## 3. Requisitos nao-funcionais

### RNF-01 Seguranca

- Headers de seguranca em API e web.
- Cookies com politica segura por ambiente.
- CORS restrito ao `WEB_BASE_URL`.
- Rate limit em rota sensivel de auth.

### RNF-02 Operacao

- Execucao local com Docker Compose.
- Execucao em 3 servicos no Railway: `web`, `api`, `worker`.
- Health checks em `api` e `worker`.

### RNF-03 Performance

- Requests de dashboard devem ser leves e orientados a leitura.
- Sync pesado nao pode bloquear request HTTP.

## 4. Fora do escopo atual

- Azure DevOps runtime.
- DORA completo.
- AI Impact completo.
- Webhooks GitHub em producao.
- Billing/freemium.
- Ranking individual de dev.

## 5. Criterios de aceite do MVP atual

- Usuario conclui fluxo completo: login -> install app -> selecionar repos -> sync -> dashboard.
- Dashboard carrega com dados reais de PR apos sync.
- Troca de organizacao ativa atualiza os dados exibidos.
- API e worker mantem operacao estavel com jobs concorrentes basicos.
