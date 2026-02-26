'use client';

import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface DonutChartProps {
  data: any[];
  nameKey: string;
  valueKey: string;
  title?: string;
  colors?: string[];
  height?: number;
  centerText?: { label: string; value: string };
}

const DEFAULT_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export default function DonutChart({
  data,
  nameKey,
  valueKey,
  title,
  colors = DEFAULT_COLORS,
  height = 400,
  centerText,
}: DonutChartProps) {
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
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              paddingAngle={2}
              dataKey={valueKey}
              nameKey={nameKey}
              label={(entry) => `${entry[nameKey]}: ${entry[valueKey]}`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {centerText && (
        <div className="text-center mt-4">
          <div className="text-3xl font-bold text-gray-900">{centerText.value}</div>
          <div className="text-sm text-gray-600">{centerText.label}</div>
        </div>
      )}
    </div>
  );
}
