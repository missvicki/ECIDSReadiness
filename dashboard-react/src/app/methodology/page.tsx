'use client';

import Container from '@/components/layout/Container';
import ValidationResults from '@/components/ValidationResults';

export default function MethodologyPage() {
  return (
    <Container>
      <div className="max-w-4xl mx-auto">

        {/* Overview */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">Overview</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The ECIDS Readiness Risk Index demonstrates how longitudinal early childhood data can predict
            K-12 outcomes using <strong>5,000 synthetic children</strong> tracked from birth through Grade 3.
          </p>
          <p className="text-gray-700 leading-relaxed">
            The dataset combines <strong>9 ECIDS flat files</strong> (early childhood) with <strong>6 K-12 files</strong> (elementary school)
            to create complete longitudinal pathways showing how early risk indicators correlate with kindergarten readiness
            and Grade 3 reading outcomes.
          </p>
        </div>

        {/* Dataset Summary */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">Dataset Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="text-3xl font-bold text-purple-600">5,000</div>
              <div className="text-sm text-gray-600">Children</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-3xl font-bold text-blue-600">12,708</div>
              <div className="text-sm text-gray-600">K-12 Student-Years</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-3xl font-bold text-green-600">1,223</div>
              <div className="text-sm text-gray-600">Grade 3 Students</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="text-3xl font-bold text-yellow-600">15</div>
              <div className="text-sm text-gray-600">Data Files</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-bold mb-2">ECIDS Early Childhood (9 Files)</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Child demographics & family context</li>
                <li>• Program participation & attendance</li>
                <li>• Developmental screenings & outcomes</li>
                <li>• Disability, immunization, insurance</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-2">K-12 Elementary (6 Files)</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Student enrollment & attendance</li>
                <li>• Kindergarten readiness status</li>
                <li>• MAP Reading/Math assessments</li>
                <li>• Reading Success Plan (RSP) interventions</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Risk Scoring Model - Condensed */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">Risk Scoring Model</h2>
          <p className="text-gray-700 mb-4">
            Composite risk score combines 4 weighted domains with specific trigger thresholds.
            Each indicator has a clearly defined point to ensure transparency.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="border-l-4 border-purple-500 bg-purple-50 p-4 rounded">
              <h3 className="font-bold mb-2">Stability (30%)</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Enrollment gaps &gt;30 days</li>
                <li>• Chronic gaps &gt;6 months</li>
                <li>• Low total attendance (&lt;100 days)</li>
              </ul>
            </div>
            <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
              <h3 className="font-bold mb-2">Engagement (25%)</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Missed developmental screenings</li>
                <li>• Immunization gaps</li>
                <li>• Low attendance rate</li>
              </ul>
            </div>
            <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded">
              <h3 className="font-bold mb-2">Developmental (25%)</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• IDEA Part C/619 eligibility</li>
                <li>• Low COS ratings (&lt;4.0)</li>
                <li>• Missing outcome data</li>
              </ul>
            </div>
            <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded">
              <h3 className="font-bold mb-2">Context (20%)</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Deep poverty (&lt;100% FPL)</li>
                <li>• Homelessness or foster care</li>
                <li>• Household stressors</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-bold mb-2">Support Band Assignment</h3>
            <p className="text-sm text-gray-600 mb-3">
              Support bands focus on what the child needs, rather than labeling risk. Calculated from composite scores but presented in action-oriented categories.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="text-center p-3 bg-green-50 rounded border border-green-200">
                <div className="font-semibold text-green-700">On Track</div>
                <div className="text-xs text-gray-600 mt-1">0-24 points</div>
                <div className="text-xs text-gray-500 mt-1">Typical progress</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded border border-blue-200">
                <div className="font-semibold text-blue-700">Monitor</div>
                <div className="text-xs text-gray-600 mt-1">25-35 points</div>
                <div className="text-xs text-gray-500 mt-1">Some signals to watch</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded border border-yellow-200">
                <div className="font-semibold text-yellow-700">Targeted Support</div>
                <div className="text-xs text-gray-600 mt-1">36-50 points</div>
                <div className="text-xs text-gray-500 mt-1">Additional help may benefit</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded border border-orange-200">
                <div className="font-semibold text-orange-700">Intensive Support</div>
                <div className="text-xs text-gray-600 mt-1">50+ points</div>
                <div className="text-xs text-gray-500 mt-1">Multiple indicators present</div>
              </div>
            </div>
          </div>
        </div>

        {/* Longitudinal Validation */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">ECIDS → K-3 Longitudinal Validation</h2>
          <ValidationResults />
        </div>

        {/* Generation Approach - Condensed */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">Data Generation Approach</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Realistic Correlations</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Higher developmental risk → lower K readiness</li>
                <li>• Lower engagement → worse attendance</li>
                <li>• ECIDS risk → Grade 3 reading outcomes</li>
                <li>• Parent education as contextual variable</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Data Integrity</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Unique identifiers (DCN, MOSIS ID)</li>
                <li>• 100% referential integrity</li>
                <li>• No orphaned K-12 records</li>
                <li>• Valid Missouri grade codes (PK, K, 01-03)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Ethical Design */}
        <div className="card mb-6">
          <h3 className="font-bold text-lg mb-2">Ethical Design Considerations</h3>
          <div>
            <h4 className="font-semibold mb-1">Support-Focused Language</h4>
            <p className="text-sm mb-2">
              The system uses <strong>Support Bands</strong> (On Track, Monitor, Targeted Support, Intensive Support)
              rather than displaying raw risk scores to avoid stigmatization and deterministic labeling of children.
            </p>
          </div>
        </div>

        {/* Important Note - Synthetic Data */}
        <div className="warning-box">
          <h3 className="font-bold text-lg mb-3">⚠️ Important Note</h3>
          <p className="text-sm font-semibold mb-3">
            This is synthetic data generated for proof-of-concept and demonstration purposes.
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>All correlations are programmed based on research literature, not observed from real students</li>
            <li>Relationships are probabilistic, not deterministic (variation exists at all risk levels)</li>
            <li>Dataset designed to illustrate how ECIDS data can predict K-12 outcomes in a longitudinal system</li>
            <li>Validation confirms data integrity and expected statistical patterns are present</li>
          </ul>
        </div>
      </div>
    </Container>
  );
}
