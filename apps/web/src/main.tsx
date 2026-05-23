import React from "react";
import { createRoot } from "react-dom/client";
import { LandingPage } from "./landing/LandingPage";
import "./styles.css";

function AppLoginPage() {
  return (
    <main className="min-h-screen bg-ink px-5 py-10 text-text">
      <div className="mx-auto max-w-md rounded-2xl border border-line bg-panel p-7 shadow-glow">
        <p className="text-xs uppercase tracking-[0.16em] text-accent">DevInsights App</p>
        <h1 className="mt-3 text-3xl font-bold">Entrar</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Esta area sera usada pelo produto em `app.seudominio.com` no futuro. Por enquanto, mantenha o acesso
          por esta rota para separar landing e aplicacao desde ja.
        </p>
        <button
          type="button"
          className="mt-6 w-full rounded-full bg-accent px-6 py-3 text-sm font-bold text-ink hover:brightness-110"
        >
          Continuar com GitHub
        </button>
        <a href="/" className="mt-4 inline-block text-sm text-muted underline decoration-line underline-offset-4">
          Voltar para landing
        </a>
      </div>
    </main>
  );
}

function AppRouter() {
  if (window.location.pathname === "/app/login") {
    return <AppLoginPage />;
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
