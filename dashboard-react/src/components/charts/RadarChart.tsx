'use client';

import React, { useEffect, useState } from 'react';
import { RadarChart as RechartsRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, Tooltip } from 'recharts';

interface RadarChartProps {
  data: any[];
  title?: string;
  height?: number;
}

export default function RadarChart({ data, title, height = 400 }: RadarChartProps) {
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
          <RechartsRadar data={data}>
            <PolarGrid stroke="#cbd5e1" />
            <PolarAngleAxis dataKey="domain" tick={{ fill: '#6b7280', fontSize: 12 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} />
            <Radar name="Low Risk" dataKey="Low" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
            <Radar name="Moderate Risk" dataKey="Moderate" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
            <Radar name="High Risk" dataKey="High" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
            <Legend />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
          </RechartsRadar>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
