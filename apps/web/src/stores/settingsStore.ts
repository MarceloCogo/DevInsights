/**
 * Settings Store - User preferences with persistence
 * @module stores/settingsStore
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { SettingsState, Locale } from '../types/store';

interface SettingsActions {
  setLocale: (locale: Locale) => void;
  setProductionEnvironments: (envs: string[]) => void;
  setReducedMotion: (reduced: boolean) => void;
}

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  devtools(
    persist(
      (set) => ({
        locale: 'en',
        productionEnvironments: ['production'],
        reducedMotion: false,

        setLocale: (locale) => set({ locale }),
        setProductionEnvironments: (productionEnvironments) => set({ productionEnvironments }),
        setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      }),
      {
        name: 'devinsights-settings',
        partialize: (state) => ({
          locale: state.locale,
          productionEnvironments: state.productionEnvironments,
        }),
      }
    ),
    { name: 'settings-store' }
  )
);
