'use client';

import React, { useMemo } from 'react';
import { ChildWithRisk } from '@/lib/types';

interface FiltersProps {
  data: ChildWithRisk[];
  filters: {
    county: string;
    povertyLevel?: string;
  };
  onChange: (filters: any) => void;
}

export default function Filters({ data, filters, onChange }: FiltersProps) {
  const counties = useMemo(() => {
    const unique = Array.from(new Set(data.map(d => d.AddressCountyName).filter(c => c))).sort();
    return ['All Counties', ...unique];
  }, [data]);

  const povertyLevels = [
    'All Poverty Levels',
    'Deep Poverty (<100%)',
    'Low Income (100-200%)',
    'Moderate Income (200-300%)',
    'Higher Income (>300%)',
  ];

  return (
    <div className="bg-white border-b border-gray-200 py-4">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium text-gray-700">Filter by:</div>

          {/* County Filter */}
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              📍 County
            </label>
            <select
              value={filters.county}
              onChange={(e) => onChange({ ...filters, county: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            >
              {counties.map((county) => (
                <option key={county} value={county}>
                  {county}
                </option>
              ))}
            </select>
          </div>

          {/* Poverty Level Filter */}
          {filters.povertyLevel !== undefined && (
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                💰 Poverty Level
              </label>
              <select
                value={filters.povertyLevel}
                onChange={(e) => onChange({ ...filters, povertyLevel: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              >
                {povertyLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Reset Button */}
          {(filters.county !== 'All Counties' || (filters.povertyLevel && filters.povertyLevel !== 'All Poverty Levels')) && (
            <button
              onClick={() => onChange({ county: 'All Counties', povertyLevel: filters.povertyLevel !== undefined ? 'All Poverty Levels' : undefined })}
              className="px-4 py-2 text-sm font-medium text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors mt-5"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
