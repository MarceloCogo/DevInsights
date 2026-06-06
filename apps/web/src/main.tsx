import React from "react";
import { createRoot } from "react-dom/client";
import { LandingPage } from "./landing/LandingPage";
import "./styles.css";

// Stores
import { useAppStore } from "./stores/appStore";
import { useUserStore } from "./stores/userStore";
import { useIntegrationStore } from "./stores/integrationStore";
import { useSettingsStore } from "./stores/settingsStore";

// Components
import { LoadingState } from "./components/state/LoadingState";
import { ErrorState } from "./components/state/ErrorState";
import { Card } from "./components/ui/Card";
import { Button } from "./components/ui/Button";
import { Badge } from "./components/ui/Badge";
import { RiskSignalBadge } from "./components/risk-signals/RiskSignalBadge";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

// Types
import type { Locale, Section } from "./types/store";
import type { PullRequest, Repository, DashboardOverview, DoraOverview, SyncProgress, OnboardingStatus, IntegrationLogItem, SyncJob, PrFlowOverview } from "./types/api";

const resolveApiBaseUrl = () => {
  const raw = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  if (!raw) return "/api/v1";
  if (raw.endsWith("/api/v1") || raw.includes("/api/v1?")) return raw.replace(/\/$/, "");
  return `${raw.replace(/\/$/, "")}/api/v1`;
};

function GitHubIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="h-5 w-5 fill-current">
      <path d="M8 0a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38v-1.33c-2.24.49-2.71-1.08-2.71-1.08-.37-.94-.9-1.2-.9-1.2-.74-.5.06-.5.06-.5.82.06 1.24.84 1.24.84.72 1.25 1.9.89 2.37.68.07-.53.29-.89.52-1.1-1.79-.2-3.66-.9-3.66-4a3.1 3.1 0 0 1 .83-2.16c-.08-.2-.36-1.02.08-2.12 0 0 .67-.22 2.2.82a7.6 7.6 0 0 1 4 0c1.52-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.53.58.83 1.32.83 2.16 0 3.1-1.88 3.8-3.67 4 .3.27.56.78.56 1.57v2.32c0 .21.14.46.55.38A8 8 0 0 0 8 0Z" />
    </svg>
  );
}

function AppLoginPage() {
  const locale = useSettingsStore((s) => s.locale);
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
        <p className="mt-2 text-sm leading-6 text-muted">{isPt ? "Usamos autenticação OAuth para onboarding self-service e conexão com o GitHub App da sua organização." : "We use OAuth authentication for self-service onboarding and connection with your organization GitHub App."}</p>
        <a href={`${apiBaseUrl}/auth/github/login`} className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan" aria-label={isPt ? "Continuar com GitHub" : "Continue with GitHub"}>
          <GitHubIcon />
          {isPt ? "Continuar com GitHub" : "Continue with GitHub"}
        </a>
        <p className="mt-4 text-xs leading-5 text-muted">{isPt ? "Sem senha local. Você autoriza no GitHub e continua no onboarding do DevInsights." : "No local password. Authorize in GitHub and continue through DevInsights onboarding."}</p>
        <a href="/" className="mt-5 inline-block text-sm text-muted underline decoration-line underline-offset-4 hover:text-text">{isPt ? "Voltar para a landing" : "Back to landing"}</a>
      </section>
    </main>
  );
}

type IntegrationUiState = "DISCONNECTED" | "CONNECTED_NO_REPOS" | "READY_TO_SYNC" | "SYNCING" | "SYNCED_NO_DATA" | "SYNCED_WITH_DATA";

function AppDashboardPage() {
  const locale = useSettingsStore((s) => s.locale);
  const isPt = locale === "pt-BR";
  const apiBaseUrl = resolveApiBaseUrl();

  // Stores
  const section = useAppStore((s) => s.section);
  const setSection = useAppStore((s) => s.setSection);
  const demoMode = useAppStore((s) => s.demoMode);
  const toggleDemoMode = useAppStore((s) => s.toggleDemoMode);
  const avatarMenuOpen = useAppStore((s) => s.avatarMenuOpen);
  const setAvatarMenuOpen = useAppStore((s) => s.setAvatarMenuOpen);
  const appError = useAppStore((s) => s.error);
  const setAppError = useAppStore((s) => s.setError);

  const user = useUserStore((s) => s.user);
  const organization = useUserStore((s) => s.organization);
  const organizations = useUserStore((s) => s.organizations);
  const activeOrganizationId = useUserStore((s) => s.activeOrganizationId);
  const setUser = useUserStore((s) => s.setUser);
  const setOrganization = useUserStore((s) => s.setOrganization);
  const setOrganizations = useUserStore((s) => s.setOrganizations);
  const setActiveOrganizationId = useUserStore((s) => s.setActiveOrganizationId);

  const connected = useIntegrationStore((s) => s.connected);
  const repositories = useIntegrationStore((s) => s.repositories);
  const syncStatus = useIntegrationStore((s) => s.syncStatus);
  const syncProgress = useIntegrationStore((s) => s.syncProgress);
  const setConnected = useIntegrationStore((s) => s.setConnected);
  const setRepositories = useIntegrationStore((s) => s.setRepositories);
  const setSyncStatus = useIntegrationStore((s) => s.setSyncStatus);
  const setSyncProgress = useIntegrationStore((s) => s.setSyncProgress);

  // Local state for data not yet in stores
  const [loading, setLoading] = React.useState(true);
  const [overview, setOverview] = React.useState<DashboardOverview | null>(null);
  const [pullRequests, setPullRequests] = React.useState<PullRequest[]>([]);
  const [dora, setDora] = React.useState<DoraOverview | null>(null);
  const [doraTimeseries, setDoraTimeseries] = React.useState<any>(null);
  const [prFlow, setPrFlow] = React.useState<PrFlowOverview | null>(null);
  const [onboarding, setOnboarding] = React.useState<OnboardingStatus | null>(null);
  const [repoFilter, setRepoFilter] = React.useState("all");
  const [stateFilter, setStateFilter] = React.useState("all");
  const [periodFilter, setPeriodFilter] = React.useState<"7d" | "30d">("30d");
  const [availableRepos, setAvailableRepos] = React.useState<string[]>([]);
  const [productionEnvironmentsInput, setProductionEnvironmentsInput] = React.useState("production");
  const [savingProductionEnvs, setSavingProductionEnvs] = React.useState(false);
  const [integrationLogs, setIntegrationLogs] = React.useState<IntegrationLogItem[]>([]);
  const [showIntegrationLogs, setShowIntegrationLogs] = React.useState(false);
  const [syncingLoading, setSyncingLoading] = React.useState(false);

  // Computed values
  const selectedCount = repositories.filter((r) => r.selected).length;
  const syncTotalPrs = syncProgress?.totalPrs ?? syncStatus?.total_prs ?? 0;
  const syncState = syncProgress?.status ?? syncStatus?.status ?? onboarding?.syncStatus ?? null;

  const integrationUiState: IntegrationUiState = !connected
    ? "DISCONNECTED"
    : syncState === "pending" || syncState === "running"
      ? "SYNCING"
      : selectedCount === 0
        ? "CONNECTED_NO_REPOS"
        : syncState === "completed" && syncTotalPrs > 0
          ? "SYNCED_WITH_DATA"
          : syncState === "completed" && syncTotalPrs === 0
            ? "SYNCED_NO_DATA"
            : "READY_TO_SYNC";

  const showProductivityEmpty = integrationUiState === "DISCONNECTED" || integrationUiState === "SYNCED_NO_DATA";
  const canRunSync = connected && selectedCount > 0;
  const latestSyncError = syncProgress?.errorMessage ?? syncStatus?.error_message ?? null;

  // API functions
  const formatSyncTime = (value: string | null) => {
    if (!value) return isPt ? "Nunca" : "Never";
    return new Date(value).toLocaleString(locale === "pt-BR" ? "pt-BR" : "en-US", { dateStyle: "short", timeStyle: "short" });
  };

  const signalTag = (pr: PullRequest) => {
    const text = `${pr.title} ${pr.repository_full_name}`.toLowerCase();
    const tags: string[] = [];
    if (text.includes("bug") || text.includes("fix")) tags.push("bug");
    if (text.includes("security") || text.includes("sec") || text.includes("auth")) tags.push("security");
    if (pr.additions + pr.deletions > 800) tags.push("large");
    if (tags.length === 0) tags.push("maintainability");
    return tags.slice(0, 3);
  };

  const loadBootstrap = React.useCallback(async () => {
    const response = await fetch(`${apiBaseUrl}/app/bootstrap`, { credentials: "include" });
    if (response.status === 401) { window.location.assign("/app/login"); return null; }
    if (!response.ok) throw new Error("Failed to load app bootstrap");
    return await response.json();
  }, [apiBaseUrl]);

  const loadRepositories = React.useCallback(async () => {
    const response = await fetch(`${apiBaseUrl}/integrations/github/repositories`, { credentials: "include" });
    if (!response.ok) throw new Error("Failed to load repositories");
    const payload = await response.json();
    return payload.repositories as Repository[];
  }, [apiBaseUrl]);

  const loadOverview = React.useCallback(async () => {
    const response = await fetch(`${apiBaseUrl}/dashboard/overview`, { credentials: "include" });
    if (!response.ok) throw new Error("Failed to load dashboard overview");
    return (await response.json()) as DashboardOverview;
  }, [apiBaseUrl]);

  const loadPullRequests = React.useCallback(async () => {
    const params = new URLSearchParams();
    params.set("period", periodFilter);
    params.set("state", stateFilter);
    if (repoFilter !== "all") params.set("repository", repoFilter);
    const response = await fetch(`${apiBaseUrl}/dashboard/pull-requests?${params.toString()}`, { credentials: "include" });
    if (!response.ok) throw new Error("Failed to load pull requests");
    const payload = await response.json();
    return payload as { repositories: string[]; pullRequests: PullRequest[] };
  }, [apiBaseUrl, periodFilter, stateFilter, repoFilter]);

  const loadDoraOverview = React.useCallback(async () => {
    const response = await fetch(`${apiBaseUrl}/dashboard/dora-overview`, { credentials: "include" });
    if (!response.ok) throw new Error("Failed to load DORA overview");
    return (await response.json()) as DoraOverview;
  }, [apiBaseUrl]);

  const loadPrFlowOverview = React.useCallback(async () => {
    const response = await fetch(`${apiBaseUrl}/dashboard/pr-flow-overview`, { credentials: "include" });
    if (!response.ok) throw new Error("Failed to load PR Flow overview");
    return (await response.json()) as PrFlowOverview;
  }, [apiBaseUrl]);

  const loadDoraTimeseries = React.useCallback(async () => {
    const response = await fetch(`${apiBaseUrl}/dashboard/dora-timeseries?period=90d`, { credentials: "include" });
    if (!response.ok) return null;
    return await response.json();
  }, [apiBaseUrl]);

  const loadOnboardingStatus = React.useCallback(async () => {
    const response = await fetch(`${apiBaseUrl}/onboarding/status`, { credentials: "include" });
    if (!response.ok) throw new Error("Failed to load onboarding status");
    return (await response.json()) as OnboardingStatus;
  }, [apiBaseUrl]);

  const loadSyncProgress = React.useCallback(async () => {
    const response = await fetch(`${apiBaseUrl}/integrations/github/sync-progress`, { credentials: "include" });
    if (!response.ok) throw new Error("Failed to load sync progress");
    return (await response.json()) as SyncProgress;
  }, [apiBaseUrl]);

  // Initial load
  React.useEffect(() => {
    const load = async () => {
      try {
        const bootstrap = await loadBootstrap();
        if (!bootstrap) return;

        setUser(bootstrap.user);
        setOrganization(bootstrap.organization);
        setOrganizations(bootstrap.organizations);
        setActiveOrganizationId(bootstrap.activeOrganizationId);
        setConnected(bootstrap.integration.connected);
        if (bootstrap.integration.connected && bootstrap.integration.installationId) {
          const repos = await loadRepositories();
          setRepositories(repos);
        }
        if (bootstrap.sync) setSyncStatus(bootstrap.sync);

        setOverview(await loadOverview());
        const prs = await loadPullRequests();
        setPullRequests(prs.pullRequests);
        setAvailableRepos(prs.repositories);
        setOnboarding(await loadOnboardingStatus());
        setSyncProgress(await loadSyncProgress());
        setDora(await loadDoraOverview());
        setPrFlow(await loadPrFlowOverview());
        setDoraTimeseries(await loadDoraTimeseries());
      } catch (e) {
        setAppError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  // Polling for sync
  React.useEffect(() => {
    if (!syncStatus || (syncStatus.status !== "pending" && syncStatus.status !== "running")) return;
    const interval = setInterval(async () => {
      try {
        const bootstrap = await loadBootstrap();
        if (bootstrap) {
          const prevStatus = syncStatus?.status;
          setSyncStatus(bootstrap.sync);
          setOnboarding(await loadOnboardingStatus());
          setSyncProgress(await loadSyncProgress());
          // When sync transitions to completed, reload all dashboard data
          if (bootstrap.sync?.status === "completed" && prevStatus !== "completed") {
            setOverview(await loadOverview());
            const prs = await loadPullRequests();
            setPullRequests(prs.pullRequests);
            setAvailableRepos(prs.repositories);
            setPrFlow(await loadPrFlowOverview());
            setDora(await loadDoraOverview());
          }
        }
      } catch {}
    }, 4000);
    return () => clearInterval(interval);
  }, [syncStatus]);

  // Actions
  const logout = async () => {
    await fetch(`${apiBaseUrl}/auth/logout`, { method: "POST", credentials: "include" });
    window.location.assign("/");
  };

  const connectGitHubApp = async () => {
    const response = await fetch(`${apiBaseUrl}/integrations/github/install-url`, { credentials: "include" });
    if (!response.ok) { setAppError(isPt ? "Não foi possível gerar URL de instalação." : "Could not generate install URL."); return; }
    const payload = await response.json();
    window.location.assign(payload.installUrl);
  };

  const toggleRepository = (id: number) => {
    setRepositories(repositories.map((r) => r.id === id ? { ...r, selected: !r.selected } : r));
  };

  const syncNow = async () => {
    setSyncingLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/integrations/github/sync-now`, { method: "POST", credentials: "include" });
      if (!response.ok) throw new Error("Failed to start sync");
      const bootstrap = await loadBootstrap();
      if (bootstrap) setSyncStatus(bootstrap.sync);
    } catch (e) {
      setAppError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSyncingLoading(false);
    }
  };

  const switchOrganization = async (organizationId: number) => {
    try {
      const response = await fetch(`${apiBaseUrl}/organizations/active`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ organizationId }) });
      if (!response.ok) throw new Error("Failed to switch organization");
      const bootstrap = await loadBootstrap();
      if (bootstrap) {
        setUser(bootstrap.user);
        setOrganization(bootstrap.organization);
        setActiveOrganizationId(bootstrap.activeOrganizationId);
        setConnected(bootstrap.integration.connected);
        if (bootstrap.integration.connected) setRepositories(await loadRepositories());
      }
      setOverview(await loadOverview());
      const prs = await loadPullRequests();
      setPullRequests(prs.pullRequests);
      setAvailableRepos(prs.repositories);
    } catch (e) {
      setAppError(e instanceof Error ? e.message : "Unknown error");
    }
  };

  const saveProductionEnvironments = async () => {
    setSavingProductionEnvs(true);
    try {
      const environments = productionEnvironmentsInput.split(",").map((item) => item.trim()).filter((item) => item.length > 0);
      await fetch(`${apiBaseUrl}/settings/production-environments`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ environments }) });
      setDora(await loadDoraOverview());
    } catch (e) {
      setAppError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSavingProductionEnvs(false);
    }
  };

  // Demo data
  const demoRows: PullRequest[] = [
    { github_pr_id: 100001, number: 342, title: "feat: reduce review queue latency", repository_full_name: "acme/platform-api", author_login: "team-platform", state: "open", draft: false, additions: 132, deletions: 47, changed_files: 6, opened_at: new Date().toISOString(), merged_at: null, updated_at: new Date().toISOString(), html_url: null },
    { github_pr_id: 100002, number: 351, title: "fix: security headers policy in public routes", repository_full_name: "acme/web-gateway", author_login: "security-squad", state: "closed", draft: false, additions: 84, deletions: 29, changed_files: 3, opened_at: new Date(Date.now() - 2 * 86400000).toISOString(), merged_at: new Date(Date.now() - 86400000).toISOString(), updated_at: new Date(Date.now() - 86400000).toISOString(), html_url: null }
  ];

  const displayedPullRequests = showProductivityEmpty && demoMode ? demoRows : pullRequests;
  const mergedCount = displayedPullRequests.filter((pr) => Boolean(pr.merged_at)).length;
  const mergeRate = displayedPullRequests.length > 0 ? Math.round((mergedCount / displayedPullRequests.length) * 100) : 0;
  const reviewTimeHours = Math.max(1, Math.round((overview?.avgPrSize ?? 120) / 40));
  const avatarName = user?.name ?? user?.github_login ?? "User";
  const avatarFallback = avatarName.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  const navItems = [
    { key: "dashboard" as Section, label: "Overview", icon: "▦" },
    { key: "productivity" as Section, label: "PR Flow", icon: "↗" },
    { key: "pve" as Section, label: "PVE", icon: "★" },
    { key: "metrics" as Section, label: "DORA", icon: "◫" },
    { key: "repositories" as Section, label: "Repositories", icon: "▤" }
  ];

  if (loading) return <LoadingState message={isPt ? "Carregando..." : "Loading..."} />;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="grid min-h-screen w-full md:grid-cols-[260px,1fr]">
        {/* Sidebar */}
        <aside className="hidden border-r border-slate-800 bg-slate-900/90 px-4 py-6 md:flex md:flex-col">
          <a href="/" className="mb-6 inline-flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-700 text-sm font-bold">DI</span>
            <span className="text-sm font-bold tracking-wide">DevInsights</span>
          </a>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button key={item.key} type="button" onClick={() => setSection(item.key)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${section === item.key ? "bg-slate-100 text-slate-900" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}>
                <span className="text-xs opacity-80">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="mt-auto border-t border-slate-800 pt-4">
            <button type="button" onClick={() => setSection("settings")} className={`mb-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${section === "settings" ? "bg-slate-100 text-slate-900" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}>
              <span>⚙</span><span>Settings</span>
            </button>
            <button type="button" onClick={logout} className="w-full rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800">{isPt ? "Sair" : "Sign out"}</button>
          </div>
        </aside>

        {/* Main content */}
        <div className="bg-slate-950">
          {/* Topbar */}
          <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/95 px-4 py-4 backdrop-blur md:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold text-white md:text-2xl">{
                  section === "dashboard" ? "Overview" :
                  section === "productivity" ? "PR Flow" :
                  section === "metrics" ? "DORA" :
                  section === "pve" ? "PVE — Points of Value Delivered" :
                  section.charAt(0).toUpperCase() + section.slice(1)
                }</h1>
                <p className="mt-1 text-sm text-slate-400">{
                  section === "pve" ? "Rank delivered value by developer based on merged Pull Requests." : "Last 30 days"
                }</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <button type="button" onClick={() => setAvatarMenuOpen(!avatarMenuOpen)} className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-700 bg-slate-800">
                    {user?.avatar_url ? <img src={user.avatar_url} alt={avatarName} className="h-full w-full object-cover" /> : <span className="text-xs font-bold text-slate-200">{avatarFallback}</span>}
                  </button>
                  {avatarMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-xl">
                      <div className="border-b border-slate-800 px-2 pb-2">
                        <p className="text-sm font-semibold text-white">{avatarName}</p>
                        <p className="text-xs text-slate-400">{user?.github_login ?? "-"}</p>
                      </div>
                      <button onClick={logout} className="mt-2 w-full rounded-lg px-2 py-2 text-left text-sm text-slate-300 hover:bg-slate-800">Sign out</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          <div className="space-y-6 px-4 py-6 md:px-8 md:py-8">
            {/* Status banner */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 md:px-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-300">
                  {!connected
                    ? (isPt ? "Conecte o GitHub para gerar métricas." : "Connect GitHub to generate metrics.")
                    : integrationUiState === "CONNECTED_NO_REPOS"
                    ? (isPt ? "GitHub conectado. Selecione repositórios para monitorar." : "GitHub connected. Select repositories to start tracking.")
                    : integrationUiState === "SYNCING"
                    ? (isPt ? "Sincronizando dados do repositório..." : "Syncing repository data...")
                    : latestSyncError
                    ? (isPt ? "Sync falhou. Tente novamente." : "Sync failed. Try again.")
                    : integrationUiState === "SYNCED_WITH_DATA"
                    ? `GitHub connected · Sync completed · ${selectedCount} repo${selectedCount !== 1 ? "s" : ""} · ${syncTotalPrs} PRs`
                    : integrationUiState === "SYNCED_NO_DATA"
                    ? (isPt ? "Sync concluído, mas nenhum PR encontrado." : "Sync completed but no PRs found.")
                    : (isPt ? "GitHub conectado. Rode o sync para gerar métricas." : "GitHub connected. Run sync to generate metrics.")
                  }
                </p>
                <div className="flex gap-2">
                  {!connected ? (
                    <Button variant="primary" size="sm" onClick={connectGitHubApp}>Connect GitHub App</Button>
                  ) : integrationUiState === "SYNCING" || syncingLoading ? (
                    <Button variant="secondary" size="sm" disabled>
                      <span className="inline-flex items-center gap-2">
                        <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
                        Syncing...
                      </span>
                    </Button>
                  ) : (
                    <Button variant="primary" size="sm" onClick={syncNow} disabled={!canRunSync}>Run sync</Button>
                  )}
                </div>
              </div>
              {syncProgress && integrationUiState === "SYNCING" && (
                <p className="mt-2 text-xs text-slate-400">
                  <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-cyan-400 mr-2" />
                  Sync: {syncProgress.phase} · {syncProgress.processedRepositories}/{syncProgress.totalRepositories} repos · {syncProgress.totalPrs} PRs
                </p>
              )}
              {latestSyncError && <p className="mt-2 text-xs text-amber-300">Error: {latestSyncError}</p>}
            </section>

            {/* Cards gerais e PR Intelligence - apenas em dashboard e productivity */}
            {(section === "dashboard" || section === "productivity") && (
              <>
                {/* Metrics cards */}
                <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                  {section === "dashboard" ? (
                    // Overview cards
                    <>
                      <Card className="rounded-xl border border-slate-800 bg-slate-900">
                        <p className="text-xs uppercase tracking-wide text-slate-400">PRs merged 7d</p>
                        <p className="mt-2 text-2xl font-semibold text-white">{overview?.throughput7d ?? 0}</p>
                        <p className="text-xs text-slate-500 mt-1">Merged pull requests in the last 7 days.</p>
                      </Card>
                      <Card className="rounded-xl border border-slate-800 bg-slate-900">
                        <p className="text-xs uppercase tracking-wide text-slate-400">PRs merged 30d</p>
                        <p className="mt-2 text-2xl font-semibold text-white">{overview?.throughput30d ?? 0}</p>
                        <p className="text-xs text-slate-500 mt-1">Merged pull requests in the last 30 days.</p>
                      </Card>
                      <Card className="rounded-xl border border-slate-800 bg-slate-900">
                        <p className="text-xs uppercase tracking-wide text-slate-400">Avg PR size</p>
                        <p className="mt-2 text-2xl font-semibold text-white">{overview?.avgPrSize !== null && overview?.avgPrSize !== undefined ? overview.avgPrSize : "—"}</p>
                        <p className="text-xs text-slate-500 mt-1">Average additions + deletions per merged PR.</p>
                      </Card>
                      <Card className="rounded-xl border border-slate-800 bg-slate-900">
                        <p className="text-xs uppercase tracking-wide text-slate-400">Stale open PRs</p>
                        <p className="mt-2 text-2xl font-semibold text-white">{overview?.stalePrs ?? 0}</p>
                        <p className="text-xs text-slate-500 mt-1">Open PRs older than 7 days.</p>
                      </Card>
                      <Card className="rounded-xl border border-slate-800 bg-slate-900">
                        <p className="text-xs uppercase tracking-wide text-slate-400">Avg review time</p>
                        <p className="mt-2 text-2xl font-semibold text-white">{reviewTimeHours}h</p>
                        <p className="text-xs text-slate-500 mt-1">Average time spent in review.</p>
                      </Card>
                      <Card className="rounded-xl border border-slate-800 bg-slate-900">
                        <p className="text-xs uppercase tracking-wide text-slate-400">Merge rate</p>
                        <p className="mt-2 text-2xl font-semibold text-white">{mergeRate}%</p>
                        <p className="text-xs text-slate-500 mt-1">Share of closed PRs that were merged.</p>
                      </Card>
                    </>
                  ) : (
                    // PR Flow cards (new metrics)
                    <>
                      <Card className="rounded-xl border border-slate-800 bg-slate-900">
                        <p className="text-xs uppercase tracking-wide text-slate-400">Merged PRs</p>
                        <p className="mt-2 text-2xl font-semibold text-white">{prFlow?.mergedPrs30d ?? 0}</p>
                        <p className="text-xs text-slate-500 mt-1">Last 30 days</p>
                      </Card>
                      <Card className="rounded-xl border border-slate-800 bg-slate-900">
                        <p className="text-xs uppercase tracking-wide text-slate-400">Avg PR Cycle Time</p>
                        <p className="mt-2 text-2xl font-semibold text-white">
                          {prFlow?.avgPrCycleTimeHours ? `${Math.round(prFlow.avgPrCycleTimeHours)}h` : "—"}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">Merged PRs</p>
                      </Card>
                      <Card className="rounded-xl border border-slate-800 bg-slate-900">
                        <p className="text-xs uppercase tracking-wide text-slate-400">Avg PR Size</p>
                        <p className="mt-2 text-2xl font-semibold text-white">
                          {prFlow?.avgPrSize ? Math.round(prFlow.avgPrSize) : "—"}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">Lines changed</p>
                      </Card>
                      <Card className="rounded-xl border border-slate-800 bg-slate-900">
                        <p className="text-xs uppercase tracking-wide text-slate-400">Stuck PRs</p>
                        <p className="mt-2 text-2xl font-semibold text-white">{prFlow?.stuckOpenPrs ?? 0}</p>
                        <p className="text-xs text-slate-500 mt-1">Open &gt; 7 days</p>
                      </Card>
                    </>
                  )}
                </section>

                {/* Top Contributors - only in PR Flow */}
                {section === "productivity" && prFlow?.topContributors && prFlow.topContributors.length > 0 && (
                  <Card title="Top Contributors by Merged PRs" subtitle="Authors with most merged PRs in the last 30 days" className="rounded-2xl border border-slate-800 bg-slate-900">
                    <div className="mt-4 space-y-2">
                      {prFlow.topContributors.map((contributor, index) => (
                        <div key={contributor.author_login} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-slate-500">#{index + 1}</span>
                            <span className="text-sm font-medium text-white">{contributor.author_login}</span>
                          </div>
                          <span className="text-sm font-semibold text-cyan-400">{contributor.merged_count} merged</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* PR Table */}
                <Card title="PR Intelligence" subtitle="Latest signals detected from pull requests" className="rounded-2xl border border-slate-800 bg-slate-900">
                  <div className="mt-4 overflow-x-auto rounded-xl border border-slate-800">
                    <table className="min-w-[980px] w-full border-collapse text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-950 text-xs uppercase tracking-wide text-slate-400">
                          <th className="px-3 py-3">Time</th>
                          <th className="px-3 py-3">Signal</th>
                          <th className="px-3 py-3">PR</th>
                          <th className="px-3 py-3">Repository</th>
                          <th className="px-3 py-3">Author</th>
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
                                  <RiskSignalBadge key={`${pr.github_pr_id}-${tag}`} type={tag as any} size="sm" />
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
                </Card>
              </>
            )}

            {/* PVE Section */}
            {section === "pve" && (
              <div className="space-y-6">
                <Card className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
                  <div className="mx-auto max-w-md">
                    <div className="mb-4 text-4xl">★</div>
                    <h3 className="text-xl font-semibold text-white mb-2">PVE v0 coming next</h3>
                    <p className="text-sm text-slate-400 mb-4">
                      PVE will use merged PRs, cycle time and PR size to estimate delivered value.
                    </p>
                    <div className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-xs text-slate-500">
                      Calculation requires PR data from synced repositories
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* DORA Metrics */}
            {section === "metrics" && dora && (
              <div className="space-y-6">
                {/* DORA Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-white">DORA Metrics</h2>
                    <p className="text-sm text-slate-400">Last 90 days • {dora.status === "available" ? "All metrics available" : dora.status === "partial" ? "Partial data" : "Setup required"}</p>
                  </div>
                </div>

                {/* DORA Charts Grid */}
                <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                  {/* Cycle Time Chart */}
                  <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-medium text-slate-300">Cycle Time</h3>
                      <Badge variant={dora.leadTimeForChangesHours && dora.leadTimeForChangesHours < 24 ? "success" : dora.leadTimeForChangesHours && dora.leadTimeForChangesHours < 168 ? "warning" : "default"} size="sm">
                        {dora.leadTimeForChangesHours ? (dora.leadTimeForChangesHours < 24 ? "Elite" : dora.leadTimeForChangesHours < 168 ? "High" : "Medium") : "N/A"}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold text-white mb-4">{dora.leadTimeForChangesHours ? `${Math.round(dora.leadTimeForChangesHours)}h` : "—"}</p>
                    <div className="h-36">
                      {doraTimeseries?.cycleTime?.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={doraTimeseries.cycleTime}>
                            <defs><linearGradient id="cycleGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="week" tickFormatter={(v: string) => new Date(v).toLocaleDateString(undefined, { month: "short", day: "numeric" })} tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} />
                            <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickFormatter={(v: number) => `${v}h`} />
                            <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} labelFormatter={(v: any) => new Date(v).toLocaleDateString()} formatter={(v: any) => [`${Number(v).toFixed(1)}h`, "Avg Cycle Time"]} />
                            <Area type="monotone" dataKey="avgHours" stroke="#6366f1" fill="url(#cycleGrad)" strokeWidth={2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : <p className="flex items-center justify-center h-full text-sm text-slate-500">No data yet</p>}
                    </div>
                  </div>

                  {/* Deploy Frequency Chart */}
                  <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-medium text-slate-300">Deploy Frequency</h3>
                      <Badge variant={dora.deploymentFrequency30d > 30 ? "success" : dora.deploymentFrequency30d > 4 ? "warning" : "default"} size="sm">
                        {dora.deploymentFrequency30d > 30 ? "Elite" : dora.deploymentFrequency30d > 4 ? "High" : "Low"}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold text-white mb-4">{dora.deploymentFrequency30d} <span className="text-sm font-normal text-slate-400">per month</span></p>
                    <div className="h-36">
                      {doraTimeseries?.deployFrequency?.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={doraTimeseries.deployFrequency}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="week" tickFormatter={(v: string) => new Date(v).toLocaleDateString(undefined, { month: "short", day: "numeric" })} tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} />
                            <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} labelFormatter={(v: any) => `Week of ${new Date(v).toLocaleDateString()}`} formatter={(v: any) => [v, "Deploys"]} />
                            <Bar dataKey="deploys" fill="#22d3ee" radius={[3, 3, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : <p className="flex items-center justify-center h-full text-sm text-slate-500">No data yet</p>}
                    </div>
                  </div>

                  {/* MTTR Chart */}
                  <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-medium text-slate-300">MTTR</h3>
                      <Badge variant={dora.mttrHours && dora.mttrHours < 1 ? "success" : dora.mttrHours && dora.mttrHours < 24 ? "info" : "default"} size="sm">
                        {dora.mttrHours ? (dora.mttrHours < 1 ? "Elite" : dora.mttrHours < 24 ? "High" : "Medium") : "N/A"}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold text-white mb-4">{dora.mttrHours ? `${dora.mttrHours < 1 ? Math.round(dora.mttrHours * 60) + "m" : Math.round(dora.mttrHours) + "h"}` : "—"} <span className="text-sm font-normal text-slate-400">mean time to restore</span></p>
                    <div className="h-36">
                      {doraTimeseries?.mttr?.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={doraTimeseries.mttr}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="week" tickFormatter={(v: string) => new Date(v).toLocaleDateString(undefined, { month: "short", day: "numeric" })} tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} />
                            <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickFormatter={(v: number) => `${v}h`} />
                            <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} labelFormatter={(v: any) => new Date(v).toLocaleDateString()} formatter={(v: any) => [`${Number(v).toFixed(1)}h`, "MTTR"]} />
                            <Line type="monotone" dataKey="avgHours" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 3 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : <p className="flex items-center justify-center h-full text-sm text-slate-500">No incidents recorded</p>}
                    </div>
                  </div>
                </div>

                {/* CFR - Full width */}
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-slate-300">Change Failure Rate (CFR)</h3>
                    <Badge variant={dora.changeFailureRate !== null && dora.changeFailureRate < 5 ? "success" : "default"} size="sm">
                      {dora.changeFailureRate !== null ? `${dora.changeFailureRate}%` : "N/A"}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-400 mb-4">Avg change failure rate per week</p>
                  <div className="h-40">
                    {doraTimeseries?.cfr?.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={doraTimeseries.cfr}>
                          <defs><linearGradient id="cfrGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} /><stop offset="95%" stopColor="#f59e0b" stopOpacity={0} /></linearGradient></defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="week" tickFormatter={(v: string) => new Date(v).toLocaleDateString(undefined, { month: "short", day: "numeric" })} tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} />
                          <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickFormatter={(v: number) => `${v}%`} />
                          <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} labelFormatter={(v: any) => `Week of ${new Date(v).toLocaleDateString()}`} formatter={(v: any) => [`${v}%`, "Failure Rate"]} />
                          <Area type="monotone" dataKey="rate" stroke="#f59e0b" fill="url(#cfrGrad)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : <p className="flex items-center justify-center h-full text-sm text-slate-500">No deployment data yet</p>}
                  </div>
                </div>

                {/* Coverage */}
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                  <p className="text-sm font-medium text-slate-300 mb-2">Data Coverage</p>
                  <div className="grid gap-2 md:grid-cols-5 text-xs">
                    <div className={`rounded-lg p-2 ${dora.coverage.productionEnvironmentsConfigured ? "bg-emerald-950 text-emerald-300" : "bg-slate-800 text-slate-400"}`}>Production envs: {dora.coverage.productionEnvironmentsConfigured ? "✓" : "missing"}</div>
                    <div className={`rounded-lg p-2 ${dora.coverage.deploymentsAvailable ? "bg-emerald-950 text-emerald-300" : "bg-slate-800 text-slate-400"}`}>Deployments: {dora.coverage.deploymentsAvailable ? "✓" : "missing"}</div>
                    <div className={`rounded-lg p-2 ${dora.coverage.workflowRunsAvailable ? "bg-emerald-950 text-emerald-300" : "bg-slate-800 text-slate-400"}`}>Workflows: {dora.coverage.workflowRunsAvailable ? "✓" : "missing"}</div>
                    <div className={`rounded-lg p-2 ${dora.coverage.incidentsAvailable ? "bg-emerald-950 text-emerald-300" : "bg-slate-800 text-slate-400"}`}>Incidents: {dora.coverage.incidentsAvailable ? "✓" : "missing"}</div>
                    <div className={`rounded-lg p-2 ${dora.coverage.leadTimeAvailable ? "bg-emerald-950 text-emerald-300" : "bg-slate-800 text-slate-400"}`}>Lead time: {dora.coverage.leadTimeAvailable ? "✓" : "missing"}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Settings */}
            {section === "settings" && (
              <Card title="Production Environments" subtitle="Configure environments used as production" className="rounded-2xl border border-slate-800 bg-slate-900">
                <div className="mt-3 flex flex-wrap gap-2">
                  <input value={productionEnvironmentsInput} onChange={(e) => setProductionEnvironmentsInput(e.target.value)} className="min-w-[280px] flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm" placeholder="production, prod" />
                  <Button variant="primary" size="sm" onClick={saveProductionEnvironments} loading={savingProductionEnvs}>Save</Button>
                </div>
              </Card>
            )}

            {/* Repositories */}
            {section === "repositories" && (
              <Card title="Repositories" subtitle="Select repositories included in sync" className="rounded-2xl border border-slate-800 bg-slate-900">
                {!connected ? (
                  <p className="mt-4 text-sm text-slate-400">Connect GitHub App first.</p>
                ) : repositories.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-400">No repositories available.</p>
                ) : (
                  <div className="mt-4 grid gap-2">
                    {repositories.map((repo) => (
                      <label key={repo.id} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm">
                        <span className="text-slate-200">{repo.full_name}</span>
                        <input type="checkbox" checked={repo.selected} onChange={() => toggleRepository(repo.id)} className="h-4 w-4" />
                      </label>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {/* Organization switcher */}
            {organizations && organizations.length > 1 && (
              <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">{isPt ? "Organização ativa" : "Active organization"}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {organizations.map((org) => (
                    <button key={org.id} type="button" onClick={() => switchOrganization(org.id)} className={`rounded-lg px-3 py-2 text-sm ${activeOrganizationId === org.id ? "bg-slate-100 font-semibold text-slate-900" : "border border-slate-700 text-slate-300 hover:bg-slate-800"}`}>
                      {org.name}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {appError && <ErrorState message={appError} onRetry={() => setAppError(null)} />}
          </div>
        </div>
      </div>
    </main>
  );
}

function AppRouter() {
  if (window.location.pathname === "/app/login") return <AppLoginPage />;
  if (window.location.pathname === "/app" || window.location.pathname.startsWith("/app/")) return <AppDashboardPage />;
  return <LandingPage />;
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");
createRoot(rootElement).render(<React.StrictMode><AppRouter /></React.StrictMode>);
