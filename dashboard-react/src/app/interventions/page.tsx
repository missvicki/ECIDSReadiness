'use client';

import Container from '@/components/layout/Container';

export default function InterventionsPage() {
  return (
    <Container>
      <div className="max-w-5xl mx-auto">

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-3">Risk-to-Response Mapping</h1>
          <p className="text-lg text-gray-700">
            <strong>The index is not a label; each flag triggers a predefined intervention pathway.</strong> This ensures that risk
            identification translates directly into actionable response protocols rather than passive reporting.
          </p>
        </div>

        {/* Intervention Mapping Table */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-4">Intervention Pathways by Risk Flag</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Risk Flag</th>
                  <th className="px-4 py-3 text-left font-semibold">Trigger Condition</th>
                  <th className="px-4 py-3 text-left font-semibold">Recommended Action</th>
                  <th className="px-4 py-3 text-left font-semibold">Responsible Role</th>
                </tr>
              </thead>
              <tbody>
                {/* Stability Interventions */}
                <tr className="border-t border-gray-200">
                  <td className="px-4 py-3 font-semibold">Enrollment Gap &gt;60 days</td>
                  <td className="px-4 py-3">Child unenrolled for 60+ days</td>
                  <td className="px-4 py-3">Re-engagement call + enrollment support</td>
                  <td className="px-4 py-3">Family Navigator</td>
                </tr>
                <tr className="border-t border-gray-200">
                  <td className="px-4 py-3 font-semibold">Chronic Gap &gt;6 months</td>
                  <td className="px-4 py-3">Gap exceeds 180 days</td>
                  <td className="px-4 py-3">Home visit + barrier assessment</td>
                  <td className="px-4 py-3">Home Visitor</td>
                </tr>
                <tr className="border-t border-gray-200">
                  <td className="px-4 py-3 font-semibold">Mobility (2+ provider moves)</td>
                  <td className="px-4 py-3">4+ participation episodes</td>
                  <td className="px-4 py-3">Transition coordination + records transfer</td>
                  <td className="px-4 py-3">Case Manager</td>
                </tr>
                <tr className="border-t border-gray-200">
                  <td className="px-4 py-3 font-semibold">Low total attendance</td>
                  <td className="px-4 py-3">&lt;100 days cumulative</td>
                  <td className="px-4 py-3">Transportation assistance + flexible scheduling</td>
                  <td className="px-4 py-3">Provider Coordinator</td>
                </tr>

                {/* Engagement Interventions */}
                <tr className="border-t border-gray-200 bg-blue-50">
                  <td className="px-4 py-3 font-semibold">Chronic Absence</td>
                  <td className="px-4 py-3">&lt;80 days/year attended</td>
                  <td className="px-4 py-3">Family outreach protocol + attendance monitoring</td>
                  <td className="px-4 py-3">Attendance Coach</td>
                </tr>
                <tr className="border-t border-gray-200 bg-blue-50">
                  <td className="px-4 py-3 font-semibold">Missed Screenings</td>
                  <td className="px-4 py-3">&lt;4 of 6 completed</td>
                  <td className="px-4 py-3">Appointment reminders + co-located screening</td>
                  <td className="px-4 py-3">Health Coordinator</td>
                </tr>
                <tr className="border-t border-gray-200 bg-blue-50">
                  <td className="px-4 py-3 font-semibold">Immunization gaps</td>
                  <td className="px-4 py-3">&lt;83% compliance</td>
                  <td className="px-4 py-3">Health outreach referral + clinic linkage</td>
                  <td className="px-4 py-3">Nurse Navigator</td>
                </tr>

                {/* Developmental Interventions */}
                <tr className="border-t border-gray-200 bg-green-50">
                  <td className="px-4 py-3 font-semibold">Developmental Screening Flag</td>
                  <td className="px-4 py-3">Flagged screening result</td>
                  <td className="px-4 py-3">First Steps referral (Part C evaluation)</td>
                  <td className="px-4 py-3">ECSE Coordinator</td>
                </tr>
                <tr className="border-t border-gray-200 bg-green-50">
                  <td className="px-4 py-3 font-semibold">Low COS Rating</td>
                  <td className="px-4 py-3">COS &lt;4.0 on 1-7 scale</td>
                  <td className="px-4 py-3">Developmental support services + IEP review</td>
                  <td className="px-4 py-3">Special Educator</td>
                </tr>
                <tr className="border-t border-gray-200 bg-green-50">
                  <td className="px-4 py-3 font-semibold">Disability (no services)</td>
                  <td className="px-4 py-3">IDEA eligible but no active IEP</td>
                  <td className="px-4 py-3">Service activation + family meeting</td>
                  <td className="px-4 py-3">Service Coordinator</td>
                </tr>

                {/* Context Interventions */}
                <tr className="border-t border-gray-200 bg-yellow-50">
                  <td className="px-4 py-3 font-semibold">Deep Poverty</td>
                  <td className="px-4 py-3">&lt;100% FPL</td>
                  <td className="px-4 py-3">Benefits enrollment (SNAP, TANF, WIC)</td>
                  <td className="px-4 py-3">Benefits Navigator</td>
                </tr>
                <tr className="border-t border-gray-200 bg-yellow-50">
                  <td className="px-4 py-3 font-semibold">Homelessness</td>
                  <td className="px-4 py-3">Documented homeless status</td>
                  <td className="px-4 py-3">Housing referral + McKinney-Vento liaison</td>
                  <td className="px-4 py-3">Homeless Liaison</td>
                </tr>
                <tr className="border-t border-gray-200 bg-yellow-50">
                  <td className="px-4 py-3 font-semibold">Foster Care</td>
                  <td className="px-4 py-3">Active placement</td>
                  <td className="px-4 py-3">Stability planning + caseworker coordination</td>
                  <td className="px-4 py-3">Foster Care Liaison</td>
                </tr>
                <tr className="border-t border-gray-200 bg-yellow-50">
                  <td className="px-4 py-3 font-semibold">Multiple Household Stressors</td>
                  <td className="px-4 py-3">2+ stressors documented</td>
                  <td className="px-4 py-3">Wraparound services + family support team</td>
                  <td className="px-4 py-3">Family Support Coordinator</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Workflow Example */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-4">Sample Workflow: High-Risk Child Alert</h2>
          <p className="text-gray-700 mb-4">
            When a child's composite risk score crosses into "High" tier (≥35), an automated alert is generated:
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">1</div>
              <div>
                <h3 className="font-bold">Alert Generated</h3>
                <p className="text-sm text-gray-600">System flags child DCN with risk score and primary drivers</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">2</div>
              <div>
                <h3 className="font-bold">Assigned to Case Manager</h3>
                <p className="text-sm text-gray-600">Alert routes to appropriate case manager based on geography/caseload</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">3</div>
              <div>
                <h3 className="font-bold">Review Risk Drivers</h3>
                <p className="text-sm text-gray-600">Case manager views child timeline, identifies top 3 risk factors</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">4</div>
              <div>
                <h3 className="font-bold">Execute Intervention Protocols</h3>
                <p className="text-sm text-gray-600">System suggests 2-3 intervention pathways based on flags (e.g., attendance outreach, screening referral)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">5</div>
              <div>
                <h3 className="font-bold">Track Outcomes</h3>
                <p className="text-sm text-gray-600">Quarterly rescoring shows whether risk is decreasing (intervention effective) or persisting (needs escalation)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Response Tiers */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-4">Tiered Response Framework</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-bold text-green-700 mb-2">Low Risk (Universal)</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Routine monitoring</li>
                <li>• Standard communications</li>
                <li>• Annual screenings</li>
              </ul>
            </div>
            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="font-bold text-yellow-700 mb-2">Moderate Risk (Targeted)</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Monthly check-ins</li>
                <li>• Specific intervention (1-2 pathways)</li>
                <li>• Quarterly reassessment</li>
              </ul>
            </div>
            <div className="border-l-4 border-red-500 pl-4">
              <h3 className="font-bold text-red-700 mb-2">High Risk (Intensive)</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Weekly/biweekly contact</li>
                <li>• Multi-intervention wraparound</li>
                <li>• Continuous monitoring + rapid response</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Key Takeaway */}
        <div className="info-box">
          <h3 className="text-lg font-bold mb-2">🎯 Key Takeaway</h3>
          <p className="text-gray-800">
            <strong>This is not passive reporting—it's an action engine.</strong> Every risk flag maps to a specific intervention protocol
            with clearly assigned responsibility. Case managers don't ask "What should I do?" The system tells them. This transforms ECIDS
            from a compliance database into a proactive early warning system that drives measurable intervention.
          </p>
        </div>
      </div>
    </Container>
  );
}
