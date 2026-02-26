'use client';

import React, { useState, useEffect } from 'react';
import { loadAllData, filterData } from '@/lib/dataLoader';
import { ChildWithRisk } from '@/lib/types';
import { getRegion } from '@/lib/moRegions';
import Filters from '@/components/Filters';
import BarChart from '@/components/charts/BarChart';
import StackedBarChart from '@/components/charts/StackedBarChart';
import Container from '@/components/layout/Container';

export default function GeographyPage() {
  const [data, setData] = useState<ChildWithRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    county: 'All Counties',
    district: 'All Districts',
    riskTier: 'All Risk Tiers',
    povertyLevel: 'All Poverty Levels',
  });

  useEffect(() => {
    loadAllData().then((loadedData) => {
      setData(loadedData);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <Container>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading data...</p>
        </div>
      </Container>
    );
  }

  const filteredData = filterData(data, filters);

  // 1. County risk analysis (top 15)
  const countyRisk = Object.entries(
    filteredData.reduce((acc: any, child) => {
      const county = child.AddressCountyName;
      if (!acc[county]) acc[county] = { sum: 0, count: 0 };
      acc[county].sum += child.composite_risk_score;
      acc[county].count += 1;
      return acc;
    }, {})
  )
    .map(([county, stats]: [string, any]) => ({
      county,
      avgRisk: stats.sum / stats.count,
      count: stats.count,
    }))
    .filter(d => d.count >= 20)
    .sort((a, b) => b.avgRisk - a.avgRisk)
    .slice(0, 15);

  // 2. Regional Risk Profile
  const regionalRisk = Object.entries(
    filteredData.reduce((acc: any, child) => {
      const region = getRegion(child.AddressCountyName);
      if (!acc[region]) acc[region] = { sum: 0, count: 0, highRisk: 0 };
      acc[region].sum += child.composite_risk_score;
      acc[region].count += 1;
      if (child.risk_tier === 'High') acc[region].highRisk += 1;
      return acc;
    }, {})
  )
    .map(([region, stats]: [string, any]) => ({
      region,
      avgRisk: stats.sum / stats.count,
      highRiskPct: (stats.highRisk / stats.count) * 100,
      count: stats.count,
    }))
    .filter(d => d.count >= 50)
    .sort((a, b) => b.avgRisk - a.avgRisk);

  // 3. Poverty vs risk
  const povertyBands = [
    { label: '<100%', min: 0, max: 100 },
    { label: '100-200%', min: 100, max: 200 },
    { label: '200-300%', min: 200, max: 300 },
    { label: '>300%', min: 300, max: Infinity },
  ];

  const povertyRisk = povertyBands.map(band => {
    const children = filteredData.filter(
      d => d.PercentOfFederalPovertyLevel >= band.min && d.PercentOfFederalPovertyLevel < band.max
    );
    return {
      band: band.label,
      avgRisk: children.reduce((sum, d) => sum + d.composite_risk_score, 0) / children.length || 0,
    };
  });

  // 4. Household stressors vs risk
  const stressorRisk = [0, 1, 2, 3, 4].map(num => {
    const children = filteredData.filter(d => d.num_household_stressors === num);
    return {
      stressors: `${num}`,
      avgRisk: children.reduce((sum, d) => sum + d.composite_risk_score, 0) / children.length || 0,
    };
  });

  // 5. Family Stressor Prevalence by Risk Tier (for grouped bar)
  const contextIndicators = [
    { name: 'Deep Poverty', field: 'deep_poverty' },
    { name: 'Homelessness', field: 'homelessness_flag' },
    { name: 'Foster Care', field: 'in_foster_care' },
    { name: 'Abuse/Neglect', field: 'abuse_flag' },
    { name: 'Substance Abuse', field: 'substance_flag' },
    { name: 'Mental Illness', field: 'depression_flag' },
  ];

  const stressorsByTier = contextIndicators.map(indicator => {
    const row: any = { indicator: indicator.name };
    ['Low', 'Moderate', 'High'].forEach(tier => {
      const tierData = filteredData.filter(d => d.risk_tier === tier);
      const prevalence = (tierData.filter((d: any) => d[indicator.field]).length / tierData.length) * 100;
      row[tier] = prevalence;
    });
    return row;
  });

  return (
    <>
      <Filters data={data} filters={filters} onChange={setFilters} />

      <Container>

        {/* Key Finding */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold mb-3">Key Finding</h2>
          <p className="text-gray-700 leading-relaxed">
            <strong>Readiness risk is not only individual but contextual</strong> — shaped by socioeconomic and household factors.
          </p>
          <div className="mt-4 bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>📖 Definition:</strong> <strong>Household stressors</strong> = significant family challenges that can impact child development.
              These include: deep poverty (income &lt;50% of federal poverty level), homelessness, foster care placement, child abuse/neglect,
              family member substance abuse, household member depression or mental illness, and incarceration of a family member.
              Children experiencing multiple stressors often face compounded developmental risks.
            </p>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <BarChart
            data={countyRisk}
            xKey="county"
            yKey="avgRisk"
            yAxisLabel="Average Risk Score (0-100)"
            title="Average Risk Score by County (Top 15, n≥20)"
            color="#d62728"
          />

          <BarChart
            data={povertyRisk}
            xKey="band"
            yKey="avgRisk"
            yAxisLabel="Average Risk Score (0-100)"
            title="Average Risk Score by Poverty Band"
            color="#ff7f0e"
          />
        </div>

        {/* Regional Risk Profile */}
        <div className="card mb-6">
          <h3 className="text-xl font-bold mb-4">🗺️ Regional Risk Profile</h3>
          <p className="text-sm text-gray-600 mb-4">
            Missouri regions show meaningful variation in both average risk scores and percentage of high-risk children.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">Region</th>
                  <th className="px-4 py-2 text-right font-semibold">Children (n)</th>
                  <th className="px-4 py-2 text-right font-semibold">Avg Risk Score</th>
                  <th className="px-4 py-2 text-right font-semibold">% High Risk</th>
                </tr>
              </thead>
              <tbody>
                {regionalRisk.map((row) => (
                  <tr key={row.region} className="border-t border-gray-200">
                    <td className="px-4 py-2 font-medium">{row.region}</td>
                    <td className="px-4 py-2 text-right">{row.count.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right">
                      <span className={`font-semibold ${
                        row.avgRisk > 40 ? 'text-red-600' : row.avgRisk > 30 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {row.avgRisk.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <span className={`font-semibold ${
                        row.highRiskPct > 25 ? 'text-red-600' : row.highRiskPct > 15 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {row.highRiskPct.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <BarChart
            data={stressorRisk}
            xKey="stressors"
            yKey="avgRisk"
            yAxisLabel="Average Risk Score (0-100)"
            title="Risk Score vs Number of Household Stressors"
            color="#9467bd"
          />

          <StackedBarChart
            data={stressorsByTier}
            xKey="indicator"
            yKeys={['Low', 'Moderate', 'High']}
            title="Family Stressor Prevalence by Risk Tier"
            yAxisLabel="Prevalence (%)"
            colors={['#28a745', '#ffc107', '#dc3545']}
            stacked={false}
          />
        </div>

        {/* So What */}
        <div className="info-box">
          <h3 className="text-lg font-bold mb-2">💡 So What?</h3>
          <p className="text-gray-800">
            <strong>Geographic variation reveals where capacity falls short.</strong> Regional differences and county-level clustering show
            exactly where to expand programs and build partnerships. Poverty correlates with risk but doesn't determine it—some lower-poverty
            areas show elevated risk, pointing to service deserts or transportation barriers. Use these patterns to guide resource allocation.
          </p>
        </div>
      </Container>
    </>
  );
}
