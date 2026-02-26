'use client';

import React, { useMemo } from 'react';
import { ChildWithRisk } from '@/lib/types';

interface FiltersProps {
  data: ChildWithRisk[];
  filters: {
    county: string;
    district: string;
    riskTier: string;
    povertyLevel: string;
  };
  onChange: (filters: any) => void;
}

export default function Filters({ data, filters, onChange }: FiltersProps) {
  const counties = useMemo(() => {
    const unique = Array.from(new Set(data.map(d => d.AddressCountyName))).sort();
    return ['All Counties', ...unique];
  }, [data]);

  const riskTiers = ['All Risk Tiers', 'Low', 'Moderate', 'High'];

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* County Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📍 County
            </label>
            <select
              value={filters.county}
              onChange={(e) => onChange({ ...filters, county: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {counties.map((county) => (
                <option key={county} value={county}>
                  {county}
                </option>
              ))}
            </select>
          </div>

          {/* Risk Tier Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ⚠️ Risk Tier
            </label>
            <select
              value={filters.riskTier}
              onChange={(e) => onChange({ ...filters, riskTier: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {riskTiers.map((tier) => (
                <option key={tier} value={tier}>
                  {tier}
                </option>
              ))}
            </select>
          </div>

          {/* Poverty Level Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              💰 Poverty Level
            </label>
            <select
              value={filters.povertyLevel}
              onChange={(e) => onChange({ ...filters, povertyLevel: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {povertyLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
