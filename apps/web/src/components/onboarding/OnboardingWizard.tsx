/**
 * OnboardingWizard Component
 * 
 * Multi-step wizard for new user onboarding.
 * Supports resuming from any step via localStorage.
 * 
 * @see Requirements 9.1, 9.3, 9.6
 */

import { useState, useEffect, useCallback } from 'react';
import type { OnboardingWizardProps } from '../../types/components';
import { OnboardingStep } from './OnboardingStep';

const STEPS = [
  {
    stepNumber: 1,
    title: 'Connect GitHub App',
    description: 'Install the DevInsights GitHub App to your organization',
  },
  {
    stepNumber: 2,
    title: 'Select Repositories',
    description: 'Choose which repositories to track for metrics',
  },
  {
    stepNumber: 3,
    title: 'Run Initial Sync',
    description: 'Fetch your historical PR data for analysis',
  },
  {
    stepNumber: 4,
    title: 'Configure Production',
    description: 'Set up production environments for DORA metrics',
  },
  {
    stepNumber: 5,
    title: 'All Done!',
    description: 'Your DevInsights dashboard is ready',
  },
];

const STORAGE_KEY = 'devinsights.onboarding';

export function OnboardingWizard({
  initialStep,
  onComplete,
  onSkip,
}: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(() => {
    // Try to resume from localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.step ?? initialStep ?? 1;
    }
    return initialStep ?? 1;
  });

  // Persist step to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ step: currentStep }));
  }, [currentStep]);

  const goToNext = useCallback(() => {
    if (currentStep < STEPS.length) {
      setCurrentStep((s: number) => s + 1);
    } else {
      // Clear onboarding state
      localStorage.removeItem(STORAGE_KEY);
      onComplete();
    }
  }, [currentStep, onComplete]);

  const goToPrevious = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((s: number) => s - 1);
    }
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    onSkip?.();
  }, [onSkip]);

  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="rounded-2xl border border-line bg-panel p-6 shadow-glow md:p-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text">Welcome to DevInsights</h2>
        <p className="mt-1 text-sm text-muted">
          Let's get you set up in just a few steps
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted">Progress</span>
          <span className="text-xs font-medium text-cyan">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-panelSoft">
          <div
            className="h-full rounded-full bg-cyan transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="relative mb-8">
        <div className="absolute left-4 top-6 bottom-6 w-px bg-line" />
        <div className="space-y-4">
          {STEPS.map((step) => (
            <OnboardingStep
              key={step.stepNumber}
              stepNumber={step.stepNumber}
              title={step.title}
              description={step.description}
              isComplete={step.stepNumber < currentStep}
              isActive={step.stepNumber === currentStep}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-line pt-4">
        <div>
          {onSkip && (
            <button
              onClick={handleSkip}
              className="text-sm text-muted hover:text-text underline underline-offset-2"
            >
              Skip for now
            </button>
          )}
        </div>
        <div className="flex gap-3">
          {currentStep > 1 && (
            <button
              onClick={goToPrevious}
              className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-text hover:bg-panelSoft focus:outline-none focus:ring-2 focus:ring-cyan"
            >
              Back
            </button>
          )}
          <button
            onClick={goToNext}
            className="rounded-lg bg-cyan px-4 py-2 text-sm font-medium text-ink hover:bg-cyan/90 focus:outline-none focus:ring-2 focus:ring-cyan focus:ring-offset-2 focus:ring-offset-panel"
          >
            {currentStep === STEPS.length ? 'Complete' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
