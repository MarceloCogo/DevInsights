/**
 * OnboardingStep Component
 * 
 * Individual step within the onboarding wizard.
 * Displays step number, title, description, and status.
 * 
 * @see Requirements 9.4
 */

import type { OnboardingStepProps } from '../../types/components';

const STATUS_STYLES = {
  complete: {
    circle: 'bg-cyan border-cyan text-ink',
    title: 'text-text',
    description: 'text-muted',
  },
  active: {
    circle: 'bg-cyan/20 border-cyan text-cyan',
    title: 'text-text',
    description: 'text-muted',
  },
  pending: {
    circle: 'bg-panelSoft border-line text-muted',
    title: 'text-muted',
    description: 'text-muted/60',
  },
};

export function OnboardingStep({
  stepNumber,
  title,
  description,
  isComplete,
  isActive,
  children,
}: OnboardingStepProps) {
  const status = isComplete ? 'complete' : isActive ? 'active' : 'pending';
  const styles = STATUS_STYLES[status];

  return (
    <div className="relative flex items-start gap-4 pl-2">
      {/* Step circle */}
      <div
        className={`relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${styles.circle}`}
      >
        {isComplete ? (
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <span className="text-sm font-bold">{stepNumber}</span>
        )}
      </div>

      {/* Step content */}
      <div className="flex-1 pb-4">
        <h4 className={`text-sm font-medium ${styles.title}`}>
          {title}
        </h4>
        <p className={`mt-0.5 text-xs ${styles.description}`}>
          {description}
        </p>
        {children && isActive && (
          <div className="mt-3">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
