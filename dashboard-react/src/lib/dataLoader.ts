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
    // Load child data, risk scores, and participation data
    const [childData, riskScores, participationData] = await Promise.all([
      loadCSV('Child.csv'),
      loadCSV('risk_scores.csv'),
      loadCSV('ChildParticipation.csv'),
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
    district?: string;
    riskTier?: string;
    povertyLevel?: string;
  }
): ChildWithRisk[] {
  let filtered = [...data];

  if (filters.county && filters.county !== 'All Counties') {
    filtered = filtered.filter(d => d.AddressCountyName === filters.county);
  }

  if (filters.district && filters.district !== 'All Districts') {
    filtered = filtered.filter(d => d.ResponsibleOrganizationIdentifier === filters.district);
  }

  if (filters.riskTier && filters.riskTier !== 'All Risk Tiers') {
    filtered = filtered.filter(d => d.risk_tier === filters.riskTier);
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
