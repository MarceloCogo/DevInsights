import { useEffect, useState } from "react";

type Locale = "pt-BR" | "en";

const copy = {
  "pt-BR": {
    nav: ["Produto", "Métricas", "Integrações", "Open Source", "Roadmap"],
    enter: "Entrar",
    eyebrow: "Engineering Intelligence Platform",
    title: "Engineering Intelligence para times de desenvolvimento na era da IA",
    subtitle:
      "Conecte GitHub, Azure DevOps e sinais de uso de IA para entender gargalos de entrega, saúde dos PRs, métricas DORA e evolução dos squads - sem transformar métricas em vigilância.",
    badges: [
      "Open source first",
      "GitHub-native",
      "Azure DevOps ready",
      "Privacy by design",
      "Railway-first deploy"
    ],
    ctaPrimary: "Começar agora",
    ctaSecondary: "Ver como funciona",
    ctaTertiary: "GitHub open source",
    problemTitle: "A IA acelerou o código. Mas o gargalo pode ter mudado de lugar.",
    problemSubtitle:
      "Com assistentes de IA, PRs podem ser criados mais rápido, mas isso não significa que a entrega melhorou. O gargalo pode estar em review, testes, deploy, requisitos, bugs ou retrabalho. DevInsights ajuda você a enxergar o fluxo inteiro com clareza.",
    painPoints: [
      "PRs criados mais rápido, mas reviews mais sobrecarregados",
      "Mais código, mas nem sempre mais valor entregue",
      "Bugs e retrabalho difíceis de conectar à origem",
      "Dados espalhados entre GitHub, Azure DevOps e planilhas",
      "Métricas usadas sem contexto geram ruído e ansiedade"
    ],
    metricsTitle: "O que o DevInsights mede",
    metrics: [
      "PR Cycle Time",
      "Pickup Time",
      "Review Time",
      "Reviewer Load",
      "Stale PRs",
      "Large PRs",
      "Throughput",
      "DORA Metrics",
      "AI-assisted PRs",
      "AI Review Burden",
      "Azure DevOps Work Item Flow",
      "Developer Experience"
    ],
    personasTitle: "Feito para quem lidera e melhora engenharia",
    personas: [
      ["CTO", "Visão executiva de fluxo, risco e capacidade de entrega; evidência para decisões de investimento e melhoria."],
      ["Engineering Manager", "Gargalos por squad, previsibilidade, carga de review e indicadores de melhoria contínua."],
      ["Tech Lead", "PRs parados, PRs grandes, reviewers sobrecarregados, risco técnico e retrabalho."],
      ["Platform/DevEx", "Fricções no fluxo, eficiência de ferramentas, impacto da IA e sinais de produtividade saudável."]
    ],
    integrationsTitle: "Nativo para o stack real dos times de engenharia",
    integrations: [
      ["GitHub", "PRs, reviews, commits, workflow runs, deployments e labels."],
      ["Azure DevOps", "Boards, Work Items, Epics, Features, User Stories, Tasks, Bugs e Sprints."],
      ["AI Development", "Declaração de uso de IA por PR, comparação de fluxo com e sem IA e checklist de validação humana."],
      ["Futuras integrações", "SonarQube, Sentry, Datadog, Jira e Slack/Teams."]
    ],
    dashboardTitle: "Visão de dashboards para liderança e squads",
    dashboardSubtitle:
      "Do nível executivo ao operacional, o produto organiza sinais de fluxo, qualidade e colaboração para orientar ações semanais.",
    dashboardCards: [
      ["Overview", "Panorama consolidado de fluxo, risco e evolução por período."],
      ["PR Intelligence", "Saúde de PRs, gargalos de review e distribuição de carga entre reviewers."],
      ["AI Impact", "Comparativos de ciclo, retrabalho e burden entre PRs com e sem IA."],
      ["DORA", "Deployment Frequency, Lead Time e sinais para evolução de confiabilidade."],
      ["Azure DevOps Flow", "Leitura de Work Items, filas por etapa e relação entre demanda e execução."]
    ],
    openTitle: "Open source, self-hosted e privacy by design",
    openBullets: [
      "Rode na sua própria infraestrutura",
      "Railway-first para deploy rápido",
      "Sem ranking público de desenvolvedores",
      "Métricas por time e fluxo por padrão",
      "Tokens de integração criptografados",
      "Coleta mínima de dados",
      "Transparência nos cálculos",
      "Preparado para LGPD e governança interna"
    ],
    weekTitle: "Em uma semana, você já começa a enxergar sinais acionáveis",
    weekItems: [
      "Quais PRs estão parados e por quê",
      "Quais reviewers estão virando gargalo",
      "Se PRs com IA estão acelerando ou gerando mais retrabalho",
      "Quais squads estão com maior tempo de ciclo",
      "Onde Azure DevOps mostra demanda parada antes mesmo do código",
      "Como o fluxo evolui por semana, sprint e squad"
    ],
    finalTitle: "Comece self-hosted. Evolua para SaaS quando fizer sentido.",
    finalText:
      "O DevInsights nasce open source e self-hosted first. O foco inicial é validar valor com times reais de engenharia. Planos gerenciados e recursos premium podem surgir futuramente.",
    finalCta: "Entrar na lista de pilotos"
  },
  en: {
    nav: ["Product", "Metrics", "Integrations", "Open Source", "Roadmap"],
    enter: "Sign in",
    eyebrow: "Engineering Intelligence Platform",
    title: "Engineering Intelligence for development teams in the AI era",
    subtitle:
      "Connect GitHub, Azure DevOps, and AI usage signals to understand delivery bottlenecks, PR health, DORA metrics, and squad evolution - without turning metrics into surveillance.",
    badges: [
      "Open source first",
      "GitHub-native",
      "Azure DevOps ready",
      "Privacy by design",
      "Railway-first deploy"
    ],
    ctaPrimary: "Start now",
    ctaSecondary: "See how it works",
    ctaTertiary: "GitHub open source",
    problemTitle: "AI sped up coding. But the bottleneck may have moved.",
    problemSubtitle:
      "With AI assistants, PRs can be created faster, but that does not mean delivery improved. The bottleneck may be in review, testing, deploy, requirements, bugs, or rework. DevInsights helps you see the full flow clearly.",
    painPoints: [
      "PRs are opened faster, but reviews are overloaded",
      "More code does not always mean more value delivered",
      "Bugs and rework are hard to trace to origin",
      "Data is scattered across GitHub, Azure DevOps, and spreadsheets",
      "Metrics without context create noise and anxiety"
    ],
    metricsTitle: "What DevInsights measures",
    metrics: [
      "PR Cycle Time",
      "Pickup Time",
      "Review Time",
      "Reviewer Load",
      "Stale PRs",
      "Large PRs",
      "Throughput",
      "DORA Metrics",
      "AI-assisted PRs",
      "AI Review Burden",
      "Azure DevOps Work Item Flow",
      "Developer Experience"
    ],
    personasTitle: "Built for people who lead and improve engineering",
    personas: [
      ["CTO", "Executive visibility into flow, risk, and delivery capacity; evidence for investment and improvement decisions."],
      ["Engineering Manager", "Squad bottlenecks, predictability, review load, and continuous improvement indicators."],
      ["Tech Lead", "Stuck PRs, oversized PRs, overloaded reviewers, technical risk, and rework."],
      ["Platform/DevEx", "Flow friction, tooling efficiency, AI impact, and healthy productivity signals."]
    ],
    integrationsTitle: "Native for the real engineering stack",
    integrations: [
      ["GitHub", "PRs, reviews, commits, workflow runs, deployments, and labels."],
      ["Azure DevOps", "Boards, Work Items, Epics, Features, User Stories, Tasks, Bugs, and Sprints."],
      ["AI Development", "AI usage declaration by PR, flow comparison with and without AI, and human validation checklist."],
      ["Future integrations", "SonarQube, Sentry, Datadog, Jira, and Slack/Teams."]
    ],
    dashboardTitle: "Dashboard views for leadership and squads",
    dashboardSubtitle:
      "From executive to operational levels, the product organizes flow, quality, and collaboration signals to guide weekly actions.",
    dashboardCards: [
      ["Overview", "Consolidated view of flow, risk, and progress over time."],
      ["PR Intelligence", "PR health, review bottlenecks, and reviewer load distribution."],
      ["AI Impact", "Cycle time, rework, and burden comparisons across AI and non-AI PRs."],
      ["DORA", "Deployment Frequency, Lead Time, and reliability improvement signals."],
      ["Azure DevOps Flow", "Work Item flow, stage queues, and demand-to-execution relation."]
    ],
    openTitle: "Open source, self-hosted, and privacy by design",
    openBullets: [
      "Run on your own infrastructure",
      "Railway-first for fast deployment",
      "No public developer ranking",
      "Team-level metrics and flow by default",
      "Encrypted integration tokens",
      "Minimal data collection",
      "Transparent calculations",
      "Prepared for governance and compliance"
    ],
    weekTitle: "In one week, you can already see actionable signals",
    weekItems: [
      "Which PRs are stuck and why",
      "Which reviewers are becoming bottlenecks",
      "Whether AI-assisted PRs are accelerating or creating more rework",
      "Which squads have the highest cycle times",
      "Where Azure DevOps reveals stalled demand before coding starts",
      "How flow evolves by week, sprint, and squad"
    ],
    finalTitle: "Start self-hosted. Evolve to SaaS when it makes sense.",
    finalText:
      "DevInsights starts as open source and self-hosted first. The initial focus is to validate value with real engineering teams. Managed plans and premium features may come later.",
    finalCta: "Join the pilot list"
  }
} as const;

function SectionTitle({ id, title, subtitle }: { id: string; title: string; subtitle?: string }) {
  return (
    <header id={id} className="mx-auto mb-8 max-w-4xl text-center md:mb-10">
      <h2 className="text-2xl font-bold tracking-tight text-text md:text-4xl">{title}</h2>
      {subtitle ? <p className="mt-3 text-sm leading-7 text-muted md:text-base">{subtitle}</p> : null}
    </header>
  );
}

export function LandingPage() {
  const [locale, setLocale] = useState<Locale>("pt-BR");

  useEffect(() => {
    const saved = localStorage.getItem("devinsights.locale") as Locale | null;
    if (saved === "pt-BR" || saved === "en") {
      setLocale(saved);
      return;
    }

    const browserLocale = navigator.language.toLowerCase();
    const detected: Locale = browserLocale.startsWith("pt") ? "pt-BR" : "en";
    setLocale(detected);
    localStorage.setItem("devinsights.locale", detected);
  }, []);

  const t = copy[locale];
  const setLang = (next: Locale) => {
    setLocale(next);
    localStorage.setItem("devinsights.locale", next);
  };

  return (
    <div className="min-h-screen bg-ink text-text">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_85%_0%,rgba(40,215,164,0.16),transparent_45%),radial-gradient(circle_at_5%_25%,rgba(34,184,240,0.12),transparent_35%)]" />
      <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-5 md:px-8">
        <nav className="sticky top-4 z-20 rounded-2xl border border-line bg-panel/80 px-4 py-3 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <a href="#" className="text-lg font-bold tracking-wide text-text">
              DevInsights
            </a>
            <ul className="hidden items-center gap-5 text-sm text-muted md:flex">
              <li><a href="#produto" className="hover:text-text">{t.nav[0]}</a></li>
              <li><a href="#metricas" className="hover:text-text">{t.nav[1]}</a></li>
              <li><a href="#integracoes" className="hover:text-text">{t.nav[2]}</a></li>
              <li><a href="#opensource" className="hover:text-text">{t.nav[3]}</a></li>
              <li><a href="#roadmap" className="hover:text-text">{t.nav[4]}</a></li>
            </ul>
            <div className="flex items-center gap-2">
              <div className="rounded-full border border-line p-1 text-xs">
                <button type="button" onClick={() => setLang("pt-BR")} className={`rounded-full px-2 py-1 ${locale === "pt-BR" ? "bg-panelSoft text-text" : "text-muted"}`} aria-label="Mudar idioma para português">PT</button>
                <button type="button" onClick={() => setLang("en")} className={`rounded-full px-2 py-1 ${locale === "en" ? "bg-panelSoft text-text" : "text-muted"}`} aria-label="Switch language to English">EN</button>
              </div>
              <a href="/app/login" className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-text hover:bg-panelSoft focus:outline-none focus:ring-2 focus:ring-cyan">
                {t.enter}
              </a>
            </div>
          </div>
        </nav>

        <section id="produto" className="pt-12 md:pt-16">
          <p className="text-xs uppercase tracking-[0.18em] text-accent">{t.eyebrow}</p>
          <h1 className="mt-4 max-w-4xl text-3xl font-extrabold leading-tight md:text-6xl">{t.title}</h1>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-muted md:text-lg">{t.subtitle}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {t.badges.map((badge) => (
              <span key={badge} className="rounded-full border border-line bg-panelSoft px-3 py-1 text-xs text-muted">{badge}</span>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="/app/login" className="rounded-full bg-accent px-6 py-3 text-sm font-bold text-ink hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-accent">{t.ctaPrimary}</a>
            <a href="#dashboard" className="rounded-full border border-line px-6 py-3 text-sm font-bold text-text hover:bg-panelSoft focus:outline-none focus:ring-2 focus:ring-cyan">{t.ctaSecondary}</a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="self-center text-sm text-muted underline decoration-line underline-offset-4 hover:text-text">{t.ctaTertiary}</a>
          </div>
        </section>

        <section className="mt-20">
          <SectionTitle id="problema" title={t.problemTitle} subtitle={t.problemSubtitle} />
          <div className="grid gap-3 md:grid-cols-5">
            {t.painPoints.map((item) => (
              <article key={item} className="rounded-xl border border-line bg-panel p-4 text-sm leading-6 text-muted">{item}</article>
            ))}
          </div>
        </section>

        <section className="mt-20" id="metricas">
          <SectionTitle title={t.metricsTitle} id="metricasTitle" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {t.metrics.map((item) => (
              <article key={item} className="rounded-xl border border-line bg-panel p-4 text-sm font-semibold text-text">{item}</article>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <SectionTitle id="personas" title={t.personasTitle} />
          <div className="grid gap-3 md:grid-cols-2">
            {t.personas.map(([role, desc]) => (
              <article key={role} className="rounded-xl border border-line bg-panel p-5">
                <h3 className="text-lg font-bold">{role}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-20" id="integracoes">
          <SectionTitle id="integracoesTitle" title={t.integrationsTitle} />
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {t.integrations.map(([title, desc]) => (
              <article key={title} className="rounded-xl border border-line bg-panel p-5">
                <h3 className="font-bold">{title}</h3>
                <p className="mt-2 text-sm text-muted">{desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="dashboard" className="mt-20">
          <SectionTitle id="dashboardTitle" title={t.dashboardTitle} subtitle={t.dashboardSubtitle} />
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {t.dashboardCards.map(([title, desc]) => (
              <article key={title} className="rounded-xl border border-line bg-panel p-5">
                <h3 className="font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="opensource" className="mt-20 rounded-2xl border border-line bg-panel p-6 md:p-8">
          <SectionTitle id="openSourceTitle" title={t.openTitle} />
          <ul className="grid list-disc gap-2 pl-5 text-sm leading-7 text-muted md:grid-cols-2">
            {t.openBullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="mt-20">
          <SectionTitle id="sinais" title={t.weekTitle} />
          <div className="grid gap-3 md:grid-cols-2">
            {t.weekItems.map((item) => (
              <article key={item} className="rounded-xl border border-line bg-panel p-4 text-sm text-muted">{item}</article>
            ))}
          </div>
        </section>

        <section id="roadmap" className="mt-20 rounded-2xl border border-line bg-panel p-7 text-center">
          <h2 className="text-2xl font-bold md:text-3xl">{t.finalTitle}</h2>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-muted md:text-base">{t.finalText}</p>
          <a href="/app/login" className="mt-6 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-bold text-ink hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-accent">{t.finalCta}</a>
        </section>
      </div>
    </div>
  );
}
