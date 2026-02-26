'use client';

import Container from '@/components/layout/Container';

export default function MethodologyPage() {
  return (
    <Container>
      <div className="max-w-4xl mx-auto">

        {/* Overview */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">Overview</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The ECIDS Readiness Risk Index uses <strong>5,000 synthetic children records</strong> across
            <strong> 9 flat file data sources</strong> to demonstrate how longitudinal early childhood signals can be
            combined into a composite readiness risk measure.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Data generation prioritized <strong>realistic correlations</strong> between risk factors to simulate
            real-world patterns while maintaining complete referential integrity across all data sources.
          </p>
        </div>

        {/* Data Sources */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">Data Sources (9 Flat Files)</h2>
          <div className="space-y-3">
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-bold text-lg">1. Child.csv</h3>
              <p className="text-gray-600">Demographics, household characteristics, poverty status, family stressors</p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-bold text-lg">2. RelatedPerson.csv</h3>
              <p className="text-gray-600">Parent/guardian information, relationships, contact details</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-bold text-lg">3. ChildParticipation.csv</h3>
              <p className="text-gray-600">Program enrollment history, attendance, service dates</p>
            </div>
            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="font-bold text-lg">4. ChildDisability.csv</h3>
              <p className="text-gray-600">Disability status, IDEA eligibility, special education services</p>
            </div>
            <div className="border-l-4 border-red-500 pl-4">
              <h3 className="font-bold text-lg">5. ChildScreening.csv</h3>
              <p className="text-gray-600">Developmental screenings (6mo, 12mo, 18mo, 24mo, 36mo, 48mo)</p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-bold text-lg">6. ChildImmunization.csv</h3>
              <p className="text-gray-600">Immunization records, compliance tracking</p>
            </div>
            <div className="border-l-4 border-pink-500 pl-4">
              <h3 className="font-bold text-lg">7. ChildOutcomes.csv</h3>
              <p className="text-gray-600">Child Outcome Summary (COS) ratings for developmental progress</p>
            </div>
            <div className="border-l-4 border-indigo-500 pl-4">
              <h3 className="font-bold text-lg">8. ChildInsurance.csv</h3>
              <p className="text-gray-600">Health insurance coverage, type, dates</p>
            </div>
            <div className="border-l-4 border-gray-500 pl-4">
              <h3 className="font-bold text-lg">9. ChildMonitoring.csv</h3>
              <p className="text-gray-600">Ongoing monitoring, service coordination</p>
            </div>
          </div>
        </div>

        {/* Generation Approach */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">Generation Approach</h2>

          <h3 className="text-xl font-semibold mb-3 mt-4">Identifiers</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
            <li><strong>Child DCN:</strong> 10-digit unique identifier (0000000001 - 0000005000)</li>
            <li><strong>MOSIS ID:</strong> 6-digit unique identifier (000001 - 005000)</li>
            <li><strong>District ID:</strong> 6-digit code based on county (e.g., 048230 = county 048, district 230)</li>
            <li><strong>Referential Integrity:</strong> All IDs consistent across all 9 files</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-4">Realistic Correlations</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
            <li><strong>Language:</strong> Correlated with Hispanic ethnicity, migrant status, race/country of origin</li>
            <li><strong>Poverty:</strong> Influences enrollment gaps, attendance, screening compliance</li>
            <li><strong>Risk Clustering:</strong> High-risk children show correlated indicators (gaps + low attendance + missed screenings)</li>
            <li><strong>Geographic Distribution:</strong> 115 Missouri counties with realistic district assignment</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-4">Tools Used</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Faker Library:</strong> Realistic names, addresses, demographics</li>
            <li><strong>Pandas:</strong> Data manipulation and CSV generation</li>
            <li><strong>NumPy:</strong> Statistical distributions and correlations</li>
          </ul>
        </div>

        {/* Risk Scoring Model */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">Risk Scoring Model</h2>
          <p className="text-gray-700 mb-4">
            The composite risk score combines <strong>4 weighted domains</strong>:
          </p>

          <div className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-2">1. Stability (30% weight)</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>Number of enrollment gaps (15 points per gap)</li>
                <li>Gaps longer than 6 months (25 points)</li>
                <li>Multiple participation episodes (&gt;3 enrollments, 15 points)</li>
                <li>Low total attendance days (&lt;100 days, 20 points)</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-2">2. Engagement (25% weight)</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>Screening completion rate (35 points for missed screenings)</li>
                <li>Immunization compliance rate (25 points for gaps)</li>
                <li>Average attendance days (&lt;80 days, 40 points)</li>
              </ul>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-2">3. Developmental (25% weight)</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>Disability status (40 points)</li>
                <li>Low COS outcome ratings (&lt;4.0, 35 points)</li>
                <li>Missing outcome data (25 points)</li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-2">4. Family Context (20% weight)</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>Deep poverty (&lt;100% FPL, 25 points)</li>
                <li>Homelessness (25 points)</li>
                <li>Foster care placement (20 points)</li>
                <li>Child abuse/neglect (15 points)</li>
                <li>Each household stressor (5 points)</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-bold mb-2">Risk Tier Assignment</h3>
            <ul className="space-y-1 text-gray-700">
              <li><span className="font-semibold text-green-600">Low Risk:</span> 0-30 points (~40% of children)</li>
              <li><span className="font-semibold text-yellow-600">Moderate Risk:</span> 30-60 points (~40% of children)</li>
              <li><span className="font-semibold text-red-600">High Risk:</span> 60-100 points (~20% of children)</li>
            </ul>
          </div>
        </div>

        {/* Validation */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">Data Validation</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>✅ All 5,000 children have unique DCN and MOSIS IDs</li>
            <li>✅ Referential integrity maintained across all 9 files</li>
            <li>✅ Not all children have disabilities (~20%)</li>
            <li>✅ Some children skipped immunizations (~15%)</li>
            <li>✅ Some children have no insurance coverage (~8%)</li>
            <li>✅ Risk distribution matches target (40% Low, 40% Moderate, 20% High)</li>
            <li>✅ Realistic correlation between poverty and risk indicators</li>
          </ul>
        </div>

        {/* Limitations */}
        <div className="warning-box">
          <h3 className="font-bold text-lg mb-2">⚠️ Limitations</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Synthetic data does not capture real-world complexity</li>
            <li>Correlations are simplified approximations</li>
            <li>Temporal patterns are simulated, not actual longitudinal data</li>
            <li>Missing real contextual factors (program quality, staff training, etc.)</li>
          </ul>
        </div>
      </div>
    </Container>
  );
}
