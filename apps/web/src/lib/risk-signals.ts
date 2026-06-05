/**
 * Risk Signal Calculation
 * @module lib/risk-signals
 */

import type { RiskSignalType } from '../types/components';

interface PullRequestForRiskSignals {
  state: string;
  updated_at: string | null;
  opened_at: string | null;
  additions: number;
  deletions: number;
  title: string;
}

const RISK_SIGNAL_LABELS: Record<RiskSignalType, string> = {
  stale: 'Stale',
  large: 'Large',
  'long-lived': 'Long-lived',
  security: 'Security',
  bug: 'Bug',
  maintainability: 'Maintainability',
};

export function getRiskSignalLabel(type: RiskSignalType): string {
  return RISK_SIGNAL_LABELS[type];
}

export function calculateRiskSignals(pr: PullRequestForRiskSignals): RiskSignalType[] {
  const signals: RiskSignalType[] = [];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  // Stale: open > 7 days without updates
  if (pr.state === 'open' && pr.updated_at) {
    const daysSinceUpdate = (now - new Date(pr.updated_at).getTime()) / dayMs;
    if (daysSinceUpdate > 7) {
      signals.push('stale');
    }
  }

  // Large: additions + deletions > 500
  if (pr.additions + pr.deletions > 500) {
    signals.push('large');
  }

  // Long-lived: open > 14 days
  if (pr.state === 'open' && pr.opened_at) {
    const daysSinceOpen = (now - new Date(pr.opened_at).getTime()) / dayMs;
    if (daysSinceOpen > 14) {
      signals.push('long-lived');
    }
  }

  // Security: title contains security-related keywords
  const titleLower = pr.title.toLowerCase();
  if (titleLower.includes('security') || titleLower.includes('vulnerability') || titleLower.includes('cve')) {
    signals.push('security');
  }

  return signals;
}
