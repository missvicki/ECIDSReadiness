'use client';

import React, { useEffect, useState } from 'react';

interface PathwayStage {
  name: string;
  color: string;
  count: number;
  percentage: number;
}

interface PathwayFlowProps {
  stages: {
    stage1: PathwayStage[];
    stage2: PathwayStage[];
    stage3: PathwayStage[];
    stage4: PathwayStage[];
  };
  stageLabels: string[];
  height?: number;
}

export default function PathwayFlow({ stages, stageLabels, height = 600 }: PathwayFlowProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div style={{ height }} className="flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="animate-pulse text-gray-400">Loading pathway chart...</div>
      </div>
    );
  }

  const renderStage = (stageData: PathwayStage[], stageLabel: string) => {
    const total = stageData.reduce((sum, item) => sum + item.count, 0);

    return (
      <div className="flex-1">
        <h3 className="text-sm font-bold text-gray-700 mb-2 text-center">{stageLabel}</h3>
        <div className="space-y-2">
          {stageData.map((item, idx) => (
            <div key={idx} className="relative">
              <div
                className="rounded-lg transition-all duration-300 hover:opacity-80 cursor-pointer"
                style={{
                  backgroundColor: item.color,
                  height: `${Math.max(50, (item.count / total) * 280)}px`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '12px',
                }}
              >
                <div className="text-white font-bold text-sm text-center">{item.name}</div>
                <div className="text-white text-xs mt-1">{item.count.toLocaleString()} ({item.percentage.toFixed(1)}%)</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="card" style={{ height, overflow: 'hidden' }}>
      <div className="flex flex-col md:flex-row gap-4 items-stretch h-full">
        {renderStage(stages.stage1, stageLabels[0])}
        <div className="hidden md:flex items-center justify-center flex-shrink-0 px-2">
          <div className="text-4xl text-gray-300">→</div>
        </div>
        {renderStage(stages.stage2, stageLabels[1])}
        <div className="hidden md:flex items-center justify-center flex-shrink-0 px-2">
          <div className="text-4xl text-gray-300">→</div>
        </div>
        {renderStage(stages.stage3, stageLabels[2])}
        <div className="hidden md:flex items-center justify-center flex-shrink-0 px-2">
          <div className="text-4xl text-gray-300">→</div>
        </div>
        {renderStage(stages.stage4, stageLabels[3])}
      </div>
    </div>
  );
}
