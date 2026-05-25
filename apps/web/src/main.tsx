import React from "react";
import { createRoot } from "react-dom/client";
import { LandingPage } from "./landing/LandingPage";
import "./styles.css";

type Locale = "pt-BR" | "en";

const resolveApiBaseUrl = () => {
  const raw = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  if (!raw) {
    return "/api/v1";
  }

  if (raw.endsWith("/api/v1") || raw.includes("/api/v1?")) {
    return raw.replace(/\/$/, "");
  }

  return `${raw.replace(/\/$/, "")}/api/v1`;
};

const detectLocale = (): Locale => {
  const saved = localStorage.getItem("devinsights.locale") as Locale | null;
  if (saved === "pt-BR" || saved === "en") {
    return saved;
  }

  const browserLocale = navigator.language.toLowerCase();
  const detected: Locale = browserLocale.startsWith("pt") ? "pt-BR" : "en";
  localStorage.setItem("devinsights.locale", detected);
  return detected;
};

function GitHubIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="h-5 w-5 fill-current">
      <path d="M8 0a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38v-1.33c-2.24.49-2.71-1.08-2.71-1.08-.37-.94-.9-1.2-.9-1.2-.74-.5.06-.5.06-.5.82.06 1.24.84 1.24.84.72 1.25 1.9.89 2.37.68.07-.53.29-.89.52-1.1-1.79-.2-3.66-.9-3.66-4a3.1 3.1 0 0 1 .83-2.16c-.08-.2-.36-1.02.08-2.12 0 0 .67-.22 2.2.82a7.6 7.6 0 0 1 4 0c1.52-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.53.58.83 1.32.83 2.16 0 3.1-1.88 3.8-3.67 4 .3.27.56.78.56 1.57v2.32c0 .21.14.46.55.38A8 8 0 0 0 8 0Z" />
    </svg>
  );
}

function AppLoginPage() {
  const locale = detectLocale();
  const isPt = locale === "pt-BR";
  const apiBaseUrl = resolveApiBaseUrl();

  return (
    <main className="relative min-h-screen overflow-hidden bg-ink px-5 py-10 text-text">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(34,184,240,0.16),transparent_35%),radial-gradient(circle_at_90%_0%,rgba(40,215,164,0.14),transparent_42%)]" />
      <div className="relative mx-auto grid w-full max-w-5xl gap-8 md:grid-cols-[1.1fr,1fr] md:items-center">
        <section>
          <a href="/" className="inline-flex items-center gap-2 text-lg font-bold tracking-wide text-text">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-panelSoft">DI</span>
            DevInsights
          </a>
          <h1 className="mt-6 text-4xl font-extrabold leading-tight md:text-5xl">
            {isPt ? "Bem-vindo de volta" : "Welcome back"}
          </h1>
          <p className="mt-4 max-w-md text-sm leading-7 text-muted md:text-base">
            {isPt
              ? "Acesse sua área para acompanhar Engineering Intelligence com foco em fluxo, colaboração e melhoria contínua."
              : "Access your workspace to track Engineering Intelligence focused on flow, collaboration, and continuous improvement."}
          </p>
        </section>

        <section className="rounded-2xl border border-line bg-panel p-7 shadow-glow md:p-8">
          <p className="text-xs uppercase tracking-[0.16em] text-accent">{isPt ? "Acesso seguro" : "Secure access"}</p>
          <h2 className="mt-3 text-2xl font-bold">{isPt ? "Entrar com sua conta GitHub" : "Sign in with your GitHub account"}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            {isPt
              ? "Usamos autenticação OAuth para onboarding self-service e conexão com o GitHub App da sua organização."
              : "We use OAuth authentication for self-service onboarding and connection with your organization GitHub App."}
          </p>

          <a
            href={`${apiBaseUrl}/auth/github/login`}
            className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan"
            aria-label={isPt ? "Continuar com GitHub" : "Continue with GitHub"}
          >
            <GitHubIcon />
            {isPt ? "Continuar com GitHub" : "Continue with GitHub"}
          </a>

          <p className="mt-4 text-xs leading-5 text-muted">
            {isPt
              ? "Sem senha local. Você autoriza no GitHub e continua no onboarding do DevInsights."
              : "No local password. Authorize in GitHub and continue through DevInsights onboarding."}
          </p>

          <a href="/" className="mt-5 inline-block text-sm text-muted underline decoration-line underline-offset-4 hover:text-text">
            {isPt ? "Voltar para a landing" : "Back to landing"}
          </a>
        </section>
      </div>
    </main>
  );
}

type AppBootstrapResponse = {
  user: {
    id: number;
    github_id: number;
    github_login: string;
    name: string | null;
    avatar_url: string | null;
  };
  organization: {
    id: number;
    name: string;
    role?: string;
  } | null;
  organizations: Array<{ id: number; name: string; role: string }>;
  activeOrganizationId: number | null;
  integration: {
    connected: boolean;
    selectedRepositories: number;
  };
  sync: {
    id: number;
    status: "pending" | "running" | "completed" | "failed";
    processed_repositories: number;
    total_prs: number;
    error_message: string | null;
    started_at: string | null;
    finished_at: string | null;
  } | null;
  repositoryInsights: {
    repositories: number;
    open_prs: number;
    merged_prs: number;
  };
};

type Repository = {
  id: number;
  full_name: string;
  private: boolean;
  selected: boolean;
};

type DashboardOverview = {
  selectedRepositories: number;
  openPrs: number;
  throughput7d: number;
  throughput30d: number;
  avgPrSize: number;
  stalePrs: number;
  lastSync: {
    status: string;
    started_at: string | null;
    finished_at: string | null;
    total_prs: number;
  } | null;
};

type PullRequestItem = {
  github_pr_id: number;
  number: number;
  title: string;
  repository_full_name: string;
  author_login: string | null;
  state: string;
  draft: boolean;
  additions: number;
  deletions: number;
  changed_files: number;
  opened_at: string | null;
  merged_at: string | null;
  updated_at: string | null;
  html_url: string | null;
};

function AppDashboardPage() {
  const locale = detectLocale();
  const isPt = locale === "pt-BR";
  const apiBaseUrl = resolveApiBaseUrl();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<AppBootstrapResponse | null>(null);
  const [repositories, setRepositories] = React.useState<Repository[]>([]);
  const [savingRepos, setSavingRepos] = React.useState(false);
  const [changingOrg, setChangingOrg] = React.useState(false);
  const [overview, setOverview] = React.useState<DashboardOverview | null>(null);
  const [pullRequests, setPullRequests] = React.useState<PullRequestItem[]>([]);
  const [repoFilter, setRepoFilter] = React.useState("all");
  const [stateFilter, setStateFilter] = React.useState("all");
  const [periodFilter, setPeriodFilter] = React.useState<"7d" | "30d">("30d");
  const [availableRepos, setAvailableRepos] = React.useState<string[]>([]);
  const [section, setSection] = React.useState<"overview" | "pr" | "integrations" | "settings">("overview");

  const formatSyncTime = (value: string | null) => {
    if (!value) {
      return isPt ? "Nunca" : "Never";
    }

    return new Date(value).toLocaleString(locale === "pt-BR" ? "pt-BR" : "en-US", {
      dateStyle: "short",
      timeStyle: "short"
    });
  };

  const signalTag = (pr: PullRequestItem) => {
    const text = `${pr.title} ${pr.repository_full_name}`.toLowerCase();
    const tags: string[] = [];
    if (text.includes("bug") || text.includes("fix")) tags.push(isPt ? "bug" : "bug");
    if (text.includes("security") || text.includes("sec") || text.includes("auth")) tags.push("security");
    if ((pr.additions + pr.deletions) > 800) tags.push(isPt ? "large" : "large");
    if (tags.length === 0) tags.push(isPt ? "maintainability" : "maintainability");
    return tags.slice(0, 3);
  };

  const loadBootstrap = React.useCallback(async () => {
    const response = await fetch(`${apiBaseUrl}/app/bootstrap`, { credentials: "include" });
    if (response.status === 401) {
      window.location.assign("/app/login");
      return null;
    }

    if (!response.ok) {
      throw new Error("Failed to load app bootstrap");
    }

    return (await response.json()) as AppBootstrapResponse;
  }, [apiBaseUrl]);

  const loadRepositories = React.useCallback(async () => {
    const response = await fetch(`${apiBaseUrl}/integrations/github/repositories`, {
      credentials: "include"
    });
    if (!response.ok) {
      throw new Error("Failed to load repositories");
    }

    const payload = (await response.json()) as { connected: boolean; repositories: Repository[] };
    return payload.repositories;
  }, [apiBaseUrl]);

  const loadOverview = React.useCallback(async () => {
    const response = await fetch(`${apiBaseUrl}/dashboard/overview`, { credentials: "include" });
    if (!response.ok) {
      throw new Error("Failed to load dashboard overview");
    }

    return (await response.json()) as DashboardOverview;
  }, [apiBaseUrl]);

  const loadPullRequests = React.useCallback(async () => {
    const params = new URLSearchParams();
    params.set("period", periodFilter);
    params.set("state", stateFilter);
    if (repoFilter !== "all") {
      params.set("repository", repoFilter);
    }

    const response = await fetch(`${apiBaseUrl}/dashboard/pull-requests?${params.toString()}`, {
      credentials: "include"
    });
    if (!response.ok) {
      throw new Error("Failed to load pull requests");
    }

    const payload = (await response.json()) as { repositories: string[]; pullRequests: PullRequestItem[] };
    return payload;
  }, [apiBaseUrl, periodFilter, stateFilter, repoFilter]);

  React.useEffect(() => {
    const load = async () => {
      try {
        const bootstrap = await loadBootstrap();
        if (!bootstrap) {
          return;
        }

        setData(bootstrap);

        if (bootstrap.integration.connected) {
          const repos = await loadRepositories();
          setRepositories(repos);
        }

        const overviewPayload = await loadOverview();
        setOverview(overviewPayload);

        const prsPayload = await loadPullRequests();
        setPullRequests(prsPayload.pullRequests);
        setAvailableRepos(prsPayload.repositories);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [loadBootstrap, loadOverview, loadPullRequests, loadRepositories]);

  React.useEffect(() => {
    if (!data) {
      return;
    }

    const refresh = async () => {
      try {
        const overviewPayload = await loadOverview();
        setOverview(overviewPayload);
        const prsPayload = await loadPullRequests();
        setPullRequests(prsPayload.pullRequests);
        setAvailableRepos(prsPayload.repositories);
      } catch {
        // keep current values
      }
    };

    void refresh();
  }, [data?.activeOrganizationId, loadOverview, loadPullRequests]);

  React.useEffect(() => {
    if (!data) {
      return;
    }

    const refreshPullRequests = async () => {
      try {
        const prsPayload = await loadPullRequests();
        setPullRequests(prsPayload.pullRequests);
        setAvailableRepos(prsPayload.repositories);
      } catch {
        // ignore filter refresh error
      }
    };

    void refreshPullRequests();
  }, [periodFilter, stateFilter, repoFilter, data, loadPullRequests]);

  React.useEffect(() => {
    if (!data?.sync || (data.sync.status !== "pending" && data.sync.status !== "running")) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const bootstrap = await loadBootstrap();
        if (!bootstrap) {
          return;
        }
        setData(bootstrap);
      } catch {
        // ignore polling errors
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [data?.sync, loadBootstrap]);

  const logout = async () => {
    await fetch(`${apiBaseUrl}/auth/logout`, {
      method: "POST",
      credentials: "include"
    });
    window.location.assign("/");
  };

  const connectGitHubApp = async () => {
    const response = await fetch(`${apiBaseUrl}/integrations/github/install-url`, {
      credentials: "include"
    });

    if (!response.ok) {
      setError(isPt ? "Não foi possível gerar URL de instalação." : "Could not generate install URL.");
      return;
    }

    const payload = (await response.json()) as { installUrl: string };
    window.location.assign(payload.installUrl);
  };

  const toggleRepository = (id: number) => {
    setRepositories((previous) =>
      previous.map((repository) =>
        repository.id === id ? { ...repository, selected: !repository.selected } : repository
      )
    );
  };

  const saveRepositoriesAndSync = async () => {
    setSavingRepos(true);
    setError(null);
    try {
      const selectedIds = repositories.filter((repository) => repository.selected).map((repository) => repository.id);
      const response = await fetch(`${apiBaseUrl}/integrations/github/repositories/select`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repositoryIds: selectedIds })
      });

      if (!response.ok) {
        throw new Error("Failed to save repositories");
      }

      const bootstrap = await loadBootstrap();
      if (bootstrap) {
        setData(bootstrap);
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unknown error");
    } finally {
      setSavingRepos(false);
    }
  };

  const syncNow = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/integrations/github/sync-now`, {
        method: "POST",
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("Failed to start sync");
      }
      const bootstrap = await loadBootstrap();
      if (bootstrap) {
        setData(bootstrap);
      }
    } catch (syncError) {
      setError(syncError instanceof Error ? syncError.message : "Unknown error");
    }
  };

  const switchOrganization = async (organizationId: number) => {
    setChangingOrg(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/organizations/active`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId })
      });

      if (!response.ok) {
        throw new Error("Failed to switch organization");
      }

      const bootstrap = await loadBootstrap();
      if (bootstrap) {
        setData(bootstrap);
      }

      const repos = await loadRepositories();
      setRepositories(repos);

      const overviewPayload = await loadOverview();
      setOverview(overviewPayload);

      const prsPayload = await loadPullRequests();
      setPullRequests(prsPayload.pullRequests);
      setAvailableRepos(prsPayload.repositories);
    } catch (switchError) {
      setError(switchError instanceof Error ? switchError.message : "Unknown error");
    } finally {
      setChangingOrg(false);
    }
  };

  const disconnectIntegration = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/integrations/github/disconnect`, {
        method: "POST",
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error("Failed to disconnect integration");
      }

      setRepositories([]);
      const bootstrap = await loadBootstrap();
      if (bootstrap) {
        setData(bootstrap);
      }

      const overviewPayload = await loadOverview();
      setOverview(overviewPayload);

      const prsPayload = await loadPullRequests();
      setPullRequests(prsPayload.pullRequests);
      setAvailableRepos(prsPayload.repositories);
    } catch (disconnectError) {
      setError(disconnectError instanceof Error ? disconnectError.message : "Unknown error");
    }
  };

  const onboardingStep = !data
    ? 0
    : !data.integration.connected
      ? 1
      : data.integration.selectedRepositories === 0
        ? 2
        : !data.sync || data.sync.status === "pending" || data.sync.status === "running"
          ? 3
          : 4;

  const activeSectionTitle =
    section === "overview"
      ? isPt
        ? "Produtividade"
        : "Productivity"
      : section === "pr"
        ? "Metrics"
        : section === "integrations"
          ? isPt
            ? "Integrações"
            : "Integrations"
          : isPt
            ? "Configurações"
            : "Settings";

  const selectedCount = repositories.filter((repository) => repository.selected).length;
  const topNavItems = [
    { key: "overview", label: isPt ? "Produtividade" : "Productivity", icon: "P" },
    { key: "pr", label: "Metrics", icon: "M" }
  ] as const;
  const futureNavItems = [
    { key: "integrations", label: isPt ? "Integrações" : "Integrations", icon: "GH" }
  ] as const;

  return (
    <main className="min-h-screen bg-ink text-text">
      <div className="grid w-full gap-0 md:grid-cols-[92px,1fr]">
        <aside className="flex flex-col border-r border-line/50 bg-panel/90 px-3 py-5 md:min-h-screen">
          <a href="/" className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-panelSoft text-sm font-extrabold">
            DI
          </a>
          <nav className="space-y-2">
            {topNavItems.map(({ key, label, icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setSection(key)}
                className={`flex w-full flex-col items-center gap-1 rounded-xl px-2 py-3 text-[11px] font-semibold ${
                  section === key
                    ? "bg-accent text-ink"
                    : "border border-transparent text-muted hover:border-line hover:bg-panelSoft hover:text-text"
                }`}
              >
                <span className="text-xs">{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-6 border-t border-line/50 pt-4">
            <p className="mb-2 px-1 text-[10px] uppercase tracking-[0.1em] text-muted">{isPt ? "Em breve" : "Coming soon"}</p>
            <div className="space-y-2">
              {futureNavItems.map(({ key, label, icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSection(key)}
                  className={`flex w-full flex-col items-center gap-1 rounded-xl px-2 py-3 text-[11px] font-semibold ${
                    section === key
                      ? "bg-accent text-ink"
                      : "border border-transparent text-muted hover:border-line hover:bg-panelSoft hover:text-text"
                  }`}
                >
                  <span className="text-xs">{icon}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2 border-t border-line/50 pt-4 md:mt-auto">
            <button
              type="button"
              onClick={() => setSection("settings")}
              className={`flex w-full flex-col items-center gap-1 rounded-xl px-2 py-3 text-[11px] font-semibold ${
                section === "settings"
                  ? "bg-accent text-ink"
                  : "border border-transparent text-muted hover:border-line hover:bg-panelSoft hover:text-text"
              }`}
            >
              <span className="text-xs">⚙</span>
              <span>{isPt ? "Config" : "Settings"}</span>
            </button>
            <button
              type="button"
              onClick={logout}
              className="w-full rounded-xl border border-line px-2 py-2 text-xs font-semibold text-muted hover:bg-panelSoft hover:text-text"
            >
              {isPt ? "Sair" : "Sign out"}
            </button>
          </div>
        </aside>

        <div className="bg-[linear-gradient(180deg,#101f30_0%,#0b1826_45%,#09131f_100%)]">
          <header className="border-b border-line/40 bg-panel/80 px-6 py-5 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-accent">{activeSectionTitle}</p>
                <h1 className="mt-1 text-2xl font-bold">
                  {isPt ? "Últimos 30 dias" : "Last 30 days"}
                </h1>
              </div>
              <div className="text-right text-sm text-muted">
                <p>{data?.user.name ?? data?.user.github_login ?? "-"}</p>
                <p>{data?.organization?.name ?? "-"}</p>
              </div>
            </div>
          </header>

          <div className="space-y-5 px-4 py-6 md:px-6 xl:px-8">
            <section className="rounded-2xl border border-line/60 bg-panelSoft/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-text">
                  {isPt
                    ? `Onboarding em etapa ${onboardingStep}/4 • Sync ${data?.sync?.status ?? "idle"}`
                    : `Onboarding step ${onboardingStep}/4 • Sync ${data?.sync?.status ?? "idle"}`}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={syncNow}
                    className="rounded-full border border-line px-4 py-2 text-xs font-semibold hover:bg-panel"
                  >
                    {isPt ? "Atualizar dados" : "Refresh data"}
                  </button>
                  <button
                    type="button"
                    onClick={connectGitHubApp}
                    className="rounded-full bg-accent px-4 py-2 text-xs font-bold text-ink hover:brightness-110"
                  >
                    {isPt ? "Configurar GitHub" : "Configure GitHub"}
                  </button>
                </div>
              </div>
            </section>

            {data?.organizations && data.organizations.length > 1 ? (
              <section className="rounded-2xl border border-line/60 bg-panel p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-muted">{isPt ? "Organização ativa" : "Active organization"}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {data.organizations.map((organization) => (
                    <button
                      key={organization.id}
                      type="button"
                      disabled={changingOrg}
                      onClick={() => switchOrganization(organization.id)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold ${
                        data.activeOrganizationId === organization.id
                          ? "bg-accent text-ink"
                          : "border border-line text-text hover:bg-panelSoft"
                      }`}
                    >
                      {organization.name}
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            {(section === "overview" || section === "pr") && (
              <section className="rounded-2xl border border-line/60 bg-panel p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold">PR Intelligence</h2>
                    <p className="text-sm text-muted">
                      {isPt ? "Leitura de fluxo com foco em velocidade e qualidade." : "Flow intelligence focused on speed and quality."}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={periodFilter}
                      onChange={(event) => setPeriodFilter(event.target.value as "7d" | "30d")}
                      className="rounded-full border border-line bg-panelSoft px-4 py-2 text-xs"
                    >
                      <option value="7d">{isPt ? "7 dias" : "7 days"}</option>
                      <option value="30d">{isPt ? "30 dias" : "30 days"}</option>
                    </select>
                    <select
                      value={stateFilter}
                      onChange={(event) => setStateFilter(event.target.value)}
                      className="rounded-full border border-line bg-panelSoft px-4 py-2 text-xs"
                    >
                      <option value="all">{isPt ? "Todos estados" : "All states"}</option>
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                    </select>
                    <select
                      value={repoFilter}
                      onChange={(event) => setRepoFilter(event.target.value)}
                      className="rounded-full border border-line bg-panelSoft px-4 py-2 text-xs"
                    >
                      <option value="all">{isPt ? "Todos repositórios" : "All repositories"}</option>
                      {availableRepos.map((repo) => (
                        <option key={repo} value={repo}>
                          {repo}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-4">
                  <article className="rounded-xl border border-line/60 bg-panelSoft/70 p-4">
                    <p className="text-xs text-muted">Throughput 7d</p>
                    <p className="mt-2 text-xl font-bold">{overview?.throughput7d ?? 0}</p>
                  </article>
                  <article className="rounded-xl border border-line/60 bg-panelSoft/70 p-4">
                    <p className="text-xs text-muted">Throughput 30d</p>
                    <p className="mt-2 text-xl font-bold">{overview?.throughput30d ?? 0}</p>
                  </article>
                  <article className="rounded-xl border border-line/60 bg-panelSoft/70 p-4">
                    <p className="text-xs text-muted">{isPt ? "Tamanho médio" : "Average PR size"}</p>
                    <p className="mt-2 text-xl font-bold">{overview?.avgPrSize ?? 0}</p>
                  </article>
                  <article className="rounded-xl border border-line/60 bg-panelSoft/70 p-4">
                    <p className="text-xs text-muted">Stale PRs</p>
                    <p className="mt-2 text-xl font-bold">{overview?.stalePrs ?? 0}</p>
                  </article>
                </div>

                <div className="mt-4 overflow-x-auto rounded-xl border border-line/60 bg-panelSoft/30">
                  <table className="min-w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-line/60 text-xs uppercase tracking-[0.08em] text-muted">
                        <th className="px-3 py-3">{isPt ? "Time" : "Time"}</th>
                        <th className="px-3 py-3">{isPt ? "Signals" : "Signals"}</th>
                        <th className="px-3 py-3">PR</th>
                        <th className="px-3 py-3">Repository</th>
                        <th className="px-3 py-3">{isPt ? "Ação" : "Action"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pullRequests.map((pr) => (
                        <tr key={pr.github_pr_id} className="border-b border-line/40 text-sm last:border-b-0">
                          <td className="px-3 py-3 text-muted">{formatSyncTime(pr.updated_at ?? pr.opened_at)}</td>
                          <td className="px-3 py-3">
                            <div className="flex flex-wrap gap-1">
                              {signalTag(pr).map((tag) => (
                                <span key={`${pr.github_pr_id}-${tag}`} className="rounded-full border border-line bg-panel px-2 py-0.5 text-[11px] text-muted">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-3 py-3 font-medium">#{pr.number} {pr.title}</td>
                          <td className="px-3 py-3 text-muted">{pr.repository_full_name}</td>
                          <td className="px-3 py-3">
                            {pr.html_url ? (
                              <a href={pr.html_url} target="_blank" rel="noreferrer" className="inline-flex rounded-full border border-line px-3 py-1 text-xs hover:bg-panel">
                                {isPt ? "Abrir" : "Open"}
                              </a>
                            ) : (
                              <span className="text-xs text-muted">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {pullRequests.length === 0 ? (
                    <p className="px-3 py-6 text-sm text-muted">
                      {isPt ? "Nenhum PR encontrado para os filtros atuais." : "No pull requests found for current filters."}
                    </p>
                  ) : null}
                </div>
              </section>
            )}

            {(section === "overview" || section === "integrations") && (
              <section className="rounded-2xl border border-line/60 bg-panel p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold">{isPt ? "Integração GitHub" : "GitHub Integration"}</h2>
                    <p className="text-sm text-muted">
                      {isPt
                        ? "Conecte, selecione repositórios e acompanhe a coleta inicial."
                        : "Connect, select repositories, and monitor initial ingestion."}
                    </p>
                  </div>
                  <div className="rounded-full border border-line bg-panelSoft px-3 py-1 text-xs text-muted">
                    {isPt ? "Atualizado" : "Updated"}: {formatSyncTime(data?.sync?.finished_at ?? data?.sync?.started_at ?? null)}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <article className="rounded-xl border border-line/60 bg-panelSoft/70 p-4">
                    <p className="text-xs text-muted">{isPt ? "Conectado" : "Connected"}</p>
                    <p className="mt-2 text-lg font-bold">{data?.integration.connected ? "Yes" : "No"}</p>
                  </article>
                  <article className="rounded-xl border border-line/60 bg-panelSoft/70 p-4">
                    <p className="text-xs text-muted">{isPt ? "Repos selecionados" : "Selected repos"}</p>
                    <p className="mt-2 text-lg font-bold">{selectedCount}</p>
                  </article>
                  <article className="rounded-xl border border-line/60 bg-panelSoft/70 p-4">
                    <p className="text-xs text-muted">{isPt ? "PRs coletados" : "Collected PRs"}</p>
                    <p className="mt-2 text-lg font-bold">{data?.sync?.total_prs ?? 0}</p>
                  </article>
                </div>

                {!data?.integration.connected ? (
                  <div className="mt-4 rounded-xl border border-dashed border-line p-4 text-sm text-muted">
                    <p>{isPt ? "Conecte o GitHub App para iniciar." : "Connect GitHub App to get started."}</p>
                    <button
                      type="button"
                      onClick={connectGitHubApp}
                      className="mt-3 rounded-full bg-accent px-4 py-2 text-xs font-bold text-ink"
                    >
                      {isPt ? "Conectar GitHub App" : "Connect GitHub App"}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mt-4 grid max-h-64 gap-2 overflow-auto rounded-xl border border-line/60 bg-panelSoft/40 p-3 md:grid-cols-2">
                      {repositories.map((repo) => (
                        <label key={repo.id} className="flex items-center gap-2 rounded-lg border border-line/50 bg-panel px-3 py-2 text-sm">
                          <input type="checkbox" checked={repo.selected} onChange={() => toggleRepository(repo.id)} className="h-4 w-4" />
                          <span className="truncate">{repo.full_name}</span>
                        </label>
                      ))}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={saveRepositoriesAndSync}
                        disabled={savingRepos || repositories.length === 0}
                        className="rounded-full bg-accent px-5 py-2 text-sm font-bold text-ink disabled:opacity-50"
                      >
                        {savingRepos ? (isPt ? "Salvando..." : "Saving...") : isPt ? "Salvar e sincronizar" : "Save and sync"}
                      </button>
                      <button
                        type="button"
                        onClick={syncNow}
                        className="rounded-full border border-line px-5 py-2 text-sm font-semibold hover:bg-panelSoft"
                      >
                        {isPt ? "Sincronizar agora" : "Sync now"}
                      </button>
                      <button
                        type="button"
                        onClick={disconnectIntegration}
                        className="rounded-full border border-red-400/40 px-5 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/10"
                      >
                        {isPt ? "Desconectar" : "Disconnect"}
                      </button>
                    </div>
                  </>
                )}
              </section>
            )}

            {section === "settings" && (
              <section className="rounded-2xl border border-line/60 bg-panel p-5">
                <h2 className="text-xl font-bold">{isPt ? "Configurações" : "Settings"}</h2>
                <p className="mt-1 text-sm text-muted">
                  {isPt
                    ? "Gerencie integrações, organização ativa e políticas operacionais do workspace."
                    : "Manage integrations, active organization, and workspace operational policies."}
                </p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <article className="rounded-xl border border-line/60 bg-panelSoft/60 p-4">
                    <p className="text-xs uppercase tracking-[0.08em] text-muted">{isPt ? "Sessão" : "Session"}</p>
                    <p className="mt-2 text-sm text-text">{isPt ? "Autenticado via GitHub OAuth" : "Authenticated via GitHub OAuth"}</p>
                  </article>
                  <article className="rounded-xl border border-line/60 bg-panelSoft/60 p-4">
                    <p className="text-xs uppercase tracking-[0.08em] text-muted">{isPt ? "Integração" : "Integration"}</p>
                    <p className="mt-2 text-sm text-text">{data?.integration.connected ? "GitHub App connected" : "GitHub App disconnected"}</p>
                  </article>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={disconnectIntegration}
                    className="rounded-full border border-red-400/40 px-5 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/10"
                  >
                    {isPt ? "Desconectar integração" : "Disconnect integration"}
                  </button>
                </div>
              </section>
            )}

            {error ? <p className="text-sm text-red-300">{error}</p> : null}
          </div>
        </div>
      </div>
    </main>
  );
}

function AppRouter() {
  if (window.location.pathname === "/app/login") {
    return <AppLoginPage />;
  }

  if (window.location.pathname === "/app" || window.location.pathname.startsWith("/app/")) {
    return <AppDashboardPage />;
  }

  return <LandingPage />;
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);
