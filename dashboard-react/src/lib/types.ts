/**
 * TypeScript type definitions for ECIDS data
 */

export interface Child {
  'Child DCN': string;
  'Child MOSIS ID': string;
  LastName: string;
  FirstName: string;
  MiddleName: string;
  BirthDate: string;
  PostalCode: string;
  AddressCountyName: string;
  City: string;
  ResponsibleOrganizationIdentifier: string;
  'RefSex.Description': string;
  'RefRace.Description': string;
  HispanicLatinoEthnicity: string;
  HomelessnessStatus: string;
  MigrantStatus: string;
  ChildAbuseNeglect: string;
  'RefLanguage.Description': string;
  FosterCareStartDate: string;
  FosterCareEndDate: string;
  'RefParentMaritalStatus.Description': string;
  FamilyMemberIncarcerated: string;
  FamilyMemberSubstanceUseAbuse: string;
  LossOfParent: string;
  PercentOfFederalPovertyLevel: number;
  FamilyIncome: number;
  NumberOfPeopleInFamily: number;
  HouseholdMemberDepressedOrMentallyIll: string;
  WeightAtBirth: number;
  WeeksOfGestation: number;
}

export interface ChildWithRisk extends Child {
  composite_risk_score: number;
  risk_tier: 'Low' | 'Moderate' | 'High';
  stability_score: number;
  engagement_score: number;
  developmental_score: number;
  context_score: number;
  num_enrollment_gaps: number;
  max_gap_days: number;
  has_gap_over_6mo: boolean;
  num_participation_episodes: number;
  total_attendance_days: number;
  avg_attendance_days: number;
  num_screenings_completed: number;
  screening_completion_rate: number;
  num_immunizations: number;
  immunization_compliance_rate: number;
  missed_screening: boolean;
  has_disability: boolean;
  has_outcomes_data: boolean;
  avg_cos_rating: number | null;
  low_outcomes: boolean;
  homelessness_flag: boolean;
  migrant_flag: boolean;
  abuse_flag: boolean;
  incarcerated_flag: boolean;
  substance_flag: boolean;
  depression_flag: boolean;
  loss_parent_flag: boolean;
  in_foster_care: boolean;
  deep_poverty: boolean;
  num_household_stressors: number;
  programs_enrolled: string;
  total_enrollments: number;
  programs_list: string[];
}

export interface FilterState {
  county: string;
  district: string;
  riskTier: string;
  povertyLevel: string;
}

export interface MetricCardProps {
  label: string;
  value: string | number;
  delta?: string;
  help?: string;
  icon?: string;
  color?: string;
}

export interface ChartConfig {
  title: string;
  xAxis?: string;
  yAxis?: string;
  height?: number;
}
