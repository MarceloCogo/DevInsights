/**
 * Integration Store - GitHub integration state
 * @module stores/integrationStore
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { IntegrationState, Repository, SyncProgress, SyncJob } from '../types/store';

interface IntegrationActions {
  setConnected: (connected: boolean) => void;
  setInstallationId: (id: number | null) => void;
  setRepositories: (repos: Repository[]) => void;
  toggleRepository: (id: number) => void;
  setSyncProgress: (progress: SyncProgress | null) => void;
  setSyncStatus: (status: SyncJob | null) => void;
  setSelectedRepositories: (count: number) => void;
  clear: () => void;
}

const initialState: IntegrationState = {
  connected: false,
  installationId: null,
  selectedRepositories: 0,
  syncStatus: null,
  syncProgress: null,
  repositories: [],
};

export const useIntegrationStore = create<IntegrationState & IntegrationActions>()(
  devtools(
    (set) => ({
      ...initialState,

      setConnected: (connected) => set({ connected }),
      setInstallationId: (installationId) => set({ installationId }),
      setRepositories: (repositories) => set({ repositories }),
      toggleRepository: (id) => set((state) => ({
        repositories: state.repositories.map((repo) =>
          repo.id === id ? { ...repo, selected: !repo.selected } : repo
        ),
      })),
      setSyncProgress: (syncProgress) => set({ syncProgress }),
      setSyncStatus: (syncStatus) => set({ syncStatus }),
      setSelectedRepositories: (selectedRepositories) => set({ selectedRepositories }),
      clear: () => set(initialState),
    }),
    { name: 'integration-store' }
  )
);
