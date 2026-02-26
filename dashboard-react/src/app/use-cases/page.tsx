'use client';

import Container from '@/components/layout/Container';

export default function UseCasesPage() {
  return (
    <Container>
      <div className="max-w-4xl mx-auto">
        {/* Main Use Case */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-4 text-purple-700">Use Case: Readiness Risk Index for Early Support</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            This dashboard operationalizes kindergarten readiness as a <strong>longitudinal stability + engagement + developmental risk signal</strong>,
            rather than a single point-in-time assessment. It helps programs identify children who may benefit from early support prior to kindergarten entry,
            and track whether risk decreases as supports are provided.
          </p>
        </div>

        {/* Primary Users */}
        <div className="card mb-8">
          <h3 className="text-xl font-bold mb-4 text-gray-800">👥 Primary Users</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span className="text-gray-700"><strong>Program and agency leaders</strong> (planning and resource allocation)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span className="text-gray-700"><strong>Early childhood coordinators and case managers</strong> (targeted outreach)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span className="text-gray-700"><strong>Cross-agency partners</strong> (service alignment)</span>
            </li>
          </ul>
        </div>

        {/* Decisions Supported */}
        <div className="card mb-8">
          <h3 className="text-xl font-bold mb-4 text-gray-800">🎯 Decisions Supported</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">→</span>
              <span className="text-gray-700">Which children are highest priority for support right now?</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">→</span>
              <span className="text-gray-700">What is driving risk (stability, engagement, developmental, context)?</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">→</span>
              <span className="text-gray-700">Where are risk concentrations by geography/program?</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">→</span>
              <span className="text-gray-700">Is risk improving over time?</span>
            </li>
          </ul>
        </div>

        {/* What It Produces */}
        <div className="card mb-8">
          <h3 className="text-xl font-bold mb-4 text-gray-800">📊 What It Produces</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold">✓</span>
              <span className="text-gray-700">Composite readiness risk score + tier (Low / Moderate / High)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold">✓</span>
              <span className="text-gray-700">Domain subscores (Stability, Engagement, Developmental, Context)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold">✓</span>
              <span className="text-gray-700">Key risk drivers (e.g., participation gaps, low attendance, missed screenings)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold">✓</span>
              <span className="text-gray-700">Cohort-level insights for planning and reporting</span>
            </li>
          </ul>
        </div>

        {/* Example Scenarios */}
        <div className="card mb-8">
          <h3 className="text-xl font-bold mb-4 text-gray-800">💡 Example Scenarios</h3>
          <div className="space-y-4">
            <div className="border-l-4 border-purple-500 pl-4 py-2">
              <p className="text-gray-700">
                <strong>Scenario 1:</strong> Target screening outreach in counties with high missed screening rates among high-risk children
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <p className="text-gray-700">
                <strong>Scenario 2:</strong> Prioritize continuity supports for children with repeated enrollment gaps
              </p>
            </div>
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="text-gray-700">
                <strong>Scenario 3:</strong> Track risk reduction after interventions over time
              </p>
            </div>
          </div>
        </div>

        {/* Guardrails */}
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-4 text-yellow-900">⚠️ Guardrails</h3>
          <ul className="space-y-3 text-yellow-900">
            <li className="flex items-start gap-3">
              <span className="font-bold">•</span>
              <span>PoC uses <strong>synthetic data</strong> (no real child PII)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold">•</span>
              <span>The index <strong>supports decision-making</strong>; it does not replace professional judgment</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold">•</span>
              <span>Predictive validation <strong>strengthens when linked to real K–12 outcomes</strong></span>
            </li>
          </ul>
        </div>
      </div>
    </Container>
  );
}
