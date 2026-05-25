import { useEffect, useState } from "react";

type Locale = "pt-BR" | "en";

const copy = {
  "pt-BR": {
    nav: ["Produto", "Problema", "Métricas", "Público"],
    enter: "Entrar",
    eyebrow: "Engineering Intelligence Platform",
    title: "Visibilidade executiva para engenharia de software",
    subtitle:
      "DevInsights transforma dados do GitHub e Azure DevOps em indicadores sobre fluxo, gargalos, produtividade e saúde da engenharia.",
    support: "Conecte seu GitHub e veja os primeiros sinais do seu fluxo.",
    ctaPrimary: "Começar com GitHub",
    problemTitle: "A engenharia gera muitos dados, mas poucos viram decisão",
    problemPoints: [
      "PRs parados sem visibilidade no momento certo",
      "Gargalos invisíveis entre squads e repositórios",
      "Baixa previsibilidade para liderança",
      "Dados espalhados entre ferramentas",
      "Dificuldade para explicar capacidade à diretoria"
    ],
    solutionTitle: "Camada de inteligência sobre o fluxo de desenvolvimento",
    solutionCards: [
      ["Fluxo de entrega", "Lead time, cycle time, review e bloqueios com leitura acionável."],
      ["Produtividade com contexto", "Sinais de capacidade sem vigilância individual."],
      ["Saúde dos repositórios", "Risco técnico, manutenção e acúmulo de débito."],
      ["Visão executiva", "Comparativos entre times e tendências para decisões." ]
    ],
    metricsTitle: "Métricas essenciais",
    metrics: [
      "Lead Time",
      "Cycle Time",
      "Tempo de Review",
      "PRs parados",
      "DORA Metrics",
      "Saúde dos repositórios",
      "Capacidade por squad",
      "Distribuição de carga",
      "Tendências executivas"
    ],
    personasTitle: "Para quem lidera engenharia com dados",
    personas: [
      ["CTO", "Visão executiva de capacidade, risco e previsibilidade."],
      ["Head de Engenharia", "Comparativos entre times e gargalos sistêmicos."],
      ["Tech Lead", "Fluxo de PRs, review load e bloqueios técnicos."],
      ["Produto/Ops", "Planejamento com capacidade real de entrega."]
    ],
    finalTitle: "Comece medindo o fluxo real da sua engenharia",
    finalText: "Comece com GitHub e acompanhe os primeiros insights de produtividade.",
    finalCta: "Entrar na lista de espera"
  },
  en: {
    nav: ["Product", "Problem", "Metrics", "Audience"],
    enter: "Sign in",
    eyebrow: "Engineering Intelligence Platform",
    title: "Executive visibility for software engineering",
    subtitle:
      "DevInsights turns GitHub and Azure DevOps data into indicators for flow, bottlenecks, productivity, and engineering health.",
    support: "Connect your GitHub and see the first signals from your flow.",
    ctaPrimary: "Start with GitHub",
    problemTitle: "Engineering generates a lot of data, but little becomes decisions",
    problemPoints: [
      "Stuck PRs without timely visibility",
      "Invisible bottlenecks across squads and repositories",
      "Low predictability for leadership",
      "Data spread across multiple tools",
      "Hard to explain capacity to executives"
    ],
    solutionTitle: "An intelligence layer for development flow",
    solutionCards: [
      ["Delivery flow", "Lead time, cycle time, review, and blockers in one actionable view."],
      ["Contextual productivity", "Capacity signals without individual surveillance."],
      ["Repository health", "Technical risk, maintenance, and debt accumulation."],
      ["Executive visibility", "Cross-team comparisons and trends for decisions."]
    ],
    metricsTitle: "Core metrics",
    metrics: [
      "Lead Time",
      "Cycle Time",
      "Review Time",
      "Stuck PRs",
      "DORA Metrics",
      "Repository health",
      "Squad capacity",
      "Workload distribution",
      "Executive trends"
    ],
    personasTitle: "Built for engineering leadership",
    personas: [
      ["CTO", "Executive view of capacity, risk, and predictability."],
      ["Head of Engineering", "Cross-team comparison and systemic bottlenecks."],
      ["Tech Lead", "PR flow, review load, and technical blockers."],
      ["Product/Ops", "Planning with real delivery capacity."]
    ],
    finalTitle: "Start measuring your real engineering flow",
    finalText: "Start with GitHub and review your first productivity insights.",
    finalCta: "Join waitlist"
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
    const detected: Locale = navigator.language.toLowerCase().startsWith("pt") ? "pt-BR" : "en";
    setLocale(detected);
    localStorage.setItem("devinsights.locale", detected);
  }, []);

  const t = copy[locale];

  return (
    <div className="min-h-screen bg-ink text-text">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_85%_0%,rgba(40,215,164,0.16),transparent_45%),radial-gradient(circle_at_5%_25%,rgba(34,184,240,0.12),transparent_35%)]" />
      <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-5 md:px-8">
        <nav className="sticky top-4 z-20 rounded-2xl border border-line bg-panel/80 px-4 py-3 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <a href="#" className="text-lg font-bold tracking-wide text-text">DevInsights</a>
            <ul className="hidden items-center gap-5 text-sm text-muted md:flex">
              <li><a href="#produto" className="hover:text-text">{t.nav[0]}</a></li>
              <li><a href="#problema" className="hover:text-text">{t.nav[1]}</a></li>
              <li><a href="#metricas" className="hover:text-text">{t.nav[2]}</a></li>
              <li><a href="#publico" className="hover:text-text">{t.nav[3]}</a></li>
            </ul>
            <div className="flex items-center gap-2">
              <div className="rounded-full border border-line p-1 text-xs">
                <button type="button" onClick={() => { setLocale("pt-BR"); localStorage.setItem("devinsights.locale", "pt-BR"); }} className={`rounded-full px-2 py-1 ${locale === "pt-BR" ? "bg-panelSoft text-text" : "text-muted"}`}>PT</button>
                <button type="button" onClick={() => { setLocale("en"); localStorage.setItem("devinsights.locale", "en"); }} className={`rounded-full px-2 py-1 ${locale === "en" ? "bg-panelSoft text-text" : "text-muted"}`}>EN</button>
              </div>
              <a href="/app/login" className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-text hover:bg-panelSoft">{t.enter}</a>
            </div>
          </div>
        </nav>

        <section id="produto" className="pt-12 md:pt-16">
          <p className="text-xs uppercase tracking-[0.18em] text-accent">{t.eyebrow}</p>
          <h1 className="mt-4 max-w-4xl text-3xl font-extrabold leading-tight md:text-6xl">{t.title}</h1>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-muted md:text-lg">{t.subtitle}</p>
          <p className="mt-6 inline-flex rounded-full border border-accent/50 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent">{t.support}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="/app/login" className="rounded-full bg-accent px-6 py-3 text-sm font-bold text-ink hover:brightness-110">{t.ctaPrimary}</a>
          </div>
        </section>

        <section className="mt-20" id="problema">
          <SectionTitle id="problemaTitle" title={t.problemTitle} />
          <div className="grid gap-3 md:grid-cols-5">
            {t.problemPoints.map((item) => (
              <article key={item} className="rounded-xl border border-line bg-panel p-4 text-sm leading-6 text-muted">{item}</article>
            ))}
          </div>
        </section>

        <section className="mt-20" id="solucao">
          <SectionTitle id="solucaoTitle" title={t.solutionTitle} />
          <div className="grid gap-3 md:grid-cols-2">
            {t.solutionCards.map(([title, desc]) => (
              <article key={title} className="rounded-xl border border-line bg-panel p-5">
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-20" id="metricas">
          <SectionTitle id="metricasTitle" title={t.metricsTitle} />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {t.metrics.map((item) => (
              <article key={item} className="rounded-xl border border-line bg-panel p-4 text-sm font-semibold text-text">{item}</article>
            ))}
          </div>
        </section>

        <section className="mt-20" id="publico">
          <SectionTitle id="publicoTitle" title={t.personasTitle} />
          <div className="grid gap-3 md:grid-cols-2">
            {t.personas.map(([role, desc]) => (
              <article key={role} className="rounded-xl border border-line bg-panel p-5">
                <h3 className="text-lg font-bold">{role}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-20 rounded-2xl border border-line bg-panel p-7 text-center">
          <h2 className="text-2xl font-bold md:text-3xl">{t.finalTitle}</h2>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-muted md:text-base">{t.finalText}</p>
          <a href="/app/login" className="mt-6 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-bold text-ink hover:brightness-110">{t.finalCta}</a>
        </section>
      </div>
    </div>
  );
}
