# Implementation Plan

## Overview

Remaining P2 product tasks for DevInsights.

## Tasks

- [ ] 1. Update the pull-requests endpoint to include risk signals
- [ ] 2. Refactor frontend signalTag function to use API risk signals data
- [ ] 3. Add color-coded badge components for risk signals
- [ ] 4. Add risk signal summary in dashboard overview
- [ ] 5. Add paginated jobs API endpoint
- [ ] 6. Create SyncHistorySection React component
- [ ] 7. Wire sync history into dashboard navigation
- [ ] 8. Add retry button for failed jobs
- [ ] 9. Create reusable LoadingState EmptyState ErrorState components
- [ ] 10. Replace inline loading and empty states with new components
- [ ] 11. Replace inline error handling with ErrorState component
- [ ] 12. Add transition animations for state changes

## Task Dependency Graph

```json
{
  "waves": [
    ["1", "2", "3", "4", "5", "6", "7", "8"],
    ["9", "10", "11", "12"]
  ]
}
```

## Notes

- Web app is in apps/web/src/main.tsx
- API routes are in apps/api/src/routes/
