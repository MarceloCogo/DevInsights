/**
 * Badge Component
 * 
 * A visual indicator for status or categories with multiple variants.
 * Supports different sizes and semantic color variants.
 * 
 * @see Requirements 1.2, 1.3 - Modular component architecture and reusable UI components
 */

import type { ReactNode } from 'react';

/**
 * Badge component props
 * Visual indicator for status or categories
 */
export interface BadgeProps {
  variant: 'default' | 'success' | 'warning' | 'error' | 'info';
  size: 'sm' | 'md';
  children: ReactNode;
}

/**
 * Maps variant names to their corresponding Tailwind CSS classes
 */
const variantStyles: Record<BadgeProps['variant'], string> = {
  default: 'bg-panelSoft text-muted border-line',
  success: 'bg-accent/20 text-accent border-accent/30',
  warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  error: 'bg-red-500/20 text-red-400 border-red-500/30',
  info: 'bg-cyan/20 text-cyan border-cyan/30',
};

/**
 * Maps size names to their corresponding Tailwind CSS classes
 */
const sizeStyles: Record<BadgeProps['size'], string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

/**
 * Badge component for displaying status indicators or category labels.
 * 
 * @example
 * ```tsx
 * <Badge variant="success" size="md">Active</Badge>
 * <Badge variant="warning" size="sm">Pending</Badge>
 * <Badge variant="error" size="sm">Failed</Badge>
 * ```
 */
export function Badge({ variant, size, children }: BadgeProps): JSX.Element {
  return (
    <span
      className={`
        inline-flex items-center rounded-md font-medium border
        ${variantStyles[variant]}
        ${sizeStyles[size]}
      `}
    >
      {children}
    </span>
  );
}
