/**
 * ThroughputChart Component
 * 
 * Displays PR open/merge throughput trends over time using Recharts.
 * Supports 7d, 30d, and 90d periods with responsive sizing.
 * 
 * @see Requirements 6.1, 6.4, 6.5
 */

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { ThroughputChartProps } from '../../types/components';

const COLORS = {
  opened: '#22b8f0',   // cyan-400
  merged: '#28d7a4',   // emerald-400
  grid: '#374151',     // gray-700
  text: '#9ca3af',     // gray-400
};

const PERIOD_LABELS: Record<ThroughputChartProps['period'], string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
};

export function ThroughputChart({ data, period }: ThroughputChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-line bg-panelSoft">
        <p className="text-muted">No throughput data available</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-line bg-panel p-4">
      <h3 className="mb-4 text-sm font-medium text-text">
        Throughput Trends • {PERIOD_LABELS[period]}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorOpened" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.opened} stopOpacity={0.3} />
              <stop offset="95%" stopColor={COLORS.opened} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorMerged" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.merged} stopOpacity={0.3} />
              <stop offset="95%" stopColor={COLORS.merged} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
          <XAxis
            dataKey="date"
            stroke={COLORS.text}
            tick={{ fill: COLORS.text, fontSize: 12 }}
            tickLine={{ stroke: COLORS.text }}
          />
          <YAxis
            stroke={COLORS.text}
            tick={{ fill: COLORS.text, fontSize: 12 }}
            tickLine={{ stroke: COLORS.text }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937', // gray-800
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#f3f4f6',
            }}
            labelStyle={{ color: '#9ca3af' }}
          />
          <Legend
            wrapperStyle={{ paddingTop: '16px' }}
            formatter={(value) => (
              <span className="text-sm text-text">{value}</span>
            )}
          />
          <Area
            type="monotone"
            dataKey="opened"
            stroke={COLORS.opened}
            fillOpacity={1}
            fill="url(#colorOpened)"
            name="Opened PRs"
          />
          <Area
            type="monotone"
            dataKey="merged"
            stroke={COLORS.merged}
            fillOpacity={1}
            fill="url(#colorMerged)"
            name="Merged PRs"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
