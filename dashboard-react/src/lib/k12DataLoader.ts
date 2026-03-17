import Papa from 'papaparse';

export interface K12Student {
  StateID: string;
  CurrentSchoolYear: string;
  StudentGradeLevel: string;
  County: string;
  KindergartenReadiness: string;
  ReadingSuccessPlan: string;
  LunchStatus: string;
}

export interface MAPAssessment {
  StateID: string;
  StudentGradeLevel: string;
  Subject: string;
  PerformanceLevel: string;
  Grade3ReadingBand: string;
  ScaleScore: string;
}

let k12StudentsCache: K12Student[] | null = null;
let mapAssessmentsCache: MAPAssessment[] | null = null;

export async function loadK12Students(): Promise<K12Student[]> {
  if (k12StudentsCache) return k12StudentsCache;

  const response = await fetch('/data/k12/StuCore.csv');
  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        k12StudentsCache = results.data as K12Student[];
        resolve(k12StudentsCache);
      },
      error: (error: Error) => reject(error),
    });
  });
}

export async function loadMAPAssessments(): Promise<MAPAssessment[]> {
  if (mapAssessmentsCache) return mapAssessmentsCache;

  const response = await fetch('/data/k12/MAP.csv');
  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        mapAssessmentsCache = results.data as MAPAssessment[];
        resolve(mapAssessmentsCache);
      },
      error: (error: Error) => reject(error),
    });
  });
}

export function padStateID(childMosisID: string | number | undefined): string {
  // Pad Child MOSIS ID to 10 digits to match K-12 StateID format
  if (!childMosisID) return '0000000000';
  const idString = String(childMosisID);
  return idString.padStart(10, '0');
}
