/**
 * RiskSignalLegend Component
 * 
 * Legend explaining all risk signal types.
 * Supports compact mode for sidebar display.
 * 
 * @see Requirements 4.5
 */

import { RiskSignalBadge } from './RiskSignalBadge';
import type { RiskSignalLegendProps, RiskSignalType } from '../../types/components';

const ALL_SIGNAL_TYPES: RiskSignalType[] = ['stale', 'large', 'long-lived', 'security', 'bug', 'maintainability'];

const SIGNAL_DESCRIPTIONS: Record<RiskSignalType, string> = {
  stale: 'PR has been open for more than 7 days without activity',
  large: 'PR has more than 500 lines changed',
  'long-lived': 'PR has been open for more than 14 days',
  security: 'PR title or body contains security-related keywords',
  bug: 'PR may introduce bugs based on complexity metrics',
  maintainability: 'PR may affect code maintainability',
};

export function RiskSignalLegend({ compact = false }: RiskSignalLegendProps) {
  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {ALL_SIGNAL_TYPES.map((type) => (
          <RiskSignalBadge key={type} type={type} size="sm" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-line bg-panel p-4">
      <h4 className="mb-3 text-sm font-medium text-text">Risk Signals</h4>
      <p className="mb-4 text-xs text-muted">
        Risk signals help identify PRs that may need attention or review.
      </p>
      <div className="space-y-3">
        {ALL_SIGNAL_TYPES.map((type) => (
          <div key={type} className="flex items-start gap-3">
            <RiskSignalBadge type={type} size="sm" />
            <p className="text-xs text-muted leading-relaxed">
              {SIGNAL_DESCRIPTIONS[type]}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
