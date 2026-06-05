/**
 * RiskSignalBadge Component
 * 
 * Visual indicator for individual PR risk signals.
 * Supports multiple risk types with appropriate colors and icons.
 * 
 * @see Requirements 4.1, 4.2, 4.3, 4.4
 */

import type { RiskSignalBadgeProps, RiskSignalType } from '../../types/components';

const RISK_CONFIG: Record<RiskSignalType, {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}> = {
  stale: {
    label: 'Stale',
    color: 'text-amber-400',
    bgColor: 'bg-amber-400/10',
    icon: '⏰',
  },
  large: {
    label: 'Large',
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/10',
    icon: '📏',
  },
  'long-lived': {
    label: 'Long-lived',
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
    icon: '📅',
  },
  security: {
    label: 'Security',
    color: 'text-red-400',
    bgColor: 'bg-red-400/10',
    icon: '🔒',
  },
  bug: {
    label: 'Bug Risk',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    icon: '🐛',
  },
  maintainability: {
    label: 'Maintainability',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    icon: '🔧',
  },
};

const SIZE_CLASSES = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
};

export function RiskSignalBadge({ type, size = 'md' }: RiskSignalBadgeProps) {
  const config = RISK_CONFIG[type];
  
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.color} ${config.bgColor} ${SIZE_CLASSES[size]}`}
      title={config.label}
      aria-label={`Risk signal: ${config.label}`}
    >
      <span aria-hidden="true">{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}

// Export the config for use in other components
export { RISK_CONFIG };
