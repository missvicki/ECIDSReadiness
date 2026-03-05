'use client';

import React, { useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

interface CountyData {
  county: string;
  avgRisk: number;
  count: number;
  highRiskPct?: number;
}

interface MissouriCountyMapProps {
  data: CountyData[];
  height?: number;
}

// Major urban counties in Missouri
const URBAN_COUNTIES = [
  'St. Louis',
  'St. Louis City',
  'Jackson',
  'Clay',
  'St. Charles',
  'Jefferson',
  'Greene',
  'Platte',
  'Boone',
  'Cass',
];

const MissouriCountyMap: React.FC<MissouriCountyMapProps> = ({ data, height = 500 }) => {
  const [tooltipContent, setTooltipContent] = useState('');
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // All hooks must be at the top
  useEffect(() => {
    setMounted(true);
  }, []);

  // Debug logging
  useEffect(() => {
    if (data.length > 0) {
      console.log('Sample county names from data:', data.slice(0, 5).map(d => d.county));
    }
  }, [data]);

  if (!mounted) {
    return (
      <div style={{ height }} className="flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="animate-pulse text-gray-400">Loading map...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ height }} className="flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-400">No county data available</p>
      </div>
    );
  }

  // Create a map for quick lookup
  const dataMap = new Map(data.map(d => [d.county.toLowerCase(), d]));

  // Color scale based on % high-risk children
  const getColor = (highRiskPct: number | undefined) => {
    if (highRiskPct === undefined) return '#e5e7eb'; // gray for no data
    if (highRiskPct >= 30) return '#ef4444'; // red - very high concentration
    if (highRiskPct >= 20) return '#f59e0b'; // amber - high concentration
    if (highRiskPct >= 10) return '#fbbf24'; // yellow - moderate concentration
    return '#10b981'; // green - low concentration
  };

  // Check if county is urban
  const isUrban = (countyName: string) => {
    return URBAN_COUNTIES.some(urban =>
      countyName.toLowerCase().includes(urban.toLowerCase())
    );
  };

  // Missouri counties GeoJSON URL - using a reliable source
  const geoUrl = 'https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json';

  return (
    <div className="relative">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          Error loading map: {error}
        </div>
      )}
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 5500,
          center: [-92.5, 38.3], // Missouri center coordinates
        }}
        style={{ width: '100%', height }}
      >
        <Geographies
          geography={geoUrl}
          onError={(error: any) => {
            console.error('Map loading error:', error);
            setError('Failed to load Missouri county boundaries');
          }}
        >
          {({ geographies }: { geographies: any[] }) => {
            if (geographies.length === 0) {
              return null;
            }

            // Filter to only Missouri counties (FIPS state code 29)
            const missouriCounties = geographies.filter((geo: any) => {
              const fips = geo.id || geo.properties?.FIPS || geo.properties?.fips || geo.properties?.GEOID;
              // Missouri FIPS code is 29, so county FIPS start with "29"
              return fips && String(fips).startsWith('29');
            });

            console.log(`Total counties: ${geographies.length}, Missouri counties: ${missouriCounties.length}`);

            return missouriCounties.map((geo: any) => {
              const countyName = geo.properties?.NAME || geo.properties?.name;
              // Try to match county name case-insensitively and handle variations
              const countyData = dataMap.get(countyName?.toLowerCase()) ||
                                 dataMap.get(countyName?.toUpperCase().toLowerCase()) ||
                                 Array.from(dataMap.entries()).find(([key]) =>
                                   key.toLowerCase() === countyName?.toLowerCase()
                                 )?.[1];
              const fillColor = getColor(countyData?.highRiskPct);
              const isUrbanCounty = isUrban(countyName || '');

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={fillColor}
                  stroke={isUrbanCounty ? '#1f2937' : '#fff'}
                  strokeWidth={isUrbanCounty ? 2 : 0.5}
                  style={{
                    default: { outline: 'none' },
                    hover: {
                      fill: '#6366f1',
                      outline: 'none',
                      cursor: 'pointer'
                    },
                    pressed: { outline: 'none' },
                  }}
                  onMouseEnter={() => {
                    if (countyData && countyData.highRiskPct !== undefined) {
                      setTooltipContent(
                        `${countyName} County${isUrbanCounty ? ' (Urban)' : ' (Rural)'}\nHigh-Risk: ${countyData.highRiskPct.toFixed(1)}%\nChildren: ${countyData.count.toLocaleString()}`
                      );
                    } else {
                      setTooltipContent(`${countyName} County\nNo data`);
                    }
                  }}
                  onMouseLeave={() => {
                    setTooltipContent('');
                  }}
                />
              );
            });
          }}
        </Geographies>
      </ComposableMap>

      {/* Tooltip */}
      {tooltipContent && (
        <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg border border-gray-200 text-sm whitespace-pre-line z-10">
          {tooltipContent}
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm">
        <div className="font-semibold text-gray-700">% High-Risk Children:</div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
          <span>&lt;10%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#fbbf24' }}></div>
          <span>10-20%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
          <span>20-30%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
          <span>≥30%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-gray-900" style={{ backgroundColor: '#fff' }}></div>
          <span>Urban County (Thick Border)</span>
        </div>
      </div>
    </div>
  );
};

export default MissouriCountyMap;
