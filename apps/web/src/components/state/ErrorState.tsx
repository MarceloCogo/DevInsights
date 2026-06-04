/**
 * ErrorState Component
 *
 * Displays an error message with an optional retry action.
 * Used consistently across the application when operations fail.
 *
 * @validates Requirements 8.2 - Reusable ErrorState component
 */

import type { ErrorStateProps } from '../../types/components';

/**
 * Error icon component
 */
function ErrorIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-12 w-12 text-red-500"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

/**
 * ErrorState Component
 *
 * Displays an error message with optional retry functionality.
 * Follows the design patterns from main.tsx with Tailwind CSS styling.
 *
 * @param message - The error message to display
 * @param onRetry - Optional callback function to retry the failed operation
 *
 * @example
 * ```tsx
 * <ErrorState
 *   message="Failed to load pull requests"
 *   onRetry={() => refetchData()}
 * />
 * ```
 */
export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 p-8 text-center"
      role="alert"
      aria-live="assertive"
    >
      <ErrorIcon />

      <p className="mt-4 text-base font-medium text-red-400">
        {message}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-panel"
          type="button"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 16h5v5" />
          </svg>
          Try Again
        </button>
      )}
    </div>
  );
}
