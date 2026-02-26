'use client';

import React, { useEffect, useState } from 'react';
import { ScatterChart as RechartsScatter, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface ScatterChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  colorKey?: string;
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  height?: number;
  colors?: { [key: string]: string };
}

const DEFAULT_COLORS = {
  Low: '#28a745',
  Moderate: '#ffc107',
  High: '#dc3545',
};

export default function ScatterChart({
  data,
  xKey,
  yKey,
  colorKey,
  title,
  xAxisLabel,
  yAxisLabel,
  height = 400,
  colors = DEFAULT_COLORS,
}: ScatterChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="card">
        {title && <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>}
        <div style={{ height }} className="flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="animate-pulse text-gray-400">Loading chart...</div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="card">
        {title && <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>}
        <div style={{ height }} className="flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-gray-400">No data available</p>
        </div>
      </div>
    );
  }

  // Group data by color key if provided
  const groupedData: [string, any[]][] = colorKey
    ? Object.entries(
        data.reduce((acc: any, item) => {
          const group = item[colorKey];
          if (!acc[group]) acc[group] = [];
          acc[group].push(item);
          return acc;
        }, {})
      )
    : [['All', data]];

  return (
    <div className="card">
      {title && <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <RechartsScatter margin={{ top: 20, right: 20, bottom: 60, left: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              type="number"
              dataKey={xKey}
              name={xAxisLabel || xKey}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              label={xAxisLabel ? {
                value: xAxisLabel,
                position: 'insideBottom',
                offset: -10,
                style: { fill: '#6b7280', fontSize: 12 }
              } : undefined}
            />
            <YAxis
              type="number"
              dataKey={yKey}
              name={yAxisLabel || yKey}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              label={yAxisLabel ? {
                value: yAxisLabel,
                angle: -90,
                position: 'insideLeft',
                style: { fill: '#6b7280', fontSize: 12, textAnchor: 'middle' }
              } : undefined}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{ paddingTop: '20px' }}
            />
            <ReferenceLine
              segment={[{ x: 0, y: 0 }, { x: 100, y: 100 }]}
              stroke="#9ca3af"
              strokeDasharray="5 5"
            />
            {groupedData.map(([group, groupData]: [string, any]) => (
              <Scatter
                key={group}
                name={group}
                data={groupData}
                fill={colors[group] || '#8b5cf6'}
                opacity={0.6}
              />
            ))}
          </RechartsScatter>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
