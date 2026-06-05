/**
 * useKeyboardShortcuts Hook - Global keyboard shortcuts
 * @module hooks/useKeyboardShortcuts
 */

import { useEffect, useCallback } from 'react';

interface KeyboardShortcutsConfig {
  onHelp?: () => void;
  onNavigate?: (section: string) => void;
  onSearch?: () => void;
  onRefresh?: () => void;
  onEscape?: () => void;
}

export function useKeyboardShortcuts(config: KeyboardShortcutsConfig) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Ignore if focus is in an input field
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        if (event.key === 'Escape' && config.onEscape) {
          config.onEscape();
        }
        return;
      }

      switch (event.key) {
        case '?':
          config.onHelp?.();
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
          const sections = ['dashboard', 'productivity', 'metrics', 'repositories', 'teams', 'integrations'];
          config.onNavigate?.(sections[parseInt(event.key) - 1]);
          break;
        case '/':
          event.preventDefault();
          config.onSearch?.();
          break;
        case 'r':
          config.onRefresh?.();
          break;
        case 'Escape':
          config.onEscape?.();
          break;
      }
    },
    [config]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
