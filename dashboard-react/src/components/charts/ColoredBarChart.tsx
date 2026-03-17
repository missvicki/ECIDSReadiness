'use client';

import React, { useEffect, useState } from 'react';
import { BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ColoredBarChartProps {
  data: Array<{ category: string; value: number; color: string }>;
  title?: string;
  height?: number;
  yAxisLabel?: string;
  horizontal?: boolean;
}

export default function ColoredBarChart({ data, title, height = 400, yAxisLabel, horizontal = false }: ColoredBarChartProps) {
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
    <div className="card" style={{ width: '100%' }}>
      {title && <h3 className="text-lg font-semibold mb-3 text-gray-800">{title}</h3>}
      <div style={{ width: '100%', height, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBar
            data={data}
            layout={horizontal ? "vertical" : "horizontal"}
            margin={{ top: 10, right: 20, left: 5, bottom: horizontal ? 10 : 80 }}
            barCategoryGap="20%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            {horizontal ? (
              <>
                <XAxis
                  type="number"
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  label={yAxisLabel ? {
                    value: yAxisLabel,
                    position: 'insideBottom',
                    offset: -5,
                    style: {
                      fill: '#6b7280',
                      fontSize: 11,
                      textAnchor: 'middle'
                    }
                  } : undefined}
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  width={150}
                />
              </>
            ) : (
              <>
                <XAxis
                  dataKey="category"
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
              </>
            )}
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Bar
              dataKey="value"
              radius={horizontal ? [0, 6, 6, 0] : [6, 6, 0, 0]}
              maxBarSize={60}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </RechartsBar>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
