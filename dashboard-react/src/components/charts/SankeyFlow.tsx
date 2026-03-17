'use client';

import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, Sankey, Tooltip } from 'recharts';

interface FlowData {
  nodes: Array<{ name: string }>;
  links: Array<{ source: number; target: number; value: number }>;
}

interface SankeyFlowProps {
  data: FlowData;
  height?: number;
}

export default function SankeyFlow({ data, height = 600 }: SankeyFlowProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div style={{ height }} className="flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="animate-pulse text-gray-400">Loading flow chart...</div>
      </div>
    );
  }

  if (!data || data.links.length === 0) {
    return (
      <div style={{ height }} className="flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-400">No flow data available</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <Sankey
            data={data}
            nodeWidth={20}
            nodePadding={30}
            margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
            link={{ stroke: '#999', strokeOpacity: 0.3 }}
            node={{
              fill: '#0891b2',
              fillOpacity: 1,
            }}
          >
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
          </Sankey>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
