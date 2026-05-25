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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-5 py-10 text-text">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(34,184,240,0.16),transparent_35%),radial-gradient(circle_at_90%_0%,rgba(40,215,164,0.14),transparent_42%)]" />
      <section className="relative w-full max-w-md rounded-2xl border border-line bg-panel p-7 shadow-glow md:p-8">
          <a href="/" className="inline-flex items-center gap-2 text-lg font-bold tracking-wide text-text">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-panelSoft">DI</span>
            DevInsights
          </a>
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

type OnboardingStatus = {
  organizationId: number | null;
  step: number;
  githubConnected: boolean;
  repositoriesSelected: boolean;
  syncStarted: boolean;
  syncCompleted: boolean;
  syncStatus?: string | null;
  productionConfigured?: boolean;
};

type IntegrationLogItem = {
  status: string;
  phase: string;
  totalRepositories: number;
  processedRepositories: number;
  totalPrs: number;
  errorMessage?: string | null;
  startedAt?: string | null;
  finishedAt?: string | null;
  createdAt?: string | null;
};

type SyncProgress = {
  status: string;
  phase: string;
  totalRepositories: number;
  processedRepositories: number;
  totalPrs: number;
  startedAt?: string | null;
  finishedAt?: string | null;
  errorMessage?: string | null;
};

type DoraOverview = {
  status: "setup_required" | "partial" | "available";
  period: "30d";
  deploymentFrequency30d: number;
  leadTimeForChangesHours: number | null;
  changeFailureRate: number | null;
  mttrHours: number | null;
  coverage: {
    productionEnvironmentsConfigured: boolean;
    deploymentsAvailable: boolean;
    workflowRunsAvailable: boolean;
    incidentsAvailable: boolean;
    leadTimeAvailable?: boolean;
  };
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
  const [section, setSection] = React.useState<
    "dashboard" | "productivity" | "metrics" | "repositories" | "teams" | "integrations" | "settings"
  >("productivity");
  const [avatarMenuOpen, setAvatarMenuOpen] = React.useState(false);
  const [demoMode, setDemoMode] = React.useState(false);
  const [onboarding, setOnboarding] = React.useState<OnboardingStatus | null>(null);
  const [syncProgress, setSyncProgress] = React.useState<SyncProgress | null>(null);
  const [dora, setDora] = React.useState<DoraOverview | null>(null);
  const [productionEnvironmentsInput, setProductionEnvironmentsInput] = React.useState("production");
  const [savingProductionEnvs, setSavingProductionEnvs] = React.useState(false);
  const [integrationLogs, setIntegrationLogs] = React.useState<IntegrationLogItem[]>([]);
  const [showIntegrationLogs, setShowIntegrationLogs] = React.useState(false);

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

  const loadOnboardingStatus = React.useCallback(async () => {
    const response = await fetch(`${apiBaseUrl}/onboarding/status`, { credentials: "include" });
    if (!response.ok) {
      throw new Error("Failed to load onboarding status");
    }
    return (await response.json()) as OnboardingStatus;
  }, [apiBaseUrl]);

  const loadSyncProgress = React.useCallback(async () => {
    const response = await fetch(`${apiBaseUrl}/integrations/github/sync-progress`, { credentials: "include" });
    if (!response.ok) {
      throw new Error("Failed to load sync progress");
    }
    return (await response.json()) as SyncProgress;
  }, [apiBaseUrl]);

  const loadDoraOverview = React.useCallback(async () => {
    const response = await fetch(`${apiBaseUrl}/dashboard/dora-overview`, { credentials: "include" });
    if (!response.ok) {
      throw new Error("Failed to load DORA overview");
    }
    return (await response.json()) as DoraOverview;
  }, [apiBaseUrl]);

  const loadIntegrationLogs = React.useCallback(async () => {
    const response = await fetch(`${apiBaseUrl}/integrations/github/logs`, { credentials: "include" });
    if (!response.ok) {
      throw new Error("Failed to load integration logs");
    }
    const payload = (await response.json()) as { logs: IntegrationLogItem[] };
    return payload.logs;
  }, [apiBaseUrl]);

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

        const onboardingPayload = await loadOnboardingStatus();
        setOnboarding(onboardingPayload);
        const syncProgressPayload = await loadSyncProgress();
        setSyncProgress(syncProgressPayload);
        const doraPayload = await loadDoraOverview();
        setDora(doraPayload);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [loadBootstrap, loadOverview, loadPullRequests, loadRepositories, loadOnboardingStatus, loadSyncProgress, loadDoraOverview]);

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
        const onboardingPayload = await loadOnboardingStatus();
        setOnboarding(onboardingPayload);
        const syncProgressPayload = await loadSyncProgress();
        setSyncProgress(syncProgressPayload);
        const doraPayload = await loadDoraOverview();
        setDora(doraPayload);
      } catch {
        // ignore polling errors
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [data?.sync, loadBootstrap, loadOnboardingStatus, loadSyncProgress, loadDoraOverview]);

  const saveProductionEnvironments = async () => {
    setSavingProductionEnvs(true);
    setError(null);
    try {
      const environments = productionEnvironmentsInput
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
      const response = await fetch(`${apiBaseUrl}/settings/production-environments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ environments })
      });
      if (!response.ok) {
        throw new Error("Failed to save production environments");
      }
      const doraPayload = await loadDoraOverview();
      setDora(doraPayload);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unknown error");
    } finally {
      setSavingProductionEnvs(false);
    }
  };

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
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        if (payload?.error === "integration_not_connected") {
          throw new Error("GitHub App is not connected");
        }
        if (payload?.error === "no_selected_repositories") {
          throw new Error("Select at least one repository before running sync");
        }
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

  const onboardingStep = onboarding?.step ?? (!data
    ? 0
    : !data.integration.connected
      ? 1
      : data.integration.selectedRepositories === 0
        ? 2
        : !data.sync || data.sync.status === "pending" || data.sync.status === "running"
          ? 3
          : 4);

  const activeSectionTitleMap = {
    dashboard: "Dashboard",
    productivity: "Productivity",
    metrics: "Metrics",
    repositories: "Repositories",
    teams: "Teams",
    integrations: "Integrations",
    settings: "Settings"
  } as const;
  const activeSectionTitle = activeSectionTitleMap[section];

  const selectedCount = repositories.filter((repository) => repository.selected).length;
  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: "▦" },
    { key: "productivity", label: "Productivity", icon: "↗" },
    { key: "metrics", label: "Metrics", icon: "◫" },
    { key: "repositories", label: "Repositories", icon: "▤" },
    { key: "teams", label: "Teams", icon: "◎" },
    { key: "integrations", label: "Integrations", icon: "◌" }
  ] as const;
  const hasIntegrationData = Boolean(data?.integration.connected);
  const hasPullRequestData = pullRequests.length > 0;
  const showProductivityEmpty = !hasIntegrationData || !hasPullRequestData;
  const canRunSync = Boolean(data?.integration.connected) && selectedCount > 0;
  const latestSyncError = syncProgress?.errorMessage ?? data?.sync?.error_message ?? null;

  const demoRows: PullRequestItem[] = [
    {
      github_pr_id: 100001,
      number: 342,
      title: "feat: reduce review queue latency",
      repository_full_name: "acme/platform-api",
      author_login: "team-platform",
      state: "open",
      draft: false,
      additions: 132,
      deletions: 47,
      changed_files: 6,
      opened_at: new Date().toISOString(),
      merged_at: null,
      updated_at: new Date().toISOString(),
      html_url: null
    },
    {
      github_pr_id: 100002,
      number: 351,
      title: "fix: security headers policy in public routes",
      repository_full_name: "acme/web-gateway",
      author_login: "security-squad",
      state: "closed",
      draft: false,
      additions: 84,
      deletions: 29,
      changed_files: 3,
      opened_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      merged_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
      html_url: null
    }
  ];

  const displayedPullRequests = showProductivityEmpty && demoMode ? demoRows : pullRequests;
  const mergedCount = displayedPullRequests.filter((pr) => Boolean(pr.merged_at)).length;
  const mergeRate = displayedPullRequests.length > 0 ? Math.round((mergedCount / displayedPullRequests.length) * 100) : 0;
  const reviewTimeHours = Math.max(1, Math.round((overview?.avgPrSize ?? 120) / 40));
  const avatarName = data?.user.name ?? data?.user.github_login ?? "User";
  const avatarFallback = avatarName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="grid min-h-screen w-full md:grid-cols-[260px,1fr]">
        <aside className="hidden border-r border-slate-800 bg-slate-900/90 px-4 py-6 md:flex md:flex-col">
          <a href="/" className="mb-6 inline-flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-700 text-sm font-bold">DI</span>
            <span className="text-sm font-bold tracking-wide">DevInsights</span>
          </a>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setSection(item.key)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                  section === item.key
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className="text-xs opacity-80">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={() => setSection("settings")}
              className={`mb-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                section === "settings" ? "bg-slate-100 text-slate-900" : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span>⚙</span>
              <span>Settings</span>
            </button>
            <button type="button" onClick={logout} className="w-full rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800">
              {isPt ? "Sair" : "Sign out"}
            </button>
          </div>
        </aside>

        <div className="bg-slate-950">
          <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/95 px-4 py-4 backdrop-blur md:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold text-white md:text-2xl">{activeSectionTitle}</h1>
                <p className="mt-1 text-sm text-slate-400">Last 30 days</p>
              </div>

              <div className="flex items-center gap-2 md:gap-3">
                <button className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800">Configure</button>
                <button className="hidden rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 md:inline-flex">
                  Talk to support
                </button>
                <button className="rounded-lg border border-slate-700 px-2.5 py-2 text-sm text-slate-300 hover:bg-slate-800">🔔</button>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setAvatarMenuOpen((value) => !value)}
                    className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-700 bg-slate-800"
                  >
                    {data?.user.avatar_url ? (
                      <img src={data.user.avatar_url} alt={avatarName} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-slate-200">{avatarFallback}</span>
                    )}
                  </button>
                  {avatarMenuOpen ? (
                    <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-xl">
                      <div className="border-b border-slate-800 px-2 pb-2">
                        <p className="text-sm font-semibold text-white">{avatarName}</p>
                        <p className="text-xs text-slate-400">{data?.user.github_login ?? "-"}</p>
                        <p className="mt-1 text-xs text-slate-500">{data?.organization?.name ?? "No organization"}</p>
                      </div>
                      <button className="mt-2 w-full rounded-lg px-2 py-2 text-left text-sm text-slate-300 hover:bg-slate-800">Settings</button>
                      <button className="w-full rounded-lg px-2 py-2 text-left text-sm text-slate-300 hover:bg-slate-800">Billing / Plan</button>
                      <button onClick={logout} className="w-full rounded-lg px-2 py-2 text-left text-sm text-slate-300 hover:bg-slate-800">Sign out</button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </header>

          <div className="space-y-6 px-4 py-6 md:px-8 md:py-8">
            <section className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 md:px-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-300">
                  {isPt
                    ? `Onboarding: etapa ${onboardingStep}/5. Conecte e configure para gerar suas primeiras métricas reais.`
                    : `Onboarding: step ${onboardingStep}/5. Connect and configure to generate your first real metrics.`}
                </p>
                <div className="flex gap-2">
                  {!data?.integration.connected ? (
                    <button onClick={connectGitHubApp} className="rounded-lg bg-emerald-400 px-3 py-2 text-xs font-bold text-slate-900 hover:bg-emerald-300">Connect GitHub App</button>
                  ) : null}
                  <button
                    onClick={syncNow}
                    disabled={!canRunSync}
                    className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Run initial sync
                  </button>
                </div>
              </div>
              {syncProgress ? (
                <p className="mt-2 text-xs text-slate-400">
                  Sync: {syncProgress.phase} • {syncProgress.processedRepositories}/{syncProgress.totalRepositories} repositories • {syncProgress.totalPrs} PRs
                </p>
              ) : null}
              {latestSyncError ? (
                <p className="mt-2 text-xs text-amber-300">Sync error: {latestSyncError}. Connect GitHub and select repositories before running sync.</p>
              ) : null}
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <h2 className="text-2xl font-semibold text-white">Productivity</h2>
              <p className="mt-1 text-sm text-slate-400">Understand engineering flow, delivery speed and quality signals.</p>
              <div className="mt-4 grid gap-2 md:grid-cols-4">
                <select value={periodFilter} onChange={(event) => setPeriodFilter(event.target.value as "7d" | "30d")} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm">
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                </select>
                <select className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"><option>All teams</option></select>
                <select value={repoFilter} onChange={(event) => setRepoFilter(event.target.value)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm">
                  <option value="all">All repositories</option>
                  {availableRepos.map((repo) => <option key={repo} value={repo}>{repo}</option>)}
                </select>
                <select value={stateFilter} onChange={(event) => setStateFilter(event.target.value)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm">
                  <option value="all">All status</option>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </section>

            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {[
                ["Throughput 7d", overview?.throughput7d ?? 0],
                ["Throughput 30d", overview?.throughput30d ?? 0],
                ["Average PR size", overview?.avgPrSize ?? 0],
                ["Stale PRs", overview?.stalePrs ?? 0],
                ["Review time", `${reviewTimeHours}h`],
                ["Merge rate", `${mergeRate}%`]
              ].map(([label, value]) => (
                <article key={String(label)} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
                </article>
              ))}
            </section>

            {showProductivityEmpty ? (
              <section className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/70 p-6">
                <h3 className="text-xl font-semibold text-white">Connect your GitHub organization to generate your first insights</h3>
                <p className="mt-2 max-w-3xl text-sm text-slate-400">
                  DevInsights analyzes pull requests, repositories and delivery flow to identify bottlenecks and engineering signals.
                </p>
                <ul className="mt-4 grid gap-2 text-sm text-slate-300 md:grid-cols-2">
                  <li>1. Connect GitHub App</li>
                  <li>2. Select repositories</li>
                  <li>3. Run initial sync</li>
                  <li>4. Configure production environments</li>
                  <li>5. Review first productivity and DORA insights</li>
                </ul>
                <div className="mt-5 flex flex-wrap gap-2">
                  {!data?.integration.connected ? (
                    <button onClick={connectGitHubApp} className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-bold text-slate-900 hover:bg-emerald-300">Connect GitHub App</button>
                  ) : null}
                  <button
                    onClick={syncNow}
                    disabled={!canRunSync}
                    className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Run initial sync
                  </button>
                  <button onClick={() => setDemoMode(true)} className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800">View sample dashboard</button>
                </div>
              </section>
            ) : null}

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">GitHub integration</h3>
                  <p className="text-sm text-slate-400">{data?.integration.connected ? "Connected" : "Not connected"} • Last sync {formatSyncTime(data?.sync?.finished_at ?? data?.sync?.started_at ?? null)}</p>
                </div>
                <div className="flex gap-2">
                  {!data?.integration.connected ? (
                    <button onClick={connectGitHubApp} className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-bold text-slate-900">Connect GitHub App</button>
                  ) : (
                    <>
                      <button className="rounded-lg border border-slate-700 px-3 py-2 text-sm">Manage repositories</button>
                      <button onClick={syncNow} className="rounded-lg border border-slate-700 px-3 py-2 text-sm">Run sync</button>
                      <button
                        onClick={async () => {
                          try {
                            const logs = await loadIntegrationLogs();
                            setIntegrationLogs(logs);
                            setShowIntegrationLogs(true);
                          } catch (logError) {
                            setError(logError instanceof Error ? logError.message : "Unknown error");
                          }
                        }}
                        className="rounded-lg border border-slate-700 px-3 py-2 text-sm"
                      >
                        View integration logs
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-4">
                <article className="rounded-xl border border-slate-800 bg-slate-950 p-3"><p className="text-xs text-slate-400">Connection status</p><p className="mt-1 font-semibold">{data?.integration.connected ? "Connected" : "Not connected"}</p></article>
                <article className="rounded-xl border border-slate-800 bg-slate-950 p-3"><p className="text-xs text-slate-400">Selected repositories</p><p className="mt-1 font-semibold">{selectedCount}</p></article>
                <article className="rounded-xl border border-slate-800 bg-slate-950 p-3"><p className="text-xs text-slate-400">Pull requests collected</p><p className="mt-1 font-semibold">{data?.sync?.total_prs ?? 0}</p></article>
                <article className="rounded-xl border border-slate-800 bg-slate-950 p-3"><p className="text-xs text-slate-400">Last updated</p><p className="mt-1 font-semibold">{formatSyncTime(data?.sync?.finished_at ?? null)}</p></article>
              </div>
              {showIntegrationLogs ? (
                <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">Integration logs (latest 20 jobs)</p>
                    <button onClick={() => setShowIntegrationLogs(false)} className="text-xs text-slate-400 hover:text-slate-200">Close</button>
                  </div>
                  <div className="space-y-2">
                    {integrationLogs.length === 0 ? (
                      <p className="text-sm text-slate-400">No sync logs yet.</p>
                    ) : (
                      integrationLogs.map((log, index) => (
                        <div key={`${log.createdAt ?? "log"}-${index}`} className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-300">
                          {log.status} • {log.phase} • {log.processedRepositories}/{log.totalRepositories} repos • {log.totalPrs} PRs • {formatSyncTime(log.finishedAt ?? log.startedAt ?? log.createdAt ?? null)}
                          {log.errorMessage ? ` • error: ${log.errorMessage}` : ""}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : null}
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <h3 className="text-lg font-semibold text-white">PR Intelligence</h3>
              <p className="mt-1 text-sm text-slate-400">Latest signals detected from pull requests, reviews and repositories.</p>
              <div className="mt-4 overflow-x-auto rounded-xl border border-slate-800">
                <table className="min-w-[980px] w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950 text-xs uppercase tracking-wide text-slate-400">
                      <th className="px-3 py-3">Time</th>
                      <th className="px-3 py-3">Signal</th>
                      <th className="px-3 py-3">PR</th>
                      <th className="px-3 py-3">Repository</th>
                      <th className="px-3 py-3">Owner/Team</th>
                      <th className="px-3 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedPullRequests.map((pr) => (
                      <tr key={pr.github_pr_id} className="border-b border-slate-800 last:border-b-0">
                        <td className="px-3 py-3 text-slate-400">{formatSyncTime(pr.updated_at ?? pr.opened_at)}</td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap gap-1">
                            {signalTag(pr).map((tag) => (
                              <span key={`${pr.github_pr_id}-${tag}`} className="rounded-full border border-slate-700 bg-slate-950 px-2 py-0.5 text-[11px] text-slate-300">{tag}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-3 font-medium text-white">#{pr.number} {pr.title}</td>
                        <td className="px-3 py-3 text-slate-300">{pr.repository_full_name}</td>
                        <td className="px-3 py-3 text-slate-400">{pr.author_login ?? "-"}</td>
                        <td className="px-3 py-3">
                          {pr.html_url ? <a href={pr.html_url} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-700 px-2 py-1 text-xs hover:bg-slate-800">Open</a> : <span className="text-xs text-slate-500">-</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {section === "metrics" && (
              <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <h3 className="text-lg font-semibold text-white">DORA Metrics</h3>
                <p className="mt-2 text-sm text-slate-400">Track deployment frequency and readiness for full DORA coverage.</p>
                <div className="mt-4 grid gap-3 md:grid-cols-4">
                  <article className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                    <p className="text-xs text-slate-400">Status</p>
                    <p className="mt-1 font-semibold text-white">{dora?.status ?? "setup_required"}</p>
                  </article>
                  <article className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                    <p className="text-xs text-slate-400">Deployment Frequency (30d)</p>
                    <p className="mt-1 font-semibold text-white">{dora?.deploymentFrequency30d ?? 0}</p>
                  </article>
                  <article className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                    <p className="text-xs text-slate-400">Lead Time for Changes</p>
                    <p className="mt-1 font-semibold text-white">{dora?.leadTimeForChangesHours ?? "pending"}</p>
                  </article>
                  <article className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                    <p className="text-xs text-slate-400">MTTR</p>
                    <p className="mt-1 font-semibold text-white">{dora?.mttrHours ?? "pending"}</p>
                  </article>
                </div>
                <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
                  <p>Coverage</p>
                  <ul className="mt-2 grid gap-1 md:grid-cols-2">
                    <li>Production environments: {dora?.coverage.productionEnvironmentsConfigured ? "configured" : "missing"}</li>
                    <li>Deployments: {dora?.coverage.deploymentsAvailable ? "available" : "missing"}</li>
                    <li>Workflow runs: {dora?.coverage.workflowRunsAvailable ? "available" : "missing"}</li>
                    <li>Incidents: {dora?.coverage.incidentsAvailable ? "available" : "missing"}</li>
                    <li>Lead time: {dora?.coverage.leadTimeAvailable ? "available" : "missing"}</li>
                  </ul>
                </div>
              </section>
            )}

            {section === "settings" && (
              <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <h3 className="text-lg font-semibold text-white">Production environments</h3>
                <p className="mt-2 text-sm text-slate-400">Configure environments used as production (comma separated).</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <input
                    value={productionEnvironmentsInput}
                    onChange={(event) => setProductionEnvironmentsInput(event.target.value)}
                    className="min-w-[280px] flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                    placeholder="production, prod"
                  />
                  <button
                    onClick={saveProductionEnvironments}
                    disabled={savingProductionEnvs}
                    className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-bold text-slate-900 disabled:opacity-60"
                  >
                    {savingProductionEnvs ? "Saving..." : "Save environments"}
                  </button>
                </div>
              </section>
            )}

            {(section === "repositories" || section === "teams" || section === "dashboard" || section === "integrations") && (
              <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <h3 className="text-lg font-semibold text-white">{activeSectionTitle}</h3>
                <p className="mt-2 text-sm text-slate-400">{isPt ? "Seção em evolução. Vamos detalhar esse módulo nas próximas iterações." : "This section is evolving. We will expand this module in the next iterations."}</p>
              </section>
            )}

            {data?.organizations && data.organizations.length > 1 ? (
              <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">{isPt ? "Organização ativa" : "Active organization"}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {data.organizations.map((organization) => (
                    <button
                      key={organization.id}
                      type="button"
                      disabled={changingOrg}
                      onClick={() => switchOrganization(organization.id)}
                      className={`rounded-lg px-3 py-2 text-sm ${
                        data.activeOrganizationId === organization.id
                          ? "bg-slate-100 font-semibold text-slate-900"
                          : "border border-slate-700 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      {organization.name}
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

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
