/**
 * Store state types for Zustand stores
 * @module types/store
 * @validates Requirements 3.2
 */

// Re-export types that are defined in api.ts (to be created)
// These are referenced by store state interfaces

/**
 * User entity from GitHub OAuth
 */
export interface User {
  id: number;
  github_id: number;
  github_login: string;
  name: string | null;
  avatar_url: string | null;
}

/**
 * Organization entity
 */
export interface Organization {
  id: number;
  name: string;
  role: string;
}

/**
 * Repository entity with selection state
 */
export interface Repository {
  id: number;
  full_name: string;
  private: boolean;
  selected: boolean;
}

/**
 * Sync job status tracking
 */
export interface SyncJob {
  id: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  processed_repositories: number;
  total_prs: number;
  error_message: string | null;
  started_at: string | null;
  finished_at: string | null;
}

/**
 * Real-time sync progress information
 */
export interface SyncProgress {
  status: string;
  phase: string;
  totalRepositories: number;
  processedRepositories: number;
  totalPrs: number;
  startedAt?: string | null;
  finishedAt?: string | null;
  errorMessage?: string | null;
}

/**
 * Application section identifiers for navigation
 */
export type Section =
  | 'dashboard'
  | 'productivity'
  | 'metrics'
  | 'repositories'
  | 'teams'
  | 'integrations'
  | 'settings';

/**
 * Supported locale identifiers
 */
export type Locale = 'en' | 'pt-BR';

/**
 * Global application state
 * Manages navigation, demo mode, UI state, and errors
 */
export interface AppState {
  section: Section;
  demoMode: boolean;
  avatarMenuOpen: boolean;
  error: string | null;
}

/**
 * User authentication and organization state
 * Manages current user, organization context, and organization switching
 */
export interface UserState {
  user: User | null;
  organization: Organization | null;
  organizations: Organization[];
  activeOrganizationId: number | null;
}

/**
 * GitHub integration state
 * Manages integration status, repository selection, and sync progress
 */
export interface IntegrationState {
  connected: boolean;
  installationId: number | null;
  selectedRepositories: number;
  syncStatus: SyncJob | null;
  syncProgress: SyncProgress | null;
  repositories: Repository[];
}

/**
 * User settings state with persistence
 * Manages locale, production environments, and accessibility preferences
 */
export interface SettingsState {
  locale: Locale;
  productionEnvironments: string[];
  reducedMotion: boolean;
}
