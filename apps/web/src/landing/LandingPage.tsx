import { useEffect, useState } from "react";

type Locale = "pt-BR" | "en";

const copy = {
  "pt-BR": {
    nav: ["Problema", "Solucao", "Open Source vs SaaS", "Metricas", "Publico"],
    signIn: "Entrar",
    heroTitle: "Visibilidade executiva para engenharia de software",
    heroSubtitle:
      "DevInsights transforma dados do GitHub e Azure DevOps em indicadores sobre fluxo, gargalos, produtividade e saude da engenharia.",
    heroSupport: "Open source para comecar. SaaS para escalar.",
    ctaDemo: "Ver demonstracao",
    ctaOss: "Comecar com Open Source",
    problemTitle: "Sua engenharia gera dados o tempo todo. Poucos viram decisao.",
    problemSubtitle:
      "Sem uma camada de inteligencia, lideranca e times operam com visibilidade parcial e baixa previsibilidade.",
    pains: [
      "PRs parados sem alerta no momento certo",
      "Gargalos invisiveis entre squads e repositorios",
      "Baixa previsibilidade de entrega para diretoria",
      "Dados espalhados em GitHub, Azure DevOps e planilhas",
      "Dificuldade de comparar capacidade entre times",
      "Falta de narrativa executiva baseada em dados"
    ],
    solutionTitle: "Uma camada de inteligencia sobre o fluxo de desenvolvimento",
    solutionCards: [
      ["Fluxo de entrega", "Lead time, cycle time, tempo de review e PRs parados em uma visao acionavel."],
      ["Produtividade com contexto", "Leitura de capacidade sem vigilancia individual e com foco em melhoria continua."],
      ["Saude dos repositorios", "Sinais de risco tecnico, manutencao e concentracao de problemas criticos."],
      ["Visao executiva", "Comparativos, tendencias e indicadores para decisoes de lideranca."]
    ],
    osTitle: "Open source para comecar. SaaS para escalar.",
    osText:
      "A edicao open source permite validar valor rapidamente, com baixo atrito e usando dados reais do seu fluxo. Quando a operacao cresce, o SaaS vira o caminho natural para governanca, escala e eficiencia operacional.",
    compareTitle: "Comparativo de evolucao",
    audienceTitle: "Para quem precisa decidir e melhorar engenharia",
    audience: [
      ["CTOs", "Visao executiva de capacidade, risco e previsibilidade de entrega."],
      ["Heads de Engenharia", "Comparativos entre times, gargalos sistemicos e evolucao de performance."],
      ["Tech Leads", "Visibilidade de PRs, review load, bloqueios tecnicos e saude do fluxo."],
      ["Produto/Operacoes", "Leitura de capacidade real para planejamento e alinhamento com negocio."]
    ],
    metricsTitle: "Metricas que conectam engenharia e decisao",
    metricGroups: [
      ["Fluxo", "Lead time, cycle time, tempo de review, PRs parados"],
      ["Saude", "Repositorios criticos, baixa manutencao, acumulo tecnico"],
      ["Gestao", "Capacidade por squad, distribuicao de carga, evolucao da produtividade"],
      ["Executivo", "Tendencias, comparativos entre times, relatorios para lideranca"]
    ],
    saasTitle: "Quando a engenharia escala, o SaaS vira o proximo passo",
    saasFeatures: [
      "Multi-organizacao",
      "Gestao de usuarios e permissoes",
      "SSO",
      "Dashboards executivos",
      "Alertas de gargalo",
      "Recomendacoes com IA",
      "Relatorios recorrentes",
      "Suporte e implantacao assistida",
      "Governanca de metricas",
      "Integracoes avancadas"
    ],
    finalTitle: "Comece medindo o fluxo real da sua engenharia",
    finalText: "Valide com a edicao open source. Escale com o DevInsights SaaS.",
    ctaWaitlist: "Entrar na lista de espera"
  },
  en: {
    nav: ["Problem", "Solution", "Open Source vs SaaS", "Metrics", "Audience"],
    signIn: "Sign in",
    heroTitle: "Executive visibility for software engineering",
    heroSubtitle:
      "DevInsights turns GitHub and Azure DevOps data into indicators for flow, bottlenecks, productivity, and engineering health.",
    heroSupport: "Open source to start. SaaS to scale.",
    ctaDemo: "Watch demo",
    ctaOss: "Start with Open Source",
    problemTitle: "Your engineering team generates data every day. Few become decisions.",
    problemSubtitle:
      "Without an intelligence layer, leadership and teams operate with partial visibility and low predictability.",
    pains: [
      "Stuck PRs without timely alerts",
      "Invisible bottlenecks across squads and repositories",
      "Low delivery predictability for leadership",
      "Data scattered across GitHub, Azure DevOps, and spreadsheets",
      "Hard to compare capacity across teams",
      "No executive narrative backed by data"
    ],
    solutionTitle: "An intelligence layer for your development flow",
    solutionCards: [
      ["Delivery flow", "Lead time, cycle time, review time, and stuck PRs in one actionable view."],
      ["Contextual productivity", "Capacity visibility without individual surveillance, focused on continuous improvement."],
      ["Repository health", "Signals for technical risk, maintenance gaps, and concentration of critical issues."],
      ["Executive view", "Comparisons, trends, and leadership-ready indicators for better decisions."]
    ],
    osTitle: "Open source to start. SaaS to scale.",
    osText:
      "The open-source edition helps teams validate value quickly with low friction and real data. As operations grow, SaaS becomes the natural next step for governance, scale, and operational efficiency.",
    compareTitle: "Evolution comparison",
    audienceTitle: "Built for teams that need to lead with data",
    audience: [
      ["CTOs", "Executive visibility into capacity, risk, and delivery predictability."],
      ["Heads of Engineering", "Cross-team comparisons, systemic bottlenecks, and performance evolution."],
      ["Tech Leads", "PR visibility, review load, technical blockers, and flow health."],
      ["Product/Ops", "Real capacity insights for planning and business alignment."]
    ],
    metricsTitle: "Metrics that connect engineering and decisions",
    metricGroups: [
      ["Flow", "Lead time, cycle time, review time, stuck PRs"],
      ["Health", "Critical repositories, low maintenance, technical backlog"],
      ["Management", "Squad capacity, workload distribution, productivity trends"],
      ["Executive", "Trends, team comparisons, leadership reports"]
    ],
    saasTitle: "When engineering scales, SaaS becomes the next step",
    saasFeatures: [
      "Multi-organization",
      "User and permission management",
      "SSO",
      "Executive dashboards",
      "Bottleneck alerts",
      "AI recommendations",
      "Recurring reports",
      "Support and assisted rollout",
      "Metrics governance",
      "Advanced integrations"
    ],
    finalTitle: "Start measuring your real engineering flow",
    finalText: "Validate with open source. Scale with DevInsights SaaS.",
    ctaWaitlist: "Join waitlist"
  }
} as const;

const compareRows = {
  "pt-BR": [
    ["Adoção", "Adoção inicial", "Escala corporativa"],
    ["Escopo", "Uso por time ou repositorio", "Multiplos times e organizacoes"],
    ["Dashboards", "Dashboards essenciais", "Dashboards executivos avancados"],
    ["Infra", "Instalacao propria", "Ambiente gerenciado"],
    ["Onboarding", "Configuracao manual", "Onboarding assistido"],
    ["Inteligencia", "Metricas basicas", "Insights, alertas e automacoes"],
    ["Melhor uso", "Ideal para validacao", "Ideal para operacao continua"]
  ],
  en: [
    ["Adoption", "Initial adoption", "Enterprise scale"],
    ["Scope", "Team or repository usage", "Multiple teams and organizations"],
    ["Dashboards", "Essential dashboards", "Advanced executive dashboards"],
    ["Infrastructure", "Self-hosted setup", "Managed environment"],
    ["Onboarding", "Manual setup", "Assisted onboarding"],
    ["Intelligence", "Core metrics", "Insights, alerts, and automations"],
    ["Best fit", "Ideal for validation", "Ideal for continuous operations"]
  ]
} as const;

function Section({ id, title, subtitle }: { id: string; title: string; subtitle?: string }) {
  return (
    <header id={id} className="mb-8">
      <h2 className="text-2xl font-bold tracking-tight text-text md:text-4xl">{title}</h2>
      {subtitle ? <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">{subtitle}</p> : null}
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
    const detected: Locale = navigator.language.toLowerCase().startsWith("pt") ? "pt-BR" : "en";
    setLocale(detected);
    localStorage.setItem("devinsights.locale", detected);
  }, []);

  const t = copy[locale];

  return (
    <div className="min-h-screen bg-ink text-text">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_90%_0%,rgba(40,215,164,0.14),transparent_42%),radial-gradient(circle_at_0%_20%,rgba(34,184,240,0.1),transparent_35%)]" />
      <div className="relative mx-auto w-full max-w-7xl px-5 pb-24 pt-6 md:px-8">
        <nav className="sticky top-4 z-30 rounded-2xl border border-line bg-panel/85 px-4 py-3 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <a href="#" className="text-lg font-bold">DevInsights</a>
            <ul className="hidden items-center gap-5 text-sm text-muted md:flex">
              <li><a href="#problema" className="hover:text-text">{t.nav[0]}</a></li>
              <li><a href="#solucao" className="hover:text-text">{t.nav[1]}</a></li>
              <li><a href="#compare" className="hover:text-text">{t.nav[2]}</a></li>
              <li><a href="#metricas" className="hover:text-text">{t.nav[3]}</a></li>
              <li><a href="#publico" className="hover:text-text">{t.nav[4]}</a></li>
            </ul>
            <div className="flex items-center gap-2">
              <div className="rounded-full border border-line p-1 text-xs">
                <button type="button" onClick={() => { setLocale("pt-BR"); localStorage.setItem("devinsights.locale", "pt-BR"); }} className={`rounded-full px-2 py-1 ${locale === "pt-BR" ? "bg-panelSoft text-text" : "text-muted"}`}>PT</button>
                <button type="button" onClick={() => { setLocale("en"); localStorage.setItem("devinsights.locale", "en"); }} className={`rounded-full px-2 py-1 ${locale === "en" ? "bg-panelSoft text-text" : "text-muted"}`}>EN</button>
              </div>
              <a href="/app/login" className="rounded-full border border-line px-4 py-2 text-sm font-semibold hover:bg-panelSoft">{t.signIn}</a>
            </div>
          </div>
        </nav>

        <section className="pt-14 md:pt-20">
          <h1 className="max-w-4xl text-4xl font-extrabold leading-tight md:text-6xl">{t.heroTitle}</h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-muted md:text-lg">{t.heroSubtitle}</p>
          <p className="mt-6 inline-flex rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent">
            {t.heroSupport}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#solucao" className="rounded-full border border-line px-6 py-3 text-sm font-bold hover:bg-panelSoft">{t.ctaDemo}</a>
            <a href="/app/login" className="rounded-full bg-accent px-6 py-3 text-sm font-bold text-ink hover:brightness-110">{t.ctaOss}</a>
          </div>
        </section>

        <section id="problema" className="mt-24">
          <Section id="problema-head" title={t.problemTitle} subtitle={t.problemSubtitle} />
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {t.pains.map((item) => (
              <article key={item} className="rounded-xl border border-line bg-panel p-4 text-sm leading-6 text-muted">{item}</article>
            ))}
          </div>
        </section>

        <section id="solucao" className="mt-24">
          <Section id="solucao-head" title={t.solutionTitle} />
          <div className="grid gap-4 md:grid-cols-2">
            {t.solutionCards.map(([title, desc]) => (
              <article key={title} className="rounded-2xl border border-line bg-panel p-6">
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted">{desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="opensource" className="mt-24 rounded-2xl border border-line bg-panel p-7 md:p-9">
          <h2 className="text-2xl font-bold md:text-3xl">{t.osTitle}</h2>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-muted md:text-base">{t.osText}</p>
        </section>

        <section id="compare" className="mt-20">
          <Section id="compare-head" title={t.compareTitle} />
          <div className="overflow-x-auto rounded-2xl border border-line bg-panel">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-panelSoft/60 text-xs uppercase tracking-[0.08em] text-muted">
                <tr>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Open Source</th>
                  <th className="px-4 py-3">SaaS</th>
                </tr>
              </thead>
              <tbody>
                {compareRows[locale].map(([label, oss, saas]) => (
                  <tr key={label} className="border-t border-line/60">
                    <td className="px-4 py-3 font-semibold text-text">{label}</td>
                    <td className="px-4 py-3 text-muted">{oss}</td>
                    <td className="px-4 py-3 text-muted">{saas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="publico" className="mt-24">
          <Section id="publico-head" title={t.audienceTitle} />
          <div className="grid gap-4 md:grid-cols-2">
            {t.audience.map(([title, desc]) => (
              <article key={title} className="rounded-xl border border-line bg-panel p-5">
                <h3 className="font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted">{desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="metricas" className="mt-24">
          <Section id="metricas-head" title={t.metricsTitle} />
          <div className="grid gap-4 md:grid-cols-2">
            {t.metricGroups.map(([title, desc]) => (
              <article key={title} className="rounded-xl border border-line bg-panel p-5">
                <h3 className="font-bold">{title}</h3>
                <p className="mt-2 text-sm text-muted">{desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-24 rounded-2xl border border-line bg-panel p-7 md:p-9">
          <h2 className="text-2xl font-bold md:text-3xl">{t.saasTitle}</h2>
          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {t.saasFeatures.map((feature) => (
              <div key={feature} className="rounded-lg border border-line bg-panelSoft/30 px-3 py-2 text-sm text-muted">{feature}</div>
            ))}
          </div>
        </section>

        <section className="mt-24 rounded-2xl border border-line bg-gradient-to-r from-panel to-panelSoft p-8 text-center md:p-10">
          <h2 className="text-3xl font-bold">{t.finalTitle}</h2>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-muted md:text-base">{t.finalText}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href="#solucao" className="rounded-full border border-line px-6 py-3 text-sm font-bold hover:bg-panel">{t.ctaDemo}</a>
            <a href="#opensource" className="rounded-full border border-line px-6 py-3 text-sm font-bold hover:bg-panel">{t.ctaWaitlist}</a>
            <a href="/app/login" className="rounded-full bg-accent px-6 py-3 text-sm font-bold text-ink hover:brightness-110">{t.ctaOss}</a>
          </div>
        </section>
      </div>
    </div>
  );
}
