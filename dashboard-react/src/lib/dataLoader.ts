/**
 * Data loading utilities for ECIDS dashboard
 * Loads CSV files and merges with risk scores
 */

import Papa from 'papaparse';
import { ChildWithRisk } from './types';

export async function loadCSV(filename: string): Promise<any[]> {
  const response = await fetch(`/data/${filename}`);
  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (error: Error) => reject(error),
    });
  });
}

export async function loadAllData(): Promise<ChildWithRisk[]> {
  try {
    // Load child data, risk scores, participation data, and K-12 data
    const [childData, riskScores, participationData] = await Promise.all([
      loadCSV('ecids/Child.csv'),
      loadCSV('ecids/risk_scores.csv'),
      loadCSV('ecids/ChildParticipation.csv'),
    ]);

    // Get all programs for each child
    const childPrograms: any = {};
    participationData.forEach((p: any) => {
      const dcn = p['Child DCN'];
      if (!childPrograms[dcn]) {
        childPrograms[dcn] = [];
      }
      if (p['RefProgramType.Description']) {
        childPrograms[dcn].push(p['RefProgramType.Description']);
      }
    });

    // Merge child data with risk scores and programs
    const merged = childData.map((child: any) => {
      const risk = riskScores.find(
        (r: any) => r['Child DCN'] === child['Child DCN']
      );

      const programs = childPrograms[child['Child DCN']] || [];
      const uniquePrograms = Array.from(new Set(programs));

      return {
        ...child,
        ...risk,
        programs_list: uniquePrograms,
        // Convert Yes/No to boolean
        HomelessnessStatus: child.HomelessnessStatus === 'Yes',
        MigrantStatus: child.MigrantStatus === 'Yes',
        ChildAbuseNeglect: child.ChildAbuseNeglect === 'Yes',
        FamilyMemberIncarcerated: child.FamilyMemberIncarcerated === 'Yes',
        FamilyMemberSubstanceUseAbuse: child.FamilyMemberSubstanceUseAbuse === 'Yes',
        HouseholdMemberDepressedOrMentallyIll: child.HouseholdMemberDepressedOrMentallyIll === 'Yes',
        LossOfParent: child.LossOfParent === 'Yes',
        in_foster_care: child.FosterCareStartDate && child.FosterCareStartDate !== '',
        deep_poverty: child.PercentOfFederalPovertyLevel < 100,
      };
    });

    return merged as ChildWithRisk[];
  } catch (error) {
    console.error('Error loading data:', error);
    return [];
  }
}

export function filterData(
  data: ChildWithRisk[],
  filters: {
    county?: string;
    povertyLevel?: string;
  }
): ChildWithRisk[] {
  let filtered = [...data];

  if (filters.county && filters.county !== 'All Counties') {
    filtered = filtered.filter(d => d.AddressCountyName === filters.county);
  }

  if (filters.povertyLevel && filters.povertyLevel !== 'All Poverty Levels') {
    if (filters.povertyLevel === 'Deep Poverty (<100%)') {
      filtered = filtered.filter(d => d.PercentOfFederalPovertyLevel < 100);
    } else if (filters.povertyLevel === 'Low Income (100-200%)') {
      filtered = filtered.filter(d =>
        d.PercentOfFederalPovertyLevel >= 100 && d.PercentOfFederalPovertyLevel < 200
      );
    } else if (filters.povertyLevel === 'Moderate Income (200-300%)') {
      filtered = filtered.filter(d =>
        d.PercentOfFederalPovertyLevel >= 200 && d.PercentOfFederalPovertyLevel < 300
      );
    } else if (filters.povertyLevel === 'Higher Income (>300%)') {
      filtered = filtered.filter(d => d.PercentOfFederalPovertyLevel >= 300);
    }
  }

  return filtered;
}

export function getUniqueValues(data: ChildWithRisk[], field: keyof ChildWithRisk): string[] {
  const values = data.map(d => String(d[field])).filter(v => v);
  return Array.from(new Set(values)).sort();
}

// K-12 Data Loaders for Executive Overview
export async function loadK12Overview(filters?: { county?: string }) {
  try {
    const [stuCore, mapData, riskScores, childData] = await Promise.all([
      loadCSV('k12/StuCore.csv'),
      loadCSV('k12/MAP.csv'),
      loadCSV('ecids/risk_scores.csv'),
      loadCSV('ecids/Child.csv'),
    ]);

    // Create MOSIS ID to geography lookup from ECIDS data
    const geographyByMosisId: any = {};
    childData.forEach((child: any) => {
      if (child['Child MOSIS ID']) {
        geographyByMosisId[child['Child MOSIS ID']] = {
          county: child.AddressCountyName,
          district: child.ResponsibleOrganizationIdentifier,
        };
      }
    });

    // Filter K-12 data by geography using ECIDS lookup
    let filteredStuCore = stuCore;
    let filteredMapData = mapData;

    if (filters?.county && filters.county !== 'All Counties') {
      filteredStuCore = filteredStuCore.filter((s: any) => {
        const geo = geographyByMosisId[s.StateID];
        return geo && geo.county === filters.county;
      });
      filteredMapData = filteredMapData.filter((m: any) => {
        const geo = geographyByMosisId[m.StateID];
        return geo && geo.county === filters.county;
      });
    }


    // Create a risk score lookup by MOSIS ID
    const riskByMosisId: any = {};
    riskScores.forEach((r: any) => {
      if (r['Child MOSIS ID']) {
        riskByMosisId[r['Child MOSIS ID']] = r.composite_risk_score;
      }
    });

    // Kindergarten readiness summary (3-tier framework)
    const kStudents = filteredStuCore.filter((s: any) => s.StudentGradeLevel === 'K');

    let demonstrating = 0;
    let approaching = 0;
    let emerging = 0;

    kStudents.forEach((s: any) => {
      const riskScore = riskByMosisId[s.StateID] || 0;

      if (s.KindergartenReadiness === 'Y') {
        demonstrating++;
      } else {
        // Split non-demonstrating students into Approaching vs Emerging based on risk
        // Approaching: Low to moderate risk (score < 35)
        // Emerging: Higher risk (score >= 35)
        if (riskScore < 35) {
          approaching++;
        } else {
          emerging++;
        }
      }
    });

    const kReadiness = {
      demonstrating,
      approaching,
      emerging,
    };

    // Grade 3 reading outcomes - handle both string "03" and number 3
    const grade3Reading = filteredMapData.filter((m: any) => {
      const grade = String(m.StudentGradeLevel);
      return (grade === '03' || grade === '3') && m.Subject === 'Reading';
    });
    const readingOutcomes = {
      advanced: grade3Reading.filter((r: any) => r.PerformanceLevel === 'Advanced').length,
      proficient: grade3Reading.filter((r: any) => r.PerformanceLevel === 'Proficient').length,
      basic: grade3Reading.filter((r: any) => r.PerformanceLevel === 'Basic').length,
      belowBasic: grade3Reading.filter((r: any) => r.PerformanceLevel === 'Below Basic').length,
    };

    // Calculate average attendance across all K-3 students
    const allStudents = filteredStuCore.filter((s: any) =>
      ['K', '01', '02', '03'].includes(s.StudentGradeLevel)
    );

    // Calculate connecting insights
    // 1. ECIDS → K Readiness: What % of high risk children demonstrate readiness?
    const kStudentsWithRisk = kStudents.filter((s: any) => riskByMosisId[s.StateID] !== undefined);
    const highRiskKStudents = kStudentsWithRisk.filter((s: any) => riskByMosisId[s.StateID] >= 35);
    const lowRiskKStudents = kStudentsWithRisk.filter((s: any) => riskByMosisId[s.StateID] < 24);

    const highRiskDemonstrating = highRiskKStudents.filter((s: any) => s.KindergartenReadiness === 'Y').length;
    const lowRiskDemonstrating = lowRiskKStudents.filter((s: any) => s.KindergartenReadiness === 'Y').length;

    const highRiskReadinessPct = highRiskKStudents.length > 0 ? (highRiskDemonstrating / highRiskKStudents.length) * 100 : 0;
    const lowRiskReadinessPct = lowRiskKStudents.length > 0 ? (lowRiskDemonstrating / lowRiskKStudents.length) * 100 : 0;

    // 2. Grade 3 Reading: What % of students reach proficient+?
    const proficientPlus = readingOutcomes.advanced + readingOutcomes.proficient;
    const totalGrade3 = proficientPlus + readingOutcomes.basic + readingOutcomes.belowBasic;
    const grade3ProficientPct = totalGrade3 > 0 ? (proficientPlus / totalGrade3) * 100 : 0;

    return {
      kindergartenReadiness: kReadiness,
      grade3Reading: readingOutcomes,
      totalK3Students: allStudents.length,
      totalKStudents: kStudents.length,
      totalGrade3Students: grade3Reading.length,
      insights: {
        highRiskReadinessPct,
        lowRiskReadinessPct,
        readinessGap: lowRiskReadinessPct - highRiskReadinessPct,
        grade3ProficientPct,
      },
    };
  } catch (error) {
    console.error('Error loading K-12 data:', error);
    return {
      kindergartenReadiness: { demonstrating: 0, emerging: 0 },
      grade3Reading: { advanced: 0, proficient: 0, basic: 0, belowBasic: 0 },
      totalK3Students: 0,
      totalKStudents: 0,
      totalGrade3Students: 0,
    };
  }
}
