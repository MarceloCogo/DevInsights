/**
 * Component Prop Interfaces
 * 
 * This file defines TypeScript interfaces for all reusable components.
 * Interfaces are organized by component category: UI, State, Risk Signals, Charts, and Onboarding.
 * 
 * @see Requirements 3.3 - Component prop interfaces
 */

import type { ReactNode } from 'react';

// ============================================================================
// UI Components
// ============================================================================

/**
 * Button component props
 * Supports multiple variants and sizes for flexible usage
 */
export interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
}

/**
 * Card component props
 * Container component with optional header elements
 */
export interface CardProps {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Badge component props
 * Visual indicator for status or categories
 */
export interface BadgeProps {
  variant: 'default' | 'success' | 'warning' | 'error' | 'info';
  size: 'sm' | 'md';
  children: ReactNode;
}

// ============================================================================
// State Components
// ============================================================================

/**
 * EmptyState component props
 * Displayed when there is no data to show
 */
export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * ErrorState component props
 * Displayed when an error occurs
 */
export interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

/**
 * LoadingState component props
 * Displayed during async operations
 */
export interface LoadingStateProps {
  message?: string;
  /** Progress percentage (0-100) for determinate progress indicators */
  progress?: number;
}

// ============================================================================
// Risk Signal Components
// ============================================================================

/**
 * Risk signal type identifiers
 * Each type represents a different category of PR risk
 */
export type RiskSignalType = 'stale' | 'large' | 'long-lived' | 'security' | 'bug' | 'maintainability';

/**
 * RiskSignalBadge component props
 * Visual indicator for individual risk signals
 */
export interface RiskSignalBadgeProps {
  type: RiskSignalType;
  size?: 'sm' | 'md';
}

/**
 * RiskSignalLegend component props
 * Legend explaining all risk signal types
 */
export interface RiskSignalLegendProps {
  compact?: boolean;
}

// ============================================================================
// Chart Components
// ============================================================================

/**
 * ThroughputChart data point
 */
export interface ThroughputDataPoint {
  date: string;
  opened: number;
  merged: number;
}

/**
 * ThroughputChart component props
 * Displays PR open/merge throughput over time
 */
export interface ThroughputChartProps {
  data: ThroughputDataPoint[];
  period: '7d' | '30d' | '90d';
}

/**
 * PRVolumeChart data point
 */
export interface PRVolumeDataPoint {
  date: string;
  volume: number;
  mergeRate: number;
}

/**
 * PRVolumeChart component props
 * Displays PR volume and merge rate trends
 */
export interface PRVolumeChartProps {
  data: PRVolumeDataPoint[];
}

// ============================================================================
// Onboarding Components
// ============================================================================

/**
 * OnboardingWizard component props
 * Multi-step wizard for new user onboarding
 */
export interface OnboardingWizardProps {
  initialStep?: number;
  onComplete: () => void;
  onSkip?: () => void;
}

/**
 * OnboardingStep component props
 * Individual step within the onboarding wizard
 */
export interface OnboardingStepProps {
  stepNumber: number;
  title: string;
  description: string;
  isComplete: boolean;
  isActive: boolean;
  children?: ReactNode;
}
