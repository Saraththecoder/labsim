import { LabObservation, LabReportData } from './types';
import { calculateFocalLengthFromUV } from './physics';

const OBSERVATIONS_KEY = 'ar_optics_lab_observations_v1';
const REPORT_KEY = 'ar_optics_lab_report_data_v1';
const QUIZ_RESULT_KEY = 'ar_optics_quiz_score_v1';

export const DEFAULT_PRELOADED_OBSERVATIONS: LabObservation[] = [
  {
    id: 'sample-1',
    serialNumber: 1,
    objectPos: 10,
    lensPos: 50,
    screenPos: 72.5,
    u: 40,
    v: 22.5,
    fCalculated: 14.4,
    ho: 5,
    hi: -2.81,
    magnification: -0.56,
    imageNature: 'Real, Inverted, Diminished',
    isFocused: true,
    timestamp: 1771500000000,
    notes: 'Object beyond 2F (u = 40cm > 2f = 30cm)',
  },
  {
    id: 'sample-2',
    serialNumber: 2,
    objectPos: 15,
    lensPos: 50,
    screenPos: 76.2,
    u: 35,
    v: 26.2,
    fCalculated: 14.99,
    ho: 5,
    hi: -3.74,
    magnification: -0.75,
    imageNature: 'Real, Inverted, Diminished',
    isFocused: true,
    timestamp: 1771500000000,
    notes: 'Sharp flame inverted on screen',
  },
  {
    id: 'sample-3',
    serialNumber: 3,
    objectPos: 20,
    lensPos: 50,
    screenPos: 80.0,
    u: 30,
    v: 30.0,
    fCalculated: 15.0,
    ho: 5,
    hi: -5.0,
    magnification: -1.0,
    imageNature: 'Real, Inverted, Same Size',
    isFocused: true,
    timestamp: 1771500000000,
    notes: 'Object at 2F (u = 30cm = 2f). Inverted image exactly 5cm',
  },
  {
    id: 'sample-4',
    serialNumber: 4,
    objectPos: 25,
    lensPos: 50,
    screenPos: 87.5,
    u: 25,
    v: 37.5,
    fCalculated: 15.0,
    ho: 5,
    hi: -7.5,
    magnification: -1.5,
    imageNature: 'Real, Inverted, Magnified',
    isFocused: true,
    timestamp: 1771500000000,
    notes: 'Object between F and 2F. Magnified image',
  },
  {
    id: 'sample-5',
    serialNumber: 5,
    objectPos: 28,
    lensPos: 50,
    screenPos: 97.1,
    u: 22,
    v: 47.1,
    fCalculated: 14.99,
    ho: 5,
    hi: -10.7,
    magnification: -2.14,
    imageNature: 'Real, Inverted, Magnified',
    isFocused: true,
    timestamp: 1771500000000,
    notes: 'Close to focus. Distinct enlarged image on screen',
  },
];

export function getSavedObservations(): LabObservation[] {
  if (typeof window === 'undefined') return DEFAULT_PRELOADED_OBSERVATIONS;
  try {
    const raw = localStorage.getItem(OBSERVATIONS_KEY);
    if (!raw) {
      // Seed with sample data on first visit
      localStorage.setItem(OBSERVATIONS_KEY, JSON.stringify(DEFAULT_PRELOADED_OBSERVATIONS));
      return DEFAULT_PRELOADED_OBSERVATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_PRELOADED_OBSERVATIONS;
  }
}

export function saveObservations(list: LabObservation[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(OBSERVATIONS_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save observations:', err);
  }
}

export function addObservation(obs: Omit<LabObservation, 'id' | 'serialNumber' | 'timestamp'>): LabObservation {
  const current = getSavedObservations();
  const newObs: LabObservation = {
    ...obs,
    id: 'obs-' + Date.now(),
    serialNumber: current.length + 1,
    timestamp: Date.now(),
  };
  const updated = [...current, newObs];
  saveObservations(updated);
  return newObs;
}

export function deleteObservation(id: string): LabObservation[] {
  const current = getSavedObservations();
  const filtered = current
    .filter((o) => o.id !== id)
    .map((o, idx) => ({ ...o, serialNumber: idx + 1 }));
  saveObservations(filtered);
  return filtered;
}

export function clearObservations(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(OBSERVATIONS_KEY);
}

export function resetToDefaultObservations(): LabObservation[] {
  saveObservations(DEFAULT_PRELOADED_OBSERVATIONS);
  return DEFAULT_PRELOADED_OBSERVATIONS;
}

export function computeStatistics(observations: LabObservation[], nominalF: number = 15) {
  if (!observations.length) {
    return {
      meanF: nominalF,
      stdDev: 0,
      percentError: 0,
      count: 0,
    };
  }

  const fValues = observations.map((o) => o.fCalculated).filter((f) => f > 0 && isFinite(f));
  if (!fValues.length) {
    return { meanF: nominalF, stdDev: 0, percentError: 0, count: 0 };
  }

  const sum = fValues.reduce((acc, val) => acc + val, 0);
  const meanF = Number((sum / fValues.length).toFixed(2));

  const variance =
    fValues.reduce((acc, val) => acc + Math.pow(val - meanF, 2), 0) / fValues.length;
  const stdDev = Number(Math.sqrt(variance).toFixed(2));

  const percentError = Number(
    (Math.abs(meanF - nominalF) / nominalF * 100).toFixed(2)
  );

  return {
    meanF,
    stdDev,
    percentError,
    count: fValues.length,
  };
}

export function getQuizScore(): { score: number; total: number; percentage: number } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(QUIZ_RESULT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveQuizScore(score: number, total: number): void {
  if (typeof window === 'undefined') return;
  const data = {
    score,
    total,
    percentage: Math.round((score / total) * 100),
    timestamp: Date.now(),
  };
  localStorage.setItem(QUIZ_RESULT_KEY, JSON.stringify(data));
}

export function exportObservationsCSV(observations: LabObservation[]): string {
  const headers = [
    'S.No',
    'Object Pos (cm)',
    'Lens Pos (cm)',
    'Screen Pos (cm)',
    'u (cm)',
    'v (cm)',
    '1/u (cm^-1)',
    '1/v (cm^-1)',
    'f = uv/(u+v) (cm)',
    'Magnification (m)',
    'Image Nature',
    'In Focus',
    'Notes',
  ];

  const rows = observations.map((o) => [
    o.serialNumber,
    o.objectPos,
    o.lensPos,
    o.screenPos,
    o.u,
    o.v,
    (1 / o.u).toFixed(4),
    (1 / o.v).toFixed(4),
    o.fCalculated,
    o.magnification,
    `"${o.imageNature}"`,
    o.isFocused ? 'Yes' : 'No',
    `"${o.notes || ''}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
