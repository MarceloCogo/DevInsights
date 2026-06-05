/**
 * MobileDrawer Component - Navigation drawer for mobile screens
 * @module components/layout/MobileDrawer
 */

import type { Section } from '../../types/store';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection: Section;
  onSectionChange: (section: Section) => void;
  onSignOut: () => void;
  locale?: 'en' | 'pt-BR';
}

const NAV_ITEMS: Array<{ key: Section; label: string; icon: string }> = [
  { key: 'dashboard', label: 'Dashboard', icon: '▦' },
  { key: 'productivity', label: 'Productivity', icon: '↗' },
  { key: 'metrics', label: 'Metrics', icon: '◫' },
  { key: 'repositories', label: 'Repositories', icon: '▤' },
  { key: 'teams', label: 'Teams', icon: '◎' },
  { key: 'integrations', label: 'Integrations', icon: '◌' },
];

export function MobileDrawer({ isOpen, onClose, activeSection, onSectionChange, onSignOut, locale = 'en' }: MobileDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      
      {/* Drawer */}
      <nav className="absolute left-0 top-0 h-full w-64 bg-slate-900 p-4 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <span className="text-lg font-bold">DevInsights</span>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white" aria-label="Close menu">
            ✕
          </button>
        </div>
        
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => { onSectionChange(item.key); onClose(); }}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium min-h-[44px] ${
                activeSection === item.key
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span className="text-xs opacity-80">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
        
        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={onSignOut}
            className="w-full rounded-lg border border-slate-700 px-3 py-3 text-sm text-slate-300 hover:bg-slate-800 min-h-[44px]"
          >
            {locale === 'pt-BR' ? 'Sair' : 'Sign out'}
          </button>
        </div>
      </nav>
    </div>
  );
}
