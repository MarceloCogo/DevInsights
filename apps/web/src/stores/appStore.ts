/**
 * App Store - Global application state
 * @module stores/appStore
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { AppState, Section } from '../types/store';

interface AppActions {
  setSection: (section: Section) => void;
  toggleDemoMode: () => void;
  setAvatarMenuOpen: (open: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState & AppActions>()(
  devtools(
    (set) => ({
      // State
      section: 'productivity',
      demoMode: false,
      avatarMenuOpen: false,
      error: null,

      // Actions
      setSection: (section) => set({ section }),
      toggleDemoMode: () => set((state) => ({ demoMode: !state.demoMode })),
      setAvatarMenuOpen: (open) => set({ avatarMenuOpen: open }),
      setError: (error) => set({ error }),
    }),
    { name: 'app-store' }
  )
);
