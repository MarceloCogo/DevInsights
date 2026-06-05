/**
 * LoadingState Component
 * 
 * Displays a loading indicator with optional message and progress bar.
 * Used during asynchronous operations to provide visual feedback to users.
 * 
 * @see Requirements 8.3 - Reusable LoadingState component
 */

import type { LoadingStateProps } from '../../types/components';

/**
 * LoadingState displays an animated spinner with optional message and progress indicator.
 * 
 * @param props.message - Optional message to display below the spinner
 * @param props.progress - Optional progress percentage (0-100) for determinate progress
 * 
 * @example
 * // Basic loading
 * <LoadingState />
 * 
 * @example
 * // With message
 * <LoadingState message="Loading pull requests..." />
 * 
 * @example
 * // With progress indicator
 * <LoadingState message="Syncing repositories..." progress={65} />
 */
export function LoadingState({ message, progress }: LoadingStateProps) {
  // Validate progress is within bounds if provided
  const normalizedProgress = progress !== undefined 
    ? Math.max(0, Math.min(100, progress)) 
    : undefined;
  
  return (
    <div 
      className="flex flex-col items-center justify-center py-12 px-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {/* Animated spinner */}
      <div className="relative">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-line border-t-accent" />
      </div>
      
      {/* Message */}
      {message && (
        <p className="mt-4 text-sm text-muted">
          {message}
        </p>
      )}
      
      {/* Progress bar (determinate) */}
      {normalizedProgress !== undefined && (
        <div className="mt-4 w-full max-w-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted">
              Progress
            </span>
            <span className="text-xs font-medium text-text">
              {Math.round(normalizedProgress)}%
            </span>
          </div>
          <div 
            className="h-2 w-full rounded-full bg-panelSoft overflow-hidden"
            role="progressbar"
            aria-valuenow={normalizedProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={message || 'Loading progress'}
          >
            <div 
              className="h-full rounded-full bg-accent transition-all duration-300 ease-out"
              style={{ width: `${normalizedProgress}%` }}
            />
          </div>
        </div>
      )}
      
      {/* Screen reader text */}
      <span className="sr-only">
        {message || 'Loading...'}
        {normalizedProgress !== undefined && ` ${Math.round(normalizedProgress)}% complete`}
      </span>
    </div>
  );
}
