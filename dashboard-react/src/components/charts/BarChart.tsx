'use client';

import React, { useEffect, useState } from 'react';
import { BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BarChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  title?: string;
  color?: string;
  height?: number;
  yAxisLabel?: string;
}

export default function BarChart({ data, xKey, yKey, title, color = '#8b5cf6', height = 400, yAxisLabel }: BarChartProps) {
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
          <RechartsBar data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey={xKey}
              tick={{ fill: '#6b7280', fontSize: 12 }}
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
            <Bar dataKey={yKey} fill={color} radius={[8, 8, 0, 0]} />
          </RechartsBar>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
