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
            Each risk indicator has a <strong>clearly defined trigger point</strong> to ensure the model is transparent and defensible.
            The composite risk score combines 4 weighted domains with specific thresholds:
          </p>

          {/* Detailed Indicator Table */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Domain</th>
                  <th className="px-4 py-3 text-left font-semibold">Indicator</th>
                  <th className="px-4 py-3 text-left font-semibold">Trigger Threshold</th>
                  <th className="px-4 py-3 text-left font-semibold">Points</th>
                </tr>
              </thead>
              <tbody>
                {/* Stability Domain */}
                <tr className="border-t border-gray-200 bg-purple-50">
                  <td className="px-4 py-3 font-bold" rowSpan={4}>Stability (30%)</td>
                  <td className="px-4 py-3">Enrollment gaps</td>
                  <td className="px-4 py-3">&gt;30 days between enrollments</td>
                  <td className="px-4 py-3">15 per gap</td>
                </tr>
                <tr className="border-t border-gray-200 bg-purple-50">
                  <td className="px-4 py-3">Chronic gap</td>
                  <td className="px-4 py-3">&gt;180 days (6 months)</td>
                  <td className="px-4 py-3">25</td>
                </tr>
                <tr className="border-t border-gray-200 bg-purple-50">
                  <td className="px-4 py-3">Enrollment instability</td>
                  <td className="px-4 py-3">≥4 participation episodes</td>
                  <td className="px-4 py-3">15</td>
                </tr>
                <tr className="border-t border-gray-200 bg-purple-50">
                  <td className="px-4 py-3">Low total attendance</td>
                  <td className="px-4 py-3">&lt;100 days cumulative</td>
                  <td className="px-4 py-3">20</td>
                </tr>

                {/* Engagement Domain */}
                <tr className="border-t border-gray-200 bg-blue-50">
                  <td className="px-4 py-3 font-bold" rowSpan={3}>Engagement (25%)</td>
                  <td className="px-4 py-3">Missed screenings</td>
                  <td className="px-4 py-3">&lt;67% completion (4 of 6 expected)</td>
                  <td className="px-4 py-3">35</td>
                </tr>
                <tr className="border-t border-gray-200 bg-blue-50">
                  <td className="px-4 py-3">Immunization gaps</td>
                  <td className="px-4 py-3">&lt;83% compliance (10 of 12 expected)</td>
                  <td className="px-4 py-3">25</td>
                </tr>
                <tr className="border-t border-gray-200 bg-blue-50">
                  <td className="px-4 py-3">Low attendance rate</td>
                  <td className="px-4 py-3">&lt;80 days per year</td>
                  <td className="px-4 py-3">40</td>
                </tr>

                {/* Developmental Domain */}
                <tr className="border-t border-gray-200 bg-green-50">
                  <td className="px-4 py-3 font-bold" rowSpan={3}>Developmental (25%)</td>
                  <td className="px-4 py-3">Disability status</td>
                  <td className="px-4 py-3">IDEA Part C/619 eligibility</td>
                  <td className="px-4 py-3">40</td>
                </tr>
                <tr className="border-t border-gray-200 bg-green-50">
                  <td className="px-4 py-3">Low COS ratings</td>
                  <td className="px-4 py-3">&lt;4.0 on 1-7 scale</td>
                  <td className="px-4 py-3">35</td>
                </tr>
                <tr className="border-t border-gray-200 bg-green-50">
                  <td className="px-4 py-3">Missing outcome data</td>
                  <td className="px-4 py-3">No COS assessment on file</td>
                  <td className="px-4 py-3">25</td>
                </tr>

                {/* Context Domain */}
                <tr className="border-t border-gray-200 bg-yellow-50">
                  <td className="px-4 py-3 font-bold" rowSpan={5}>Family Context (20%)</td>
                  <td className="px-4 py-3">Deep poverty</td>
                  <td className="px-4 py-3">&lt;100% Federal Poverty Level</td>
                  <td className="px-4 py-3">25</td>
                </tr>
                <tr className="border-t border-gray-200 bg-yellow-50">
                  <td className="px-4 py-3">Homelessness</td>
                  <td className="px-4 py-3">Any documented homeless status</td>
                  <td className="px-4 py-3">25</td>
                </tr>
                <tr className="border-t border-gray-200 bg-yellow-50">
                  <td className="px-4 py-3">Foster care</td>
                  <td className="px-4 py-3">Active foster care placement</td>
                  <td className="px-4 py-3">20</td>
                </tr>
                <tr className="border-t border-gray-200 bg-yellow-50">
                  <td className="px-4 py-3">Child abuse/neglect</td>
                  <td className="px-4 py-3">Any documented case</td>
                  <td className="px-4 py-3">15</td>
                </tr>
                <tr className="border-t border-gray-200 bg-yellow-50">
                  <td className="px-4 py-3">Household stressors</td>
                  <td className="px-4 py-3">Per stressor (incarceration, substance abuse, etc.)</td>
                  <td className="px-4 py-3">5 each</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Composite Score Calculation */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="font-bold mb-2">Composite Score Calculation</h3>
            <p className="font-mono text-sm mb-3">
              <strong>Composite Score =</strong> (Stability × 0.30) + (Engagement × 0.25) + (Developmental × 0.25) + (Context × 0.20)
            </p>
            <h3 className="font-bold mb-2 mt-4">Risk Tier Assignment</h3>
            <ul className="space-y-1 text-gray-700">
              <li><span className="font-semibold text-green-600">Low Risk:</span> 0-24 points (55.1% of children, n=2,756)</li>
              <li><span className="font-semibold text-yellow-600">Moderate Risk:</span> 24-35 points (25.2% of children, n=1,260)</li>
              <li><span className="font-semibold text-red-600">High Risk:</span> 35-100 points (19.7% of children, n=984)</li>
            </ul>
            <p className="text-sm text-gray-600 mt-3">
              <strong>Note:</strong> Thresholds were calibrated to match the actual composite score distribution, ensuring approximately
              20% of children are flagged as high-risk for targeted intervention while maintaining meaningful differentiation across tiers.
            </p>
          </div>
        </div>

        {/* How Risk Compounds */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">How Risk Compounds</h2>
          <p className="text-gray-700 mb-4">
            Risk is multidimensional. A child may not be extreme in any single indicator, but moderate challenges across
            multiple domains (attendance, enrollment stability, screenings, family context) compound to elevate overall vulnerability.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <h3 className="font-bold mb-2 text-green-900">Low Risk Example</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>✓ Continuous enrollment (no gaps)</li>
                <li>✓ Consistent attendance (120+ days/yr)</li>
                <li>✓ All 6 screenings completed</li>
                <li>✗ Single risk factor (poverty)</li>
              </ul>
              <p className="text-sm mt-3 font-semibold text-green-700">Risk Score: 18 (Low)</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
              <h3 className="font-bold mb-2 text-yellow-900">Moderate Risk Example</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>✗ 1 enrollment gap (45 days)</li>
                <li>✗ Inconsistent attendance (75 days/yr)</li>
                <li>✗ Missed 2 developmental screenings</li>
                <li>✓ No household stressors</li>
              </ul>
              <p className="text-sm mt-3 font-semibold text-yellow-700">Risk Score: 29 (Moderate)</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
              <h3 className="font-bold mb-2 text-red-900">High Risk Example</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>✗ Multiple enrollment gaps (200+ days)</li>
                <li>✗ Low attendance (&lt;60 days/yr)</li>
                <li>✗ Missed 4+ screenings</li>
                <li>✗ Deep poverty + homelessness</li>
              </ul>
              <p className="text-sm mt-3 font-semibold text-red-700">Risk Score: 62 (High)</p>
            </div>
          </div>
        </div>

        {/* Simulated Child Archetypes */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">Simulated Child Archetypes</h2>
          <p className="text-gray-700 mb-4">
            The synthetic dataset intentionally includes diverse risk profiles to demonstrate the model's discrimination capability:
          </p>
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <h3 className="font-bold text-lg mb-2">1. Stable Child (~55%)</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Continuous enrollment (no gaps &gt;30 days)</li>
                <li>• High attendance (100+ days/year)</li>
                <li>• All 6 developmental screenings completed</li>
                <li>• No disability, normal COS ratings</li>
                <li>• Above poverty line, no household stressors</li>
              </ul>
              <p className="text-xs mt-2 text-green-700"><strong>Typical Risk Score:</strong> 5-20 (Low)</p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
              <h3 className="font-bold text-lg mb-2">2. Moderate Risk Child (~25%)</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• 1-2 enrollment gaps (30-90 days each)</li>
                <li>• Moderate attendance (70-90 days/year)</li>
                <li>• Missed 1-2 screenings</li>
                <li>• May have 1 household stressor (e.g., poverty)</li>
                <li>• No major developmental concerns</li>
              </ul>
              <p className="text-xs mt-2 text-yellow-700"><strong>Typical Risk Score:</strong> 24-35 (Moderate)</p>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
              <h3 className="font-bold text-lg mb-2">3. High Mobility Child (~5%)</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• 4+ participation episodes (frequent provider switching)</li>
                <li>• Multiple enrollment gaps</li>
                <li>• Inconsistent attendance across episodes</li>
                <li>• Screening completion impacted by mobility</li>
                <li>• May have housing instability or family stress</li>
              </ul>
              <p className="text-xs mt-2 text-orange-700"><strong>Typical Risk Score:</strong> 35-50 (High)</p>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
              <h3 className="font-bold text-lg mb-2">4. Attendance-Driven Risk Child (~8%)</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Enrolled but very low attendance (&lt;60 days/year)</li>
                <li>• May have gaps between sparse attendance periods</li>
                <li>• Missed multiple screenings due to low engagement</li>
                <li>• Often correlated with transportation barriers or family chaos</li>
              </ul>
              <p className="text-xs mt-2 text-red-700"><strong>Typical Risk Score:</strong> 40-55 (High)</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
              <h3 className="font-bold text-lg mb-2">5. Developmental Risk Child (~7%)</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• IDEA Part C/619 eligible (disability documented)</li>
                <li>• Low COS ratings (&lt;4.0) or flagged screenings</li>
                <li>• May have stable enrollment but developmental concerns dominate risk profile</li>
                <li>• Requires specialized intervention pathway (First Steps, IEP)</li>
              </ul>
              <p className="text-xs mt-2 text-purple-700"><strong>Typical Risk Score:</strong> 35-60 (Moderate to High)</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4 italic">
            These archetypes prove the dataset is <strong>intentional, not random</strong>—simulating real-world diversity in risk profiles
            that ECIDS programs encounter.
          </p>
        </div>

        {/* Validation */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">Data Validation</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>✅ All 5,000 children have unique DCN and MOSIS IDs</li>
            <li>✅ Referential integrity maintained across all 9 files</li>
            <li>✅ Not all children have disabilities (~12%)</li>
            <li>✅ Some children skipped immunizations (~15%)</li>
            <li>✅ Some children have no insurance coverage (~8%)</li>
            <li>✅ Risk distribution: 55.1% Low, 25.2% Moderate, 19.7% High (984 flagged for intervention)</li>
            <li>✅ Realistic correlation between poverty and risk indicators</li>
            <li>✅ High-risk children show compounded indicators (enrollment gaps + low attendance + missed screenings)</li>
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
