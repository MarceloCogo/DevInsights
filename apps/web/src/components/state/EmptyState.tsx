/**
 * EmptyState Component
 *
 * A reusable component for displaying empty data states with customizable
 * icon, title, description, and optional action button.
 *
 * @see Requirements 8.1 - Reusable EmptyState component
 */

import type { EmptyStateProps } from '../../types/components';

/**
 * EmptyState displays a centered placeholder when no data is available.
 * Used across dashboard sections to provide consistent UX when data is missing.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={<NoDataIcon />}
 *   title="No pull requests found"
 *   description="Connect your GitHub repository to see pull requests"
 *   action={{ label: "Connect GitHub", onClick: handleConnect }}
 * />
 * ```
 */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-[200px] w-full flex-col items-center justify-center gap-4 px-4 py-8">
      {icon && (
        <div className="text-muted" aria-hidden="true">
          {icon}
        </div>
      )}
      <div className="flex flex-col items-center gap-2 text-center">
        <h3 className="text-lg font-semibold text-text">{title}</h3>
        {description && (
          <p className="max-w-sm text-sm text-muted">{description}</p>
        )}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 rounded-lg bg-cyan px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan/90 focus:outline-none focus:ring-2 focus:ring-cyan focus:ring-offset-2 focus:ring-offset-panel"
          type="button"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
