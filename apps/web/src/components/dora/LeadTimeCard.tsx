/**
 * LeadTimeCard Component
 * 
 * Displays lead time for changes metric with distribution visualization.
 * 
 * @see Requirements 7.2, 7.5
 */

interface LeadTimeCardProps {
  leadTimeHours: number | null;
  trend?: number;
  distribution?: Array<{ range: string; count: number }>;
}

export function LeadTimeCard({ leadTimeHours, trend, distribution }: LeadTimeCardProps) {
  const formatLeadTime = (hours: number): string => {
    if (hours < 24) {
      return `${Math.round(hours)}h`;
    }
    const days = hours / 24;
    if (days < 7) {
      return `${Math.round(days)}d`;
    }
    const weeks = days / 7;
    return `${Math.round(weeks)}w`;
  };

  const getBenchmark = (hours: number): { label: string; color: string } => {
    const days = hours / 24;
    if (days < 1) return { label: 'Elite', color: 'text-emerald-400' };
    if (days < 7) return { label: 'High', color: 'text-cyan-400' };
    if (days < 30) return { label: 'Medium', color: 'text-amber-400' };
    return { label: 'Low', color: 'text-red-400' };
  };

  const benchmark = leadTimeHours !== null ? getBenchmark(leadTimeHours) : null;

  return (
    <div className="rounded-lg border border-line bg-panel p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-muted">Lead Time for Changes</h3>
          {leadTimeHours !== null ? (
            <>
              <p className="mt-2 text-3xl font-bold text-text">
                {formatLeadTime(leadTimeHours)}
              </p>
              <p className="text-xs text-muted">average time from commit to deploy</p>
            </>
          ) : (
            <p className="mt-2 text-lg text-muted">
              Configure production environments
            </p>
          )}
        </div>
        {benchmark && (
          <div className={`text-sm font-medium ${benchmark.color}`}>
            {benchmark.label}
          </div>
        )}
      </div>

      {trend !== undefined && leadTimeHours !== null && (
        <div className="mt-4 flex items-center gap-1">
          {trend <= 0 ? ( // Lower is better for lead time
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

      {distribution && distribution.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-medium text-text">Distribution</p>
          <div className="space-y-1">
            {distribution.map((item) => (
              <div key={item.range} className="flex items-center gap-2">
                <span className="w-16 text-xs text-muted">{item.range}</span>
                <div className="flex-1 rounded bg-panelSoft h-2">
                  <div
                    className="h-full rounded bg-cyan"
                    style={{ width: `${Math.min(100, (item.count / Math.max(...distribution.map((d) => d.count))) * 100)}%` }}
                  />
                </div>
                <span className="w-8 text-xs text-muted text-right">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
