'use client';

import React, { useState, useEffect } from 'react';
import { loadAllData, filterData } from '@/lib/dataLoader';
import { ChildWithRisk } from '@/lib/types';
import Filters from '@/components/Filters';
import MetricCard from '@/components/MetricCard';
import BarChart from '@/components/charts/BarChart';
import Container from '@/components/layout/Container';

export default function RiskPage() {
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

  // Risk distribution
  const riskCounts = {
    Low: filteredData.filter(d => d.risk_tier === 'Low').length,
    Moderate: filteredData.filter(d => d.risk_tier === 'Moderate').length,
    High: filteredData.filter(d => d.risk_tier === 'High').length,
  };

  const highRiskPct = (riskCounts.High / filteredData.length) * 100;

  // 1. Risk by poverty band
  const riskByPoverty = [
    { band: '<100% FPL', avgRisk: 0, highPct: 0 },
    { band: '100-200%', avgRisk: 0, highPct: 0 },
    { band: '200-300%', avgRisk: 0, highPct: 0 },
    { band: '>300%', avgRisk: 0, highPct: 0 },
  ];

  const povertyGroups = [
    { data: filteredData.filter(d => d.PercentOfFederalPovertyLevel < 100), index: 0 },
    { data: filteredData.filter(d => d.PercentOfFederalPovertyLevel >= 100 && d.PercentOfFederalPovertyLevel < 200), index: 1 },
    { data: filteredData.filter(d => d.PercentOfFederalPovertyLevel >= 200 && d.PercentOfFederalPovertyLevel < 300), index: 2 },
    { data: filteredData.filter(d => d.PercentOfFederalPovertyLevel >= 300), index: 3 },
  ];

  povertyGroups.forEach(({ data: groupData, index }) => {
    if (groupData.length > 0) {
      riskByPoverty[index].avgRisk = groupData.reduce((sum, d) => sum + d.composite_risk_score, 0) / groupData.length;
      riskByPoverty[index].highPct = (groupData.filter(d => d.risk_tier === 'High').length / groupData.length) * 100;
    }
  });

  // 2. Screening completion by risk tier
  const screeningByTier = ['Low', 'Moderate', 'High'].map(tier => {
    const tierData = filteredData.filter(d => d.risk_tier === tier);
    return {
      tier,
      avgScreenings: tierData.reduce((sum, d) => sum + d.num_screenings_completed, 0) / tierData.length || 0,
    };
  });

  // 3. Participation intensity by risk tier
  const participationByTier = ['Low', 'Moderate', 'High'].map(tier => {
    const tierData = filteredData.filter(d => d.risk_tier === tier);
    return {
      tier,
      avgDays: tierData.reduce((sum, d) => sum + d.avg_attendance_days, 0) / tierData.length || 0,
    };
  });

  // 4. Mobility (enrollment gaps) by risk tier
  const mobilityByTier = ['Low', 'Moderate', 'High'].map(tier => {
    const tierData = filteredData.filter(d => d.risk_tier === tier);
    return {
      tier,
      avgGaps: tierData.reduce((sum, d) => sum + d.num_enrollment_gaps, 0) / tierData.length || 0,
    };
  });

  // 5. Risk tier counts by top counties
  const countyRiskCounts = Object.entries(
    filteredData.reduce((acc: any, child) => {
      const county = child.AddressCountyName;
      if (!acc[county]) acc[county] = { Low: 0, Moderate: 0, High: 0, total: 0 };
      acc[county][child.risk_tier]++;
      acc[county].total++;
      return acc;
    }, {})
  )
    .map(([county, counts]: [string, any]) => ({
      county,
      High: counts.High,
      total: counts.total,
      highPct: (counts.High / counts.total) * 100,
    }))
    .filter(d => d.total >= 30)
    .sort((a, b) => b.highPct - a.highPct)
    .slice(0, 10)
    .map(d => ({
      county: d.county,
      highRiskPct: d.highPct,
    }));

  return (
    <>
      <Filters data={data} filters={filters} onChange={setFilters} />

      <Container>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <MetricCard
            label="Low Risk Children"
            value={riskCounts.Low.toLocaleString()}
            delta={`${((riskCounts.Low / filteredData.length) * 100).toFixed(1)}%`}
            icon="✅"
            color="green"
          />
          <MetricCard
            label="Moderate Risk Children"
            value={riskCounts.Moderate.toLocaleString()}
            delta={`${((riskCounts.Moderate / filteredData.length) * 100).toFixed(1)}%`}
            icon="⚠️"
            color="yellow"
          />
          <MetricCard
            label="High Risk Children"
            value={riskCounts.High.toLocaleString()}
            delta={`${highRiskPct.toFixed(1)}%`}
            icon="🚨"
            color="red"
          />
        </div>

        {/* Key Finding */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold mb-3">Key Finding</h2>
          <p className="text-gray-700 leading-relaxed">
            <strong>{highRiskPct.toFixed(1)}% of children are classified as high readiness risk</strong>, with clear
            correlations between risk tier and participation patterns. High-risk children show lower screening
            completion, more enrollment gaps, and reduced attendance intensity.
          </p>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <BarChart
            data={riskByPoverty}
            xKey="band"
            yKey="avgRisk"
            yAxisLabel="Readiness Risk Score (0-100)"
            title="How Poverty Level Affects Readiness Risk"
            color="#f59e0b"
          />

          <BarChart
            data={countyRiskCounts}
            xKey="county"
            yKey="highRiskPct"
            yAxisLabel="Percent of Children"
            title="Counties with Highest Risk (Top 10)"
            color="#ef4444"
          />
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <BarChart
            data={screeningByTier}
            xKey="tier"
            yKey="avgScreenings"
            yAxisLabel="Screenings Completed (of 6 total)"
            title="Developmental Screening Completion"
            color="#10b981"
          />

          <BarChart
            data={participationByTier}
            xKey="tier"
            yKey="avgDays"
            yAxisLabel="Days Attended per Year"
            title="Program Attendance Patterns"
            color="#6366f1"
          />
        </div>

        {/* Charts Row 3 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <BarChart
            data={mobilityByTier}
            xKey="tier"
            yKey="avgGaps"
            yAxisLabel="Number of Gaps in Enrollment"
            title="Enrollment Stability (Fewer Gaps = More Stable)"
            color="#f59e0b"
          />

          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Risk Tier Breakdown</h3>
            <div className="space-y-3">
              {['Low', 'Moderate', 'High'].map(tier => {
                const count = riskCounts[tier as keyof typeof riskCounts];
                const pct = (count / filteredData.length) * 100;
                const color = tier === 'Low' ? 'green' : tier === 'Moderate' ? 'yellow' : 'red';

                return (
                  <div key={tier}>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{tier} Risk</span>
                      <span className="text-gray-600">{count.toLocaleString()} ({pct.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          color === 'green' ? 'bg-green-500' : color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="card mb-8">
          <h3 className="text-xl font-bold mb-4">🎯 Key Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-bold mb-1">Poverty-Risk Correlation</h4>
              <p className="text-gray-700 text-sm">
                Children in deep poverty (&lt;100% FPL) show {riskByPoverty[0].avgRisk.toFixed(0)} average risk score vs{' '}
                {riskByPoverty[3].avgRisk.toFixed(0)} for higher income (&gt;300% FPL).
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-bold mb-1">Screening Gaps</h4>
              <p className="text-gray-700 text-sm">
                High-risk children complete {screeningByTier[2].avgScreenings.toFixed(1)} of 6 recommended screenings vs{' '}
                {screeningByTier[0].avgScreenings.toFixed(1)} for low-risk children.
              </p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-bold mb-1">Attendance Patterns</h4>
              <p className="text-gray-700 text-sm">
                Low-risk children attend {participationByTier[0].avgDays.toFixed(0)} days/year vs{' '}
                {participationByTier[2].avgDays.toFixed(0)} for high-risk children.
              </p>
            </div>
            <div className="border-l-4 border-yellow-500 pl-4">
              <h4 className="font-bold mb-1">Enrollment Instability</h4>
              <p className="text-gray-700 text-sm">
                High-risk children average {mobilityByTier[2].avgGaps.toFixed(1)} enrollment gaps vs{' '}
                {mobilityByTier[0].avgGaps.toFixed(1)} for low-risk children.
              </p>
            </div>
          </div>
        </div>

        {/* So What */}
        <div className="info-box">
          <h3 className="text-lg font-bold mb-2">💡 So What?</h3>
          <p className="text-gray-800">
            <strong>Risk patterns cluster around modifiable factors</strong>—high-risk children complete fewer screenings, attend less
            consistently, and experience more enrollment disruptions. County-level variation shows exactly where to target program expansion
            and outreach. This validates that ECIDS data can drive evidence-based resource allocation.
          </p>
        </div>
      </Container>
    </>
  );
}
