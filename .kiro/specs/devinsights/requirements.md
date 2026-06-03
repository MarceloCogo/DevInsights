# Requirements Document

## Introduction

DevInsights is an open source, self-hosted platform for Pull Request flow visibility. The current focus is delivering simple GitHub onboarding and a useful operational dashboard for continuous improvement, without individual surveillance.

## Requirements

### Requirement 1: Authentication

**User Story:** As a developer, I want to log in with my GitHub account so that I can access the dashboard securely.

#### Acceptance Criteria
- [ ] User can login via OAuth GitHub
- [ ] Session is managed via HttpOnly cookie
- [ ] User can logout and session is destroyed

### Requirement 2: Organizations

**User Story:** As a team lead, I want to manage organizations so that data is isolated per team.

#### Acceptance Criteria
- [ ] User belongs to one or more organizations
- [ ] User can switch active organization
- [ ] Data is isolated per organization

### Requirement 3: GitHub App Integration

**User Story:** As an admin, I want to connect a GitHub App so that repositories can be monitored.

#### Acceptance Criteria
- [ ] System generates GitHub App installation URL
- [ ] Installation callback is processed correctly
- [ ] installation_id is saved per organization
- [ ] Connection and disconnection status is displayed

### Requirement 4: Repositories

**User Story:** As a user, I want to select which repositories to monitor so that only relevant data is synced.

#### Acceptance Criteria
- [ ] Repositories authorized by installation are listed
- [ ] User can select monitored repositories
- [ ] Selection is persisted per organization

### Requirement 5: Synchronization

**User Story:** As a user, I want PR data to sync automatically so that the dashboard shows current information.

#### Acceptance Criteria
- [ ] API creates sync job in integration_sync_jobs
- [ ] Worker consumes pending jobs and syncs PRs
- [ ] Job status lifecycle works: pending, running, completed, failed
- [ ] Sync is idempotent by PR key (organization_id, repository_id, github_pr_id)

### Requirement 6: Dashboard

**User Story:** As a developer, I want a comprehensive dashboard so that I can understand PR flow and identify risks.

#### Acceptance Criteria
- [ ] Complete layout with sections: overview, pr, integrations, settings
- [ ] PR metric cards are displayed
- [ ] PR table supports filters (period, state, repository)
- [ ] Sync actions and integration status are accessible
- [ ] PR risk signals (stale, large, long-lived) are displayed with visual indicators
- [ ] Sync/jobs history page is available with pagination
- [ ] Consistent empty, error, and loading states across all sections

### Requirement 7: Security

**User Story:** As a platform operator, I want security hardening so that the application is protected against common attacks.

#### Acceptance Criteria
- [ ] Security headers are set on API and web responses
- [ ] Cookie policy is secure per environment
- [ ] CORS is restricted to WEB_BASE_URL
- [ ] Rate limiting is applied on sensitive auth routes

### Requirement 8: Operations

**User Story:** As a DevOps engineer, I want reliable deployment options so that the platform runs consistently.

#### Acceptance Criteria
- [ ] Application runs locally with Docker Compose
- [ ] 3-service deployment works on Railway: web, api, worker
- [ ] Health checks are available on api and worker

### Requirement 9: Performance

**User Story:** As a user, I want fast dashboard responses so that my workflow is not interrupted.

#### Acceptance Criteria
- [ ] Dashboard requests are lightweight and read-oriented
- [ ] Heavy sync does not block HTTP requests

## Glossary

- PR: Pull Request
- DORA: DevOps Research and Assessment metrics
- Stale PR: A PR open for more than 7 days without updates
- Large PR: A PR with more than 500 lines of additions+deletions
- Long-lived PR: A PR open for more than 14 days
