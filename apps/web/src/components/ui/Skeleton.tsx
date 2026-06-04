/**
 * Skeleton Component
 * 
 * Loading placeholder with pulse animation.
 * Used to indicate loading state before content is available.
 * 
 * @see Requirements 10.3
 */

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  className?: string;
  animation?: 'pulse' | 'wave' | 'none';
}

const VARIANT_CLASSES = {
  text: 'rounded',
  circular: 'rounded-full',
  rectangular: 'rounded-lg',
  card: 'rounded-xl',
};

const ANIMATION_CLASSES = {
  pulse: 'animate-pulse',
  wave: 'animate-shimmer',
  none: '',
};

export function Skeleton({
  variant = 'text',
  width,
  height,
  className = '',
  animation = 'pulse',
}: SkeletonProps) {
  const style: React.CSSProperties = {};

  if (width !== undefined) {
    style.width = typeof width === 'number' ? `${width}px` : width;
  }
  if (height !== undefined) {
    style.height = typeof height === 'number' ? `${height}px` : height;
  }

  // Default heights for variants
  const defaultHeight = variant === 'text' ? '1em' : variant === 'circular' ? '40px' : variant === 'card' ? '120px' : '80px';

  return (
    <div
      className={`bg-line ${VARIANT_CLASSES[variant]} ${ANIMATION_CLASSES[animation]} ${className}`}
      style={{
        width: style.width,
        height: style.height ?? defaultHeight,
      }}
      aria-hidden="true"
    />
  );
}

// Preset skeleton components for common use cases
export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          height={14}
          width={i === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-xl border border-line bg-panel p-4 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1">
          <Skeleton variant="text" height={14} width="40%" className="mb-2" />
          <Skeleton variant="text" height={12} width="60%" />
        </div>
      </div>
      <Skeleton variant="rectangular" height={80} className="mb-4" />
      <div className="flex justify-between">
        <Skeleton variant="text" height={12} width="30%" />
        <Skeleton variant="text" height={12} width="30%" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex gap-4 mb-4 pb-2 border-b border-line">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="text" height={14} className="flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-3 border-b border-line/50">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" height={14} className="flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
