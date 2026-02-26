'use client';

import React, { useState, useEffect } from 'react';
import { loadAllData, filterData } from '@/lib/dataLoader';
import { ChildWithRisk } from '@/lib/types';
import Filters from '@/components/Filters';
import RadarChart from '@/components/charts/RadarChart';
import Container from '@/components/layout/Container';

export default function DomainsPage() {
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

  // Domain averages
  const domainScores = [
    {
      domain: 'Stability',
      score: filteredData.reduce((sum, d) => sum + d.stability_score, 0) / filteredData.length,
      weight: '30%',
    },
    {
      domain: 'Engagement',
      score: filteredData.reduce((sum, d) => sum + d.engagement_score, 0) / filteredData.length,
      weight: '25%',
    },
    {
      domain: 'Developmental',
      score: filteredData.reduce((sum, d) => sum + d.developmental_score, 0) / filteredData.length,
      weight: '25%',
    },
    {
      domain: 'Context',
      score: filteredData.reduce((sum, d) => sum + d.context_score, 0) / filteredData.length,
      weight: '20%',
    },
  ];

  // Domain scores by risk tier for radar chart
  const domainsByTier = ['Low', 'Moderate', 'High'].map(tier => {
    const tierData = filteredData.filter(d => d.risk_tier === tier);
    return {
      tier,
      stability: tierData.reduce((sum, d) => sum + d.stability_score, 0) / tierData.length || 0,
      engagement: tierData.reduce((sum, d) => sum + d.engagement_score, 0) / tierData.length || 0,
      developmental: tierData.reduce((sum, d) => sum + d.developmental_score, 0) / tierData.length || 0,
      context: tierData.reduce((sum, d) => sum + d.context_score, 0) / tierData.length || 0,
    };
  });

  // Reshape data for radar chart (each domain is a point, each tier is a series)
  const radarData = [
    {
      domain: 'Stability',
      Low: domainsByTier[0].stability,
      Moderate: domainsByTier[1].stability,
      High: domainsByTier[2].stability,
    },
    {
      domain: 'Engagement',
      Low: domainsByTier[0].engagement,
      Moderate: domainsByTier[1].engagement,
      High: domainsByTier[2].engagement,
    },
    {
      domain: 'Developmental',
      Low: domainsByTier[0].developmental,
      Moderate: domainsByTier[1].developmental,
      High: domainsByTier[2].developmental,
    },
    {
      domain: 'Context',
      Low: domainsByTier[0].context,
      Moderate: domainsByTier[1].context,
      High: domainsByTier[2].context,
    },
  ];

  // Indicator prevalence by risk tier (TABLE DATA)
  const indicators = [
    { name: 'Participation Gaps (>1)', calc: (d: ChildWithRisk) => d.num_enrollment_gaps > 1 },
    { name: 'Long Gap (>6 months)', calc: (d: ChildWithRisk) => d.has_gap_over_6mo },
    { name: 'Missed Screenings', calc: (d: ChildWithRisk) => d.missed_screening },
    { name: 'Low Attendance (<80 days avg)', calc: (d: ChildWithRisk) => d.avg_attendance_days < 80 },
    { name: 'Has Disability', calc: (d: ChildWithRisk) => d.has_disability },
    { name: 'Low COS Ratings', calc: (d: ChildWithRisk) => d.low_outcomes },
    { name: 'Deep Poverty', calc: (d: ChildWithRisk) => d.deep_poverty },
    { name: 'Homelessness', calc: (d: ChildWithRisk) => d.homelessness_flag },
    { name: 'Foster Care', calc: (d: ChildWithRisk) => d.in_foster_care },
    { name: 'Household Stressors (≥2)', calc: (d: ChildWithRisk) => d.num_household_stressors >= 2 },
  ];

  const prevalenceData = indicators.map(indicator => {
    const row: any = { indicator: indicator.name };
    ['High', 'Moderate', 'Low'].forEach(tier => {
      const tierData = filteredData.filter(d => d.risk_tier === tier);
      const prevalence = tierData.filter(indicator.calc).length / tierData.length * 100;
      row[tier] = prevalence;
    });
    return row;
  });

  // Top Risk Drivers
  const calculateLift = (indicatorCalc: (d: ChildWithRisk) => boolean) => {
    const baseline = filteredData.filter(indicatorCalc).length / filteredData.length * 100;
    const highRiskData = filteredData.filter(d => d.risk_tier === 'High');
    const highRisk = highRiskData.filter(indicatorCalc).length / highRiskData.length * 100;
    return highRisk - baseline;
  };

  const riskDrivers = [
    { name: 'Participation Gap >6mo', lift: calculateLift(d => d.has_gap_over_6mo) },
    { name: 'Missed Screenings', lift: calculateLift(d => d.num_screenings_completed < 4) },
    { name: 'Low Attendance', lift: calculateLift(d => d.avg_attendance_days < 80) },
    { name: 'Deep Poverty', lift: calculateLift(d => d.deep_poverty) },
    { name: 'Homelessness', lift: calculateLift(d => d.homelessness_flag) },
    { name: 'Foster Care', lift: calculateLift(d => d.in_foster_care) },
    { name: 'Has Disability', lift: calculateLift(d => d.has_disability) },
    { name: 'Multiple Gaps', lift: calculateLift(d => d.num_enrollment_gaps > 1) },
  ].sort((a, b) => b.lift - a.lift).slice(0, 5);

  return (
    <>
      <Filters data={data} filters={filters} onChange={setFilters} />

      <Container>

        {/* Key Finding */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold mb-3">Key Finding</h2>
          <p className="text-gray-700 leading-relaxed">
            Risk is <strong>multidimensional</strong> — constructed from stability, engagement, developmental, and contextual signals.
            High-risk children show elevated indicators across all domains.
          </p>
        </div>

        {/* Domain Explanations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card bg-purple-50">
            <h3 className="text-lg font-bold mb-2">🔄 Stability (30%)</h3>
            <p className="text-sm text-gray-700 mb-2">
              Measures participation continuity and enrollment patterns:
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>Number of enrollment gaps</li>
              <li>Length of gaps (especially &gt;6 months)</li>
              <li>Multiple program transitions</li>
              <li>Total attendance days</li>
            </ul>
          </div>

          <div className="card bg-blue-50">
            <h3 className="text-lg font-bold mb-2">📚 Engagement (25%)</h3>
            <p className="text-sm text-gray-700 mb-2">
              Measures program participation quality:
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>Developmental screening completion</li>
              <li>Immunization compliance</li>
              <li>Average attendance days per enrollment</li>
              <li>Consistent program participation</li>
            </ul>
          </div>

          <div className="card bg-green-50">
            <h3 className="text-lg font-bold mb-2">🧠 Developmental (25%)</h3>
            <p className="text-sm text-gray-700 mb-2">
              Measures developmental outcomes:
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>Disability status</li>
              <li>Child Outcome Summary (COS) ratings</li>
              <li>Developmental progress tracking</li>
              <li>Special education services</li>
            </ul>
          </div>

          <div className="card bg-yellow-50">
            <h3 className="text-lg font-bold mb-2">🏠 Family Context (20%)</h3>
            <p className="text-sm text-gray-700 mb-2">
              Measures environmental risk factors:
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>Poverty level (&lt;100% FPL)</li>
              <li>Homelessness status</li>
              <li>Foster care placement</li>
              <li>Household stressors (incarceration, substance abuse, etc.)</li>
            </ul>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="mb-8">
          <RadarChart
            data={radarData}
            title="Domain Scores by Risk Tier (Multidimensional View)"
            height={500}
          />
          <p className="text-sm text-gray-600 text-center mt-2">
            High-risk children (red) show elevated scores across all domains, confirming multidimensional risk.
          </p>
        </div>

        {/* Domain Scores by Risk Tier */}
        <div className="card mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Average Domain Scores by Risk Tier</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">Risk Tier</th>
                  <th className="px-4 py-2 text-right font-semibold">Stability</th>
                  <th className="px-4 py-2 text-right font-semibold">Engagement</th>
                  <th className="px-4 py-2 text-right font-semibold">Developmental</th>
                  <th className="px-4 py-2 text-right font-semibold">Context</th>
                </tr>
              </thead>
              <tbody>
                {domainsByTier.map((row) => (
                  <tr key={row.tier} className="border-t border-gray-200">
                    <td className="px-4 py-2 font-medium">{row.tier}</td>
                    <td className="px-4 py-2 text-right">{row.stability.toFixed(1)}</td>
                    <td className="px-4 py-2 text-right">{row.engagement.toFixed(1)}</td>
                    <td className="px-4 py-2 text-right">{row.developmental.toFixed(1)}</td>
                    <td className="px-4 py-2 text-right">{row.context.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Indicator Prevalence Table */}
        <div className="card mb-8">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Indicator Prevalence by Risk Tier</h3>
          <p className="text-sm text-gray-600 mb-4">
            This table demonstrates the correlation modeling — higher-risk children show elevated rates across key indicators.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">Indicator</th>
                  <th className="px-4 py-2 text-right font-semibold text-red-700">High Risk</th>
                  <th className="px-4 py-2 text-right font-semibold text-yellow-700">Moderate Risk</th>
                  <th className="px-4 py-2 text-right font-semibold text-green-700">Low Risk</th>
                </tr>
              </thead>
              <tbody>
                {prevalenceData.map((row, idx) => (
                  <tr key={idx} className="border-t border-gray-200">
                    <td className="px-4 py-2">{row.indicator}</td>
                    <td className="px-4 py-2 text-right font-semibold text-red-600">{row.High.toFixed(1)}%</td>
                    <td className="px-4 py-2 text-right text-yellow-600">{row.Moderate.toFixed(1)}%</td>
                    <td className="px-4 py-2 text-right text-green-600">{row.Low.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Risk Drivers */}
        <div className="card mb-8">
          <h3 className="text-xl font-bold mb-2">🎯 Top Risk Drivers</h3>
          <p className="text-sm text-gray-600 mb-4">
            Indicators with largest lift vs. statewide baseline (showing prevalence increase in high-risk group)
          </p>
          <div className="space-y-3">
            {riskDrivers.map((driver, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  idx === 0 ? 'bg-red-50' : idx === 1 ? 'bg-orange-50' : 'bg-yellow-50'
                }`}
              >
                <span className="font-semibold">{driver.name}</span>
                <span className={`font-bold ${
                  idx === 0 ? 'text-red-600' : idx === 1 ? 'text-orange-600' : 'text-yellow-700'
                }`}>
                  +{driver.lift.toFixed(1)}% prevalence
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* So What */}
        <div className="info-box">
          <h3 className="text-lg font-bold mb-2">💡 So What?</h3>
          <p className="text-gray-800">
            <strong>Domain decomposition reveals where to intervene.</strong> High-risk children show elevated scores across all four
            domains—stability, engagement, developmental, and context—confirming multidimensional risk. Programs can target the
            highest-scoring domains (e.g., if stability dominates, prioritize enrollment continuity; if engagement lags, focus on
            attendance and screening outreach).
          </p>
        </div>
      </Container>
    </>
  );
}
