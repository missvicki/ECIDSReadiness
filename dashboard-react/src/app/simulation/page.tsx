'use client';

import React, { useState, useEffect } from 'react';
import { loadAllData, filterData } from '@/lib/dataLoader';
import { ChildWithRisk } from '@/lib/types';
import Filters from '@/components/Filters';
import ScatterChart from '@/components/charts/ScatterChart';
import Container from '@/components/layout/Container';

export default function SimulationPage() {
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

  // Simulate 3rd grade risk (correlated with readiness risk score)
  const simulatedData = filteredData.map(d => ({
    ...d,
    simulated_3rd_grade_risk: Math.min(100, Math.max(0, d.composite_risk_score * 0.7 + (Math.random() - 0.5) * 20)),
  }));

  // Sample 500 for scatter plot performance
  const scatterSample = simulatedData
    .sort(() => 0.5 - Math.random())
    .slice(0, 500);

  // Intervention scenario - top 20% highest risk
  const threshold = simulatedData.map(d => d.composite_risk_score).sort((a, b) => b - a)[Math.floor(simulatedData.length * 0.2)];
  const interventionGroup = simulatedData.filter(d => d.composite_risk_score >= threshold);
  const controlGroup = simulatedData.filter(d => d.composite_risk_score < threshold);

  // Simulate 20% reduction in 3rd grade risk with intervention
  const interventionEffect = interventionGroup.reduce((sum, d) => sum + d.simulated_3rd_grade_risk, 0) / interventionGroup.length * 0.80;
  const controlAvg = controlGroup.reduce((sum, d) => sum + d.simulated_3rd_grade_risk, 0) / controlGroup.length;
  const overallAvg = simulatedData.reduce((sum, d) => sum + d.simulated_3rd_grade_risk, 0) / simulatedData.length;

  // ROI calculation
  const costPerChild = 3000;
  const benefitPerChild = 8000;
  const totalCost = interventionGroup.length * costPerChild;
  const totalBenefit = interventionGroup.length * benefitPerChild;
  const roi = ((totalBenefit - totalCost) / totalCost) * 100;

  return (
    <>
      <Filters data={data} filters={filters} onChange={setFilters} />

      <Container>
        {/* Illustrative Example */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold mb-3">Illustrative Example</h2>
          <p className="text-gray-700 leading-relaxed">
            This demonstrates <strong>how early identification enables targeted intervention</strong> by simulating
            the relationship between early childhood risk scores and later school outcomes.
          </p>
        </div>

        {/* Charts and Simulation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Scatter Plot */}
          <ScatterChart
            data={scatterSample}
            xKey="composite_risk_score"
            yKey="simulated_3rd_grade_risk"
            colorKey="risk_tier"
            title="Early Childhood Risk vs Simulated 3rd Grade Risk"
            xAxisLabel="Readiness Risk Score (Ages 0-5)"
            yAxisLabel="Simulated 3rd Grade Risk Score"
            height={500}
          />

          {/* Intervention Scenario */}
          <div className="card">
            <h3 className="text-xl font-bold mb-4">Intervention Scenario</h3>
            <p className="text-sm text-gray-600 mb-4">
              <em>What if we intervene with the top 20% highest-risk children?</em>
            </p>

            {/* Metrics Table */}
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">Group</th>
                    <th className="px-3 py-2 text-right font-semibold">Count</th>
                    <th className="px-3 py-2 text-right font-semibold">Avg Early Risk</th>
                    <th className="px-3 py-2 text-right font-semibold">Proj 3rd Grade</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-200">
                    <td className="px-3 py-2 font-medium">Top 20% (Intervention)</td>
                    <td className="px-3 py-2 text-right">{interventionGroup.length.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right text-red-600 font-semibold">
                      {(interventionGroup.reduce((sum, d) => sum + d.composite_risk_score, 0) / interventionGroup.length).toFixed(1)}
                    </td>
                    <td className="px-3 py-2 text-right text-green-600 font-semibold">
                      {interventionEffect.toFixed(1)}
                    </td>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <td className="px-3 py-2 font-medium">Remaining 80%</td>
                    <td className="px-3 py-2 text-right">{controlGroup.length.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right">
                      {(controlGroup.reduce((sum, d) => sum + d.composite_risk_score, 0) / controlGroup.length).toFixed(1)}
                    </td>
                    <td className="px-3 py-2 text-right">{controlAvg.toFixed(1)}</td>
                  </tr>
                  <tr className="border-t border-gray-200 bg-gray-50">
                    <td className="px-3 py-2 font-bold">All Children</td>
                    <td className="px-3 py-2 text-right font-bold">{simulatedData.length.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right font-bold">
                      {(simulatedData.reduce((sum, d) => sum + d.composite_risk_score, 0) / simulatedData.length).toFixed(1)}
                    </td>
                    <td className="px-3 py-2 text-right font-bold">{overallAvg.toFixed(1)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Impact Summary */}
            <div className="bg-green-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-green-900">
                <strong>Illustrative Impact:</strong>
              </p>
              <ul className="text-sm text-green-800 mt-2 space-y-1">
                <li>• <strong>{interventionGroup.length.toLocaleString()} children</strong> identified for early intervention</li>
                <li>• Projected <strong>20% reduction</strong> in 3rd-grade risk with targeted support</li>
                <li>• Cost-effective targeting of highest-need children</li>
              </ul>
            </div>

            {/* ROI */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm font-semibold text-blue-900 mb-2">Return on Investment (Illustrative)</p>
              <div className="text-3xl font-bold text-blue-700">{roi.toFixed(0)}%</div>
              <p className="text-xs text-blue-600 mt-2">
                Based on ${costPerChild.toLocaleString()} per child intervention cost and ${benefitPerChild.toLocaleString()} long-term benefit
              </p>
            </div>
          </div>
        </div>

        {/* So What */}
        <div className="info-box">
          <h3 className="text-lg font-bold mb-2">💡 So What?</h3>
          <p className="text-gray-800">
            <strong>Note: This page shows simulated outcomes for illustrative purposes.</strong> True predictive validation requires
            linking ECIDS data to K-12 outcomes (next-phase goal). However, this PoC proves early risk scores can be calculated from
            existing data. If validated against actual school performance, this approach enables proactive intervention 1-2 years before
            kindergarten—shifting from reactive remediation to preventive support.
          </p>
        </div>
      </Container>
    </>
  );
}
