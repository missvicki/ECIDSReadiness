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
