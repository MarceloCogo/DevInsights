/**
 * Card Component
 *
 * A reusable container component with optional header elements (title, subtitle, action).
 * Follows the existing Tailwind CSS styling patterns with rounded corners, borders,
 * and the existing color scheme.
 *
 * @see Requirements 1.2, 1.3 - Reusable UI components with single responsibility
 */

import type { CardProps } from '../../types/components';

/**
 * Card component for content sections
 *
 * @param title - Optional card title displayed in the header
 * @param subtitle - Optional subtitle displayed below the title
 * @param action - Optional ReactNode for action buttons/links in the header
 * @param children - Main content of the card
 * @param className - Optional additional CSS classes
 */
export function Card({ title, subtitle, action, children, className }: CardProps) {
  const hasHeader = title || subtitle || action;

  return (
    <section
      className={`rounded-2xl border border-line bg-panel p-6 shadow-glow ${className ?? ''}`}
    >
      {hasHeader && (
        <header className="mb-4 flex items-start justify-between gap-4">
          <div className="flex-1">
            {title && (
              <h3 className="text-lg font-bold text-text">{title}</h3>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-muted">{subtitle}</p>
            )}
          </div>
          {action && (
            <div className="flex-shrink-0">{action}</div>
          )}
        </header>
      )}
      <div className="text-text">{children}</div>
    </section>
  );
}
