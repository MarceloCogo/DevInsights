# Implementation Plan: Frontend Evolution

## Overview

This implementation plan transforms the monolithic main.tsx (1274 lines) into a modular, scalable architecture with Zustand state management, code splitting, new features (risk signals, sync jobs page, charts), and comprehensive testing. The migration follows a 7-phase approach to ensure stability at each step.

## Tasks

### Phase 1: Foundation - Directory Structure and Types

- [x] 1. Set up modular directory structure
  - Create directories: components/, components/ui/, components/state/, components/charts/, components/layout/, components/onboarding/, components/risk-signals/
  - Create directories: pages/, hooks/, stores/, lib/, types/, i18n/, i18n/locales/, styles/
  - Create index.ts barrel files in each component directory
  - _Requirements: 1.1_

- [x] 2. Extract TypeScript interfaces and types
  - [x] 2.1 Create types/api.ts with all API response interfaces
    - Define User, Organization, AppBootstrapResponse, IntegrationStatus, SyncJob, PullRequest, DashboardOverview, DoraOverview, Repository interfaces
    - _Requirements: 3.2_

  - [x] 2.2 Create types/store.ts with store state interfaces
    - Define AppState, UserState, IntegrationState, SettingsState, Section, Locale types
    - _Requirements: 3.2_

  - [x] 2.3 Create types/components.ts with component prop interfaces
    - Define ButtonProps, CardProps, BadgeProps, EmptyStateProps, ErrorStateProps, LoadingStateProps interfaces
    - Define RiskSignalBadgeProps, RiskSignalLegendProps, ThroughputChartProps, PRVolumeChartProps interfaces
    - Define OnboardingWizardProps, OnboardingStepProps interfaces
    - _Requirements: 3.3_

  - [x] 2.4 Update tsconfig.json for strict mode
    - Enable noImplicitAny, strictNullChecks, strictFunctionTypes
    - _Requirements: 3.1_

### Phase 2: Extract Reusable UI Components

- [ ] 3. Extract base UI components
  - [x] 3.1 Create components/ui/Button.tsx
    - Implement Button with variants (primary, secondary, ghost, danger), sizes (sm, md, lg)
    - Add loading and disabled states
    - _Requirements: 1.2, 1.3_

  - [x] 3.2 Create components/ui/Card.tsx
    - Implement Card with title, subtitle, action, and children props
    - _Requirements: 1.2, 1.3_

  - [x] 3.3 Create components/ui/Badge.tsx
    - Implement Badge with variants (default, success, warning, error, info)
    - _Requirements: 1.2, 1.3_

  - [~] 3.4 Create components/ui/Input.tsx
    - Implement Input with label, error, and helper text support
    - _Requirements: 1.2, 1.3_

  - [~] 3.5 Create component barrel file components/ui/index.ts
    - Export all UI components for clean imports
    - _Requirements: 1.4_

- [ ] 4. Extract state components
  - [x] 4.1 Create components/state/EmptyState.tsx
    - Implement EmptyState with icon, title, description, and action props
    - _Requirements: 8.1_

  - [x] 4.2 Create components/state/ErrorState.tsx
    - Implement ErrorState with message and onRetry props
    - _Requirements: 8.2_

  - [x] 4.3 Create components/state/LoadingState.tsx
    - Implement LoadingState with message and optional progress indicator
    - _Requirements: 8.3_

  - [~] 4.4 Create component barrel file components/state/index.ts
    - Export all state components
    - _Requirements: 1.4_

- [ ] 5. Extract layout components
  - [x] 5.1 Create components/layout/Sidebar.tsx
    - Extract sidebar navigation with section links
    - Implement active section highlighting
    - _Requirements: 1.2_

  - [x] 5.2 Create components/layout/Topbar.tsx
    - Extract top navigation with user menu and organization switcher
    - _Requirements: 1.2_

  - [~] 5.3 Create components/layout/MobileDrawer.tsx
    - Implement mobile navigation drawer for screens < 768px
    - Add touch-friendly tap targets (minimum 44px)
    - _Requirements: 16.1, 16.3_

  - [~] 5.4 Create component barrel file components/layout/index.ts
    - Export all layout components
    - _Requirements: 1.4_

### Phase 3: State Management with Zustand

- [ ] 6. Install Zustand and set up stores
  - [~] 6.1 Install zustand package
    - Add zustand to package.json dependencies
    - _Requirements: 2.1_

  - [~] 6.2 Create stores/appStore.ts
    - Implement appStore with section, demoMode, avatarMenuOpen, error state
    - Add devtools middleware for debugging
    - _Requirements: 2.1, 2.5_

  - [~] 6.3 Create stores/userStore.ts
    - Implement userStore with user, organization, organizations, activeOrganizationId
    - Add switchOrganization action
    - _Requirements: 2.1_

  - [~] 6.4 Create stores/integrationStore.ts
    - Implement integrationStore with connected, installationId, repositories, syncStatus, syncProgress
    - Add startSyncPolling action with 4-second interval
    - _Requirements: 2.1_

  - [~] 6.5 Create stores/settingsStore.ts with persistence
    - Implement settingsStore with locale, productionEnvironments, reducedMotion
    - Add persist middleware for localStorage persistence
    - _Requirements: 2.1, 2.4_

  - [~] 6.6 Create store barrel file stores/index.ts
    - Export all stores
    - _Requirements: 1.4_

- [ ] 7. Migrate state from useState to Zustand stores
  - [~] 7.1 Replace section state with useAppStore
    - Update navigation to use store's section state
    - _Requirements: 2.2_

  - [~] 7.2 Replace user/organization state with useUserStore
    - Update bootstrap data handling to populate userStore
    - _Requirements: 2.2_

  - [~] 7.3 Replace integration state with useIntegrationStore
    - Update sync status handling to use integrationStore
    - _Requirements: 2.2_

  - [~] 7.4 Replace settings state with useSettingsStore
    - Update locale and preferences handling to use settingsStore
    - _Requirements: 2.2_

### Phase 4: Extract Hooks and Utilities

- [ ] 8. Create utility functions in lib/
  - [~] 8.1 Create lib/api.ts with API client
    - Implement apiFetch wrapper with error handling
    - Add ApiError class for typed errors
    - Handle 401 redirect to login
    - _Requirements: 17.3_

  - [~] 8.2 Create lib/formatters.ts with locale-aware formatting
    - Implement formatDate with locale support (MM/DD/YYYY for en, DD/MM/YYYY for pt-BR)
    - Implement formatNumber with locale-aware separators
    - _Requirements: 18.5_

  - [~] 8.3 Create lib/risk-signals.ts with signal calculation
    - Implement calculateRiskSignals function
    - Detect stale (> 7 days), large (> 500 lines), long-lived (> 14 days), security keywords
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [~] 8.4 Create lib/export.ts with CSV export
    - Implement exportToCSV function with proper escaping
    - _Requirements: 6.6_

- [ ] 9. Extract custom hooks
  - [~] 9.1 Create hooks/usePullRequests.ts
    - Implement data fetching, caching, loading/error states
    - _Requirements: 1.1_

  - [~] 9.2 Create hooks/useSyncJobs.ts
    - Implement sync jobs fetching with pagination and filtering
    - _Requirements: 5.1_

  - [~] 9.3 Create hooks/useDoraMetrics.ts
    - Implement DORA metrics fetching with coverage status
    - _Requirements: 7.1_

  - [~] 9.4 Create hooks/useKeyboardShortcuts.ts
    - Implement global keyboard shortcut handling (? for help, 1-6 for navigation, / for search, r for refresh)
    - Ignore shortcuts when input field has focus
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

  - [~] 9.5 Create hooks/useLocale.ts
    - Implement locale switching and persistence
    - _Requirements: 18.1, 18.3_

  - [~] 9.6 Create hooks barrel file hooks/index.ts
    - Export all hooks
    - _Requirements: 1.4_

### Phase 5: Code Splitting and Page Extraction

- [ ] 10. Install Recharts and set up chart components
  - [~] 10.1 Install recharts package
    - Add recharts to package.json dependencies
    - _Requirements: 6.3_

  - [~] 10.2 Create components/charts/ThroughputChart.tsx
    - Implement throughput trends chart with 7d, 30d, 90d period support
    - Add responsive sizing and tooltips
    - _Requirements: 6.1, 6.4, 6.5_

  - [~] 10.3 Create components/charts/PRVolumeChart.tsx
    - Implement PR volume chart with merge rate overlay
    - _Requirements: 6.2, 6.4, 6.5_

  - [~] 10.4 Create component barrel file components/charts/index.ts
    - Export all chart components
    - _Requirements: 1.4_

- [ ] 11. Extract page components with lazy loading
  - [~] 11.1 Create pages/DashboardPage.tsx with React.lazy
    - Extract dashboard section into dedicated page component
    - Wrap with Suspense and loading fallback
    - _Requirements: 13.1, 13.3_

  - [~] 11.2 Create pages/ProductivityPage.tsx with React.lazy
    - Extract productivity/PR table section
    - Integrate with usePullRequests hook
    - _Requirements: 13.1, 13.3_

  - [~] 11.3 Create pages/MetricsPage.tsx with React.lazy
    - Extract metrics/DORA section
    - Integrate with useDoraMetrics hook and chart components
    - _Requirements: 13.1, 13.3_

  - [~] 11.4 Create pages/RepositoriesPage.tsx with React.lazy
    - Extract repositories management section
    - _Requirements: 13.1, 13.3_

  - [~] 11.5 Create pages/IntegrationsPage.tsx with React.lazy
    - Extract integrations section
    - _Requirements: 13.1, 13.3_

  - [~] 11.6 Create pages/SettingsPage.tsx with React.lazy
    - Extract settings section with language switcher
    - _Requirements: 13.1, 13.3, 18.4_

  - [~] 11.7 Refactor main.tsx as minimal router
    - Keep only routing logic and Suspense boundaries
    - Preload likely-needed chunks during idle time
    - _Requirements: 13.1, 13.5_

### Phase 6: New Features

- [ ] 12. Implement Risk Signals feature
  - [~] 12.1 Create components/risk-signals/RiskSignalBadge.tsx
    - Implement badge component for each signal type (stale, large, long-lived, security)
    - Add visual indicators with appropriate colors and icons
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [~] 12.2 Create components/risk-signals/RiskSignalLegend.tsx
    - Implement legend explaining all risk signal types
    - Support compact mode for sidebar display
    - _Requirements: 4.5_

  - [~] 12.3 Create components/risk-signals/RiskSignalFilter.tsx
    - Implement filter dropdown for filtering PRs by risk signal
    - _Requirements: 4.6_

  - [~] 12.4 Integrate risk signals into PullRequestTable
    - Display RiskSignalBadge components on each PR row
    - Connect filter to table data
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.6_

- [ ] 13. Implement Sync Jobs History page
  - [~] 13.1 Create pages/SyncJobsPage.tsx
    - Implement sync jobs history page with React.lazy
    - _Requirements: 5.1_

  - ] 13.2 Create components/sync-jobs/SyncJobTable.tsx
    - Implement table displaying job status, start time, duration, PR count
    - _Requirements: 5.2_

  - [~] 13.3 Create components/sync-jobs/SyncJobRow.tsx
    - Implement individual job row with error message display for failed jobs
    - _Requirements: 5.2, 5.5_

  - [~] 13.4 Implement pagination for sync jobs
    - Add pagination with 20 items per page
    - _Requirements: 5.3_

  - [~] 13.5 Implement status filtering for sync jobs
    - Add filter dropdown for completed, failed, running statuses
    - _Requirements: 5.4_

  - [~] 13.6 Add retry link for failed jobs
    - Display retry button that triggers sync job restart
    - _Requirements: 5.6_

- [ ] 14. Implement DORA Metrics visualization
  - [~] 14.1 Create components/dora/DeploymentFrequencyCard.tsx
    - Display deployment frequency metric with trend indicator
    - Show industry benchmark comparison
    - _Requirements: 7.1, 7.5_

  - [~] 14.2 Create components/dora/LeadTimeCard.tsx
    - Display lead time for changes with distribution chart
    - _Requirements: 7.2, 7.5_

  - [~] 14.3 Create components/dora/ChangeFailureRateCard.tsx
    - Display change failure rate with percentage visualization
    - _Requirements: 7.3, 7.5_

  - [~] 14.4 Create components/dora/MTTRCard.tsx
    - Display mean time to recovery with trend
    - _Requirements: 7.4, 7.5_

  - [~] 14.5 Create components/dora/DORASetupGuide.tsx
    - Display setup guidance when production environments not configured
    - _Requirements: 7.6_

- [ ] 15. Implement Onboarding Wizard
  - [~] 15.1 Create components/onboarding/OnboardingWizard.tsx
    - Implement step-by-step wizard with progress tracking
    - Support resuming from any step via localStorage
    - Add skip option for experienced users
    - _Requirements: 9.1, 9.3, 9.6_

  - [~] 15.2 Create components/onboarding/OnboardingStep.tsx
    - Implement individual step component with title, description, status
    - _Requirements: 9.4_

  - [~] 15.3 Create onboarding steps content
    - Step 1: Connect GitHub App
    - Step 2: Select repositories
    - Step 3: Run initial sync
    - Step 4: Configure production environments
    - Step 5: Success summary
    - _Requirements: 9.2, 9.5_

### Phase 7: UX Enhancements

- [ ] 16. Implement animations and transitions
  - [~] 16.1 Add Tailwind transition classes for section navigation
    - Implement smooth transitions between sections
    - _Requirements: 10.1_

  - [~] 16.2 Create components/ui/Modal.tsx with fade-in animation
    - Implement modal component with fade-in/fade-out transitions
    - _Requirements: 10.2_

  - [~] 16.3 Create components/ui/Skeleton.tsx for loading states
    - Implement skeleton animation components
    - _Requirements: 10.3_

  - [~] 16.4 Implement value highlight on data updates
    - Add brief highlight effect when values change
    - _Requirements: 10.4_

  - [~] 16.5 Implement reduced motion preference handling
    - Check prefers-reduced-motion media query
    - Disable/reduce animations when user preference is reduce
    - _Requirements: 10.5, 10.6_

- [ ] 17. Implement accessibility improvements
  - [~] 17.1 Add visible focus indicators for keyboard navigation
    - Implement focus ring styles for all interactive elements
    - _Requirements: 11.2_

  - [~] 17.2 Add ARIA labels to all interactive elements
    - Audit and add aria-label, aria-labelledby, aria-describedby attributes
    - _Requirements: 11.3_

  - [~] 17.3 Implement keyboard navigation support
    - Support Tab, Enter, Escape keys throughout application
    - _Requirements: 11.4_

  - [~] 17.4 Add live region announcements for dynamic content
    - Implement aria-live regions for screen reader announcements
    - _Requirements: 11.5_

  - [~] 17.5 Verify color contrast ratio compliance
    - Ensure 4.5:1 contrast ratio for all text
    - _Requirements: 11.6_

- [ ] 18. Implement keyboard shortcuts
  - [~] 18.1 Create components/ui/KeyboardShortcutsHelp.tsx
    - Implement help dialog triggered by "?" key
    - Display all available shortcuts
    - _Requirements: 12.1_

  - [~] 18.2 Wire up section navigation shortcuts (1-6)
    - Connect number keys to section switching
    - _Requirements: 12.2_

  - [~] 18.3 Wire up search trigger shortcut (/)
    - Connect "/" key to search focus
    - _Requirements: 12.3_

  - [~] 18.4 Wire up refresh shortcut (r)
    - Connect "r" key to current view refresh
    - _Requirements: 12.4_

  - [~] 18.5 Ensure Escape dismisses modals
    - Wire Escape key to modal close
    - _Requirements: 12.5_

- [ ] 19. Implement error boundaries
  - [~] 19.1 Create components/ErrorBoundary.tsx
    - Implement SectionErrorBoundary class component
    - Add fallback UI with error details
    - _Requirements: 17.1, 17.2_

  - [~] 19.2 Add Try Again recovery button
    - Implement error recovery with state reset
    - _Requirements: 17.3_

  - [~] 19.3 Wrap page sections with error boundaries
    - Apply error boundaries at section level
    - _Requirements: 17.5_

- [ ] 20. Implement internationalization (i18n)
  - [~] 20.1 Create i18n/index.ts with useTranslation hook
    - Implement lightweight i18n system with key-value lookup
    - _Requirements: 18.1_

  - [~] 20.2 Create i18n/locales/en.json
    - Extract all English strings to translation file
    - _Requirements: 18.2_

  - [~] 20.3 Create i18n/locales/pt-BR.json
    - Translate all strings to Portuguese (Brazil)
    - _Requirements: 18.2_

  - [~] 20.4 Add language switcher to SettingsPage
    - Implement locale selection dropdown
    - _Requirements: 18.4_

  - [~] 20.5 Update date/number formatting to use locale
    - Use Intl.DateTimeFormat and Intl.NumberFormat
    - _Requirements: 18.5_

- [ ] 21. Enhance responsive design
  - [~] 21.1 Adapt dashboard cards to single column on mobile
    - Update grid layout for screens < 768px
    - _Requirements: 16.2_

  - [~] 21.2 Hide non-essential table columns on small screens
    - Implement responsive column visibility
    - _Requirements: 16.4_

  - [~] 21.3 Preserve scroll position on device rotation
    - Store and restore scroll position on orientation change
    - _Requirements: 16.5_

  - [~] 21.4 Implement pull-to-refresh on mobile dashboards
    - Add touch gesture for data refresh
    - _Requirements: 16.6_

### Phase 8: Testing and Developer Experience

- [ ] 22. Set up testing infrastructure
  - [~] 22.1 Install testing dependencies
    - Add vitest, @testing-library/react, @testing-library/user-event, fast-check, jest-axe
    - _Requirements: 15.1_

  - [~] 22.2 Configure Vitest for unit and property tests
    - Create vitest.config.ts with jsdom environment
    - _Requirements: 15.1_

  - [~] 22.3 Configure Playwright for E2E tests
    - Create playwright.config.ts
    - Add test scripts to package.json
    - _Requirements: 15.1_

- [ ] 23. Write property-based tests
  - [~] 23.1 Write property tests for risk signal calculation
    - **Property 1: Risk Signal Detection Accuracy**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**
    - Test stale detection (> 7 days), large detection (> 500 lines), long-lived (> 14 days), security keywords

  - [ ]* 23.2 Write property test for risk signal filtering
    - **Property 2: Risk Signal Filter Correctness**
    - **Validates: Requirements 4.6**

  - [ ]* 23.3 Write property test for sync job rendering
    - **Property 3: Sync Job Rendering Completeness**
    - **Validates: Requirements 5.2**

  - [ ]* 23.4 Write property test for sync job pagination
    - **Property 4: Sync Job Pagination**
    - **Validates: Requirements 5.3**

  - [ ]* 23.5 Write property test for sync job status filtering
    - **Property 5: Sync Job Status Filter**
    - **Validates: Requirements 5.4**

  - [ ]* 23.6 Write property test for failed job error display
    - **Property 6: Failed Job Error Display**
    - **Validates: Requirements 5.5**

  - [ ]* 23.7 Write property test for CSV export
    - **Property 7: CSV Export Format**
    - **Validates: Requirements 6.6**

  - [ ]* 23.8 Write property test for onboarding step persistence
    - **Property 8: Onboarding Step Persistence**
    - **Validates: Requirements 9.3**

  - [ ]* 23.9 Write property test for reduced motion respect
    - **Property 9: Reduced Motion Respect**
    - **Validates: Requirements 10.5**

  - [ ]* 23.10 Write property test for input field shortcut isolation
    - **Property 10: Input Field Shortcut Isolation**
    - **Validates: Requirements 12.6**

  - [ ]* 23.11 Write property test for locale persistence
    - **Property 11: Locale Preference Persistence**
    - **Validates: Requirements 18.3**

  - [ ]* 23.12 Write property test for locale-aware date formatting
    - **Property 12: Locale-Aware Date Formatting**
    - **Validates: Requirements 18.5**

  - [ ]* 23.13 Write property test for locale-aware number formatting
    - **Property 13: Locale-Aware Number Formatting**
    - **Validates: Requirements 18.5**

  - [ ]* 23.14 Write property test for state persistence round-trip
    - **Property 14: State Persistence Round-Trip**
    - **Validates: Requirements 2.4**

- [ ] 24. Write unit tests for components
  - [ ]* 24.1 Write unit tests for UI components (Button, Card, Badge, Input)
    - Test variants, sizes, states, and interactions
    - _Requirements: 15.1_

  - [ ]* 24.2 Write unit tests for state components (EmptyState, ErrorState, LoadingState)
    - Test rendering and action callbacks
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ]* 24.3 Write unit tests for layout components (Sidebar, Topbar, MobileDrawer)
    - Test navigation and responsive behavior
    - _Requirements: 16.1_

  - [ ]* 24.4 Write unit tests for risk signal components
    - Test badge rendering and filter functionality
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ]* 24.5 Write unit tests for chart components
    - Test data rendering and responsive sizing
    - _Requirements: 6.1, 6.2_

  - [ ]* 24.6 Write unit tests for DORA metric cards
    - Test metric display and benchmark comparisons
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ]* 24.7 Write unit tests for onboarding wizard
    - Test step progression and persistence
    - _Requirements: 9.1, 9.2, 9.3_

- [ ] 25. Write accessibility tests
  - [ ]* 25.1 Write accessibility tests for Sidebar
    - Run jest-axe audit
    - _Requirements: 11.1_

  - [ ]* 25.2 Write accessibility tests for modals and dialogs
    - Verify focus trap and ARIA attributes
    - _Requirements: 11.1_

  - [ ]* 25.3 Write accessibility tests for forms and inputs
    - Verify label associations and error announcements
    - _Requirements: 11.1_

- [ ] 26. Write integration tests
  - [ ]* 26.1 Write integration test for onboarding flow
    - Test complete wizard flow from start to finish
    - _Requirements: 9.1, 9.2_

  - [ ]* 26.2 Write integration test for sync jobs page
    - Test pagination, filtering, and retry functionality
    - _Requirements: 5.1, 5.3, 5.4, 5.6_

  - [ ]* 26.3 Write integration test for metrics page
    - Test chart rendering and data export
    - _Requirements: 6.1, 6.2, 6.6_

- [ ] 27. Set up Storybook
  - [~] 27.1 Install and configure Storybook
    - Initialize Storybook with Vite builder
    - _Requirements: 15.1_

  - [~] 27.2 Create stories for UI components
    - Document Button, Card, Badge, Input with all variants
    - _Requirements: 15.1_

  - [~] 27.3 Create stories for state components
    - Document EmptyState, ErrorState, LoadingState
    - _Requirements: 15.1_

  - [~] 27.4 Create stories for chart components
    - Document ThroughputChart, PRVolumeChart with sample data
    - _Requirements: 15.1_

- [ ] 28. Set up linting and formatting
  - [~] 28.1 Configure ESLint for React best practices
    - Add eslint-plugin-react, eslint-plugin-react-hooks
    - _Requirements: 15.2_

  - [~] 28.2 Configure Prettier for code formatting
    - Add .prettierrc configuration
    - Add format script to package.json
    - _Requirements: 15.3_

  - [~] 28.3 Add VS Code settings
    - Create .vscode/settings.json with editor configuration
    - _Requirements: 15.4_

- [~] 29. Checkpoint - Verify all tests pass
  - Run full test suite and verify all tests pass
  - Ensure TypeScript compilation has no errors
  - Run linter and fix any issues
  - Ask the user if questions arise.

### Phase 9: Performance Optimization

- [ ] 30. Implement performance optimizations
  - [~] 30.1 Add React.memo to expensive list item components
    - Memoize PullRequestRow, SyncJobRow components
    - _Requirements: 14.1_

  - [~] 30.2 Add useMemo for derived data calculations
    - Optimize risk signal calculations and metrics aggregations
    - _Requirements: 14.2_

  - [~] 30.3 Add useCallback for event handlers
    - Stabilize callback references passed to children
    - _Requirements: 14.3_

  - [~] 30.4 Implement list virtualization for large PR tables
    - Add @tanstack/react-virtual for tables with 100+ items
    - _Requirements: 14.6_

  - [~] 30.5 Verify bundle size reduction
    - Measure and verify initial bundle is < 100KB (40% reduction target)
    - _Requirements: 13.4_

- [~] 31. Final checkpoint - Verify performance targets
  - Run Lighthouse audit and verify Performance > 90
  - Verify Time to Interactive < 2s
  - Verify First Contentful Paint < 1s
  - Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Phases are designed to be completed sequentially with checkpoints for validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The migration strategy ensures no breaking changes to URLs or API contracts

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1", "2.2", "2.3", "2.4"] },
    { "id": 1, "tasks": ["3.1", "3.2", "3.3", "3.4", "3.5", "4.1", "4.2", "4.3", "4.4", "5.1", "5.2", "5.3", "5.4"] },
    { "id": 2, "tasks": ["6.1", "6.2", "6.3", "6.4", "6.5", "6.6"] },
    { "id": 3, "tasks": ["7.1", "7.2", "7.3", "7.4", "8.1", "8.2", "8.3", "8.4"] },
    { "id": 4, "tasks": ["9.1", "9.2", "9.3", "9.4", "9.5", "9.6"] },
    { "id": 5, "tasks": ["10.1", "10.2", "10.3", "10.4", "11.1", "11.2", "11.3", "11.4", "11.5", "11.6", "11.7"] },
    { "id": 6, "tasks": ["12.1", "12.2", "12.3", "12.4", "13.1", "13.2", "13.3", "13.4", "13.5", "13.6"] },
    { "id": 7, "tasks": ["14.1", "14.2", "14.3", "14.4", "14.5", "15.1", "15.2", "15.3"] },
    { "id": 8, "tasks": ["16.1", "16.2", "16.3", "16.4", "16.5", "17.1", "17.2", "17.3", "17.4", "17.5"] },
    { "id": 9, "tasks": ["18.1", "18.2", "18.3", "18.4", "18.5", "19.1", "19.2", "19.3"] },
    { "id": 10, "tasks": ["20.1", "20.2", "20.3", "20.4", "20.5", "21.1", "21.2", "21.3", "21.4"] },
    { "id": 11, "tasks": ["22.1", "22.2", "22.3", "23.1"] },
    { "id": 12, "tasks": ["23.2", "23.3", "23.4", "23.5", "23.6", "23.7", "23.8", "23.9", "23.10", "23.11", "23.12", "23.13", "23.14", "24.1", "24.2", "24.3", "24.4", "24.5", "24.6", "24.7"] },
    { "id": 13, "tasks": ["25.1", "25.2", "25.3", "26.1", "26.2", "26.3", "27.1", "27.2", "27.3", "27.4", "28.1", "28.2", "28.3"] },
    { "id": 14, "tasks": ["29"] },
    { "id": 15, "tasks": ["30.1", "30.2", "30.3", "30.4", "30.5"] },
    { "id": 16, "tasks": ["31"] }
  ]
}
```
