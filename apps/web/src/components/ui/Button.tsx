/**
 * Button Component
 * 
 * A reusable button component with multiple variants, sizes, and states.
 * Follows the DevInsights design system with slate/cyan color scheme.
 * 
 * @see Requirements 1.2, 1.3 - Reusable UI components with variants
 */

import type { ButtonProps } from '../../types/components';

/**
 * Variant styles for different button types
 * - primary: Cyan accent for main actions
 * - secondary: Slate background for secondary actions
 * - ghost: Transparent background for subtle actions
 * - danger: Red accent for destructive actions
 */
const variantStyles: Record<ButtonProps['variant'], string> = {
  primary: 'bg-cyan hover:bg-cyan/90 text-slate-900 focus:ring-cyan',
  secondary: 'bg-slate-700 hover:bg-slate-600 text-white focus:ring-slate-500',
  ghost: 'bg-transparent hover:bg-slate-800 text-text focus:ring-slate-500',
  danger: 'bg-red-600 hover:bg-red-500 text-white focus:ring-red-500',
};

/**
 * Size styles for different button sizes
 * - sm: Small buttons for compact UIs
 * - md: Default size for most actions
 * - lg: Large buttons for prominent CTAs
 */
const sizeStyles: Record<ButtonProps['size'], string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
};

/**
 * Loading spinner component
 * Simple animated spinner for loading state
 */
function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 mr-2"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/**
 * Button Component
 * 
 * Renders a button element with configurable variant, size, and states.
 * Supports loading and disabled states with proper accessibility attributes.
 * 
 * @example
 * ```tsx
 * // Primary button
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Save Changes
 * </Button>
 * 
 * // Loading state
 * <Button variant="primary" size="md" loading>
 *   Processing...
 * </Button>
 * 
 * // Disabled state
 * <Button variant="secondary" size="sm" disabled>
 *   Cannot Edit
 * </Button>
 * ```
 */
export function Button({
  variant,
  size,
  disabled = false,
  loading = false,
  children,
  onClick,
  type = 'button',
  className = '',
}: ButtonProps): JSX.Element {
  const isDisabled = disabled || loading;

  const baseStyles = [
    'inline-flex items-center justify-center font-medium',
    'transition-colors duration-150',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' ');

  const combinedClassName = [
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    className,
  ].join(' ').trim();

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={combinedClassName}
      aria-disabled={isDisabled}
      aria-busy={loading}
    >
      {loading && <LoadingSpinner />}
      {children}
    </button>
  );
}
