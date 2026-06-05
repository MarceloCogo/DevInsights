/**
 * PRVolumeChart Component
 * 
 * Displays PR volume and merge rate trends using Recharts.
 * Shows volume as bars with merge rate overlay as a line.
 * 
 * @see Requirements 6.2, 6.4, 6.5
 */

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  YAxisProps,
} from 'recharts';
import type { PRVolumeChartProps } from '../../types/components';

const COLORS = {
  volume: '#22b8f0',     // cyan-400
  mergeRate: '#28d7a4',  // emerald-400
  grid: '#374151',       // gray-700
  text: '#9ca3af',       // gray-400
};

export function PRVolumeChart({ data }: PRVolumeChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-line bg-panelSoft">
        <p className="text-muted">No PR volume data available</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-line bg-panel p-4">
      <h3 className="mb-4 text-sm font-medium text-text">
        PR Volume & Merge Rate
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.volume} stopOpacity={0.8} />
              <stop offset="95%" stopColor={COLORS.volume} stopOpacity={0.4} />
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
            yAxisId="left"
            stroke={COLORS.text}
            tick={{ fill: COLORS.text, fontSize: 12 }}
            tickLine={{ stroke: COLORS.text }}
            label={{
              value: 'PRs',
              angle: -90,
              position: 'insideLeft',
              fill: COLORS.text,
              fontSize: 12,
            } as YAxisProps['label']}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke={COLORS.text}
            tick={{ fill: COLORS.text, fontSize: 12 }}
            tickLine={{ stroke: COLORS.text }}
            domain={[0, 100]}
            label={{
              value: 'Merge %',
              angle: 90,
              position: 'insideRight',
              fill: COLORS.text,
              fontSize: 12,
            } as YAxisProps['label']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937', // gray-800
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#f3f4f6',
            }}
            labelStyle={{ color: '#9ca3af' }}
            formatter={(value, name) => {
              if (name === 'mergeRate') {
                return [`${value}%`, 'Merge Rate'];
              }
              return [value, name === 'volume' ? 'PR Volume' : name];
            }}
          />
          <Legend
            wrapperStyle={{ paddingTop: '16px' }}
            formatter={(value) => (
              <span className="text-sm text-text">
                {value === 'volume' ? 'PR Volume' : 'Merge Rate'}
              </span>
            )}
          />
          <Bar
            yAxisId="left"
            dataKey="volume"
            fill="url(#colorVolume)"
            radius={[4, 4, 0, 0]}
            name="volume"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="mergeRate"
            stroke={COLORS.mergeRate}
            strokeWidth={2}
            dot={{ fill: COLORS.mergeRate, strokeWidth: 2 }}
            activeDot={{ r: 6 }}
            name="mergeRate"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
