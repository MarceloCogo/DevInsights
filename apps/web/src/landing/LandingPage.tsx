import { badges, metrics, painPoints } from "./data";

function SectionTitle({ id, title, subtitle }: { id: string; title: string; subtitle?: string }) {
  return (
    <header id={id} className="mx-auto mb-8 max-w-4xl text-center md:mb-10">
      <h2 className="text-2xl font-bold tracking-tight text-text md:text-4xl">{title}</h2>
      {subtitle ? <p className="mt-3 text-sm leading-7 text-muted md:text-base">{subtitle}</p> : null}
    </header>
  );
}

function DashboardMock() {
  const tabs = ["Overview", "PR Intelligence", "AI Impact", "DORA", "Azure DevOps Flow"];
  const cards = [
    ["Cycle Time", "2.4 dias"],
    ["Pickup Time", "6.2 horas"],
    ["Review Time", "1.1 dias"],
    ["Reviewer Load", "6.1 PRs/reviewer"],
    ["AI Assisted PRs", "43%"],
    ["Stale PRs", "8"],
    ["Deploy Frequency", "14/semana"],
    ["Work Items Completed", "38"]
  ];

  return (
    <div className="rounded-2xl border border-line bg-panel p-4 shadow-glow md:p-6">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab, idx) => (
          <button
            type="button"
            key={tab}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${idx === 0 ? "bg-accent text-ink" : "bg-panelSoft text-muted"}`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        {cards.map(([label, value]) => (
          <article key={label} className="rounded-xl border border-line bg-ink/40 p-3">
            <p className="text-xs text-muted">{label}</p>
            <p className="mt-1 text-sm font-bold text-text">{value}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

export function LandingPage() {
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
              <li><a href="#produto" className="hover:text-text">Produto</a></li>
              <li><a href="#metricas" className="hover:text-text">Metricas</a></li>
              <li><a href="#integracoes" className="hover:text-text">Integracoes</a></li>
              <li><a href="#opensource" className="hover:text-text">Open Source</a></li>
              <li><a href="#roadmap" className="hover:text-text">Roadmap</a></li>
            </ul>
            <a href="/app/login" className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-text hover:bg-panelSoft focus:outline-none focus:ring-2 focus:ring-cyan">
              Entrar
            </a>
          </div>
        </nav>

        <section id="produto" className="pt-12 md:pt-16">
          <p className="text-xs uppercase tracking-[0.18em] text-accent">Engineering Intelligence Platform</p>
          <h1 className="mt-4 max-w-4xl text-3xl font-extrabold leading-tight md:text-6xl">
            Engineering Intelligence para times de desenvolvimento na era da IA
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-muted md:text-lg">
            Conecte GitHub, Azure DevOps e sinais de uso de IA para entender gargalos de entrega, saude dos
            PRs, metricas DORA e evolucao dos squads - sem transformar metricas em vigilancia.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {badges.map((badge) => (
              <span key={badge} className="rounded-full border border-line bg-panelSoft px-3 py-1 text-xs text-muted">
                {badge}
              </span>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="/app/login" className="rounded-full bg-accent px-6 py-3 text-sm font-bold text-ink hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-accent">
              Comecar agora
            </a>
            <a href="#dashboard" className="rounded-full border border-line px-6 py-3 text-sm font-bold text-text hover:bg-panelSoft focus:outline-none focus:ring-2 focus:ring-cyan">
              Ver como funciona
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="self-center text-sm text-muted underline decoration-line underline-offset-4 hover:text-text">
              GitHub open source
            </a>
          </div>
          <div className="mt-10">
            <DashboardMock />
          </div>
        </section>

        <section className="mt-20">
          <SectionTitle
            id="problema"
            title="A IA acelerou o codigo. Mas o gargalo pode ter mudado de lugar."
            subtitle="Com assistentes de IA, PRs podem ser criados mais rapido, mas isso nao significa que a entrega melhorou. O gargalo pode estar em review, testes, deploy, requisitos, bugs ou retrabalho. DevInsights ajuda voce a enxergar o fluxo inteiro com clareza."
          />
          <div className="grid gap-3 md:grid-cols-5">
            {painPoints.map((item) => (
              <article key={item} className="rounded-xl border border-line bg-panel p-4 text-sm leading-6 text-muted">
                {item}
              </article>
            ))}
          </div>
        </section>

        <section className="mt-20" id="metricas">
          <SectionTitle title="O que o DevInsights mede" id="metricasTitle" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((item) => (
              <article key={item} className="rounded-xl border border-line bg-panel p-4 text-sm font-semibold text-text">
                {item}
              </article>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <SectionTitle id="personas" title="Feito para quem lidera e melhora engenharia" />
          <div className="grid gap-3 md:grid-cols-2">
            {[
              ["CTO", "visao executiva de fluxo, risco e capacidade de entrega; evidencia para decisoes de investimento e melhoria."],
              ["Engineering Manager", "gargalos por squad; previsibilidade; carga de review; indicadores de melhoria continua."],
              ["Tech Lead", "PRs parados; PRs grandes; reviewers sobrecarregados; risco tecnico e retrabalho."],
              ["Platform/DevEx", "friccoes no fluxo; eficiencia de ferramentas; impacto da IA; sinais de produtividade saudavel."]
            ].map(([role, desc]) => (
              <article key={role} className="rounded-xl border border-line bg-panel p-5">
                <h3 className="text-lg font-bold">{role}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-20" id="integracoes">
          <SectionTitle id="integracoesTitle" title="Nativo para o stack real dos times de engenharia" />
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <article className="rounded-xl border border-line bg-panel p-5"><h3 className="font-bold">GitHub</h3><p className="mt-2 text-sm text-muted">PRs, reviews, commits, workflow runs, deployments e labels.</p></article>
            <article className="rounded-xl border border-line bg-panel p-5"><h3 className="font-bold">Azure DevOps</h3><p className="mt-2 text-sm text-muted">Boards, Work Items, Epics, Features, User Stories, Tasks, Bugs e Sprints.</p></article>
            <article className="rounded-xl border border-line bg-panel p-5"><h3 className="font-bold">AI Development</h3><p className="mt-2 text-sm text-muted">declaracao de uso de IA por PR; comparacao de fluxo com e sem IA; checklist de validacao humana.</p></article>
            <article className="rounded-xl border border-line bg-panel p-5"><h3 className="font-bold">Futuras integracoes</h3><p className="mt-2 text-sm text-muted">SonarQube, Sentry, Datadog, Jira, Slack/Teams.</p></article>
          </div>
        </section>

        <section id="dashboard" className="mt-20">
          <SectionTitle id="dashboardTitle" title="Dashboard de Engineering Intelligence" subtitle="Visibilidade em nivel executivo e operacional para agir com contexto, nao por intuicao." />
          <DashboardMock />
        </section>

        <section id="opensource" className="mt-20 rounded-2xl border border-line bg-panel p-6 md:p-8">
          <SectionTitle id="openSourceTitle" title="Open source, self-hosted e privacy by design" />
          <ul className="grid list-disc gap-2 pl-5 text-sm leading-7 text-muted md:grid-cols-2">
            <li>Rode na sua propria infraestrutura</li>
            <li>Railway-first para deploy rapido</li>
            <li>Sem ranking publico de desenvolvedores</li>
            <li>Metricas por time e fluxo por padrao</li>
            <li>Tokens de integracao criptografados</li>
            <li>Coleta minima de dados</li>
            <li>Transparencia nos calculos</li>
            <li>Preparado para LGPD e governanca interna</li>
          </ul>
        </section>

        <section className="mt-20">
          <SectionTitle id="sinais" title="Em uma semana, voce ja comeca a enxergar sinais acionaveis" />
          <div className="grid gap-3 md:grid-cols-2">
            {[
              "Quais PRs estao parados e por que",
              "Quais reviewers estao virando gargalo",
              "Se PRs com IA estao acelerando ou gerando mais retrabalho",
              "Quais squads estao com maior tempo de ciclo",
              "Onde Azure DevOps mostra demanda parada antes mesmo do codigo",
              "Como o fluxo evolui por semana, sprint e squad"
            ].map((item) => (
              <article key={item} className="rounded-xl border border-line bg-panel p-4 text-sm text-muted">
                {item}
              </article>
            ))}
          </div>
        </section>

        <section id="roadmap" className="mt-20 rounded-2xl border border-line bg-panel p-7 text-center">
          <h2 className="text-2xl font-bold md:text-3xl">Comece self-hosted. Evolua para SaaS quando fizer sentido.</h2>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-muted md:text-base">
            O DevInsights nasce open source e self-hosted first. O foco inicial e validar valor com times reais
            de engenharia. Planos gerenciados e recursos premium podem surgir futuramente.
          </p>
          <a href="/app/login" className="mt-6 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-bold text-ink hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-accent">
            Entrar na lista de pilotos
          </a>
        </section>
      </div>
    </div>
  );
}
