# DevInsights — Especificação de Design e UX

## 1. Direção visual

O produto deve ter uma estética próxima a plataformas modernas de engenharia como LinearB, GitHub, Vercel e Linear:

- interface limpa;
- muito espaço em branco;
- foco em tabelas e dashboards;
- cards objetivos;
- gráficos simples;
- navegação lateral;
- filtros persistentes;
- visual técnico, mas acessível para liderança.

## 2. Princípios de UX

- Mostrar primeiro visão agregada, depois drill-down.
- Evitar rankings individuais.
- Sempre explicar como a métrica é calculada.
- Transformar métricas em ações recomendadas.
- Destacar gargalos, não culpados.
- Usar linguagem de melhoria contínua.
- Permitir configurar o que é produção, incidente, PR grande e stale.
- Dar transparência sobre dados coletados.

## 3. Layout base

### Estrutura

```text
Sidebar esquerda
  - Overview
  - Squads
  - PR Intelligence
  - DORA
  - AI Impact
  - Investment
  - DevEx
  - Automations
  - Insights
  - Settings

Header superior
  - Organização atual
  - Período
  - Filtros globais
  - Busca
  - Usuário

Área principal
  - cards
  - gráficos
  - tabelas
  - insights
```

## 4. Tokens de design

### Cores

Usar paleta neutra com acentos discretos.

- Background principal: quase branco.
- Cards: branco.
- Bordas: cinza claro.
- Texto principal: cinza quase preto.
- Texto secundário: cinza médio.
- Sucesso: verde.
- Atenção: amarelo/âmbar.
- Risco: vermelho.
- Informação: azul ou roxo discreto.

### Tipografia

- Fonte sans-serif moderna.
- Títulos com peso 600/700.
- Métricas grandes com peso 600.
- Texto auxiliar menor e discreto.

### Componentes

- Cards com borda leve e sombra mínima.
- Tabelas densas, mas legíveis.
- Badges para status.
- Tooltips explicativos.
- Empty states úteis.
- Skeleton loading.
- Modais apenas quando necessário.

## 5. Telas

## 5.1 Onboarding

### Passos

1. Criar organização.
2. Instalar GitHub App.
3. Selecionar repositórios.
4. Criar squads.
5. Mapear repositórios para squads.
6. Configurar privacidade.
7. Importar histórico.

### UX importante

- Mostrar progresso.
- Explicar quais dados serão coletados.
- Permitir pular configurações avançadas.
- Mostrar status da importação.

## 5.2 Overview

### Objetivo

Dar visão executiva da saúde da engenharia.

### Componentes

- Health score geral.
- Cards principais:
  - PR Cycle Time
  - Pickup Time
  - Review Time
  - Throughput
  - Deployment Frequency
  - AI Assisted PR Rate
  - Stale PRs
  - Active Alerts
- Gráfico de tendência de cycle time.
- Gráfico de review time.
- Tabela de squads.
- Feed de insights.

### Exemplo de card

```text
PR Cycle Time
2.4 dias
↓ 18% vs período anterior
```

## 5.3 Squads

### Objetivo

Comparar saúde de fluxo por squad sem ranking agressivo.

### Componentes

- Tabela de squads.
- Filtros por período.
- Cards por squad.
- Drill-down.

### Colunas

- Squad
- Repositórios
- PR Cycle Time
- Pickup Time
- Review Time
- Throughput
- AI Usage
- Stale PRs
- Alerts

## 5.4 PR Intelligence

### Objetivo

Mostrar gargalos no fluxo de pull requests.

### Componentes

- Cards de métricas.
- Lista de PRs.
- Filtros avançados.
- Gráfico de cycle time por semana.
- Gráfico de distribuição de tamanho de PR.
- Tabela de reviewers.
- Lista de PRs parados.

### Estados de PR

- Open
- Draft
- Waiting review
- Changes requested
- Approved
- Merged
- Stale

## 5.5 PR Detail

### Componentes

- Header com título, repo, autor, status e link GitHub.
- Timeline do PR.
- Métricas do PR.
- Reviews.
- Workflows.
- Declaração de IA.
- Alertas.

### Timeline

- Aberto
- Ready for review
- Primeira revisão
- Changes requested
- Aprovação
- Merge
- Deploy

## 5.6 DORA

### Componentes

- Deployment Frequency.
- Lead Time for Changes.
- Change Failure Rate.
- MTTR.
- Deploy timeline.
- Incidentes.
- Configuração de ambientes.

### UX importante

Sempre indicar se a métrica está completa ou parcial.

Exemplo:

```text
Change Failure Rate parcial
Baseado em incidentes cadastrados manualmente e issues com label incident.
```

## 5.7 AI Impact

### Componentes

- AI Assisted PR Rate.
- Uso por ferramenta.
- Uso por finalidade.
- Cycle time com IA vs sem IA.
- Review burden com IA vs sem IA.
- Rework com IA vs sem IA.
- PRs com IA intensiva sem teste.
- Governança de ferramentas.

### UX importante

Evitar conclusões absolutas. Usar linguagem probabilística/contextual.

Exemplo:

```text
PRs com IA intensiva estão sendo mergeados 21% mais rápido, mas receberam 34% mais comentários de review neste período.
```

## 5.8 Investment

### Componentes

- Roadmap vs bugs vs sustentação.
- Trabalho planejado vs não planejado.
- Débito técnico.
- Segurança.
- Inovação.
- Distribuição por squad.
- Distribuição por repositório.

## 5.9 DevEx

### Componentes

- DevEx score.
- Survey mensal.
- Heatmap de fricções.
- Comentários anônimos.
- Tendência por squad.
- Relação com métricas reais.

## 5.10 Automations

### Componentes

- Lista de regras.
- Criador de regra.
- Templates.
- Histórico de execuções.

### Templates iniciais

- PR stale reminder.
- Large PR review guard.
- AI intensive PR without tests.
- Reviewer overload alert.
- Review time regression.

## 5.11 Insights

### Componentes

- Feed de insights.
- Filtro por severidade.
- Filtro por squad.
- Ação recomendada.
- Marcar como resolvido.
- Acompanhar impacto.

## 5.12 Settings

Seções:

- Organization
- GitHub Integration
- Squads
- Repositories
- Users
- Privacy
- Metrics definitions
- Data retention
- Audit logs

## 6. Componentes essenciais

- MetricCard
- TrendBadge
- HealthBadge
- FilterBar
- DateRangePicker
- RepositorySelector
- TeamSelector
- DataTable
- InsightCard
- AlertCard
- Timeline
- EmptyState
- LoadingSkeleton
- TooltipInfo
- PrivacyNotice

## 7. Estados vazios

O produto deve ter bons empty states.

Exemplos:

### Sem GitHub conectado

```text
Conecte sua organização GitHub para começar a medir fluxo de engenharia.
```

### Sem dados no período

```text
Não encontramos PRs para este período. Ajuste o filtro ou execute uma nova sincronização.
```

### DORA incompleto

```text
Para calcular DORA completo, configure deployments de produção e incidentes.
```

## 8. Microcopy

Usar linguagem clara.

Evitar:

- “baixo desempenho do desenvolvedor”;
- “pior dev”;
- “ranking individual”.

Preferir:

- “gargalo de fluxo”;
- “oportunidade de melhoria”;
- “risco de entrega”;
- “sobrecarga de revisão”;
- “sinal de atenção”.

## 9. Acessibilidade

- Contraste adequado.
- Navegação por teclado.
- Labels em inputs.
- Tooltips não essenciais para entendimento.
- Gráficos com valores textuais.
- Estados com ícones + texto, não só cor.
