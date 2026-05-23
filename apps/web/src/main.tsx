import React from "react";
import { createRoot } from "react-dom/client";
import { LandingPage } from "./landing/LandingPage";
import "./styles.css";

type Locale = "pt-BR" | "en";

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
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

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
  } | null;
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

function AppDashboardPage() {
  const locale = detectLocale();
  const isPt = locale === "pt-BR";
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<AppBootstrapResponse | null>(null);
  const [repositories, setRepositories] = React.useState<Repository[]>([]);
  const [savingRepos, setSavingRepos] = React.useState(false);

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
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [loadBootstrap, loadRepositories]);

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

  const onboardingStep = !data
    ? 0
    : !data.integration.connected
      ? 1
      : data.integration.selectedRepositories === 0
        ? 2
        : !data.sync || data.sync.status === "pending" || data.sync.status === "running"
          ? 3
          : 4;

  return (
    <main className="relative min-h-screen overflow-hidden bg-ink px-5 py-10 text-text">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_15%,rgba(34,184,240,0.14),transparent_32%),radial-gradient(circle_at_90%_0%,rgba(40,215,164,0.12),transparent_40%)]" />
      <div className="relative mx-auto w-full max-w-6xl">
        <header className="rounded-2xl border border-line bg-panel/80 p-5 backdrop-blur md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-accent">DevInsights App</p>
              <h1 className="mt-2 text-2xl font-bold md:text-3xl">
                {isPt ? "Dashboard inicial" : "Initial dashboard"}
              </h1>
              <p className="mt-1 text-sm text-muted">
                {isPt ? "Usuário autenticado via GitHub" : "User authenticated with GitHub"}
              </p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-text hover:bg-panelSoft"
            >
              {isPt ? "Sair" : "Sign out"}
            </button>
          </div>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-4">
          <article className="rounded-2xl border border-line bg-panel p-5">
            <p className="text-xs uppercase tracking-[0.12em] text-muted">{isPt ? "Status" : "Status"}</p>
            <p className="mt-2 text-lg font-semibold text-text">
              {loading ? (isPt ? "Carregando..." : "Loading...") : isPt ? "Autenticado" : "Authenticated"}
            </p>
          </article>
          <article className="rounded-2xl border border-line bg-panel p-5">
            <p className="text-xs uppercase tracking-[0.12em] text-muted">GitHub</p>
            <p className="mt-2 text-lg font-semibold text-text">
              {data?.user.github_login ? `@${data.user.github_login}` : "-"}
            </p>
          </article>
          <article className="rounded-2xl border border-line bg-panel p-5">
            <p className="text-xs uppercase tracking-[0.12em] text-muted">
              {isPt ? "Organização" : "Organization"}
            </p>
            <p className="mt-2 text-lg font-semibold text-text">{data?.organization?.name ?? "-"}</p>
          </article>
          <article className="rounded-2xl border border-line bg-panel p-5">
            <p className="text-xs uppercase tracking-[0.12em] text-muted">{isPt ? "Onboarding" : "Onboarding"}</p>
            <p className="mt-2 text-lg font-semibold text-text">
              {isPt ? `Etapa ${onboardingStep}/4` : `Step ${onboardingStep}/4`}
            </p>
          </article>
        </section>

        <section className="mt-6 rounded-2xl border border-line bg-gradient-to-br from-panel to-panelSoft p-6">
          <h2 className="text-xl font-bold">{isPt ? "Onboarding self-service" : "Self-service onboarding"}</h2>
          {!data?.integration.connected ? (
            <div className="mt-4">
              <p className="text-sm text-muted">
                {isPt
                  ? "Passo 1: conecte o GitHub App para começar a coletar dados dos repositórios."
                  : "Step 1: connect GitHub App to start collecting repository data."}
              </p>
              <button
                type="button"
                onClick={connectGitHubApp}
                className="mt-4 rounded-full bg-accent px-5 py-2 text-sm font-bold text-ink hover:brightness-110"
              >
                {isPt ? "Conectar GitHub App" : "Connect GitHub App"}
              </button>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <p className="text-sm text-muted">
                {isPt
                  ? "Passo 2: selecione os repositórios monitorados e inicie a sincronização inicial."
                  : "Step 2: select monitored repositories and start initial sync."}
              </p>

              {repositories.length > 0 ? (
                <div className="grid max-h-64 gap-2 overflow-auto rounded-xl border border-line bg-ink/20 p-3 md:grid-cols-2">
                  {repositories.map((repo) => (
                    <label key={repo.id} className="flex items-center gap-2 rounded-lg border border-line/60 bg-panel/70 px-3 py-2 text-sm">
                      <input
                        type="checkbox"
                        checked={repo.selected}
                        onChange={() => toggleRepository(repo.id)}
                        className="h-4 w-4"
                      />
                      <span className="truncate">{repo.full_name}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted">{isPt ? "Carregando repositórios autorizados..." : "Loading authorized repositories..."}</p>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={saveRepositoriesAndSync}
                  disabled={savingRepos || repositories.length === 0}
                  className="rounded-full bg-accent px-5 py-2 text-sm font-bold text-ink hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingRepos
                    ? isPt
                      ? "Salvando..."
                      : "Saving..."
                    : isPt
                      ? "Salvar e iniciar coleta"
                      : "Save and start collection"}
                </button>
                <button
                  type="button"
                  onClick={syncNow}
                  className="rounded-full border border-line px-5 py-2 text-sm font-semibold text-text hover:bg-panelSoft"
                >
                  {isPt ? "Sincronizar agora" : "Sync now"}
                </button>
              </div>
            </div>
          )}

          {data?.sync ? (
            <div className="mt-6 rounded-xl border border-line/70 bg-ink/20 p-4 text-sm text-muted">
              <p>
                {isPt ? "Status do sync:" : "Sync status:"} <strong className="text-text">{data.sync.status}</strong>
              </p>
              <p>
                {isPt ? "Repositórios processados:" : "Processed repositories:"} {data.sync.processed_repositories}
              </p>
              <p>
                {isPt ? "PRs coletados:" : "Collected PRs:"} {data.sync.total_prs}
              </p>
              {data.sync.error_message ? <p className="text-red-300">{data.sync.error_message}</p> : null}
            </div>
          ) : null}

          {data?.repositoryInsights ? (
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <article className="rounded-xl border border-line/70 bg-ink/20 p-3 text-sm">
                <p className="text-xs text-muted">{isPt ? "Repos monitorados" : "Monitored repos"}</p>
                <p className="mt-1 font-semibold text-text">{data.repositoryInsights.repositories}</p>
              </article>
              <article className="rounded-xl border border-line/70 bg-ink/20 p-3 text-sm">
                <p className="text-xs text-muted">{isPt ? "PRs abertos" : "Open PRs"}</p>
                <p className="mt-1 font-semibold text-text">{data.repositoryInsights.open_prs}</p>
              </article>
              <article className="rounded-xl border border-line/70 bg-ink/20 p-3 text-sm">
                <p className="text-xs text-muted">{isPt ? "PRs merged" : "Merged PRs"}</p>
                <p className="mt-1 font-semibold text-text">{data.repositoryInsights.merged_prs}</p>
              </article>
            </div>
          ) : null}

          {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
        </section>
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
