'use client';

import React, { useEffect, useState } from 'react';
import { BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface StackedBarChartProps {
  data: any[];
  xKey: string;
  yKeys: string[];
  title?: string;
  colors?: string[];
  height?: number;
  yAxisLabel?: string;
  stacked?: boolean;
}

const DEFAULT_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];

export default function StackedBarChart({
  data,
  xKey,
  yKeys,
  title,
  colors = DEFAULT_COLORS,
  height = 400,
  yAxisLabel,
  stacked = true
}: StackedBarChartProps) {
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

  return (
    <div className="card">
      {title && <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <RechartsBar data={data} margin={{ top: 5, right: 20, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey={xKey}
              tick={{ fill: '#6b7280', fontSize: 11 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 12 }}
              label={yAxisLabel ? {
                value: yAxisLabel,
                angle: -90,
                position: 'insideLeft',
                offset: 10,
                style: {
                  fill: '#6b7280',
                  fontSize: 12,
                  textAnchor: 'middle'
                }
              } : undefined}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Legend />
            {yKeys.map((key, idx) => (
              <Bar
                key={key}
                dataKey={key}
                stackId={stacked ? 'a' : undefined}
                fill={colors[idx % colors.length]}
              />
            ))}
          </RechartsBar>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
