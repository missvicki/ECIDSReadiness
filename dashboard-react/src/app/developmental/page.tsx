'use client';

import React, { useState, useEffect } from 'react';
import { loadAllData, filterData } from '@/lib/dataLoader';
import { ChildWithRisk } from '@/lib/types';
import Filters from '@/components/Filters';
import MetricCard from '@/components/MetricCard';
import BarChart from '@/components/charts/BarChart';
import Container from '@/components/layout/Container';

export default function DevelopmentalPage() {
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
  const disabilityPct = (filteredData.filter(d => d.has_disability).length / filteredData.length) * 100;
  const avgScreeningRate = (filteredData.reduce((sum, d) => sum + d.screening_completion_rate, 0) / filteredData.length) * 100;
  const avgImmunizationRate = (filteredData.reduce((sum, d) => sum + d.immunization_compliance_rate, 0) / filteredData.length) * 100;

  // 1. Screening Distribution (how many screenings children completed)
  const screeningDistribution = [
    { screenings: '0-2 Screenings', count: filteredData.filter(d => d.num_screenings_completed <= 2).length },
    { screenings: '3-4 Screenings', count: filteredData.filter(d => d.num_screenings_completed >= 3 && d.num_screenings_completed <= 4).length },
    { screenings: '5-6 Screenings', count: filteredData.filter(d => d.num_screenings_completed >= 5).length },
  ];

  // 2. Average COS Rating by Risk Tier
  const cosByTier = ['Low', 'Moderate', 'High'].map(tier => {
    const tierData = filteredData.filter(d => d.risk_tier === tier && d.avg_cos_rating !== null);
    const avgCOS = tierData.reduce((sum, d) => sum + (d.avg_cos_rating || 0), 0) / tierData.length || 0;
    return {
      tier,
      rating: avgCOS,
    };
  });

  // 3. Immunization Compliance Rate by Risk Tier
  const immunizationByTier = ['Low', 'Moderate', 'High'].map(tier => {
    const tierData = filteredData.filter(d => d.risk_tier === tier);
    return {
      tier,
      rate: (tierData.reduce((sum, d) => sum + d.immunization_compliance_rate, 0) / tierData.length) * 100 || 0,
    };
  });

  // 4. Disability Prevalence by Risk Tier
  const disabilityByTier = ['Low', 'Moderate', 'High'].map(tier => {
    const tierData = filteredData.filter(d => d.risk_tier === tier);
    return {
      tier,
      prevalence: (tierData.filter(d => d.has_disability).length / tierData.length) * 100 || 0,
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
            <strong>Developmental and health engagement signals further differentiate readiness risk</strong> —
            particularly screening completion and COS outcome ratings.
          </p>
          <div className="mt-4 bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>📖 Definition:</strong> <strong>Developmental screening</strong> = quick checks at well-child visits to see
              if a child is learning basic skills (talking, walking, playing, learning) when they should. Think of it like a
              wellness checkup for development. If delays are detected, children can get early intervention services.
              Recommended at: 6mo, 12mo, 18mo, 24mo, 36mo, and 48mo (6 total).
            </p>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <MetricCard
            label="Average Screening Completion"
            value={`${avgScreeningRate.toFixed(1)}%`}
            icon="📋"
            color="blue"
          />
          <MetricCard
            label="Average Immunization Rate"
            value={`${avgImmunizationRate.toFixed(1)}%`}
            icon="💉"
            color="green"
          />
          <MetricCard
            label="Children with Disabilities"
            value={`${disabilityPct.toFixed(1)}%`}
            icon="🧩"
            color="purple"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <BarChart
            data={screeningDistribution}
            xKey="screenings"
            yKey="count"
            yAxisLabel="Number of Children"
            title="Developmental Screening Completion Distribution"
            color="#10b981"
          />

          <BarChart
            data={cosByTier}
            xKey="tier"
            yKey="rating"
            yAxisLabel="Average COS Rating (1-7)"
            title="Child Outcome Summary (COS) Rating by Risk Tier"
            color="#3b82f6"
          />
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <BarChart
            data={immunizationByTier}
            xKey="tier"
            yKey="rate"
            yAxisLabel="Compliance Rate (%)"
            title="Immunization Compliance Rate by Risk Tier"
            color="#6366f1"
          />

          <BarChart
            data={disabilityByTier}
            xKey="tier"
            yKey="prevalence"
            yAxisLabel="Prevalence (%)"
            title="Disability Prevalence by Risk Tier"
            color="#8b5cf6"
          />
        </div>


        {/* Key Insights */}
        <div className="card mb-8">
          <h3 className="text-xl font-bold mb-4">📊 Key Insights</h3>
          <div className="space-y-4">
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-bold mb-1">Screening Completion Varies Widely</h4>
              <p className="text-gray-700 text-sm">
                {((filteredData.filter(d => d.num_screenings_completed <= 2).length / filteredData.length) * 100).toFixed(0)}%
                of children completed 2 or fewer of the 6 recommended developmental screenings (6mo, 12mo, 18mo, 24mo, 36mo, 48mo).
                Only {((filteredData.filter(d => d.num_screenings_completed >= 5).length / filteredData.length) * 100).toFixed(0)}%
                completed 5-6 screenings, suggesting systemic access barriers or awareness gaps.
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-bold mb-1">Child Outcomes Track with Risk</h4>
              <p className="text-gray-700 text-sm">
                Child Outcome Summary (COS) ratings—which measure functional skills in social-emotional, knowledge, and physical domains—show
                clear differentiation: high-risk children average {cosByTier[2].rating.toFixed(1)} vs {cosByTier[0].rating.toFixed(1)} for
                low-risk on a 1-7 scale (7 = age-appropriate functioning).
              </p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-bold mb-1">Immunization Compliance Lower for High-Risk</h4>
              <p className="text-gray-700 text-sm">
                High-risk children show {immunizationByTier[2].rate.toFixed(0)}% immunization compliance vs{' '}
                {immunizationByTier[0].rate.toFixed(0)}% for low-risk, indicating less consistent health system engagement beyond screenings.
              </p>
            </div>
            <div className="border-l-4 border-orange-500 pl-4">
              <h4 className="font-bold mb-1">Disability Prevalence Concentrated</h4>
              <p className="text-gray-700 text-sm">
                {disabilityByTier[2].prevalence.toFixed(0)}% of high-risk children have documented disabilities (IDEA Part C/619 eligibility)
                compared to {disabilityByTier[0].prevalence.toFixed(0)}% of low-risk children—showing disability services reach those with
                greatest need, though not all high-risk children qualify.
              </p>
            </div>
          </div>
        </div>

        {/* So What */}
        <div className="info-box">
          <h3 className="text-lg font-bold mb-2">💡 So What?</h3>
          <p className="text-gray-800">
            <strong>Screening completion is both a risk indicator and intervention lever.</strong> Children completing 5-6 screenings show
            lower overall risk. Yet {((filteredData.filter(d => d.num_screenings_completed < 4).length / filteredData.length) * 100).toFixed(0)}%
            miss key checkpoints. Targeted outreach—reminders, accessible locations, transportation—can improve early detection of
            developmental delays before kindergarten entry.
          </p>
        </div>
      </Container>
    </>
  );
}
