/**
 * MTTRCard Component
 * 
 * Displays mean time to recovery metric with trend.
 * 
 * @see Requirements 7.4, 7.5
 */

interface MTTRCardProps {
  mttrHours: number | null;
  trend?: number;
  incidentsCount?: number;
  quality?: 'real' | 'estimated' | 'missing';
}

export function MTTRCard({ mttrHours, trend, incidentsCount, quality = 'real' }: MTTRCardProps) {
  const formatMTTR = (hours: number): string => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`;
    }
    if (hours < 24) {
      return `${Math.round(hours)}h`;
    }
    const days = hours / 24;
    return `${Math.round(days)}d`;
  };

  const getBenchmark = (hours: number): { label: string; color: string } => {
    if (hours < 1) return { label: 'Elite', color: 'text-emerald-400' };
    if (hours < 24) return { label: 'High', color: 'text-cyan-400' };
    if (hours < 168) return { label: 'Medium', color: 'text-amber-400' }; // 7 days
    return { label: 'Low', color: 'text-red-400' };
  };

  const getQualityBadge = (): { label: string; color: string } => {
    switch (quality) {
      case 'real':
        return { label: 'Real', color: 'text-emerald-400' };
      case 'estimated':
        return { label: 'Estimated', color: 'text-amber-400' };
      case 'missing':
        return { label: 'Missing', color: 'text-red-400' };
      default:
        return { label: 'Real', color: 'text-emerald-400' };
    }
  };

  const benchmark = mttrHours !== null ? getBenchmark(mttrHours) : null;
  const qualityBadge = getQualityBadge();

  return (
    <div className="rounded-lg border border-line bg-panel p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-muted">Mean Time to Recovery</h3>
          {mttrHours !== null ? (
            <>
              <p className="mt-2 text-3xl font-bold text-text">{formatMTTR(mttrHours)}</p>
              {incidentsCount !== undefined && (
                <p className="text-xs text-muted">
                  from {incidentsCount} incident{incidentsCount !== 1 ? 's' : ''}
                </p>
              )}
            </>
          ) : (
            <>
              <p className="mt-2 text-3xl font-bold text-text">N/A</p>
              <p className="text-xs text-muted">
                {quality === 'missing' ? 'No incidents recorded' : 'Configure incident labels'}
              </p>
            </>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          {benchmark && (
            <div className={`text-sm font-medium ${benchmark.color}`}>
              {benchmark.label}
            </div>
          )}
          {mttrHours !== null && quality !== 'real' && (
            <div className={`text-xs font-medium ${qualityBadge.color}`}>
              {qualityBadge.label}
            </div>
          )}
        </div>
      </div>

      {trend !== undefined && mttrHours !== null && (
        <div className="mt-4 flex items-center gap-1">
          {trend <= 0 ? ( // Lower is better for MTTR
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

      <div className="mt-4 border-t border-line pt-3">
        <p className="text-xs text-muted">
          Elite: &lt;1 hour • High: &lt;1 day • Medium: &lt;1 week • Low: &gt;1 week
        </p>
      </div>
    </div>
  );
}
