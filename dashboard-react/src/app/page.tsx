'use client';

import React, { useState, useEffect } from 'react';
import { loadAllData, loadK12Overview, filterData } from '@/lib/dataLoader';
import { ChildWithRisk } from '@/lib/types';
import Filters from '@/components/Filters';
import MetricCard from '@/components/MetricCard';
import DonutChart from '@/components/charts/DonutChart';
import Container from '@/components/layout/Container';

export default function OverviewPage() {
  const [data, setData] = useState<ChildWithRisk[]>([]);
  const [k12Data, setK12Data] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    county: 'All Counties',
  });

  useEffect(() => {
    loadAllData().then((ecidsData) => {
      setData(ecidsData);
    });
  }, []);

  useEffect(() => {
    loadK12Overview(filters).then((k12Overview) => {
      setK12Data(k12Overview);
      setLoading(false);
    });
  }, [filters]);

  if (loading || !k12Data) {
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

  // ECIDS Risk Distribution
  const riskDistribution = [
    { name: 'Low Risk', value: filteredData.filter(d => d.risk_tier === 'Low').length },
    { name: 'Moderate Risk', value: filteredData.filter(d => d.risk_tier === 'Moderate').length },
    { name: 'High Risk', value: filteredData.filter(d => d.risk_tier === 'High').length },
  ];

  // Kindergarten Readiness (3-tier framework)
  const kReadinessData = [
    { name: 'Demonstrating Readiness', value: k12Data.kindergartenReadiness.demonstrating },
    { name: 'Approaching Readiness', value: k12Data.kindergartenReadiness.approaching },
    { name: 'Emerging Readiness', value: k12Data.kindergartenReadiness.emerging },
  ];

  // Student Support Needs
  const supportDistribution = [
    { name: 'On Track', value: filteredData.filter(d => d.support_band === 'On Track').length },
    { name: 'Monitor', value: filteredData.filter(d => d.support_band === 'Monitor').length },
    { name: 'Targeted Support', value: filteredData.filter(d => d.support_band === 'Targeted Support').length },
    { name: 'Intensive Support', value: filteredData.filter(d => d.support_band === 'Intensive Support').length },
  ];

  // Grade 3 Reading Outcomes
  const grade3ReadingData = [
    { name: 'Advanced', value: k12Data.grade3Reading.advanced },
    { name: 'Proficient', value: k12Data.grade3Reading.proficient },
    { name: 'Basic', value: k12Data.grade3Reading.basic },
    { name: 'Below Basic', value: k12Data.grade3Reading.belowBasic },
  ];

  // Calculate key metrics
  const totalChildren = filteredData.length;
  const highRiskPct = (riskDistribution[2].value / totalChildren) * 100;
  const targetedPlusPct = ((supportDistribution[2].value + supportDistribution[3].value) / totalChildren) * 100;
  const grade3ProficientPlus = k12Data.grade3Reading.advanced + k12Data.grade3Reading.proficient;
  const grade3Total = k12Data.grade3Reading.advanced + k12Data.grade3Reading.proficient +
                      k12Data.grade3Reading.basic + k12Data.grade3Reading.belowBasic;
  const grade3ProficientPct = grade3Total > 0 ? (grade3ProficientPlus / grade3Total) * 100 : 0;

  return (
    <>
      <Filters data={data} filters={filters} onChange={setFilters} />

      <Container>
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Early Childhood to Grade 3 Outcomes
          </h1>
          <p className="text-gray-600">
            Tracking the pathway from early childhood indicators through elementary school outcomes
          </p>
        </div>

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

        {/* Executive Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <MetricCard
            label="Total Children Tracked"
            value={data.length.toLocaleString()}
            icon="👶"
          />
          <MetricCard
            label="K-3 Student Records"
            value={k12Data.totalK3Students.toLocaleString()}
            icon="🎓"
            color="blue"
          />
          <MetricCard
            label="Grade 3 Students"
            value={k12Data.totalGrade3Students.toLocaleString()}
            icon="📚"
            color="green"
          />
          <MetricCard
            label="Grade 3 Proficient+"
            value={`${grade3ProficientPct.toFixed(1)}%`}
            help="Advanced or Proficient in Reading"
            icon="⭐"
            color="purple"
          />
        </div>

        {/* Visual Pathway Indicator */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="text-center flex-1">
              <div className="text-2xl font-bold text-purple-700">Early Childhood</div>
              <div className="text-sm text-gray-600">ECIDS Indicators</div>
            </div>
            <div className="text-3xl text-gray-400">→</div>
            <div className="text-center flex-1">
              <div className="text-2xl font-bold text-blue-700">Kindergarten</div>
              <div className="text-sm text-gray-600">School Entry</div>
            </div>
            <div className="text-3xl text-gray-400">→</div>
            <div className="text-center flex-1">
              <div className="text-2xl font-bold text-green-700">K-3 Support</div>
              <div className="text-sm text-gray-600">Resource Needs</div>
            </div>
            <div className="text-3xl text-gray-400">→</div>
            <div className="text-center flex-1">
              <div className="text-2xl font-bold text-orange-700">Grade 3 Reading</div>
              <div className="text-sm text-gray-600">Key Milestone</div>
            </div>
          </div>
        </div>

        {/* 4-Chart Longitudinal Story */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Chart 1: Early Childhood Indicators */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Early Childhood Indicators</h3>
            <p className="text-xs text-gray-600 mb-4">
              Overall profile of children entering the system
            </p>
            <DonutChart
              data={riskDistribution}
              nameKey="name"
              valueKey="value"
              colors={['#10b981', '#f59e0b', '#ef4444']}
              height={300}
              centerText={{
                label: 'High',
                value: `${highRiskPct.toFixed(1)}%`,
              }}
            />
            <div className="mt-4 text-xs text-gray-600">
              <p className="font-semibold mb-1">What this shows:</p>
              <p>Early indicators children bring into the system based on participation, development, and family context.</p>
            </div>
            {/* Connecting Insight */}
            <div className="mt-4 bg-purple-50 border-l-2 border-purple-400 px-3 py-2 rounded">
              <p className="text-xs font-semibold text-purple-900">
                → {k12Data.insights?.readinessGap ? `${k12Data.insights.readinessGap.toFixed(0)}%` : '~30%'} readiness gap between low and high indicator children
              </p>
            </div>
          </div>

          {/* Chart 2: Kindergarten Readiness */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Kindergarten Readiness</h3>
            <p className="text-xs text-gray-600 mb-4">
              How prepared children are when entering school
            </p>
            <DonutChart
              data={kReadinessData}
              nameKey="name"
              valueKey="value"
              colors={['#10b981', '#3b82f6', '#f59e0b']}
              height={300}
              centerText={{
                label: 'Demonstrating',
                value: `${k12Data.totalKStudents > 0 ? ((k12Data.kindergartenReadiness.demonstrating / k12Data.totalKStudents) * 100).toFixed(1) : 0}%`,
              }}
            />
            <div className="mt-4 text-xs text-gray-600">
              <p className="font-semibold mb-1">What this shows:</p>
              <p>Transition point between early childhood services and the K-12 system.</p>
            </div>
            {/* Connecting Insight */}
            <div className="mt-4 bg-blue-50 border-l-2 border-blue-400 px-3 py-2 rounded">
              <p className="text-xs font-semibold text-blue-900">
                → Children demonstrating readiness are more likely to be On Track in K-3
              </p>
            </div>
          </div>

          {/* Chart 3: Student Support Needs */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Student Support Needs</h3>
            <p className="text-xs text-gray-600 mb-4">
              Based on early indicators and K-3 progress
            </p>
            <DonutChart
              data={supportDistribution}
              nameKey="name"
              valueKey="value"
              colors={['#10b981', '#3b82f6', '#f59e0b', '#f97316']}
              height={300}
              centerText={{
                label: 'Targeted+',
                value: `${targetedPlusPct.toFixed(1)}%`,
              }}
            />
            <div className="mt-4 text-xs text-gray-600">
              <p className="font-semibold mb-1">What this shows:</p>
              <p>High-level view of support needs to help agencies prioritize resources.</p>
            </div>
            {/* Connecting Insight */}
            <div className="mt-4 bg-green-50 border-l-2 border-green-400 px-3 py-2 rounded">
              <p className="text-xs font-semibold text-green-900">
                → Early support correlates with stronger Grade 3 reading outcomes
              </p>
            </div>
          </div>

          {/* Chart 4: Grade 3 Reading Outcomes */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Grade 3 Reading Outcomes</h3>
            <p className="text-xs text-gray-600 mb-4">
              Key early academic milestone
            </p>
            <DonutChart
              data={grade3ReadingData}
              nameKey="name"
              valueKey="value"
              colors={['#10b981', '#3b82f6', '#f59e0b', '#ef4444']}
              height={300}
              centerText={{
                label: 'Proficient+',
                value: `${grade3ProficientPct.toFixed(1)}%`,
              }}
            />
            <div className="mt-4 text-xs text-gray-600">
              <p className="font-semibold mb-1">What this shows:</p>
              <p>Grade 3 reading is widely used as an indicator of long-term academic success.</p>
            </div>
          </div>
        </div>

        {/* Key Insight Summary */}
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6 mb-8">
          <p className="text-gray-800 leading-relaxed">
            <strong>Key Insight:</strong> Early childhood indicators are associated with kindergarten readiness and early reading outcomes,
            illustrating how integrated data systems can help identify where additional support may improve long-term success.
          </p>
        </div>

        {/* Executive Summary */}
        <div className="card bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-purple-600">
          <h3 className="text-xl font-bold mb-4 text-purple-900">📊 Key Takeaway for Decision-Makers</h3>
          <div className="space-y-3 text-gray-800">
            <p className="text-lg leading-relaxed">
              <strong>This system demonstrates how early childhood data connects to later school outcomes.</strong> Integrated ECIDS and K-12 data
              allow policymakers to see how early indicators—like enrollment gaps, missed screenings, and family context—correlate with
              kindergarten readiness and Grade 3 reading achievement.
            </p>
            <p>
              The value is not just identifying children with multiple risk factors ({highRiskPct.toFixed(1)}% high risk), but showing that
              early childhood experiences influence later educational trajectories. This enables:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Proactive support</strong> before kindergarten entry, not reactive remediation later</li>
              <li><strong>Resource prioritization</strong> toward children who would benefit most</li>
              <li><strong>Data-driven decisions</strong> based on longitudinal pathways, not snapshots</li>
              <li><strong>Cross-system collaboration</strong> between early childhood and K-12 programs</li>
            </ul>
            <p className="mt-4 text-sm font-semibold text-purple-900">
              Early identification enables early support. Integrated data systems make the connection visible.
            </p>
          </div>
        </div>
      </Container>
    </>
  );
}
