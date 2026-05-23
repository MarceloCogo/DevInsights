import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

type BootstrapResponse = {
  user: {
    github_login: string;
    name: string | null;
    avatar_url: string | null;
  };
  organization: {
    id: number;
    name: string;
  } | null;
};

type Repository = {
  id: number;
  full_name: string;
  private: boolean;
  selected: boolean;
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001/api/v1";

function LandingPage() {
  return (
    <div className="site">
      <header className="topbar">
        <a className="brand" href="#home">
          DevInsights
        </a>
        <nav className="nav">
          <a href="#product">Produto</a>
          <a href="#insights">Insights</a>
          <a href="#pricing">Pricing</a>
        </nav>
        <a className="ghost linkBtn" href="/app/login">
          Entrar
        </a>
      </header>

      <main id="home">
        <section className="hero">
          <p className="eyebrow">Engineering Intelligence for modern teams</p>
          <h1>Transforme dados do GitHub em melhoria real de entrega</h1>
          <p className="lead">
            Descubra gargalos no fluxo de PR, reduza tempo de ciclo e acompanhe o impacto de IA com
            clareza para liderança e squads.
          </p>
          <div className="heroActions">
            <a className="primary linkBtn" href="/app/login">
              Iniciar onboarding
            </a>
            <a className="secondary linkBtn" href="#pricing">
              Ver pricing
            </a>
          </div>
          <div className="heroPanel">
            <div>
              <span>Cycle Time</span>
              <strong>2.4 dias</strong>
              <small>-31% no trimestre</small>
            </div>
            <div>
              <span>Review Load</span>
              <strong>6.1 PRs/reviewer</strong>
              <small>threshold recomendado: 5</small>
            </div>
            <div>
              <span>AI Assisted PRs</span>
              <strong>43%</strong>
              <small>com checklist humano ativo</small>
            </div>
          </div>
        </section>

        <section className="proof" id="product">
          <article>
            <h2>Menos opinião, mais sinal de execução</h2>
            <p>
              Veja pickup time, review time, PR size e throughput em um único fluxo visual para agir
              rápido onde o time realmente trava.
            </p>
          </article>
          <article>
            <h2>Privacidade por design desde o MVP</h2>
            <p>
              Métricas transparentes, foco em nível de time e controle granular de coleta para evitar
              uso indevido e ranking individual simplista.
            </p>
          </article>
          <article>
            <h2>GitHub-native, open source-first</h2>
            <p>
              Integração com GitHub App, webhooks e arquitetura modular para self-hosted, com caminho
              claro para evolução SaaS no futuro.
            </p>
          </article>
        </section>

        <section className="insights" id="insights">
          <h3>O que você acompanha em uma semana</h3>
          <ul>
            <li>PRs parados por squad e por repositório</li>
            <li>Reviewers sobrecarregados antes de virar atraso</li>
            <li>Comparativo de PRs com IA vs sem IA</li>
            <li>Risco por PR grande e retrabalho após review</li>
          </ul>
        </section>

        <section className="pricing" id="pricing">
          <div className="pricingCard">
            <p className="eyebrow">Pricing & Contratacao</p>
            <h3>Em breve: planos por squad e por organizacao</h3>
            <p>
              Nesta fase, estamos abrindo lista de interesse para pilotos. A contratacao completa fica
              para as proximas sprints com checkout e billing integrados.
            </p>
            <button className="primary" type="button">
              Entrar na lista de espera
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

function AppLoginPage() {
  return (
    <main className="appPage">
      <section className="appCard">
        <p className="eyebrow">App Access</p>
        <h1>Entrar no DevInsights</h1>
        <p className="lead compact">Use sua conta GitHub para autenticar e iniciar o onboarding self-service.</p>
        <a className="primary linkBtn full" href={`${apiBaseUrl}/auth/github/login`}>
          Continuar com GitHub
        </a>
      </section>
    </main>
  );
}

function AppDashboardPage() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [bootstrap, setBootstrap] = React.useState<BootstrapResponse | null>(null);
  const [repositories, setRepositories] = React.useState<Repository[]>([]);
  const [connected, setConnected] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const meResponse = await fetch(`${apiBaseUrl}/auth/me`, { credentials: "include" });
      if (meResponse.status === 401) {
        window.location.assign("/app/login");
        return;
      }

      if (!meResponse.ok) {
        throw new Error("failed to load session");
      }

      const mePayload = (await meResponse.json()) as BootstrapResponse;
      setBootstrap(mePayload);

      const repositoriesResponse = await fetch(`${apiBaseUrl}/integrations/github/repositories`, {
        credentials: "include"
      });

      if (repositoriesResponse.ok) {
        const repositoriesPayload = (await repositoriesResponse.json()) as {
          connected: boolean;
          repositories: Repository[];
        };
        setConnected(repositoriesPayload.connected);
        setRepositories(repositoriesPayload.repositories);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "unknown_error");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadData();
  }, [loadData]);

  const connectGithub = async () => {
    const response = await fetch(`${apiBaseUrl}/integrations/github/install-url`, {
      credentials: "include"
    });

    if (!response.ok) {
      setError("nao foi possivel gerar URL de instalacao do GitHub App");
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

  const saveSelection = async () => {
    const selectedIds = repositories.filter((repository) => repository.selected).map((repository) => repository.id);
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/integrations/github/repositories/select`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repositoryIds: selectedIds })
      });

      if (!response.ok) {
        throw new Error("falha ao salvar repositorios");
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "save_failed");
    } finally {
      setSaving(false);
    }
  };

  const logout = async () => {
    await fetch(`${apiBaseUrl}/auth/logout`, { method: "POST", credentials: "include" });
    window.location.assign("/");
  };

  if (loading) {
    return (
      <main className="appPage">
        <section className="appCard">
          <p>Carregando ambiente...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="appPage">
      <section className="appCard">
        <div className="appTop">
          <div>
            <p className="eyebrow">App Dashboard</p>
            <h1>Ola, {bootstrap?.user.name ?? bootstrap?.user.github_login}</h1>
            <p className="lead compact">Organizacao atual: {bootstrap?.organization?.name ?? "nao definida"}</p>
          </div>
          <button className="secondary" onClick={logout} type="button">
            Sair
          </button>
        </div>

        <div className="metricsGrid">
          <article>
            <span>PR Cycle Time</span>
            <strong>Em processamento</strong>
          </article>
          <article>
            <span>Review Time</span>
            <strong>Em processamento</strong>
          </article>
          <article>
            <span>Throughput</span>
            <strong>Em processamento</strong>
          </article>
        </div>

        <section className="integrationCard">
          <h2>Integracao GitHub (Self-service)</h2>
          {!connected ? (
            <>
              <p>Conecte o GitHub App para listar e selecionar repositorios monitorados.</p>
              <button className="primary" onClick={connectGithub} type="button">
                Conectar GitHub App
              </button>
            </>
          ) : (
            <>
              <p>Selecione os repositorios para iniciar o sync inicial.</p>
              <div className="repoList">
                {repositories.map((repository) => (
                  <label key={repository.id} className="repoItem">
                    <input
                      type="checkbox"
                      checked={repository.selected}
                      onChange={() => toggleRepository(repository.id)}
                    />
                    <span>{repository.full_name}</span>
                    <small>{repository.private ? "private" : "public"}</small>
                  </label>
                ))}
              </div>
              <button className="primary" onClick={saveSelection} disabled={saving} type="button">
                {saving ? "Salvando..." : "Salvar selecao e iniciar sync"}
              </button>
            </>
          )}
        </section>

        {error ? <p className="errorText">Erro: {error}</p> : null}
      </section>
    </main>
  );
}

function AppRouter() {
  const path = window.location.pathname;

  if (path === "/" || path.startsWith("/#")) {
    return <LandingPage />;
  }

  if (path === "/app/login") {
    return <AppLoginPage />;
  }

  if (path.startsWith("/app")) {
    return <AppDashboardPage />;
  }

  return <LandingPage />;
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);
