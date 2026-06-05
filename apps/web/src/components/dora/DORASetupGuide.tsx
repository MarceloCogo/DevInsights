/**
 * DORASetupGuide Component
 * 
 * Displayed when production environments are not configured,
 * guiding users through the setup process.
 * 
 * @see Requirements 7.6
 */

interface DORASetupGuideProps {
  onConfigure?: () => void;
}

export function DORASetupGuide({ onConfigure }: DORASetupGuideProps) {
  return (
    <div className="rounded-lg border border-dashed border-line bg-panelSoft p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-cyan/10">
          <svg className="h-6 w-6 text-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-text">Configure Production Environments</h3>
          <p className="mt-1 text-sm text-muted">
            To calculate accurate DORA metrics, you need to identify which of your repositories represent production deployments.
          </p>

          <div className="mt-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-cyan text-xs font-bold text-ink">
                1
              </span>
              <div>
                <p className="text-sm font-medium text-text">Select repositories</p>
                <p className="text-xs text-muted">Choose which repositories to track</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-cyan text-xs font-bold text-ink">
                2
              </span>
              <div>
                <p className="text-sm font-medium text-text">Mark production environments</p>
                <p className="text-xs text-muted">Identify which branches/deployments are production</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-cyan text-xs font-bold text-ink">
                3
              </span>
              <div>
                <p className="text-sm font-medium text-text">View metrics</p>
                <p className="text-xs text-muted">DORA metrics will be calculated automatically</p>
              </div>
            </div>
          </div>

          {onConfigure && (
            <button
              onClick={onConfigure}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-cyan px-4 py-2 text-sm font-medium text-ink hover:bg-cyan/90 focus:outline-none focus:ring-2 focus:ring-cyan focus:ring-offset-2 focus:ring-offset-panel"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Configure Production Environments
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
