# DevPulse AI — Especificação de Negócio

## 1. Contexto

O DevPulse AI será uma plataforma open source de Engineering Intelligence inspirada em produtos como LinearB, Swarmia e DX, mas desenhada desde o início para o cenário atual de desenvolvimento acelerado por IA.

O objetivo não é medir desenvolvedores por volume bruto de atividade, mas entender a saúde do fluxo de engenharia, qualidade, colaboração, entrega, governança e impacto real do uso de IA no ciclo de desenvolvimento.

## 2. Proposta de valor

Ajudar CTOs, Engineering Managers, Tech Leads e times de plataforma a responder perguntas como:

- Onde estão os gargalos reais do fluxo de desenvolvimento?
- O time está entregando mais rápido ou apenas gerando mais código?
- A IA está reduzindo cycle time sem aumentar bugs, retrabalho e risco?
- Os PRs estão ficando parados por falta de revisão?
- Quais squads estão sobrecarregados?
- Quais repositórios concentram maior risco técnico?
- A frequência de deploy aumentou com estabilidade?
- Onde há excesso de trabalho não planejado?
- Como melhorar developer experience sem abrir mão de qualidade?

## 3. Princípios do produto

### 3.1 Open source first

O produto deve nascer utilizável em modelo self-hosted, com instalação simples, documentação clara e sem dependência obrigatória de serviços proprietários.

Diretrizes:

- core open source;
- integração inicial nativa com GitHub;
- arquitetura modular;
- dados armazenados no banco do cliente;
- configuração transparente;
- fácil contribuição da comunidade;
- possibilidade futura de oferta SaaS/freemium sem limitar o core essencial.

### 3.2 Privacy by design

O produto deve respeitar privacidade, contexto e finalidade das métricas.

Diretrizes:

- coletar o mínimo necessário;
- evitar ranking público de desenvolvedores;
- priorizar visão por squad, repositório e fluxo;
- explicar como cada métrica é calculada;
- permitir retenção configurável;
- proteger tokens e segredos;
- permitir anonimização de surveys;
- manter logs de auditoria;
- permitir exclusão ou anonimização de dados pessoais;
- aplicar RBAC desde a primeira versão.

### 3.3 Métricas para melhoria, não vigilância

O produto deve ser usado para melhoria contínua de sistemas, processos e times, não para punição individual.

Métricas como commits, linhas alteradas, quantidade de PRs e comentários devem ser tratadas como sinais auxiliares, nunca como indicador isolado de produtividade.

## 4. Público-alvo

### 4.1 CTO / Diretor de Engenharia

Quer visão executiva sobre eficiência, previsibilidade, risco, qualidade, adoção de IA e evolução dos squads.

### 4.2 Engineering Manager

Quer entender gargalos, carga de trabalho, review bottlenecks, fluxo por squad, alocação e melhoria contínua.

### 4.3 Tech Lead

Quer acompanhar PRs parados, PRs grandes, revisões, qualidade, risco técnico e padrões de desenvolvimento.

### 4.4 Desenvolvedor

Quer visibilidade do próprio fluxo, pendências, PRs aguardando revisão, feedbacks técnicos e melhoria do ambiente.

### 4.5 Plataforma / DevEx

Quer medir fricções, gargalos de pipeline, qualidade do fluxo de revisão, automações e impacto de ferramentas de IA.

## 5. Posicionamento

DevPulse AI é uma plataforma open source de Engineering Intelligence para times modernos que querem medir produtividade real em engenharia considerando velocidade, qualidade, segurança, colaboração, experiência do desenvolvedor e impacto do uso de IA.

## 6. Inspiração funcional próxima ao LinearB

O produto deve buscar proximidade com as seguintes capacidades típicas de plataformas como LinearB:

- métricas de ciclo de desenvolvimento;
- DORA metrics;
- dashboards por time;
- workflow automation;
- PR intelligence;
- review bottlenecks;
- investment allocation;
- planejamento e previsibilidade;
- coaching e recomendações;
- developer experience;
- insights sobre IA;
- governança de workflow;
- integração com GitHub e ferramentas de gestão.

## 7. Diferencial AI-native

O DevPulse AI deve nascer com uma camada própria para medir impacto de IA:

- PRs assistidos por IA;
- intensidade de uso de IA;
- tipo de uso de IA;
- impacto no cycle time;
- impacto no review burden;
- impacto em retrabalho;
- impacto em bugs;
- checklist de validação humana;
- governança de ferramentas homologadas;
- comparação de fluxo com IA vs sem IA.

## 8. Métricas norteadoras do produto

- Cycle Time
- Pickup Time
- Review Time
- Merge Time
- Deployment Frequency
- Lead Time for Changes
- Change Failure Rate
- MTTR
- PR Size
- Rework After Review
- Reviewer Load
- PRs Stale
- AI Assisted PR Rate
- AI Cycle Time Delta
- AI Review Burden
- Bug / Hotfix Rate
- Developer Experience Score
- Flow Efficiency
- Work Allocation

## 9. Escopo inicial recomendado

O primeiro MVP deve resolver com excelência:

1. Integração nativa com GitHub via GitHub App.
2. Coleta de repositórios, PRs, reviews, commits, checks e workflows.
3. Dashboard de PR Intelligence.
4. Métricas de fluxo de PR.
5. Mapeamento de squads e repositórios.
6. Declaração de uso de IA em PRs.
7. Dashboard inicial de AI Impact.
8. Primeira versão de DORA parcial.
9. RBAC básico.
10. Privacy settings.

## 10. Fora do escopo do MVP

- billing/freemium;
- marketplace de plugins;
- multi-tenant SaaS completo;
- Jira/Azure DevOps obrigatório;
- SonarQube obrigatório;
- Sentry/Datadog obrigatório;
- IA generativa para análise automática;
- mobile app;
- benchmark externo;
- ranking de desenvolvedores.
