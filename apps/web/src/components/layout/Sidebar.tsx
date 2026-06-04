/**
 * Sidebar navigation component
 * @module components/layout/Sidebar
 * @validates Requirements 1.2
 */

import React from "react";
import type { Section } from "../../types/store";

/**
 * Navigation item configuration
 */
export interface NavItem {
  key: Section;
  label: string;
  icon: string;
}

/**
 * Props for the Sidebar component
 */
export interface SidebarProps {
  /** Currently active section */
  activeSection: Section;
  /** Callback when a section is selected */
  onSectionChange: (section: Section) => void;
  /** Callback when user signs out */
  onSignOut: () => void;
  /** Optional array of navigation items (defaults to standard items) */
  navItems?: readonly NavItem[];
  /** Locale for i18n */
  locale?: "en" | "pt-BR";
}

/**
 * Default navigation items for the sidebar
 */
const DEFAULT_NAV_ITEMS: readonly NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: "▦" },
  { key: "productivity", label: "Productivity", icon: "↗" },
  { key: "metrics", label: "Metrics", icon: "◫" },
  { key: "repositories", label: "Repositories", icon: "▤" },
  { key: "teams", label: "Teams", icon: "◎" },
  { key: "integrations", label: "Integrations", icon: "◌" }
] as const;

/**
 * Sidebar navigation component with section links
 * Hidden on mobile, flex column on md+
 */
export function Sidebar({
  activeSection,
  onSectionChange,
  onSignOut,
  navItems = DEFAULT_NAV_ITEMS as readonly NavItem[],
  locale = "en"
}: SidebarProps): JSX.Element {
  const isPt = locale === "pt-BR";
  const signOutText = isPt ? "Sair" : "Sign out";

  return (
    <aside className="hidden border-r border-slate-800 bg-slate-900/90 px-4 py-6 md:flex md:flex-col">
      {/* Logo */}
      <a href="/" className="mb-6 inline-flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-700 text-sm font-bold">DI</span>
        <span className="text-sm font-bold tracking-wide">DevInsights</span>
      </a>

      {/* Navigation */}
      <nav className="space-y-1">
        {navItems.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onSectionChange(item.key)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
              activeSection === item.key
                ? "bg-slate-100 text-slate-900"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <span className="text-xs opacity-80">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer with Settings and Sign out */}
      <div className="mt-auto border-t border-slate-800 pt-4">
        <button
          type="button"
          onClick={() => onSectionChange("settings")}
          className={`mb-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
            activeSection === "settings" ? "bg-slate-100 text-slate-900" : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span>⚙</span>
          <span>Settings</span>
        </button>
        <button
          type="button"
          onClick={onSignOut}
          className="w-full rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
        >
          {signOutText}
        </button>
      </div>
    </aside>
  );
}
