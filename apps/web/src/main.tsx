import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

function App() {
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
        <button className="ghost">Entrar</button>
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
            <button className="primary">Quero acesso antecipado</button>
            <button className="secondary">Ver demo do produto</button>
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
            <button className="primary">Entrar na lista de espera</button>
          </div>
        </section>
      </main>
    </div>
  );
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
