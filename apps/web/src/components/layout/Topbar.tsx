/**
 * Top navigation bar component
 * @module components/layout/Topbar
 * @validates Requirements 1.2
 */

import React from "react";
import type { User, Organization, Section } from "../../types/store";

/**
 * Section title mapping
 */
const SECTION_TITLES: Record<Section, string> = {
  dashboard: "Dashboard",
  productivity: "Productivity",
  metrics: "Metrics",
  repositories: "Repositories",
  teams: "Teams",
  integrations: "Integrations",
  settings: "Settings",
  pve: "PVE"
} as const;

/**
 * Props for the Topbar component
 */
export interface TopbarProps {
  /** Currently active section */
  activeSection: Section;
  /** Current user information */
  user: User | null;
  /** Current organization */
  organization: Organization | null;
  /** All available organizations for switching */
  organizations: Organization[];
  /** Whether organization switch is in progress */
  changingOrg?: boolean;
  /** Callback when user signs out */
  onSignOut: () => void;
  /** Callback to switch organization */
  onSwitchOrganization?: (organizationId: number) => void;
  /** Whether avatar dropdown menu is open */
  avatarMenuOpen: boolean;
  /** Callback when avatar menu toggle is clicked */
  onToggleAvatarMenu: () => void;
  /** Locale for i18n */
  locale?: "en" | "pt-BR";
}

/**
 * Top navigation bar with section title, user menu, and organization switcher
 */
export function Topbar({
  activeSection,
  user,
  organization,
  organizations,
  changingOrg = false,
  onSignOut,
  onSwitchOrganization,
  avatarMenuOpen,
  onToggleAvatarMenu,
  locale = "en"
}: TopbarProps): JSX.Element {
  const isPt = locale === "pt-BR";

  // Get section title
  const sectionTitle = SECTION_TITLES[activeSection];

  // Generate avatar fallback from user name
  const avatarName = user?.name ?? user?.github_login ?? "User";
  const avatarFallback = avatarName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/95 px-4 py-4 backdrop-blur md:px-8">
      <div className="flex items-center justify-between gap-4">
        {/* Section Title */}
        <div>
          <h1 className="text-xl font-semibold text-white md:text-2xl">{sectionTitle}</h1>
          <p className="mt-1 text-sm text-slate-400">{isPt ? "Últimos 30 dias" : "Last 30 days"}</p>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Configure button */}
          <button className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800">
            {isPt ? "Configurar" : "Configure"}
          </button>

          {/* Support button - hidden on mobile */}
          <button className="hidden rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 md:inline-flex">
            {isPt ? "Falar com suporte" : "Talk to support"}
          </button>

          {/* Notification button */}
          <button className="rounded-lg border border-slate-700 px-2.5 py-2 text-sm text-slate-300 hover:bg-slate-800">
            🔔
          </button>

          {/* User Avatar with Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={onToggleAvatarMenu}
              className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-700 bg-slate-800"
              aria-label={isPt ? "Menu do usuário" : "User menu"}
              aria-expanded={avatarMenuOpen}
            >
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={avatarName} className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-slate-200">{avatarFallback}</span>
              )}
            </button>

            {/* Avatar Dropdown Menu */}
            {avatarMenuOpen ? (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-xl">
                {/* User info */}
                <div className="border-b border-slate-800 px-2 pb-2">
                  <p className="text-sm font-semibold text-white">{avatarName}</p>
                  <p className="text-xs text-slate-400">{user?.github_login ?? "-"}</p>
                  <p className="mt-1 text-xs text-slate-500">{organization?.name ?? (isPt ? "Sem organização" : "No organization")}</p>
                </div>

                {/* Organization Switcher */}
                {organizations.length > 1 && onSwitchOrganization && (
                  <div className="border-b border-slate-800 py-2">
                    <p className="px-2 pb-1 text-xs font-medium text-slate-400">
                      {isPt ? "Organizações" : "Organizations"}
                    </p>
                    {organizations.map((org) => (
                      <button
                        key={org.id}
                        type="button"
                        onClick={() => onSwitchOrganization(org.id)}
                        disabled={changingOrg || org.id === organization?.id}
                        className={`w-full rounded-lg px-2 py-2 text-left text-sm ${
                          org.id === organization?.id
                            ? "bg-slate-700 text-white"
                            : "text-slate-300 hover:bg-slate-800"
                        } ${changingOrg ? "cursor-not-allowed opacity-50" : ""}`}
                      >
                        {org.name}
                        {org.id === organization?.id && (
                          <span className="ml-2 text-xs text-slate-400">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Menu actions */}
                <button className="mt-2 w-full rounded-lg px-2 py-2 text-left text-sm text-slate-300 hover:bg-slate-800">
                  {isPt ? "Configurações" : "Settings"}
                </button>
                <button className="w-full rounded-lg px-2 py-2 text-left text-sm text-slate-300 hover:bg-slate-800">
                  {isPt ? "Faturamento / Plano" : "Billing / Plan"}
                </button>
                <button
                  onClick={onSignOut}
                  className="w-full rounded-lg px-2 py-2 text-left text-sm text-slate-300 hover:bg-slate-800"
                >
                  {isPt ? "Sair" : "Sign out"}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
