/**
 * API Response Types
 * 
 * TypeScript interfaces for all API responses used in the DevInsights frontend.
 * These types are extracted from the main.tsx monolith and aligned with backend API contracts.
 * 
 * @see Requirements 3.2 - Create typed interfaces for all API responses
 */

/**
 * User information from GitHub OAuth authentication
 */
export interface User {
  id: number;
  github_id: number;
  github_login: string;
  name: string | null;
  avatar_url: string | null;
}

/**
 * Organization membership information
 */
export interface Organization {
  id: number;
  name: string;
  role: string;
}

/**
 * GitHub App integration status
 */
export interface IntegrationStatus {
  connected: boolean;
  installationId?: number | null;
  selectedRepositories: number;
}

/**
 * Sync job status and progress information
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
 * Repository insights summary
 */
export interface RepositoryInsights {
  repositories: number;
  open_prs: number;
  merged_prs: number;
}

/**
 * Bootstrap response containing all initial app data
 * Returned by GET /auth/bootstrap endpoint
 */
export interface AppBootstrapResponse {
  user: User;
  organization: Organization | null;
  organizations: Organization[];
  activeOrganizationId: number | null;
  integration: IntegrationStatus;
  sync: SyncJob | null;
  repositoryInsights: RepositoryInsights;
}

/**
 * Pull request information for dashboard display
 */
export interface PullRequest {
  github_pr_id: number;
  number: number;
  title: string;
  repository_full_name: string;
  author_login: string | null;
  state: 'open' | 'closed';
  draft: boolean;
  additions: number;
  deletions: number;
  changed_files: number;
  opened_at: string | null;
  merged_at: string | null;
  updated_at: string | null;
  html_url: string | null;
}

/**
 * Dashboard overview metrics
 */
export interface DashboardOverview {
  selectedRepositories: number;
  openPrs: number;
  throughput7d: number;
  throughput30d: number;
  avgPrSize: number;
  stalePrs: number;
  lastSync: {
    status: string;
    started_at: string | null;
    finished_at: string | null;
    total_prs: number;
  } | null;
}

/**
 * DORA metrics overview with coverage status
 */
export interface DoraOverview {
  status: 'setup_required' | 'partial' | 'available';
  period: '30d';
  deploymentFrequency30d: number;
  leadTimeForChangesHours: number | null;
  changeFailureRate: number | null;
  mttrHours: number | null;
  coverage: {
    productionEnvironmentsConfigured: boolean;
    deploymentsAvailable: boolean;
    workflowRunsAvailable: boolean;
    incidentsAvailable: boolean;
    leadTimeAvailable?: boolean;
  };
}

/**
 * Repository selection status
 */
export interface Repository {
  id: number;
  full_name: string;
  private: boolean;
  selected: boolean;
}

/**
 * Onboarding wizard progress tracking
 */
export interface OnboardingStatus {
  organizationId: number | null;
  step: number;
  githubConnected: boolean;
  repositoriesSelected: boolean;
  syncStarted: boolean;
  syncCompleted: boolean;
  syncStatus?: string | null;
  productionConfigured?: boolean;
}

/**
 * Integration log entry for sync history
 */
export interface IntegrationLogItem {
  status: string;
  phase: string;
  totalRepositories: number;
  processedRepositories: number;
  totalPrs: number;
  errorMessage?: string | null;
  startedAt?: string | null;
  finishedAt?: string | null;
  createdAt?: string | null;
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
