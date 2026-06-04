/**
 * DeploymentFrequencyCard Component
 * 
 * Displays deployment frequency metric with trend indicator
 * and industry benchmark comparison.
 * 
 * @see Requirements 7.1, 7.5
 */

import type { CardProps } from '../../types/components';

interface DeploymentFrequencyCardProps {
  deployments30d: number;
  trend?: number; // percentage change from previous period
  benchmark?: 'elite' | 'high' | 'medium' | 'low';
}

const BENCHMARK_LABELS = {
  elite: { label: 'Elite', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  high: { label: 'High', color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
  medium: { label: 'Medium', color: 'text-amber-400', bg: 'bg-amber-400/10' },
  low: { label: 'Low', color: 'text-red-400', bg: 'bg-red-400/10' },
};

export function DeploymentFrequencyCard({
  deployments30d,
  trend,
  benchmark = 'medium',
}: DeploymentFrequencyCardProps) {
  const benchmarkConfig = BENCHMARK_LABELS[benchmark];

  return (
    <div className="rounded-lg border border-line bg-panel p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-muted">Deployment Frequency</h3>
          <p className="mt-2 text-3xl font-bold text-text">{deployments30d}</p>
          <p className="text-xs text-muted">deployments in last 30 days</p>
        </div>
        <div className={`rounded-full px-2.5 py-1 text-xs font-medium ${benchmarkConfig.color} ${benchmarkConfig.bg}`}>
          {benchmarkConfig.label}
        </div>
      </div>

      {trend !== undefined && (
        <div className="mt-4 flex items-center gap-1">
          {trend >= 0 ? (
            <svg className="h-4 w-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="h-4 w-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
          <span className={`text-sm font-medium ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {Math.abs(trend)}%
          </span>
          <span className="text-xs text-muted">vs previous period</span>
        </div>
      )}

      <div className="mt-4 border-t border-line pt-3">
        <p className="text-xs text-muted">
          Elite: Multiple deploys per day • High: Weekly deploys • Medium: Monthly deploys • Low: Less than monthly
        </p>
      </div>
    </div>
  );
}
