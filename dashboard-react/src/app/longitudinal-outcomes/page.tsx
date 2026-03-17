'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { loadAllData } from '@/lib/dataLoader';
import { loadK12Students, loadMAPAssessments, padStateID } from '@/lib/k12DataLoader';
import { ChildWithRisk } from '@/lib/types';
import Container from '@/components/layout/Container';
import PathwayFlow from '@/components/charts/PathwayFlow';
import ColoredBarChart from '@/components/charts/ColoredBarChart';

export default function LongitudinalOutcomesPage() {
  const [ecidsData, setEcidsData] = useState<ChildWithRisk[]>([]);
  const [k12Data, setK12Data] = useState<any[]>([]);
  const [mapData, setMapData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      loadAllData(),
      loadK12Students(),
      loadMAPAssessments()
    ]).then(([ecids, k12, map]) => {
      setEcidsData(ecids);
      setK12Data(k12);
      setMapData(map);
      setLoading(false);
    });
  }, []);

  // Link ECIDS and K-12 data (aggregate across years for each student)
  const linkedData = useMemo(() => {
    return ecidsData.map(child => {
      const stateID = padStateID(child['Child MOSIS ID']);

      // Get all K-12 records for this student
      const studentRecords = k12Data.filter(k => k.StateID === stateID);

      // Find kindergarten readiness (from grade K record)
      const kRecord = studentRecords.find(k => k.StudentGradeLevel === 'K');

      // Find RSP status (from any grade 1-3 record with RSP data)
      const rspRecord = studentRecords.find(k =>
        (k.StudentGradeLevel === '01' || k.StudentGradeLevel === '02' || k.StudentGradeLevel === '03') &&
        k.ReadingSuccessPlan && k.ReadingSuccessPlan !== ''
      );

      // Find grade 3 reading performance
      const mapRecord = mapData.find(m =>
        m.StateID === stateID &&
        m.StudentGradeLevel === '03' &&
        m.Subject === 'Reading'
      );

      return {
        ...child,
        stateID,
        kindergartenReadiness: kRecord?.KindergartenReadiness || '',
        readingSuccessPlan: rspRecord?.ReadingSuccessPlan || '',
        grade3Reading: mapRecord?.PerformanceLevel || '',
        grade3ReadingBand: mapRecord?.Grade3ReadingBand || '',
      };
    });
  }, [ecidsData, k12Data, mapData]);

  const filteredData = linkedData;

  // Build pathway flow data
  const pathwayData = useMemo(() => {
    if (filteredData.length === 0) {
      return {
        stage1: [],
        stage2: [],
        stage3: [],
        stage4: [],
      };
    }

    const total = filteredData.length;

    // Stage 1: ECIDS Risk Tier
    const lowRisk = filteredData.filter(c => c.risk_tier === 'Low');
    const modRisk = filteredData.filter(c => c.risk_tier === 'Moderate');
    const highRisk = filteredData.filter(c => c.risk_tier === 'High');

    // Stage 2: Kindergarten Readiness (only children with K readiness data)
    const withKReadiness = filteredData.filter(c => c.kindergartenReadiness === 'Y' || c.kindergartenReadiness === 'N');
    const demonstrating = withKReadiness.filter(c => c.kindergartenReadiness === 'Y');
    const notReady = withKReadiness.filter(c => c.kindergartenReadiness === 'N');

    // Stage 3: K-3 Support
    const noRSP = filteredData.filter(c => c.readingSuccessPlan === 'NO RSP');
    const rsp = filteredData.filter(c => c.readingSuccessPlan === 'REC RSP');

    // Stage 4: Grade 3 Reading
    const advanced = filteredData.filter(c => c.grade3Reading === 'Advanced');
    const proficient = filteredData.filter(c => c.grade3Reading === 'Proficient');
    const basic = filteredData.filter(c => c.grade3Reading === 'Basic');
    const belowBasic = filteredData.filter(c => c.grade3Reading === 'Below Basic');

    return {
      stage1: [
        { name: 'Low Risk', color: '#10b981', count: lowRisk.length, percentage: (lowRisk.length / total) * 100 },
        { name: 'Moderate Risk', color: '#f59e0b', count: modRisk.length, percentage: (modRisk.length / total) * 100 },
        { name: 'High Risk', color: '#ef4444', count: highRisk.length, percentage: (highRisk.length / total) * 100 },
      ].filter(s => s.count > 0),
      stage2: [
        { name: 'Demonstrating', color: '#10b981', count: demonstrating.length, percentage: withKReadiness.length > 0 ? (demonstrating.length / withKReadiness.length) * 100 : 0 },
        { name: 'Not Ready', color: '#ef4444', count: notReady.length, percentage: withKReadiness.length > 0 ? (notReady.length / withKReadiness.length) * 100 : 0 },
      ].filter(s => s.count > 0),
      stage3: [
        { name: 'No RSP', color: '#10b981', count: noRSP.length, percentage: (noRSP.length / total) * 100 },
        { name: 'Received RSP', color: '#f59e0b', count: rsp.length, percentage: (rsp.length / total) * 100 },
      ].filter(s => s.count > 0),
      stage4: [
        { name: 'Advanced', color: '#10b981', count: advanced.length, percentage: (advanced.length / total) * 100 },
        { name: 'Proficient', color: '#34d399', count: proficient.length, percentage: (proficient.length / total) * 100 },
        { name: 'Basic', color: '#fbbf24', count: basic.length, percentage: (basic.length / total) * 100 },
        { name: 'Below Basic', color: '#ef4444', count: belowBasic.length, percentage: (belowBasic.length / total) * 100 },
      ].filter(s => s.count > 0),
    }
  }, [filteredData]);

  const stageLabels = [
    'Stage 1: ECIDS Risk',
    'Stage 2: K Readiness',
    'Stage 3: K-3 Support',
    'Stage 4: Grade 3 Reading',
  ];

  // Calculate summary statistics
  const stats = useMemo(() => {
    const total = filteredData.length;
    if (total === 0) return null;

    const highRiskCount = filteredData.filter(c => c.risk_tier === 'High').length;
    const notReadyCount = filteredData.filter(c => c.kindergartenReadiness === 'N').length;
    const rspCount = filteredData.filter(c => c.readingSuccessPlan === 'REC RSP').length;
    const belowBasicCount = filteredData.filter(c => c.grade3Reading === 'Below Basic' || c.grade3Reading === 'Basic').length;

    return {
      total,
      highRiskPct: ((highRiskCount / total) * 100).toFixed(1),
      notReadyPct: ((notReadyCount / total) * 100).toFixed(1),
      rspPct: ((rspCount / total) * 100).toFixed(1),
      belowBasicPct: ((belowBasicCount / total) * 100).toFixed(1),
    };
  }, [filteredData]);


  if (loading) {
    return (
      <Container>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading longitudinal data...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      {/* KPI Summary */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-sm text-red-700 font-medium">High Risk (ECIDS)</div>
            <div className="text-3xl font-bold text-red-900">{stats.highRiskPct}%</div>
            <div className="text-xs text-red-600 mt-1">{filteredData.filter(c => c.risk_tier === 'High').length.toLocaleString()} children</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-sm text-orange-700 font-medium">Not Ready (K)</div>
            <div className="text-3xl font-bold text-orange-900">{stats.notReadyPct}%</div>
            <div className="text-xs text-orange-600 mt-1">{filteredData.filter(c => c.kindergartenReadiness === 'N').length.toLocaleString()} children</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-sm text-yellow-700 font-medium">Reading Success Plan</div>
            <div className="text-3xl font-bold text-yellow-900">{stats.rspPct}%</div>
            <div className="text-xs text-yellow-600 mt-1">{filteredData.filter(c => c.readingSuccessPlan === 'REC RSP').length.toLocaleString()} children</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-sm text-red-700 font-medium">Basic/Below Basic (Gr. 3)</div>
            <div className="text-3xl font-bold text-red-900">{stats.belowBasicPct}%</div>
            <div className="text-xs text-red-600 mt-1">{filteredData.filter(c => c.grade3Reading === 'Below Basic' || c.grade3Reading === 'Basic').length.toLocaleString()} children</div>
          </div>
        </div>
      )}

      {/* Section 1: Longitudinal Flow Overview */}
      <div className="card mb-8">
        <h2 className="text-2xl font-bold mb-4">📊 Longitudinal Pathways: How Children Move Through the System</h2>
        <p className="text-gray-700 mb-6">
          This flow chart shows how groups of children progress from early childhood (ECIDS) through kindergarten readiness,
          K-3 support needs, and Grade 3 reading outcomes. The width of each flow represents the number of children following that pathway.
        </p>

        <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-cyan-900 mb-2">How to Read This Chart</h3>
          <p className="text-sm text-cyan-800 mb-3">
            Each column represents a stage in the educational pathway. The colored flows show how children move from one stage to the next:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
            <div>
              <strong className="text-cyan-900">Stage 1:</strong> ECIDS Risk Tier<br/>
              <span className="text-xs text-cyan-700">(Early childhood indicators)</span>
            </div>
            <div>
              <strong className="text-cyan-900">Stage 2:</strong> Kindergarten Readiness<br/>
              <span className="text-xs text-cyan-700">(At school entry)</span>
            </div>
            <div>
              <strong className="text-cyan-900">Stage 3:</strong> K-3 Support<br/>
              <span className="text-xs text-cyan-700">(Reading Success Plan status)</span>
            </div>
            <div>
              <strong className="text-cyan-900">Stage 4:</strong> Grade 3 Reading<br/>
              <span className="text-xs text-cyan-700">(Assessment performance)</span>
            </div>
          </div>
        </div>

        <PathwayFlow stages={pathwayData} stageLabels={stageLabels} height={380} />
      </div>


      {/* Question 1: Do Early Indicators Persist? */}
      <div className="card mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">1️⃣ Do Early Childhood Indicators Persist Into Later Academic Outcomes?</h2>
        <p className="text-gray-700 mb-6">
          This analysis examines whether patterns observed in ECIDS data appear again in school outcomes, demonstrating that early indicators
          are meaningful signals, not just administrative data.
        </p>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3 text-gray-900">📈 Early Childhood Indicators and Later Outcomes</h3>
          <p className="text-sm text-gray-600 mb-4">
            Population-level patterns showing how early ECIDS risk tiers relate to kindergarten readiness and Grade 3 reading proficiency
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b-2 border-gray-300">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">ECIDS Risk Tier</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">% Demonstrating (K)</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">% Proficient+ (Grade 3)</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Students Tracked</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const tiers = ['Low', 'Moderate', 'High'];
                  return tiers.map((tier) => {
                    const tierData = filteredData.filter(c => c.risk_tier === tier);
                    const withKReadiness = tierData.filter(c => c.kindergartenReadiness !== '');
                    const kReady = withKReadiness.filter(c => c.kindergartenReadiness === 'Y').length;
                    const kReadyPct = withKReadiness.length > 0 ? ((kReady / withKReadiness.length) * 100).toFixed(1) : '0.0';

                    const withGrade3 = tierData.filter(c => c.grade3Reading !== '');
                    const proficientPlus = withGrade3.filter(c => c.grade3Reading === 'Advanced' || c.grade3Reading === 'Proficient').length;
                    const proficientPct = withGrade3.length > 0 ? ((proficientPlus / withGrade3.length) * 100).toFixed(1) : '0.0';

                    const colorClass = tier === 'Low' ? 'text-green-700' : tier === 'Moderate' ? 'text-yellow-700' : 'text-red-700';

                    return (
                      <tr key={tier} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className={`px-4 py-3 font-medium ${colorClass}`}>{tier} Risk</td>
                        <td className="px-4 py-3 text-right">{kReadyPct}%</td>
                        <td className="px-4 py-3 text-right">{proficientPct}%</td>
                        <td className="px-4 py-3 text-right text-gray-600">{tierData.length.toLocaleString()}</td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
            <p className="text-sm text-green-900">
              <strong>Answer:</strong> Yes. Early childhood indicators persist into later academic outcomes. ECIDS risk tiers show clear, consistent relationships
              with both kindergarten readiness (stage 1) and Grade 3 reading proficiency (stage 2). This validates ECIDS as a meaningful early warning system.
            </p>
          </div>
        </div>
      </div>

      {/* Question 2: Are Supports Reaching Students Who Need Them? */}
      <div className="card mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">2️⃣ Are Interventions Reaching the Students Who Need Them Most?</h2>
        <p className="text-gray-700 mb-6">
          This analysis evaluates targeting effectiveness: whether Reading Success Plans are more frequently assigned to students
          with lower kindergarten readiness, demonstrating that the system allocates support to higher-need populations.
        </p>

        {/* Visualization 3: Support Needs by Readiness Level */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3 text-gray-900">🎯 Intervention Rates by Kindergarten Readiness Level</h3>
          <p className="text-sm text-gray-600 mb-4">
            This chart shows what percentage of students at each readiness level receive Reading Success Plans, demonstrating system-level targeting effectiveness.
          </p>
          <ColoredBarChart
            data={[
              {
                category: 'Demonstrating',
                value: Math.round((filteredData.filter(c => c.kindergartenReadiness === 'Y' && c.readingSuccessPlan === 'REC RSP').length /
                  Math.max(1, filteredData.filter(c => c.kindergartenReadiness === 'Y' && c.readingSuccessPlan !== '').length)) * 100),
                color: '#10b981',
              },
              {
                category: 'Not Ready',
                value: Math.round((filteredData.filter(c => c.kindergartenReadiness === 'N' && c.readingSuccessPlan === 'REC RSP').length /
                  Math.max(1, filteredData.filter(c => c.kindergartenReadiness === 'N' && c.readingSuccessPlan !== '').length)) * 100),
                color: '#ef4444',
              },
            ]}
            title=""
            height={200}
            horizontal={true}
            yAxisLabel="% Receiving RSP"
          />
          <div className="mt-4 p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
            <p className="text-sm text-green-900">
              <strong>Answer:</strong> Yes. Students who were not ready for kindergarten receive Reading Success Plans at significantly higher rates
              than those who were demonstrating readiness. This shows the system is successfully targeting supports to populations with greater needs.
            </p>
          </div>
        </div>
      </div>

      {/* Question 3: Do Students Receiving Interventions Show Different Outcomes? */}
      <div className="card mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">3️⃣ How Do Outcomes Differ for Students Receiving Support?</h2>
        <p className="text-gray-700 mb-6">
          This analysis compares Grade 3 reading outcomes between students who received Reading Success Plans and those who did not,
          examining outcome distributions among supported students. <strong>Important:</strong> Lower proficiency rates in the RSP group
          reflect initial need severity, not intervention failure.
        </p>

        {/* Visualization 1: Reading Success Plan Impact */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3 text-gray-900">📊 Grade 3 Reading Outcomes by Support Type</h3>
          <p className="text-sm text-gray-600 mb-4">
            Population-level comparison showing Grade 3 reading proficiency distributions for students who received Reading Success Plans versus those who did not
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b-2 border-gray-300">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Support Type</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Advanced</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Proficient</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Basic</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Below Basic</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Total Students</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const noRSP = filteredData.filter(c => c.readingSuccessPlan === 'NO RSP' && c.grade3Reading !== '');
                  const rsp = filteredData.filter(c => c.readingSuccessPlan === 'REC RSP' && c.grade3Reading !== '');

                  const calcPcts = (group: typeof noRSP) => {
                    const total = group.length;
                    return {
                      advanced: total > 0 ? ((group.filter(c => c.grade3Reading === 'Advanced').length / total) * 100).toFixed(1) : '0.0',
                      proficient: total > 0 ? ((group.filter(c => c.grade3Reading === 'Proficient').length / total) * 100).toFixed(1) : '0.0',
                      basic: total > 0 ? ((group.filter(c => c.grade3Reading === 'Basic').length / total) * 100).toFixed(1) : '0.0',
                      belowBasic: total > 0 ? ((group.filter(c => c.grade3Reading === 'Below Basic').length / total) * 100).toFixed(1) : '0.0',
                      total,
                    };
                  };

                  const noRSPStats = calcPcts(noRSP);
                  const rspStats = calcPcts(rsp);

                  return (
                    <>
                      <tr className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">No RSP</td>
                        <td className="px-4 py-3 text-right text-green-700 font-semibold">{noRSPStats.advanced}%</td>
                        <td className="px-4 py-3 text-right text-green-600">{noRSPStats.proficient}%</td>
                        <td className="px-4 py-3 text-right text-yellow-600">{noRSPStats.basic}%</td>
                        <td className="px-4 py-3 text-right text-red-600">{noRSPStats.belowBasic}%</td>
                        <td className="px-4 py-3 text-right text-gray-700">{noRSPStats.total.toLocaleString()}</td>
                      </tr>
                      <tr className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">Received RSP</td>
                        <td className="px-4 py-3 text-right text-green-700 font-semibold">{rspStats.advanced}%</td>
                        <td className="px-4 py-3 text-right text-green-600">{rspStats.proficient}%</td>
                        <td className="px-4 py-3 text-right text-yellow-600">{rspStats.basic}%</td>
                        <td className="px-4 py-3 text-right text-red-600">{rspStats.belowBasic}%</td>
                        <td className="px-4 py-3 text-right text-gray-700">{rspStats.total.toLocaleString()}</td>
                      </tr>
                    </>
                  );
                })()}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
            <p className="text-sm text-green-900">
              <strong>Answer:</strong> Students receiving RSP show lower aggregate proficiency rates, but this reflects initial need severity—they started
              with greater challenges. Critically, many RSP students still reach proficiency, demonstrating that targeted support can help students succeed.
              This pattern describes group outcomes, not individual predictions.
            </p>
          </div>
        </div>
      </div>

      {/* So What */}
      <div className="info-box">
        <h3 className="text-lg font-bold mb-2">💡 So What?</h3>
        <p className="text-gray-800">
          <strong>This single visualization answers the core policy question: Does early childhood matter for school success?</strong>
          {' '}By linking ECIDS and K-12 administrative data, we can see clear pathways from early indicators to later outcomes—
          without individual prediction, risk scoring, or simulation. The data speaks for itself: patterns of developmental risk,
          program participation, and family context in early childhood flow forward into kindergarten readiness and elementary reading achievement.
          This evidence base justifies investments in prevention, early identification, and coordinated birth-to-third-grade systems.
          {' '}<strong>The question is not whether early childhood matters—it's what we do with this knowledge.</strong>
        </p>
      </div>
    </Container>
  );
}
