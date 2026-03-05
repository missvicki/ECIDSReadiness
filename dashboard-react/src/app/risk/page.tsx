'use client';

import React, { useState, useEffect } from 'react';
import { loadAllData, filterData } from '@/lib/dataLoader';
import { ChildWithRisk } from '@/lib/types';
import { getRegion } from '@/lib/moRegions';
import Filters from '@/components/Filters';
import MetricCard from '@/components/MetricCard';
import BarChart from '@/components/charts/BarChart';
import StackedBarChart from '@/components/charts/StackedBarChart';
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

  // 2. Screening completion distribution
  const screeningDistribution = [
    { category: '0-2 screenings', count: filteredData.filter(d => d.num_screenings_completed <= 2).length },
    { category: '3-4 screenings', count: filteredData.filter(d => d.num_screenings_completed >= 3 && d.num_screenings_completed <= 4).length },
    { category: '5-6 screenings', count: filteredData.filter(d => d.num_screenings_completed >= 5).length },
  ].map(item => {
    const categoryData = filteredData.filter(d => {
      if (item.category === '0-2 screenings') return d.num_screenings_completed <= 2;
      if (item.category === '3-4 screenings') return d.num_screenings_completed >= 3 && d.num_screenings_completed <= 4;
      return d.num_screenings_completed >= 5;
    });
    return {
      ...item,
      avgRiskScore: categoryData.length > 0
        ? categoryData.reduce((sum, d) => sum + d.composite_risk_score, 0) / categoryData.length
        : 0
    };
  });

  // 3. Attendance distribution
  const attendanceDistribution = [
    { category: 'Very Low (<50)', count: filteredData.filter(d => d.avg_attendance_days < 50).length },
    { category: 'Low (50-100)', count: filteredData.filter(d => d.avg_attendance_days >= 50 && d.avg_attendance_days < 100).length },
    { category: 'Moderate (100-150)', count: filteredData.filter(d => d.avg_attendance_days >= 100 && d.avg_attendance_days < 150).length },
    { category: 'High (150+)', count: filteredData.filter(d => d.avg_attendance_days >= 150).length },
  ].map(item => {
    const categoryData = filteredData.filter(d => {
      if (item.category === 'Very Low (<50)') return d.avg_attendance_days < 50;
      if (item.category === 'Low (50-100)') return d.avg_attendance_days >= 50 && d.avg_attendance_days < 100;
      if (item.category === 'Moderate (100-150)') return d.avg_attendance_days >= 100 && d.avg_attendance_days < 150;
      return d.avg_attendance_days >= 150;
    });
    return {
      ...item,
      avgRiskScore: categoryData.length > 0
        ? categoryData.reduce((sum, d) => sum + d.composite_risk_score, 0) / categoryData.length
        : 0
    };
  });

  // 4. Enrollment gap distribution
  const gapDistribution = [
    { category: 'No gaps', count: filteredData.filter(d => d.num_enrollment_gaps === 0).length },
    { category: '1 gap', count: filteredData.filter(d => d.num_enrollment_gaps === 1).length },
    { category: '2+ gaps', count: filteredData.filter(d => d.num_enrollment_gaps >= 2).length },
  ].map(item => {
    const categoryData = filteredData.filter(d => {
      if (item.category === 'No gaps') return d.num_enrollment_gaps === 0;
      if (item.category === '1 gap') return d.num_enrollment_gaps === 1;
      return d.num_enrollment_gaps >= 2;
    });
    return {
      ...item,
      avgRiskScore: categoryData.length > 0
        ? categoryData.reduce((sum, d) => sum + d.composite_risk_score, 0) / categoryData.length
        : 0
    };
  });

  // 5. Program risk analysis
  const programRisk: any = {};
  filteredData.forEach(child => {
    child.programs_list?.forEach((program: string) => {
      if (!programRisk[program]) {
        programRisk[program] = { sum: 0, count: 0 };
      }
      programRisk[program].sum += child.composite_risk_score;
      programRisk[program].count += 1;
    });
  });

  const programRiskData = Object.entries(programRisk)
    .map(([program, stats]: [string, any]) => ({
      program,
      avgRisk: stats.sum / stats.count,
      count: stats.count,
    }))
    .filter(d => d.count >= 20)
    .sort((a, b) => b.avgRisk - a.avgRisk);

  // 6. Regional Risk Profile
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

  // 7. Household stressors vs risk
  const stressorRisk = [0, 1, 2, 3, 4].map(num => {
    const children = filteredData.filter(d => d.num_household_stressors === num);
    return {
      stressors: `${num}`,
      avgRisk: children.reduce((sum, d) => sum + d.composite_risk_score, 0) / children.length || 0,
    };
  });

  // 8. Family Stressor Prevalence by Risk Tier
  const contextIndicators = [
    { name: 'Deep Poverty', field: 'deep_poverty' as keyof ChildWithRisk },
    { name: 'Homelessness', field: 'homelessness_flag' as keyof ChildWithRisk },
    { name: 'Foster Care', field: 'in_foster_care' as keyof ChildWithRisk },
    { name: 'Abuse/Neglect', field: 'abuse_flag' as keyof ChildWithRisk },
    { name: 'Substance Abuse', field: 'substance_flag' as keyof ChildWithRisk },
    { name: 'Mental Illness', field: 'depression_flag' as keyof ChildWithRisk },
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

  // 9. Domain scores by risk tier
  const domainsByTier = ['Low', 'Moderate', 'High'].map(tier => {
    const tierData = filteredData.filter(d => d.risk_tier === tier);
    if (tierData.length === 0) {
      return { tier, stability: 0, engagement: 0, developmental: 0, context: 0 };
    }
    return {
      tier,
      stability: tierData.reduce((sum, d) => sum + d.stability_score, 0) / tierData.length,
      engagement: tierData.reduce((sum, d) => sum + d.engagement_score, 0) / tierData.length,
      developmental: tierData.reduce((sum, d) => sum + d.developmental_score, 0) / tierData.length,
      context: tierData.reduce((sum, d) => sum + d.context_score, 0) / tierData.length,
    };
  });

  // 10. Indicator prevalence by risk tier
  const indicators = [
    { name: 'Participation Gaps (>1)', calc: (d: ChildWithRisk) => d.num_enrollment_gaps > 1 },
    { name: 'Long Gap (>6 months)', calc: (d: ChildWithRisk) => d.has_gap_over_6mo },
    { name: 'Missed Screenings (<4 completed)', calc: (d: ChildWithRisk) => d.num_screenings_completed < 4 },
    { name: 'Low Attendance (<80 days avg)', calc: (d: ChildWithRisk) => d.avg_attendance_days < 80 },
    { name: 'Has Disability', calc: (d: ChildWithRisk) => d.has_disability },
    { name: 'Deep Poverty (<100% FPL)', calc: (d: ChildWithRisk) => d.deep_poverty },
    { name: 'Homelessness', calc: (d: ChildWithRisk) => d.homelessness_flag },
    { name: 'Foster Care', calc: (d: ChildWithRisk) => d.in_foster_care },
    { name: 'Household Stressors (≥2)', calc: (d: ChildWithRisk) => d.num_household_stressors >= 2 },
  ];

  const prevalenceData = indicators.map(indicator => {
    const row: any = { indicator: indicator.name };
    ['High', 'Moderate', 'Low'].forEach(tier => {
      const tierData = filteredData.filter(d => d.risk_tier === tier);
      const prevalence = tierData.length > 0
        ? (tierData.filter(indicator.calc).length / tierData.length * 100)
        : 0;
      row[tier] = prevalence;
    });
    return row;
  });

  // 11. Average risk score by county
  const countyAvgRisk = Object.entries(
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

                {/* Domain Scores by Risk Tier */}
        <div className="card mb-8">
          <h3 className="text-xl font-bold mb-4">🎯 Average Domain Scores by Risk Tier</h3>
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
                    <td className="px-4 py-2 text-right">{(row.stability || 0).toFixed(1)}</td>
                    <td className="px-4 py-2 text-right">{(row.engagement || 0).toFixed(1)}</td>
                    <td className="px-4 py-2 text-right">{(row.developmental || 0).toFixed(1)}</td>
                    <td className="px-4 py-2 text-right">{(row.context || 0).toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Charts Row 1: Geographic & Program Risk */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">🗺️ Geographic & Program Risk Patterns</h3>
                  {/* Regional Risk Profile */}
        <div className="card mb-8">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BarChart
              data={countyAvgRisk}
              xKey="county"
              yKey="avgRisk"
              yAxisLabel="Average Risk Score (0-100)"
              title="Counties with Highest Average Risk Score (Top 15, n≥20)"
              color="#2563eb"
            />
            <BarChart
              data={programRiskData}
              xKey="program"
              yKey="avgRisk"
              yAxisLabel="Average Risk Score (0-100)"
              title="Programs with Highest Risk (n≥20)"
              color="#2563eb"
            />
          </div>
        </div>

        {/* Charts Row 2: Distribution Analysis */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">📊 Distribution Patterns</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <BarChart
              data={riskByPoverty}
              xKey="band"
              yKey="avgRisk"
              yAxisLabel="Readiness Risk Score (0-100)"
              title="Risk by Poverty Level"
              color="#2563eb"
            />
            <BarChart
              data={screeningDistribution}
              xKey="category"
              yKey="avgRiskScore"
              yAxisLabel="Average Readiness Score"
              title="Risk by Screening Completion"
              color="#2563eb"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BarChart
              data={attendanceDistribution}
              xKey="category"
              yKey="avgRiskScore"
              yAxisLabel="Average Readiness Score"
              title="Risk by Attendance Level"
              color="#2563eb"
            />

            <BarChart
              data={gapDistribution}
              xKey="category"
              yKey="avgRiskScore"
              yAxisLabel="Average Readiness Score"
              title="Risk by Enrollment Gaps"
              color="#2563eb"
            />
          </div>
        </div>

        {/* Household Stressors Analysis */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">🏠 Household Context & Risk</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BarChart
              data={stressorRisk}
              xKey="stressors"
              yKey="avgRisk"
              yAxisLabel="Average Risk Score (0-100)"
              title="Risk Score vs Number of Household Stressors"
              color="#2563eb"
            />
            <StackedBarChart
              data={stressorsByTier}
              xKey="indicator"
              yKeys={['Low', 'Moderate', 'High']}
              title="Family Stressor Prevalence by Risk Tier"
              yAxisLabel="Prevalence (%)"
              colors={['#10b981', '#f59e0b', '#ef4444']}
              stacked={false}
            />
          </div>
        </div>


        {/* Indicator Prevalence by Risk Tier */}
        <div className="card mb-8">
          <h3 className="text-xl font-bold mb-4">📊 Indicator Prevalence by Risk Tier</h3>
          <p className="text-sm text-gray-600 mb-4">
            This table demonstrates correlation—higher-risk children show elevated rates across key indicators.
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
                    <td className="px-4 py-2 text-right font-semibold text-red-600">{(row.High || 0).toFixed(1)}%</td>
                    <td className="px-4 py-2 text-right text-yellow-600">{(row.Moderate || 0).toFixed(1)}%</td>
                    <td className="px-4 py-2 text-right text-green-600">{(row.Low || 0).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              <h4 className="font-bold mb-1">Screening Completion</h4>
              <p className="text-gray-700 text-sm">
                {((screeningDistribution.find(d => d.category === '0-2 screenings')?.count || 0) / filteredData.length * 100).toFixed(0)}%
                of children completed 2 or fewer of the 6 recommended developmental screenings.
              </p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-bold mb-1">Low Attendance</h4>
              <p className="text-gray-700 text-sm">
                {((attendanceDistribution.find(d => d.category === 'Very Low (<50)')?.count || 0) / filteredData.length * 100).toFixed(0)}%
                of children attend fewer than 50 days per year—indicating severe engagement challenges.
              </p>
            </div>
            <div className="border-l-4 border-yellow-500 pl-4">
              <h4 className="font-bold mb-1">Enrollment Gaps</h4>
              <p className="text-gray-700 text-sm">
                {((gapDistribution.find(d => d.category === '2+ gaps')?.count || 0) / filteredData.length * 100).toFixed(0)}%
                of children have 2 or more enrollment gaps—suggesting significant instability.
              </p>
            </div>
          </div>
        </div>

        {/* So What */}
        <div className="info-box">
          <h3 className="text-lg font-bold mb-2">💡 So What?</h3>
          <p className="text-gray-800">
            <strong>Risk patterns concentrate around modifiable factors</strong>—at-risk children complete fewer screenings, attend less
            consistently, and experience more enrollment disruptions. These are not immutable characteristics but intervention opportunities.
            County-level variation reveals exactly where to target program expansion, mobile services, and intensive outreach. This analysis
            validates that ECIDS data can drive evidence-based, geographically-targeted resource allocation rather than spreading efforts thin.
          </p>
        </div>
      </Container>
    </>
  );
}
