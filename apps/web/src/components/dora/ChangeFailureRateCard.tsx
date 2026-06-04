/**
 * ChangeFailureRateCard Component
 * 
 * Displays change failure rate metric with percentage visualization.
 * 
 * @see Requirements 7.3, 7.5
 */

interface ChangeFailureRateCardProps {
  failureRate: number | null; // percentage 0-100
  trend?: number;
  failedDeployments?: number;
  totalDeployments?: number;
}

export function ChangeFailureRateCard({
  failureRate,
  trend,
  failedDeployments,
  totalDeployments,
}: ChangeFailureRateCardProps) {
  const getBenchmark = (rate: number): { label: string; color: string; bg: string } => {
    if (rate <= 5) return { label: 'Elite', color: 'text-emerald-400', bg: 'bg-emerald-400' };
    if (rate <= 10) return { label: 'High', color: 'text-cyan-400', bg: 'bg-cyan-400' };
    if (rate <= 25) return { label: 'Medium', color: 'text-amber-400', bg: 'bg-amber-400' };
    return { label: 'Low', color: 'text-red-400', bg: 'bg-red-400' };
  };

  const benchmark = failureRate !== null ? getBenchmark(failureRate) : null;

  return (
    <div className="rounded-lg border border-line bg-panel p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-muted">Change Failure Rate</h3>
          {failureRate !== null ? (
            <>
              <p className="mt-2 text-3xl font-bold text-text">{failureRate.toFixed(1)}%</p>
              {failedDeployments !== undefined && totalDeployments !== undefined && (
                <p className="text-xs text-muted">
                  {failedDeployments} of {totalDeployments} deployments failed
                </p>
              )}
            </>
          ) : (
            <p className="mt-2 text-lg text-muted">No data available</p>
          )}
        </div>
        {benchmark && (
          <div className={`text-sm font-medium ${benchmark.color}`}>
            {benchmark.label}
          </div>
        )}
      </div>

      {failureRate !== null && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted">0%</span>
            <span className="text-xs text-muted">100%</span>
          </div>
          <div className="h-2 w-full rounded bg-panelSoft">
            <div
              className={`h-full rounded transition-all ${benchmark?.bg || 'bg-cyan'}`}
              style={{ width: `${failureRate}%` }}
            />
          </div>
        </div>
      )}

      {trend !== undefined && failureRate !== null && (
        <div className="mt-4 flex items-center gap-1">
          {trend <= 0 ? ( // Lower is better for failure rate
            <svg className="h-4 w-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="h-4 w-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
          <span className={`text-sm font-medium ${trend <= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {Math.abs(trend)}%
          </span>
          <span className="text-xs text-muted">vs previous</span>
        </div>
      )}
    </div>
  );
}
