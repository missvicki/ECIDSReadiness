'use client';

import React, { useState, useEffect } from 'react';
import { loadAllData, filterData } from '@/lib/dataLoader';
import { ChildWithRisk } from '@/lib/types';
import Filters from '@/components/Filters';
import MetricCard from '@/components/MetricCard';
import BarChart from '@/components/charts/BarChart';
import StackedBarChart from '@/components/charts/StackedBarChart';
import Container from '@/components/layout/Container';

export default function ParticipationPage() {
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

  // Metrics
  const avgGaps = filteredData.reduce((sum, d) => sum + d.num_enrollment_gaps, 0) / filteredData.length;
  const pctWithGaps = (filteredData.filter(d => d.num_enrollment_gaps > 0).length / filteredData.length) * 100;
  const avgAttendance = filteredData.reduce((sum, d) => sum + d.avg_attendance_days, 0) / filteredData.length;

  // 1. Participation Episodes Distribution by Risk Tier (100% Stacked)
  const episodesByTier: any = {};
  ['Low', 'Moderate', 'High'].forEach(tier => {
    const tierData = filteredData.filter(d => d.risk_tier === tier);
    const total = tierData.length;
    episodesByTier[tier] = {
      tier,
      '1 episode': (tierData.filter(d => d.num_participation_episodes === 1).length / total) * 100,
      '2 episodes': (tierData.filter(d => d.num_participation_episodes === 2).length / total) * 100,
      '3 episodes': (tierData.filter(d => d.num_participation_episodes === 3).length / total) * 100,
      '4+ episodes': (tierData.filter(d => d.num_participation_episodes >= 4).length / total) * 100,
    };
  });

  const episodeData = Object.values(episodesByTier);

  // 2. Risk by Program Type
  const programRisk: any = {};
  filteredData.forEach(child => {
    child.programs_list?.forEach(program => {
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

  // 3. Attendance Bands by Risk Tier (Stacked)
  const attendanceByTier: any = {};
  ['Low', 'Moderate', 'High'].forEach(tier => {
    const tierData = filteredData.filter(d => d.risk_tier === tier);
    attendanceByTier[tier] = {
      tier,
      'Very Low (<50)': tierData.filter(d => d.avg_attendance_days < 50).length,
      'Low (50-100)': tierData.filter(d => d.avg_attendance_days >= 50 && d.avg_attendance_days < 100).length,
      'Moderate (100-150)': tierData.filter(d => d.avg_attendance_days >= 100 && d.avg_attendance_days < 150).length,
      'High (150+)': tierData.filter(d => d.avg_attendance_days >= 150).length,
    };
  });

  const attendanceData = Object.values(attendanceByTier);

  // 4. Program Switching (>2 Episodes) by Risk Tier
  const switchingByTier = ['Low', 'Moderate', 'High'].map(tier => {
    const tierData = filteredData.filter(d => d.risk_tier === tier);
    return {
      tier,
      count: tierData.filter(d => d.num_participation_episodes > 2).length,
    };
  });

  return (
    <>
      <Filters data={data} filters={filters} onChange={setFilters} />

      <Container>

        {/* Key Finding */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold mb-3">Key Finding</h2>
          <p className="text-gray-700 leading-relaxed">
            <strong>Participation continuity is one of the strongest readiness signals.</strong> Children with multiple
            enrollment gaps and lower attendance show significantly higher risk.
          </p>
          <div className="mt-4 bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>📖 Definition:</strong> An <strong>enrollment episode</strong> = one continuous period of program participation.
              Example: Child enrolled Jan-June (1 episode), gap in summer, re-enrolled Sept-Dec (2nd episode) = 2 total episodes.
              More episodes often = more instability.
            </p>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <MetricCard
            label="Avg Enrollment Gaps"
            value={avgGaps.toFixed(2)}
            icon="📊"
          />
          <MetricCard
            label="Children with Gaps"
            value={`${pctWithGaps.toFixed(1)}%`}
            icon="⚠️"
            color="yellow"
          />
          <MetricCard
            label="Avg Attendance Days"
            value={avgAttendance.toFixed(0)}
            icon="📅"
            color="blue"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <StackedBarChart
            data={episodeData}
            xKey="tier"
            yKeys={['1 episode', '2 episodes', '3 episodes', '4+ episodes']}
            title="Enrollment Episodes by Risk Tier (100% Stacked)"
            yAxisLabel="Percentage of Children"
            colors={['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b']}
            stacked={true}
          />

          <BarChart
            data={programRiskData}
            xKey="program"
            yKey="avgRisk"
            yAxisLabel="Average Risk Score (0-100)"
            title="Programs with Highest Risk (n≥20)"
            color="#f59e0b"
          />
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <StackedBarChart
              data={attendanceData}
              xKey="tier"
              yKeys={['Very Low (<50)', 'Low (50-100)', 'Moderate (100-150)', 'High (150+)']}
              title="Attendance Days per Year by Risk Tier"
              yAxisLabel="Number of Children"
              colors={['#ef4444', '#f59e0b', '#3b82f6', '#10b981']}
              stacked={true}
            />
            <p className="text-xs text-gray-600 mt-2 text-center">
              Colors show attendance levels: Red = Concerning (&lt;50 days), Green = Good (150+ days)
            </p>
          </div>

          <BarChart
            data={switchingByTier}
            xKey="tier"
            yKey="count"
            yAxisLabel="Number of Children"
            title="Program Switching (>2 Episodes) by Risk Tier"
            color="#8b5cf6"
          />
        </div>

        {/* Key Insights */}
        <div className="card mb-8">
          <h3 className="text-xl font-bold mb-4">📊 Participation Patterns</h3>
          <div className="space-y-4">
            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-bold mb-1">Chronic Gaps</h4>
              <p className="text-gray-700 text-sm">
                {((filteredData.filter(d => d.has_gap_over_6mo).length / filteredData.length) * 100).toFixed(1)}% of children
                have gaps longer than 6 months between program enrollment, indicating major instability.
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-bold mb-1">Program Switching</h4>
              <p className="text-gray-700 text-sm">
                High-risk children are overrepresented in the 4+ episodes category, suggesting program instability
                rather than continuous engagement.
              </p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-bold mb-1">Attendance Correlation</h4>
              <p className="text-gray-700 text-sm">
                Children with low attendance (&lt;50 days/year) show {((filteredData.filter(d => d.avg_attendance_days < 50 && d.risk_tier === 'High').length / filteredData.filter(d => d.avg_attendance_days < 50).length) * 100).toFixed(0)}%
                high-risk rate vs {((filteredData.filter(d => d.risk_tier === 'High').length / filteredData.length) * 100).toFixed(0)}% overall.
              </p>
            </div>
          </div>
        </div>

        {/* So What */}
        <div className="info-box">
          <h3 className="text-lg font-bold mb-2">💡 So What?</h3>
          <p className="text-gray-800">
            <strong>Enrollment continuity is protective—gaps signal risk.</strong> With {pctWithGaps.toFixed(0)}% of children experiencing
            enrollment disruptions, there's a clear intervention opportunity: re-enrollment outreach, transportation support, flexible scheduling.
            ECIDS participation data can flag children needing stabilization services before they disengage completely.
          </p>
        </div>
      </Container>
    </>
  );
}
