'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { loadAllData, loadK12Overview, filterData } from '@/lib/dataLoader';
import { ChildWithRisk } from '@/lib/types';
import MetricCard from '@/components/MetricCard';
import DonutChart from '@/components/charts/DonutChart';
import MissouriCountyMap from '@/components/charts/MissouriCountyMap';
import Container from '@/components/layout/Container';
import { BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

type MapMetric = 'multiple-indicators' | 'screening-completion' | 'early-learning' | 'poverty';

export default function IndicatorDistributionPage() {
  const [data, setData] = useState<ChildWithRisk[]>([]);
  const [k12Data, setK12Data] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    county: 'All Counties',
    povertyLevel: 'All Poverty Levels',
  });
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  const [mapMetric, setMapMetric] = useState<MapMetric>('multiple-indicators');

  useEffect(() => {
    loadAllData().then((loadedData) => {
      setData(loadedData);
    });
  }, []);

  useEffect(() => {
    loadK12Overview(filters).then((k12Overview) => {
      setK12Data(k12Overview);
      setLoading(false);
    });
  }, [filters]);

  // All hooks must be called before any conditional returns
  const filteredData = filterData(data, filters);

  // Debug logging
  useEffect(() => {
    if (filters.county !== 'All Counties') {
      console.log('Current filter:', filters);
      console.log('Filtered data count:', filteredData.length);
      console.log('Sample filtered data:', filteredData.slice(0, 3));
    }
  }, [filters, filteredData]);

  // Calculate county-level metrics for map
  const countyMetrics = useMemo(() => {
    const metrics: any = {};

    data.forEach(child => {
      const county = child.AddressCountyName;
      if (!metrics[county]) {
        metrics[county] = {
          county,
          totalChildren: 0,
          multipleIndicators: 0,
          missedScreenings: 0,
          enrollmentGaps: 0,
          lowAttendance: 0,
          deepPoverty: 0,
          targetedSupport: 0,
          intensiveSupport: 0,
        };
      }

      metrics[county].totalChildren++;

      // Multiple indicators (2+)
      let indicatorCount = 0;
      if (child.num_enrollment_gaps > 0) indicatorCount++;
      if (child.num_screenings_completed < 4) indicatorCount++;
      if (child.avg_attendance_days < 80) indicatorCount++;
      if (child.deep_poverty) indicatorCount++;
      if (child.num_household_stressors > 1) indicatorCount++;

      if (indicatorCount >= 2) metrics[county].multipleIndicators++;
      if (child.num_screenings_completed < 4) metrics[county].missedScreenings++;
      if (child.num_enrollment_gaps > 0) metrics[county].enrollmentGaps++;
      if (child.avg_attendance_days < 80) metrics[county].lowAttendance++;
      if (child.deep_poverty) metrics[county].deepPoverty++;
      if (child.support_band === 'Targeted Support') metrics[county].targetedSupport++;
      if (child.support_band === 'Intensive Support') metrics[county].intensiveSupport++;
    });

    return Object.values(metrics).map((m: any) => ({
      ...m,
      multipleIndicatorsPct: (m.multipleIndicators / m.totalChildren) * 100,
      missedScreeningsPct: (m.missedScreenings / m.totalChildren) * 100,
      enrollmentGapsPct: (m.enrollmentGaps / m.totalChildren) * 100,
      lowAttendancePct: (m.lowAttendance / m.totalChildren) * 100,
      deepPovertyPct: (m.deepPoverty / m.totalChildren) * 100,
      supportNeedsPct: ((m.targetedSupport + m.intensiveSupport) / m.totalChildren) * 100,
    }));
  }, [data]);

  // Calculate high-risk children by county for second map
  const highRiskCountyData = useMemo(() => {
    return Object.entries(
      data.reduce((acc: any, child) => {
        const county = child.AddressCountyName;
        if (!acc[county]) acc[county] = { sum: 0, count: 0, highRisk: 0 };
        acc[county].sum += child.composite_risk_score;
        acc[county].count += 1;
        if (child.risk_tier === 'High') acc[county].highRisk += 1;
        return acc;
      }, {})
    )
      .map(([county, stats]: [string, any]) => ({
        county,
        avgRisk: stats.sum / stats.count,
        value: (stats.highRisk / stats.count) * 100,
        highRiskPct: (stats.highRisk / stats.count) * 100,
        count: stats.count,
      }));
  }, [data]);

  // Get map data based on selected metric
  const getMapData = () => {
    const metricField = {
      'multiple-indicators': 'multipleIndicatorsPct',
      'screening-completion': 'missedScreeningsPct',
      'early-learning': 'enrollmentGapsPct',
      'poverty': 'deepPovertyPct',
    }[mapMetric];

    return countyMetrics.map(m => ({
      county: m.county,
      value: m[metricField],
      highRiskPct: m.supportNeedsPct,
      count: m.totalChildren,
    }));
  };

  const mapTitle = {
    'multiple-indicators': 'Children with Multiple Early Childhood Indicators by County',
    'screening-completion': 'Developmental Screening Gaps by County',
    'early-learning': 'Early Learning Participation Gaps by County',
    'poverty': 'Deep Poverty Context by County',
  }[mapMetric];

  const mapLegendLabel = {
    'multiple-indicators': 'Children with Multiple Indicators',
    'screening-completion': 'Children with Missed Screenings',
    'early-learning': 'Children with Enrollment Gaps',
    'poverty': 'Children in Deep Poverty',
  }[mapMetric];

  // Calculate multiple indicators percentage for summary metrics
  const childrenWithMultipleIndicators = filteredData.filter(d => {
    let indicatorCount = 0;
    if (d.num_enrollment_gaps > 0) indicatorCount++;
    if (d.num_screenings_completed < 4) indicatorCount++;
    if (d.avg_attendance_days < 80) indicatorCount++;
    if (d.deep_poverty) indicatorCount++;
    if (d.num_household_stressors > 1) indicatorCount++;
    return indicatorCount >= 2;
  }).length;

  const multipleIndicatorsPct = filteredData.length > 0
    ? (childrenWithMultipleIndicators / filteredData.length) * 100
    : 0;

  // Selected county data
  const selectedCountyData = selectedCounty && selectedCounty !== 'All Counties'
    ? countyMetrics.find(m => m.county === selectedCounty)
    : null;

  const selectedCountyChildren = selectedCounty && selectedCounty !== 'All Counties'
    ? data.filter(d => d.AddressCountyName === selectedCounty)
    : filteredData;

  // Helper function to get risk tier percentages for a subset of children
  const getRiskTierPercentages = (children: ChildWithRisk[]) => {
    const total = children.length;
    if (total === 0) return { 'Low Risk': 0, 'Moderate Risk': 0, 'High Risk': 0 };

    return {
      'Low Risk': Math.round((children.filter(d => d.risk_tier === 'Low').length / total) * 100),
      'Moderate Risk': Math.round((children.filter(d => d.risk_tier === 'Moderate').length / total) * 100),
      'High Risk': Math.round((children.filter(d => d.risk_tier === 'High').length / total) * 100),
    };
  };

  // Check loading state after all hooks have been called
  if (loading || !k12Data) {
    return (
      <Container>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading indicator data...</p>
        </div>
      </Container>
    );
  }

  return (
    <>
      <Container>
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Early Childhood Indicator Patterns</h1>
              <p className="text-gray-600">
                This page shows how early childhood indicators are distributed across counties and identifies where additional support may be needed.
              </p>
            </div>
            {selectedCounty && selectedCounty !== 'All Counties' && (
              <div className="flex items-center gap-2 bg-white rounded-lg shadow-md border border-gray-200 px-4 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Viewing:</span>
                  <span className="text-base font-bold text-gray-900">
                    {selectedCounty.split(' ').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')} County
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedCounty(null);
                    setFilters({ ...filters, county: 'All Counties' });
                  }}
                  className="ml-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Summary Metrics - Only show when viewing all counties */}
        {(!selectedCounty || selectedCounty === 'All Counties') && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <MetricCard
              label="Total Children Tracked"
              value={filteredData.length.toLocaleString()}
              icon="👶"
            />
            <MetricCard
              label="Multiple Indicators"
              value={`${multipleIndicatorsPct.toFixed(1)}%`}
              help="Children with 2+ early childhood indicators"
              icon="📊"
              color="orange"
            />
            <MetricCard
              label="Missed Screenings"
              value={`${((filteredData.filter(d => d.num_screenings_completed < 4).length / filteredData.length) * 100).toFixed(1)}%`}
              icon="🏥"
              color="yellow"
            />
            <MetricCard
              label="Enrollment Gaps"
              value={`${((filteredData.filter(d => d.num_enrollment_gaps > 0).length / filteredData.length) * 100).toFixed(1)}%`}
              icon="📅"
              color="yellow"
            />
          </div>
        )}

        {/* County Drill-Down - Shown at top when county selected */}
        {selectedCountyData && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-blue-900">
                {selectedCounty ? selectedCounty.split(' ').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ') : ''} County - ECIDS Summary
              </h3>
            </div>

            {/* County KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-white rounded-lg p-3">
                <div className="text-xs text-gray-600">Children Tracked</div>
                <div className="text-2xl font-bold text-gray-900">{selectedCountyData.totalChildren}</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="text-xs text-gray-600">Multiple Indicators</div>
                <div className="text-2xl font-bold text-orange-700">{selectedCountyData.multipleIndicatorsPct.toFixed(1)}%</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="text-xs text-gray-600">Missed Screenings</div>
                <div className="text-2xl font-bold text-yellow-700">{selectedCountyData.missedScreeningsPct.toFixed(1)}%</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="text-xs text-gray-600">Enrollment Gaps</div>
                <div className="text-2xl font-bold text-yellow-700">{selectedCountyData.enrollmentGapsPct.toFixed(1)}%</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="text-xs text-gray-600">Support Needs</div>
                <div className="text-2xl font-bold text-purple-700">{selectedCountyData.supportNeedsPct.toFixed(1)}%</div>
              </div>
            </div>

            {/* County Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Early Childhood Indicators</h4>
                <DonutChart
                  data={[
                    { name: 'Low Indicators', value: selectedCountyChildren.filter(d => d.risk_tier === 'Low').length },
                    { name: 'Moderate Indicators', value: selectedCountyChildren.filter(d => d.risk_tier === 'Moderate').length },
                    { name: 'Multiple Indicators', value: selectedCountyChildren.filter(d => d.risk_tier === 'High').length },
                  ]}
                  nameKey="name"
                  valueKey="value"
                  colors={['#10b981', '#f59e0b', '#ef4444']}
                  height={250}
                />
              </div>

              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Support Needs</h4>
                <DonutChart
                  data={[
                    { name: 'On Track', value: selectedCountyChildren.filter(d => d.support_band === 'On Track').length },
                    { name: 'Monitor', value: selectedCountyChildren.filter(d => d.support_band === 'Monitor').length },
                    { name: 'Targeted Support', value: selectedCountyChildren.filter(d => d.support_band === 'Targeted Support').length },
                    { name: 'Intensive Support', value: selectedCountyChildren.filter(d => d.support_band === 'Intensive Support').length },
                  ]}
                  nameKey="name"
                  valueKey="value"
                  colors={['#10b981', '#3b82f6', '#f59e0b', '#f97316']}
                  height={250}
                />
              </div>
            </div>
          </div>
        )}

        {/* Map Section - Only show when viewing all counties */}
        {(!selectedCounty || selectedCounty === 'All Counties') && (
          <div className="card mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{mapTitle}</h3>
              <p className="text-sm text-gray-600 mt-1">
                Click on a county to see detailed indicator patterns
              </p>
            </div>

          </div>

          {/* Side-by-side maps */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Indicator-specific map */}
            <div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Indicator Map View</label>
                <select
                  value={mapMetric}
                  onChange={(e) => setMapMetric(e.target.value as MapMetric)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                >
                  <option value="multiple-indicators">Multiple Indicators</option>
                  <option value="screening-completion">Screening Gaps</option>
                  <option value="early-learning">Participation Gaps</option>
                  <option value="poverty">Poverty Context</option>
                </select>
              </div>
              <MissouriCountyMap
                data={getMapData()}
                height={450}
                metricLabel={mapLegendLabel}
                onCountyClick={(county) => {
                  const countyName = county.toUpperCase();
                  setSelectedCounty(countyName);
                  setFilters({ ...filters, county: countyName });
                }}
              />
            </div>

            {/* High-Risk Children map */}
            <div>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">High-Risk Children by County</h3>
                <p className="text-xs text-gray-600">
                  Percentage of children in each county classified as high-risk based on composite ECIDS indicators
                </p>
              </div>
              <MissouriCountyMap
                data={highRiskCountyData}
                height={450}
                metricLabel="High-Risk Children"
                onCountyClick={(county) => {
                  const countyName = county.toUpperCase();
                  setSelectedCounty(countyName);
                  setFilters({ ...filters, county: countyName });
                }}
              />
            </div>
          </div>
          </div>
        )}

        {/* ECIDS Indicator Pattern Charts */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Indicator Contribution to Risk</h2>
          <p className="text-gray-600 mb-6">
            Understanding which early childhood indicators are most strongly associated with readiness risk
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Program Stability */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold mb-2 text-gray-900">Program Stability Patterns</h3>
              <p className="text-sm text-gray-600 mb-4">How enrollment stability appears across risk tiers</p>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <RechartsBar
                    data={[
                      {
                        pattern: 'Consistent',
                        ...getRiskTierPercentages(filteredData.filter(d => d.num_enrollment_gaps === 0))
                      },
                      {
                        pattern: '1 Transition',
                        ...getRiskTierPercentages(filteredData.filter(d => d.num_enrollment_gaps === 1))
                      },
                      {
                        pattern: '2+ Transitions',
                        ...getRiskTierPercentages(filteredData.filter(d => d.num_enrollment_gaps >= 2))
                      },
                    ]}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 110, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tick={{ fill: '#6b7280', fontSize: 13, fontWeight: 500 }}
                      label={{ value: 'Percentage (%)', position: 'insideBottom', offset: -20, style: { fill: '#374151', fontWeight: 600 } }}
                    />
                    <YAxis
                      type="category"
                      dataKey="pattern"
                      tick={{ fill: '#374151', fontSize: 13, fontWeight: 500 }}
                      width={100}
                    />
                    <Tooltip
                      formatter={(value) => `${value}%`}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontSize: '13px',
                        fontWeight: 500
                      }}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="circle"
                    />
                    <Bar dataKey="Low Risk" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="Moderate Risk" stackId="a" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="High Risk" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} />
                  </RechartsBar>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Screening Completion */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold mb-2 text-gray-900">Developmental Screening Patterns</h3>
              <p className="text-sm text-gray-600 mb-4">How screening completion appears across risk tiers</p>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <RechartsBar
                    data={[
                      {
                        pattern: 'Completed (4+)',
                        ...getRiskTierPercentages(filteredData.filter(d => d.num_screenings_completed >= 4))
                      },
                      {
                        pattern: 'Partial (2-3)',
                        ...getRiskTierPercentages(filteredData.filter(d => d.num_screenings_completed >= 2 && d.num_screenings_completed < 4))
                      },
                      {
                        pattern: 'Missed (<2)',
                        ...getRiskTierPercentages(filteredData.filter(d => d.num_screenings_completed < 2))
                      },
                    ]}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 120, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tick={{ fill: '#6b7280', fontSize: 13, fontWeight: 500 }}
                      label={{ value: 'Percentage (%)', position: 'insideBottom', offset: -20, style: { fill: '#374151', fontWeight: 600 } }}
                    />
                    <YAxis
                      type="category"
                      dataKey="pattern"
                      tick={{ fill: '#374151', fontSize: 13, fontWeight: 500 }}
                      width={110}
                    />
                    <Tooltip
                      formatter={(value) => `${value}%`}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontSize: '13px',
                        fontWeight: 500
                      }}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="circle"
                    />
                    <Bar dataKey="Low Risk" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="Moderate Risk" stackId="a" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="High Risk" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} />
                  </RechartsBar>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Early Learning Participation */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold mb-2 text-gray-900">Early Learning Participation Patterns</h3>
              <p className="text-sm text-gray-600 mb-4">How attendance patterns appear across risk tiers</p>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <RechartsBar
                    data={[
                      {
                        pattern: 'Consistent Participation',
                        ...getRiskTierPercentages(filteredData.filter(d => d.avg_attendance_days >= 100))
                      },
                      {
                        pattern: 'Intermittent Participation',
                        ...getRiskTierPercentages(filteredData.filter(d => d.avg_attendance_days >= 80 && d.avg_attendance_days < 100))
                      },
                      {
                        pattern: 'Limited Participation',
                        ...getRiskTierPercentages(filteredData.filter(d => d.avg_attendance_days < 80))
                      },
                    ]}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 160, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tick={{ fill: '#6b7280', fontSize: 13, fontWeight: 500 }}
                      label={{ value: 'Percentage (%)', position: 'insideBottom', offset: -20, style: { fill: '#374151', fontWeight: 600 } }}
                    />
                    <YAxis
                      type="category"
                      dataKey="pattern"
                      tick={{ fill: '#374151', fontSize: 12, fontWeight: 500 }}
                      width={150}
                    />
                    <Tooltip
                      formatter={(value) => `${value}%`}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontSize: '13px',
                        fontWeight: 500
                      }}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="circle"
                    />
                    <Bar dataKey="Low Risk" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="Moderate Risk" stackId="a" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="High Risk" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} />
                  </RechartsBar>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Family Context */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold mb-2 text-gray-900">Family Context Indicators</h3>
              <p className="text-sm text-gray-600 mb-4">How poverty levels appear across risk tiers</p>
              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer>
                  <RechartsBar
                    data={[
                      {
                        pattern: 'Higher Income',
                        ...getRiskTierPercentages(filteredData.filter(d => d.PercentOfFederalPovertyLevel >= 300))
                      },
                      {
                        pattern: 'Moderate Income',
                        ...getRiskTierPercentages(filteredData.filter(d => d.PercentOfFederalPovertyLevel >= 200 && d.PercentOfFederalPovertyLevel < 300))
                      },
                      {
                        pattern: 'Low Income',
                        ...getRiskTierPercentages(filteredData.filter(d => d.PercentOfFederalPovertyLevel >= 100 && d.PercentOfFederalPovertyLevel < 200))
                      },
                      {
                        pattern: 'Deep Poverty',
                        ...getRiskTierPercentages(filteredData.filter(d => d.PercentOfFederalPovertyLevel < 100))
                      },
                    ]}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 120, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tick={{ fill: '#6b7280', fontSize: 13, fontWeight: 500 }}
                      label={{ value: 'Percentage (%)', position: 'insideBottom', offset: -20, style: { fill: '#374151', fontWeight: 600 } }}
                    />
                    <YAxis
                      type="category"
                      dataKey="pattern"
                      tick={{ fill: '#374151', fontSize: 13, fontWeight: 500 }}
                      width={110}
                    />
                    <Tooltip
                      formatter={(value) => `${value}%`}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontSize: '13px',
                        fontWeight: 500
                      }}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="circle"
                    />
                    <Bar dataKey="Low Risk" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="Moderate Risk" stackId="a" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="High Risk" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} />
                  </RechartsBar>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Household Stressors */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold mb-2 text-gray-900">Household Stressors Patterns</h3>
              <p className="text-sm text-gray-600 mb-4">How family stress appears across risk tiers</p>
              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer>
                  <RechartsBar
                    data={[
                      {
                        pattern: 'No Stressors',
                        ...getRiskTierPercentages(filteredData.filter(d => d.num_household_stressors === 0))
                      },
                      {
                        pattern: '1 Stressor',
                        ...getRiskTierPercentages(filteredData.filter(d => d.num_household_stressors === 1))
                      },
                      {
                        pattern: '2 Stressors',
                        ...getRiskTierPercentages(filteredData.filter(d => d.num_household_stressors === 2))
                      },
                      {
                        pattern: '3+ Stressors',
                        ...getRiskTierPercentages(filteredData.filter(d => d.num_household_stressors >= 3))
                      },
                    ]}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 110, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tick={{ fill: '#6b7280', fontSize: 13, fontWeight: 500 }}
                      label={{ value: 'Percentage (%)', position: 'insideBottom', offset: -20, style: { fill: '#374151', fontWeight: 600 } }}
                    />
                    <YAxis
                      type="category"
                      dataKey="pattern"
                      tick={{ fill: '#374151', fontSize: 13, fontWeight: 500 }}
                      width={100}
                    />
                    <Tooltip
                      formatter={(value) => `${value}%`}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontSize: '13px',
                        fontWeight: 500
                      }}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="circle"
                    />
                    <Bar dataKey="Low Risk" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="Moderate Risk" stackId="a" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="High Risk" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} />
                  </RechartsBar>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Program Participation */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold mb-2 text-gray-900">Program Participation Patterns</h3>
              <p className="text-sm text-gray-600 mb-4">How program enrollment appears across risk tiers</p>
              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer>
                  <RechartsBar
                    data={[
                      {
                        pattern: 'No Programs',
                        ...getRiskTierPercentages(filteredData.filter(d => !d.programs_list || d.programs_list.length === 0))
                      },
                      {
                        pattern: '1 Program',
                        ...getRiskTierPercentages(filteredData.filter(d => d.programs_list && d.programs_list.length === 1))
                      },
                      {
                        pattern: '2 Programs',
                        ...getRiskTierPercentages(filteredData.filter(d => d.programs_list && d.programs_list.length === 2))
                      },
                      {
                        pattern: '3+ Programs',
                        ...getRiskTierPercentages(filteredData.filter(d => d.programs_list && d.programs_list.length >= 3))
                      },
                    ]}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 110, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tick={{ fill: '#6b7280', fontSize: 13, fontWeight: 500 }}
                      label={{ value: 'Percentage (%)', position: 'insideBottom', offset: -20, style: { fill: '#374151', fontWeight: 600 } }}
                    />
                    <YAxis
                      type="category"
                      dataKey="pattern"
                      tick={{ fill: '#374151', fontSize: 13, fontWeight: 500 }}
                      width={100}
                    />
                    <Tooltip
                      formatter={(value) => `${value}%`}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontSize: '13px',
                        fontWeight: 500
                      }}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="circle"
                    />
                    <Bar dataKey="Low Risk" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="Moderate Risk" stackId="a" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="High Risk" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} />
                  </RechartsBar>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Insight Box */}
          <div className="mt-6 bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4">
            <p className="text-sm text-gray-800">
              <strong>📊 Indicator → Risk Relationship:</strong> These charts reveal which early childhood indicators are most strongly associated
              with higher readiness risk. Notice how children with multiple program transitions, missed screenings, limited participation, deeper poverty,
              or multiple household stressors show higher concentrations of risk (red segments). This analytical view helps policymakers understand
              <strong> what contributes to risk</strong>, not just where risk appears, enabling more targeted support strategies.
            </p>
          </div>
        </div>

        {/* Key Insights */}
        <div className="info-box">
          <h3 className="text-lg font-bold mb-2">💡 Key Insight</h3>
          <p className="text-gray-800">
            <strong>Early childhood indicator patterns vary significantly by county.</strong> This geographic view helps policymakers and program
            administrators identify where support systems may need strengthening. Counties with higher concentrations of multiple indicators may
            benefit from enhanced developmental screening programs, family support services, or early learning opportunities. These patterns are
            based on ECIDS data and represent actionable opportunities for early intervention.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs text-gray-600">
            <strong>Note:</strong> These patterns are based on synthetic data generated for demonstration purposes and are intended to illustrate
            how integrated early childhood and K–3 data can support planning and resource allocation.
          </p>
        </div>
      </Container>
    </>
  );
}
