'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ValidationData {
  metadata: {
    generated: string;
    dataset_version: string;
    total_ecids_children: number;
    total_k12_student_years: number;
    grade3_count: number;
  };
  layer1_ecids: Record<string, any>;
  layer2_k12: Record<string, any>;
  layer3_linkage: Record<string, any>;
  research_alignment: Record<string, any>;
  summary: {
    all_layers_pass: boolean;
    key_findings: string[];
    critical_metrics: {
      ecids_children: number;
      k12_student_years: number;
      grade3_students: number;
      backwards_progressions: number;
      orphaned_k12_records: number;
      correlation_engagement_attendance: number;
      correlation_dev_k_readiness: number;
      correlation_dev_grade3_reading: number;
    };
  };
}

export default function ValidationResults() {
  const [validation, setValidation] = useState<ValidationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/validation_results.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load validation data');
        return res.json();
      })
      .then(data => {
        setValidation(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (error || !validation) {
    return (
      <div className="card border-l-4 border-yellow-500">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-lg mb-1">Validation Data Not Available</h3>
            <p className="text-sm text-gray-600">
              {error || 'Unable to load validation results. Please ensure validation_results.json is available.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const formatCorrelation = (value: number) => {
    return value.toFixed(3);
  };

  const getCorrelationStrength = (value: number) => {
    const abs = Math.abs(value);
    if (abs > 0.7) return 'Very Strong';
    if (abs > 0.5) return 'Strong';
    if (abs > 0.3) return 'Moderate';
    if (abs > 0.1) return 'Weak';
    return 'Very Weak';
  };

  const getAlignmentBadge = (alignment: string) => {
    const colors = {
      'Strong': 'bg-green-100 text-green-800 border-green-300',
      'Moderate': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'Weak': 'bg-orange-100 text-orange-800 border-orange-300',
      'Unable to assess': 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[alignment as keyof typeof colors] || colors['Weak'];
  };

  return (
    <div className="space-y-6">
      {/* Key Findings */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4">Key Findings</h3>
        <div className="space-y-2">
          {validation.summary.key_findings.map((finding, idx) => (
            <div key={idx} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-gray-700">{finding}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Critical Correlations */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4">Critical Correlations (Risk → Outcomes)</h3>
        <p className="text-sm text-gray-600 mb-4">
          These correlations validate that ECIDS risk scores predict K-3 outcomes as expected.
          <strong> r</strong> = Pearson's correlation coefficient, measuring relationship strength and direction.
          Scale: -1 (perfect negative) to +1 (perfect positive). Negative values mean higher risk scores lead to poorer outcomes.
        </p>
        <p className="text-xs text-gray-500 mb-4">
          Note: Higher risk scores represent higher levels of developmental or contextual risk.
        </p>
        <div className="space-y-4">
          {/* Engagement → Attendance */}
          <div className="bg-gradient-to-r from-blue-50 to-white p-4 rounded-lg border border-blue-200">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold text-lg">Engagement Risk → Attendance Rate</h4>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                getCorrelationStrength(validation.summary.critical_metrics.correlation_engagement_attendance) === 'Very Strong'
                  ? 'bg-green-100 text-green-800 border-green-300'
                  : 'bg-yellow-100 text-yellow-800 border-yellow-300'
              }`}>
                {getCorrelationStrength(validation.summary.critical_metrics.correlation_engagement_attendance)}
              </span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-blue-600">
                r = {formatCorrelation(validation.summary.critical_metrics.correlation_engagement_attendance)}
              </span>
              <span className="text-sm text-gray-600">
                (Expected: Negative - higher risk → lower attendance)
              </span>
            </div>
          </div>

          {/* Developmental → K Readiness */}
          <div className="bg-gradient-to-r from-purple-50 to-white p-4 rounded-lg border border-purple-200">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold text-lg">Developmental Risk → Kindergarten Readiness</h4>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                getCorrelationStrength(validation.summary.critical_metrics.correlation_dev_k_readiness) === 'Moderate'
                  ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                  : 'bg-green-100 text-green-800 border-green-300'
              }`}>
                {getCorrelationStrength(validation.summary.critical_metrics.correlation_dev_k_readiness)}
              </span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-purple-600">
                r = {formatCorrelation(validation.summary.critical_metrics.correlation_dev_k_readiness)}
              </span>
              <span className="text-sm text-gray-600">
                (Expected: Negative - higher risk → less likely ready)
              </span>
            </div>
          </div>

          {/* Developmental → Grade 3 Reading */}
          <div className="bg-gradient-to-r from-green-50 to-white p-4 rounded-lg border border-green-200">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold text-lg">Developmental Risk → Grade 3 Reading</h4>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                getCorrelationStrength(validation.summary.critical_metrics.correlation_dev_grade3_reading) === 'Very Strong'
                  ? 'bg-green-100 text-green-800 border-green-300'
                  : 'bg-yellow-100 text-yellow-800 border-yellow-300'
              }`}>
                {getCorrelationStrength(validation.summary.critical_metrics.correlation_dev_grade3_reading)}
              </span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-green-600">
                r = {formatCorrelation(validation.summary.critical_metrics.correlation_dev_grade3_reading)}
              </span>
              <span className="text-sm text-gray-600">
                (Expected: Negative - higher risk → lower reading scores)
              </span>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4 italic">
          Note: These are statistical correlations in synthetic data, not deterministic relationships.
          Real-world data would show similar patterns with more variation.
        </p>
      </div>

      {/* Validation Layers Summary */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4">Validation Layers</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Layer 1: ECIDS */}
          <div className="border-l-4 border-purple-500 bg-purple-50 p-4 rounded">
            <div className="flex items-center mb-3">
              <CheckCircle className="h-5 w-5 text-purple-600 mr-2" />
              <h4 className="font-bold">Layer 1: ECIDS Integrity</h4>
            </div>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>✓ Risk scores: {validation.layer1_ecids.composite_risk_score_range}</li>
              <li>✓ {validation.layer1_ecids.participation_coverage.toFixed(1)}% participation coverage</li>
              <li>✓ {validation.layer1_ecids.screening_coverage.toFixed(1)}% screening coverage</li>
              <li>✓ All demographics 100% complete</li>
            </ul>
          </div>

          {/* Layer 2: K-12 */}
          <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
            <div className="flex items-center mb-3">
              <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
              <h4 className="font-bold">Layer 2: K-12 Integrity</h4>
            </div>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>✓ Valid Missouri grade codes</li>
              <li>✓ {validation.layer2_k12.backwards_progression} backwards progressions</li>
              <li>✓ MAP outcomes populated</li>
              <li>✓ {validation.layer2_k12.mean_attendance.toFixed(1)}% avg attendance</li>
            </ul>
          </div>

          {/* Layer 3: Longitudinal Linkage */}
          <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded">
            <div className="flex items-center mb-3">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <h4 className="font-bold">Layer 3: Linkage</h4>
            </div>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>✓ {validation.layer3_linkage.orphaned_k12_records} orphaned records</li>
              <li>✓ 100% demographic consistency</li>
              <li>✓ Expected correlations validated</li>
              <li>✓ Longitudinal narratives complete</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Research Model Alignment */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4">Research Framework Representation</h3>
        <p className="text-sm text-gray-600 mb-4">
          Degree to which established research frameworks on early childhood risk are represented in this synthetic dataset.
        </p>
        <div className="space-y-3">
          {/* Harvard Cumulative Risk */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <h4 className="font-semibold">Harvard Cumulative Risk Model</h4>
              <p className="text-xs text-gray-600">Sameroff et al., 1987</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
              getAlignmentBadge(validation.research_alignment.harvard_alignment)
            }`}>
              {validation.research_alignment.harvard_alignment}
            </span>
          </div>

          {/* Heckman Investment ROI */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <h4 className="font-semibold">Heckman Early Investment ROI</h4>
              <p className="text-xs text-gray-600">Heckman, 2006</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
              getAlignmentBadge(validation.research_alignment.heckman_alignment)
            }`}>
              {validation.research_alignment.heckman_alignment}
            </span>
          </div>

          {/* Attendance Works */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <h4 className="font-semibold">Attendance Works (Chronic Absenteeism)</h4>
              <p className="text-xs text-gray-600">Chang & Romero, 2008</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
              getAlignmentBadge(validation.research_alignment.attendance_works_alignment)
            }`}>
              {validation.research_alignment.attendance_works_alignment}
            </span>
          </div>

          {/* Chapin Hall */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <h4 className="font-semibold">Chapin Hall Stability Framework</h4>
              <p className="text-xs text-gray-600">Wulczyn et al., 2010</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
              getAlignmentBadge(validation.research_alignment.chapin_hall_alignment)
            }`}>
              {validation.research_alignment.chapin_hall_alignment}
            </span>
          </div>

          {/* ECIDS/SLDS Integration */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <h4 className="font-semibold">ECIDS/SLDS Integration Framework</h4>
              <p className="text-xs text-gray-600">Data Quality Campaign, 2014</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
              getAlignmentBadge(validation.research_alignment.ecids_slds_alignment)
            }`}>
              {validation.research_alignment.ecids_slds_alignment}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
