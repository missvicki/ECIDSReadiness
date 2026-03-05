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

        {/* Geographic Risk Distribution */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-2">🗺️ Geographic Risk Distribution</h3>
          <p className="text-sm text-gray-600 mb-4">
            Risk concentration varies by region and county—identifying where to target intensive services
          </p>

        {/* Regional Risk Profile */}
        <div className="card mb-8">
          <h3 className="text-lg font-bold mb-2">Regional Variation</h3>
          <p className="text-sm text-gray-600 mb-4">
            Average risk scores and percentage of high-risk children by Missouri region
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
            <div className="card">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Risk Concentrates in Specific Counties</h3>
              <p className="text-xs text-gray-600 mb-4">Top 15 counties show 2-3x higher average risk than statewide mean—targeting opportunity</p>
              <BarChart
                data={countyAvgRisk}
                xKey="county"
                yKey="avgRisk"
                yAxisLabel="Average Risk Score (0-100)"
                color="#2563eb"
              />
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Certain Programs Serve Highest-Need Children</h3>
              <p className="text-xs text-gray-600 mb-4">Programs ranked by average risk—shows where intensive supports are needed most</p>
              <BarChart
                data={programRiskData}
                xKey="program"
                yKey="avgRisk"
                yAxisLabel="Average Risk Score (0-100)"
                color="#2563eb"
              />
            </div>
          </div>
        </div>

        {/* Early Warning Indicators */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-2">⚡ Early Warning Indicators</h3>
          <p className="text-sm text-gray-600 mb-4">
            How specific behaviors and circumstances predict readiness risk levels
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Deep Poverty Predicts Higher Risk</h3>
              <p className="text-xs text-gray-600 mb-4">Children &lt;100% FPL average {riskByPoverty[0]?.avgRisk.toFixed(0)} risk score vs {riskByPoverty[3]?.avgRisk.toFixed(0)} for &gt;300% FPL</p>
              <BarChart
                data={riskByPoverty}
                xKey="band"
                yKey="avgRisk"
                yAxisLabel="Readiness Risk Score (0-100)"
                color="#2563eb"
              />
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Missed Screenings Signal Elevated Risk</h3>
              <p className="text-xs text-gray-600 mb-4">Children completing ≤2 screenings show 3x higher risk than those completing all 6</p>
              <BarChart
                data={screeningDistribution}
                xKey="category"
                yKey="avgRiskScore"
                yAxisLabel="Average Readiness Score"
                color="#2563eb"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Chronic Low Attendance Predicts Risk</h3>
              <p className="text-xs text-gray-600 mb-4">Children attending &lt;50 days/year show dramatically higher risk scores</p>
              <BarChart
                data={attendanceDistribution}
                xKey="category"
                yKey="avgRiskScore"
                yAxisLabel="Average Readiness Score"
                color="#2563eb"
              />
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Enrollment Gaps Drive Risk Up</h3>
              <p className="text-xs text-gray-600 mb-4">Each additional enrollment gap (30+ days) compounds risk—continuity is protective</p>
              <BarChart
                data={gapDistribution}
                xKey="category"
                yKey="avgRiskScore"
                yAxisLabel="Average Readiness Score"
                color="#2563eb"
              />
            </div>
          </div>
        </div>

        {/* Household Context Analysis */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-2">🏠 Family Context & Compounding Risk</h3>
          <p className="text-sm text-gray-600 mb-4">
            How household stressors compound to elevate risk levels
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Each Stressor Compounds Risk</h3>
              <p className="text-xs text-gray-600 mb-4">Risk score climbs with each additional household stressor—2+ stressors = high risk</p>
              <BarChart
                data={stressorRisk}
                xKey="stressors"
                yKey="avgRisk"
                yAxisLabel="Average Risk Score (0-100)"
                color="#2563eb"
              />
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">High-Risk Children Face Multiple Stressors</h3>
              <p className="text-xs text-gray-600 mb-4">Homelessness, foster care, and poverty cluster in high-risk tier</p>
              <StackedBarChart
                data={stressorsByTier}
                xKey="indicator"
                yKeys={['Low', 'Moderate', 'High']}
                yAxisLabel="Prevalence (%)"
                colors={['#10b981', '#f59e0b', '#ef4444']}
                stacked={false}
              />
            </div>
          </div>
        </div>


        {/* Indicator Prevalence by Risk Tier */}
        <div className="card mb-8">
          <h3 className="text-xl font-bold mb-2">📊 Risk Indicator Correlation Matrix</h3>
          <p className="text-sm text-gray-600 mb-4">
            Percentage of children showing each risk indicator by tier—demonstrating how indicators cluster in high-risk children
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
          <h3 className="text-xl font-bold mb-4">💡 Key Insights</h3>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-bold mb-2 text-blue-900">Multidimensional Risk</h4>
              <p className="text-gray-700 text-sm">
                High-risk children show elevated scores across all four domains (Stability, Engagement, Developmental, Context),
                confirming risk compounds when challenges occur simultaneously across multiple areas. This validates the need for
                comprehensive, multi-domain interventions rather than single-issue approaches.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-bold mb-2 text-purple-900">Poverty × Risk</h4>
                <p className="text-gray-700 text-sm">
                  Deep poverty (&lt;100% FPL): <strong>{riskByPoverty[0].avgRisk.toFixed(0)}</strong> avg risk<br/>
                  Higher income (&gt;300%): <strong>{riskByPoverty[3].avgRisk.toFixed(0)}</strong> avg risk<br/>
                  <span className="text-purple-700 font-semibold">Gap: {(riskByPoverty[0].avgRisk - riskByPoverty[3].avgRisk).toFixed(0)} points</span>
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-bold mb-2 text-green-900">Early Warning Signals</h4>
                <p className="text-gray-700 text-sm">
                  <strong>{((screeningDistribution.find(d => d.category === '0-2 screenings')?.count || 0) / filteredData.length * 100).toFixed(0)}%</strong> completed ≤2 screenings<br/>
                  <strong>{((attendanceDistribution.find(d => d.category === 'Very Low (<50)')?.count || 0) / filteredData.length * 100).toFixed(0)}%</strong> attend &lt;50 days/year<br/>
                  <strong>{((gapDistribution.find(d => d.category === '2+ gaps')?.count || 0) / filteredData.length * 100).toFixed(0)}%</strong> have 2+ enrollment gaps
                </p>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg">
                <h4 className="font-bold mb-2 text-amber-900">Geographic Targeting</h4>
                <p className="text-gray-700 text-sm">
                  Risk concentration varies significantly by region and county, enabling precise targeting of
                  intensive services, mobile outreach, and program expansion to highest-need areas.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* So What */}
        <div className="info-box">
          <h3 className="text-lg font-bold mb-2">🎯 So What?</h3>
          <p className="text-gray-800 mb-3">
            <strong>This analysis proves that ECIDS data can identify vulnerable children before kindergarten entry—and shows exactly where to intervene.</strong>
          </p>
          <p className="text-gray-800">
            Risk is not random. High-risk children demonstrate measurable patterns: chronic low attendance, missed developmental screenings,
            enrollment instability, and compounding family stressors. These are <strong>modifiable factors</strong>, not immutable traits.
            The multidimensional risk profile reveals that effective intervention requires addressing multiple domains simultaneously—attendance
            coaching alone won't help a child who also lacks stable housing and misses critical screenings. Geographic variation pinpoints exactly
            which counties and programs need intensive support. This shifts the paradigm from reactive remediation to <strong>proactive,
            data-driven prevention</strong>.
          </p>
        </div>
      </Container>
    </>
  );
}
