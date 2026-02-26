'use client';

import React, { useState, useEffect } from 'react';
import { loadAllData, filterData } from '@/lib/dataLoader';
import { ChildWithRisk } from '@/lib/types';
import Filters from '@/components/Filters';
import MetricCard from '@/components/MetricCard';
import BarChart from '@/components/charts/BarChart';
import DonutChart from '@/components/charts/DonutChart';
import Container from '@/components/layout/Container';

export default function OverviewPage() {
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
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </Container>
    );
  }

  const filteredData = filterData(data, filters);

  // Calculate metrics
  const totalChildren = filteredData.length;
  const highRiskPct = (filteredData.filter(d => d.risk_tier === 'High').length / totalChildren) * 100;
  const avgScore = filteredData.reduce((sum, d) => sum + d.composite_risk_score, 0) / totalChildren;
  const instabilityPct = (filteredData.filter(d => d.num_enrollment_gaps > 0).length / totalChildren) * 100;
  const missingScreeningPct = (filteredData.filter(d => d.num_screenings_completed < 4).length / totalChildren) * 100;

  // Risk tier distribution
  const riskDistribution = [
    { name: 'Low', value: filteredData.filter(d => d.risk_tier === 'Low').length },
    { name: 'Moderate', value: filteredData.filter(d => d.risk_tier === 'Moderate').length },
    { name: 'High', value: filteredData.filter(d => d.risk_tier === 'High').length },
  ];

  // Domain scores
  const domainScores = [
    { domain: 'Stability', score: filteredData.reduce((sum, d) => sum + d.stability_score, 0) / totalChildren },
    { domain: 'Engagement', score: filteredData.reduce((sum, d) => sum + d.engagement_score, 0) / totalChildren },
    { domain: 'Developmental', score: filteredData.reduce((sum, d) => sum + d.developmental_score, 0) / totalChildren },
    { domain: 'Context', score: filteredData.reduce((sum, d) => sum + d.context_score, 0) / totalChildren },
  ];

  // High-risk children analysis
  const highRiskChildren = filteredData.filter(d => d.risk_tier === 'High');

  return (
    <>
      <Filters data={data} filters={filters} onChange={setFilters} />

      <Container>

        {/* Filter Summary */}
        {totalChildren < data.length && (
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-blue-900">Filtered View Active</p>
                <p className="text-sm text-blue-700">
                  Showing {totalChildren.toLocaleString()} of {data.length.toLocaleString()} children ({((totalChildren / data.length) * 100).toFixed(1)}%)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Hero Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <MetricCard
            label="Total Children Analyzed"
            value={totalChildren.toLocaleString()}
            icon="👶"
          />
          <MetricCard
            label="High Readiness Risk"
            value={`${highRiskPct.toFixed(1)}%`}
            icon="⚠️"
            color="red"
          />
          <MetricCard
            label="Avg Readiness Score"
            value={avgScore.toFixed(1)}
            help="Scale: 0-100, Higher = More Risk"
            icon="📊"
          />
          <MetricCard
            label="Participation Instability"
            value={`${instabilityPct.toFixed(1)}%`}
            icon="📅"
            color="yellow"
          />
          <MetricCard
            label="Missing Key Screenings"
            value={`${missingScreeningPct.toFixed(1)}%`}
            icon="🏥"
            color="yellow"
          />
        </div>

        {/* Key Finding */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-4">📍 Key Finding</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            <strong>{highRiskPct.toFixed(1)}% of children analyzed show high readiness risk</strong>, with instability
            in participation and missed developmental screenings as primary risk drivers. Early identification enables
            targeted intervention before kindergarten entry.
          </p>
        </div>

        {/* What Drives High Risk */}
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 text-red-900">🔍 What Drives High Risk?</h2>
          <p className="text-sm text-red-800 mb-4">
            Analysis of {highRiskChildren.length.toLocaleString()} high-risk children (score 60+):
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Most Common Risk Drivers */}
            <div>
              <h3 className="font-bold text-red-900 mb-3">Most Common Risk Drivers</h3>
              <ul className="space-y-2 text-sm text-red-800">
                <li className="flex items-center gap-2">
                  <span className="font-bold">→</span>
                  <span><strong>{((highRiskChildren.filter(d => d.num_enrollment_gaps > 1).length / highRiskChildren.length) * 100).toFixed(0)}%</strong> have 2+ enrollment gaps</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold">→</span>
                  <span><strong>{((highRiskChildren.filter(d => d.num_screenings_completed < 4).length / highRiskChildren.length) * 100).toFixed(0)}%</strong> missed 3+ developmental screenings</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold">→</span>
                  <span><strong>{((highRiskChildren.filter(d => d.avg_attendance_days < 80).length / highRiskChildren.length) * 100).toFixed(0)}%</strong> have low attendance (&lt;80 days)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold">→</span>
                  <span><strong>{((highRiskChildren.filter(d => d.deep_poverty).length / highRiskChildren.length) * 100).toFixed(0)}%</strong> in deep poverty (&lt;100% FPL)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold">→</span>
                  <span><strong>{((highRiskChildren.filter(d => d.num_household_stressors >= 2).length / highRiskChildren.length) * 100).toFixed(0)}%</strong> have 2+ household stressors</span>
                </li>
              </ul>
            </div>

            {/* Domain Breakdown */}
            <div>
              <h3 className="font-bold text-red-900 mb-3">Domain Breakdown (High-Risk Avg)</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-white rounded px-3 py-2">
                  <span className="text-sm font-medium text-gray-700">Stability</span>
                  <span className="text-sm font-bold text-red-700">
                    {(highRiskChildren.reduce((sum, d) => sum + d.stability_score, 0) / highRiskChildren.length).toFixed(0)}/100
                  </span>
                </div>
                <div className="flex items-center justify-between bg-white rounded px-3 py-2">
                  <span className="text-sm font-medium text-gray-700">Engagement</span>
                  <span className="text-sm font-bold text-red-700">
                    {(highRiskChildren.reduce((sum, d) => sum + d.engagement_score, 0) / highRiskChildren.length).toFixed(0)}/100
                  </span>
                </div>
                <div className="flex items-center justify-between bg-white rounded px-3 py-2">
                  <span className="text-sm font-medium text-gray-700">Developmental</span>
                  <span className="text-sm font-bold text-red-700">
                    {(highRiskChildren.reduce((sum, d) => sum + d.developmental_score, 0) / highRiskChildren.length).toFixed(0)}/100
                  </span>
                </div>
                <div className="flex items-center justify-between bg-white rounded px-3 py-2">
                  <span className="text-sm font-medium text-gray-700">Context</span>
                  <span className="text-sm font-bold text-red-700">
                    {(highRiskChildren.reduce((sum, d) => sum + d.context_score, 0) / highRiskChildren.length).toFixed(0)}/100
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Insight */}
          <div className="bg-red-100 rounded-lg p-4">
            <p className="text-sm font-semibold text-red-900">
              💡 <strong>Key Insight:</strong> High-risk children struggle most with <strong>enrollment stability</strong> and <strong>program engagement</strong>—both
              modifiable factors through targeted outreach, transportation support, and retention programs.
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <DonutChart
            data={riskDistribution}
            nameKey="name"
            valueKey="value"
            title="Risk Tier Distribution"
            centerText={{
              label: 'High Risk',
              value: `${highRiskPct.toFixed(1)}%`,
            }}
          />
          <BarChart
            data={domainScores}
            xKey="domain"
            yKey="score"
            title="Average Risk Scores by Domain"
            color="#8b5cf6"
          />
        </div>

        {/* So What Section */}
        <div className="info-box">
          <h3 className="text-lg font-bold mb-2">💡 So What?</h3>
          <p className="text-gray-800">
            <strong>This PoC proves existing ECIDS data can identify high-risk children before kindergarten entry.</strong> The {highRiskPct.toFixed(0)}%
            flagged as high-risk show clear deficits in modifiable factors—enrollment stability, screening completion, attendance. Programs can now
            prioritize resources toward children most likely to struggle, shifting from reactive remediation to proactive prevention.
          </p>
        </div>
      </Container>
    </>
  );
}
